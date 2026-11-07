// Monime checkout for customers in Sierra Leone: Orange Money, Afrimoney, bank and Visa debit
// on Monime's hosted page, priced in new Leones (SLE).
//
//   POST /api/monime/checkout { token }   -> { url }            redirect the customer there
//   POST /api/monime/confirm  { token }   -> { order_status }   after the customer comes back
//   POST /api/monime/webhook              (Monime calls this when a checkout completes)
//   GET  /api/monime/health               -> configuration check (no secrets)
//
// Secrets (Cloudflare Worker -> Settings -> Variables and Secrets):
//   MONIME_ACCESS_TOKEN   personal access token (mon_test_… = test money, mon_… = live)
//   MONIME_SPACE_ID       the Sylkit Space (spc-…)
//   MONIME_USD_RATE       optional fixed SLE per USD; otherwise the day's market rate is used
//
// Nothing a caller sends is trusted: confirm and webhook both re-read the checkout session and the
// payment from Monime's API with our token, and only a completed payment for the right amount marks
// the order paid. Test-mode payments never mark an order paid.

import { alertOwner, orderLine } from './notify.js';

const API = 'https://api.monime.io';
const SUPABASE_URL = 'https://chcljhwcvzlmxrrhetfv.supabase.co';
const SITE = 'https://sylkit.com';
const TOKEN_RE = /^[0-9a-f-]{36}$/i;
const DONE = new Set(['paid', 'in_progress', 'delivered']);

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

export const hasMonime = (env) => !!(env.MONIME_ACCESS_TOKEN && env.MONIME_SPACE_ID);
const isTest = (env) => String(env.MONIME_ACCESS_TOKEN || '').startsWith('mon_test_');
const leones = (n) => `NLe ${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ---------- Monime REST ----------
async function monime(env, method, path, body, idem) {
  const headers = {
    authorization: `Bearer ${env.MONIME_ACCESS_TOKEN}`,
    'monime-space-id': env.MONIME_SPACE_ID,
    accept: 'application/json',
  };
  if (body) headers['content-type'] = 'application/json';
  if (idem) headers['idempotency-key'] = idem;
  const r = await fetch(`${API}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || data.success === false) {
    const msg = data?.error?.message || data?.messages?.[0] || data?.message || '';
    const e = new Error(`monime ${r.status}: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`.slice(0, 400));
    e.status = r.status;
    throw e;
  }
  return data.result ?? data;
}

// ---------- USD -> SLE ----------
let fx = { at: 0, rate: 0 };
async function sleRate(env) {
  const fixed = Number(env.MONIME_USD_RATE);
  if (fixed > 1) return fixed;
  if (fx.rate && Date.now() - fx.at < 6 * 3600 * 1000) return fx.rate;
  const j = await fetch('https://open.er-api.com/v6/latest/USD', { cf: { cacheTtl: 3600 } }).then((r) => r.json());
  const rate = Number(j?.rates?.SLE);
  if (!(rate > 5 && rate < 200)) throw Object.assign(new Error('fx_unavailable'), { status: 503 });
  fx = { at: Date.now(), rate };
  return rate;
}

// ---------- Supabase ----------
function sbHeaders(env, extra = {}) {
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  const h = { apikey: key, 'content-type': 'application/json', ...extra };
  if (key && key.startsWith('eyJ')) h.authorization = `Bearer ${key}`;
  return h;
}
async function sb(env, path, init = {}) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: sbHeaders(env, init.headers) });
  const text = await r.text();
  if (!r.ok) throw new Error(`supabase ${r.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}
const getOrder = (env, field, value) => sb(env, `orders?${field}=eq.${encodeURIComponent(value)}&select=*`).then((r) => r[0]);
const patchOrder = (env, id, patch) => sb(env, `orders?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(patch), headers: { prefer: 'return=minimal' } });
const addEvent = (env, order_id, kind, message, isPublic = true) =>
  sb(env, 'order_events', { method: 'POST', body: JSON.stringify({ order_id, kind, message, public: isPublic }), headers: { prefer: 'return=minimal' } });

// ---------- webhook registration (once per Worker instance) ----------
let hookChecked = false;
async function ensureWebhook(env) {
  if (hookChecked) return;
  hookChecked = true;
  try {
    const url = `${SITE}/api/monime/webhook`;
    const list = await monime(env, 'GET', '/v1/webhooks?limit=50');
    const items = Array.isArray(list) ? list : list?.items || [];
    if (items.some((w) => w.url === url)) return;
    await monime(env, 'POST', '/v1/webhooks', { name: 'Sylkit orders', url, apiRelease: 'caph', events: ['checkout_session.completed'] }, 'sylkit-webhook-v1');
  } catch {
    hookChecked = false; // try again on the next checkout; the return-page check still works without it
  }
}

// ---------- checkout ----------
async function checkout(request, env) {
  const body = await request.json().catch(() => null);
  const token = String(body?.token || '');
  if (!TOKEN_RE.test(token)) return json({ error: 'invalid_token' }, 400);
  const order = await getOrder(env, 'token', token);
  if (!order) return json({ error: 'order_not_found' }, 404);
  if (DONE.has(order.status)) return json({ error: 'already_paid' }, 409);
  if (order.status !== 'accepted') return json({ error: 'order_not_payable', status: order.status }, 409);
  const total = Number(order.quote_amount);
  if (!total || total <= 0) return json({ error: 'no_quote_amount' }, 409);
  const currency = String(order.quote_currency || 'USD').toUpperCase();
  const rate = currency === 'SLE' ? 1 : await sleRate(env);
  const sle = Math.ceil(total * rate); // whole Leones, rounded up
  const minor = sle * 100;
  const back = `${SITE}/order?t=${token}`;
  const win = Math.floor(Date.now() / (20 * 60 * 1000));

  let s;
  try {
    s = await monime(
      env,
      'POST',
      '/v1/checkout-sessions',
      {
        name: `Sylkit ${order.order_number}`.slice(0, 150),
        description: (order.product_name_en || order.product_name_es || 'Sylkit order').slice(0, 1000),
        reference: order.order_number,
        successUrl: `${back}&paid=monime`,
        cancelUrl: `${back}&pay=monime`,
        lineItems: [{ type: 'custom', name: `Sylkit ${order.order_number}`.slice(0, 100), price: { currency: 'SLE', value: minor }, quantity: 1 }],
        brandingOptions: { primaryColor: '#2558E8' },
        metadata: { sylkit_order: order.order_number, sylkit_token: token, usd: String(total), sle_minor: String(minor) },
      },
      `sylkit-${order.order_number}-${minor}-${win}`,
    );
  } catch (e) {
    await addEvent(env, order.id, 'update', `Monime checkout failed (${e.status || '?'}): ${e.message}`, false).catch(() => {});
    return json({ error: 'monime_failed' }, 502);
  }
  if (!s?.redirectUrl) return json({ error: 'monime_no_link' }, 502);
  await patchOrder(env, order.id, { payment_method: isTest(env) ? 'monime:test' : 'monime:pending', payment_reference: s.id });
  await addEvent(env, order.id, 'update', `Monime checkout started: ${leones(sle)} (${currency} ${total} at ${rate.toFixed(2)} SLE/USD)${isTest(env) ? ' — TEST mode' : ''}.`, false);
  ensureWebhook(env);
  return json({ url: s.redirectUrl, sle, rate, test: isTest(env) });
}

// ---------- verify against Monime and update the order ----------
async function settle(env, order) {
  if (DONE.has(order.status)) return order.status;
  const method = String(order.payment_method || '');
  if (!method.startsWith('monime')) return order.status;
  const sessionId = String(order.payment_reference || '');
  if (!/^[A-Za-z0-9_-]{6,80}$/.test(sessionId)) return order.status;

  const s = await monime(env, 'GET', `/v1/checkout-sessions/${encodeURIComponent(sessionId)}`);
  if (s.status !== 'completed') return order.status;
  if (s.reference && s.reference !== order.order_number) return order.status;
  const expected = Number(s?.metadata?.sle_minor || 0);

  // The payment behind the session: amount and status straight from Monime.
  let pay = null;
  if (s.orderNumber) {
    const list = await monime(env, 'GET', `/v1/payments?orderNumber=${encodeURIComponent(s.orderNumber)}&limit=5`).catch(() => null);
    const items = Array.isArray(list) ? list : list?.items || [];
    pay = items.find((p) => p.status === 'completed') || null;
  }
  const paid = Number(pay?.amount?.value || 0);
  const ref = pay?.id || s.orderNumber || sessionId;
  const channel = pay?.channel?.provider || pay?.channel?.type || 'Monime';

  if (isTest(env) || method === 'monime:test') {
    await patchOrder(env, order.id, { status: 'payment_submitted', payment_method: 'monime:test', payment_reference: ref });
    await addEvent(env, order.id, 'update', `Monime TEST payment completed (${leones(paid / 100)}). Not real money: do not start work.`, false);
    return 'payment_submitted';
  }
  if (!pay || (expected && paid + 1 < expected) || String(pay.amount?.currency || 'SLE').toUpperCase() !== 'SLE') {
    await patchOrder(env, order.id, { status: 'payment_submitted', payment_method: 'monime', payment_reference: ref });
    await addEvent(env, order.id, 'update', `Monime session completed but the payment needs a manual check (paid ${leones(paid / 100)}, expected ${leones(expected / 100)}).`, false);
    await alertOwner(env, { title: 'Pago Monime por revisar', message: orderLine(order), orderId: order.id, tags: 'warning' });
    return 'payment_submitted';
  }
  await patchOrder(env, order.id, { status: 'paid', payment_method: 'monime', payment_reference: ref });
  const es = order.lang === 'es';
  await addEvent(env, order.id, 'update', es ? `Pago confirmado con Monime (${channel}): ${leones(paid / 100)}.` : `Payment confirmed with Monime (${channel}): ${leones(paid / 100)}.`);
  await alertOwner(env, { title: `Pagado con Monime ${leones(paid / 100)}`, message: `${orderLine(order)}\nRevisa y empieza la instalación.`, orderId: order.id, priority: 'high', tags: 'moneybag' });
  return 'paid';
}

async function confirm(request, env) {
  const body = await request.json().catch(() => null);
  const token = String(body?.token || '');
  if (!TOKEN_RE.test(token)) return json({ error: 'invalid_token' }, 400);
  const order = await getOrder(env, 'token', token);
  if (!order) return json({ error: 'order_not_found' }, 404);
  try {
    return json({ order_status: await settle(env, order) });
  } catch (e) {
    return json({ error: 'monime_check_failed', order_status: order.status }, 502);
  }
}

// Monime -> us. The body only tells us which order to re-check; the decision comes from Monime's API.
async function webhook(request, env) {
  const raw = await request.text();
  let body = null;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ ok: true });
  }
  const refs = new Set();
  const walk = (o, depth = 0) => {
    if (!o || depth > 6) return;
    if (typeof o === 'string') {
      if (/^SK-\d{3,8}$/.test(o)) refs.add(o);
      return;
    }
    if (typeof o === 'object') for (const v of Object.values(o)) walk(v, depth + 1);
  };
  walk(body);
  for (const n of [...refs].slice(0, 3)) {
    const order = await getOrder(env, 'order_number', n).catch(() => null);
    if (order) await settle(env, order).catch(() => null);
  }
  return json({ ok: true });
}

async function health(env) {
  if (!hasMonime(env)) return json({ configured: false });
  try {
    const r = await fetch(API, { headers: { accept: 'application/json', authorization: `Bearer ${env.MONIME_ACCESS_TOKEN}` } }).then((x) => x.json());
    let rate = null;
    try {
      rate = await sleRate(env);
    } catch {}
    return json({ configured: true, authenticated: !!r?.status?.isAuthenticated, environment: r?.status?.environment ?? null, sle_per_usd: rate, ready: !!r?.status?.isAuthenticated });
  } catch {
    return json({ configured: true, authenticated: false, ready: false });
  }
}

export async function handleMonime(request, env, url) {
  try {
    if (!env.SUPABASE_SERVICE_ROLE_KEY) return json({ error: 'database_not_configured' }, 503);
    if (url.pathname === '/api/monime/health') return await health(env);
    if (!hasMonime(env)) return json({ error: 'payments_not_configured' }, 503);
    if (request.method !== 'POST') return json({ error: 'not_found' }, 404);
    if (url.pathname === '/api/monime/checkout') return await checkout(request, env);
    if (url.pathname === '/api/monime/confirm') return await confirm(request, env);
    if (url.pathname === '/api/monime/webhook') return await webhook(request, env);
    return json({ error: 'not_found' }, 404);
  } catch (e) {
    console.error('monime error', e);
    return json({ error: e.message === 'fx_unavailable' ? 'rate_unavailable' : 'server_error' }, e.status === 503 ? 503 : 500);
  }
}
