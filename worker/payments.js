// NOWPayments (crypto) for Sylkit orders.
//
//   POST /api/pay/create   { token, currency? }  -> creates a NOWPayments payment for an accepted quote
//   POST /api/pay/ipn      NOWPayments webhook   -> verifies x-nowpayments-sig, then updates the order
//   POST /api/pay/checkout { token }           -> fixed-price plan: confirms the order at the server-calculated total so it can be paid right away
//   GET  /api/pay/status?t=<token>             -> current crypto payment for the order (polled by the tracking page)
//   GET  /api/pay/health                         -> says which secrets are bound and whether NOWPayments answers (never returns secret values)
//
// Runtime secrets (Worker > Settings > Variables and Secrets, type "Secret"):
//   NOWPAYMENTS_API_KEY, NOWPAYMENTS_IPN_SECRET, SUPABASE_SERVICE_ROLE_KEY
// No imports needed: HMAC uses the Web Crypto API built into Workers (crypto.subtle).

const NOWPAYMENTS_LIVE = 'https://api.nowpayments.io/v1';
const NOWPAYMENTS_SANDBOX = 'https://api-sandbox.nowpayments.io/v1';
// Set the plain variable NOWPAYMENTS_SANDBOX = "true" in Cloudflare to use a sandbox (test) key.
let NOWPAYMENTS = NOWPAYMENTS_LIVE;
const SUPABASE_URL = 'https://chcljhwcvzlmxrrhetfv.supabase.co';
const SITE = 'https://sylkit.com';
const DEFAULT_CURRENCY = 'usdttrc20';
const ALLOWED_CURRENCIES = new Set(['usdttrc20', 'usdtbsc', 'usdterc20', 'usdcbsc', 'btc', 'eth', 'ltc', 'trx', 'bnbbsc']);

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

// ---------- signature ----------

// NOWPayments signs the JSON body with keys sorted alphabetically at every level.
export function sortDeep(v) {
  if (Array.isArray(v)) return v.map(sortDeep);
  if (v && typeof v === 'object') {
    return Object.keys(v)
      .sort()
      .reduce((o, k) => {
        o[k] = sortDeep(v[k]);
        return o;
      }, {});
  }
  return v;
}

const toHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

export async function hmacSha512Hex(secret, message) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']);
  return toHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message)));
}

// Constant-time comparison so the signature can't be guessed byte by byte.
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function verifyIpn(rawBody, signature, secret) {
  if (!signature || !secret) return { ok: false, reason: !secret ? 'missing_secret' : 'missing_signature' };
  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return { ok: false, reason: 'bad_json' };
  }
  const expected = await hmacSha512Hex(secret, JSON.stringify(sortDeep(payload)));
  return safeEqual(expected, String(signature).trim().toLowerCase()) ? { ok: true, payload } : { ok: false, reason: 'bad_signature' };
}

// ---------- Supabase (service role, server side only) ----------

function sbHeaders(env, extra = {}) {
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  const h = { apikey: key, 'content-type': 'application/json', ...extra };
  if (key && key.startsWith('eyJ')) h.authorization = `Bearer ${key}`; // legacy JWT keys also need the bearer header
  return h;
}

async function sb(env, path, init = {}) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: sbHeaders(env, init.headers) });
  const text = await r.text();
  if (!r.ok) throw new Error(`supabase ${r.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

const getOrderByToken = (env, token) =>
  sb(env, `orders?token=eq.${encodeURIComponent(token)}&select=id,order_number,status,quote_amount,quote_currency,payment_method,payment_reference,lang`).then((r) => r[0]);
const getOrderByNumber = (env, n) =>
  sb(env, `orders?order_number=eq.${encodeURIComponent(n)}&select=id,order_number,status,quote_amount,quote_currency,payment_method,payment_reference,lang`).then((r) => r[0]);
const patchOrder = (env, id, patch) => sb(env, `orders?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(patch), headers: { prefer: 'return=minimal' } });
const addEvent = (env, order_id, kind, message, isPublic = true) =>
  sb(env, 'order_events', { method: 'POST', body: JSON.stringify({ order_id, kind, message, public: isPublic }), headers: { prefer: 'return=minimal' } });

// ---------- NOWPayments helpers ----------

const OPEN = new Set(['waiting', 'confirming', 'confirmed', 'sending', 'partially_paid']);
const isCrypto = (order) => String(order.payment_method || '').startsWith('crypto:') && /^\d+$/.test(String(order.payment_reference || ''));

async function getPayment(env, id) {
  const r = await fetch(`${NOWPAYMENTS}/payment/${encodeURIComponent(id)}`, { headers: { 'x-api-key': env.NOWPAYMENTS_API_KEY } });
  if (!r.ok) return null;
  return r.json();
}

// What the tracking page needs (no secrets, no internal fields).
const publicPayment = (p, extra = {}) => ({
  payment_id: p.payment_id,
  payment_status: p.payment_status,
  pay_address: p.pay_address,
  pay_amount: p.pay_amount,
  actually_paid: p.actually_paid ?? 0,
  pay_currency: p.pay_currency,
  price_amount: p.price_amount,
  price_currency: p.price_currency,
  network: p.network ?? null,
  payin_extra_id: p.payin_extra_id ?? null,
  expiration_estimate_date: p.expiration_estimate_date ?? null,
  ...extra,
});

// Apply a NOWPayments status to the order. Used by the signed webhook and by the
// status check (which reads straight from NOWPayments with our API key, so it is trusted too).
async function applyPayment(env, order, p, { fromPoll = false } = {}) {
  if (order.status === 'paid' || order.status === 'in_progress' || order.status === 'delivered') return { already: order.status };
  const status = String(p.payment_status || '');
  const quote = Number(order.quote_amount);
  const priced = Number(p.price_amount);
  const amountOk = !quote || (priced && Math.abs(priced - quote) < 0.01);
  const ref = { payment_method: `crypto:${p.pay_currency}`, payment_reference: String(p.payment_id) };

  if (status === 'finished' && amountOk) {
    await patchOrder(env, order.id, { status: 'paid', ...ref });
    await addEvent(env, order.id, 'update', `Crypto payment confirmed: ${p.actually_paid ?? p.pay_amount} ${String(p.pay_currency).toUpperCase()}.`);
    return { status: 'paid' };
  }
  if (['confirming', 'confirmed', 'sending'].includes(status) && order.status === 'accepted') {
    await patchOrder(env, order.id, { status: 'payment_submitted', ...ref });
    return { status: 'payment_submitted' };
  }
  if (status === 'partially_paid' && !fromPoll) {
    await addEvent(env, order.id, 'update', `Partial payment received: ${p.actually_paid} of ${p.pay_amount} ${String(p.pay_currency).toUpperCase()}. Please send the rest or contact us.`);
  } else if (['failed', 'expired', 'refunded'].includes(status)) {
    await addEvent(env, order.id, 'update', `Crypto payment ${status}. You can start a new payment from this page.`);
    await patchOrder(env, order.id, { payment_reference: null, ...(order.status === 'payment_submitted' ? { status: 'accepted' } : {}) });
  } else if (status === 'finished' && !amountOk && !fromPoll) {
    await addEvent(env, order.id, 'update', `Payment ${p.payment_id} finished but the amount (${priced}) does not match the quote (${quote}). Check manually.`, false);
  }
  return { status: order.status };
}

// ---------- handlers ----------

async function create(request, env) {
  if (!env.NOWPAYMENTS_API_KEY) return json({ error: 'payments_not_configured' }, 503);
  if (!env.SUPABASE_SERVICE_ROLE_KEY) return json({ error: 'database_not_configured' }, 503);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }
  const token = String(body.token || '');
  if (!/^[0-9a-f-]{36}$/i.test(token)) return json({ error: 'invalid_token' }, 400);
  const currency = ALLOWED_CURRENCIES.has(String(body.currency || '').toLowerCase()) ? String(body.currency).toLowerCase() : DEFAULT_CURRENCY;

  const order = await getOrderByToken(env, token);
  if (!order) return json({ error: 'order_not_found' }, 404);
  // Reuse an open payment instead of creating a second address.
  if (isCrypto(order) && (order.status === 'accepted' || order.status === 'payment_submitted')) {
    const existing = await getPayment(env, order.payment_reference);
    if (existing && OPEN.has(existing.payment_status)) return json(publicPayment(existing, { reused: true }));
  }
  if (order.status !== 'accepted') return json({ error: 'order_not_payable', status: order.status }, 409);
  const amount = Number(order.quote_amount);
  if (!amount || amount <= 0) return json({ error: 'no_quote_amount' }, 409);

  // Price is always taken from the database, never from the browser.
  const r = await fetch(`${NOWPAYMENTS}/payment`, {
    method: 'POST',
    headers: { 'x-api-key': env.NOWPAYMENTS_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({
      price_amount: amount,
      price_currency: String(order.quote_currency || 'usd').toLowerCase(),
      pay_currency: currency,
      order_id: order.order_number,
      order_description: `Sylkit ${order.order_number}`,
      ipn_callback_url: `${SITE}/api/pay/ipn`,
    }),
  });
  const p = await r.json().catch(() => ({}));
  if (!r.ok) {
    console.error('nowpayments create failed', r.status, JSON.stringify(p));
    return json({ error: 'nowpayments_error', status: r.status, message: p.message || p.code || 'unknown' }, 502);
  }

  await patchOrder(env, order.id, { payment_method: `crypto:${p.pay_currency}`, payment_reference: String(p.payment_id) });
  await addEvent(env, order.id, 'update', `Crypto payment created (${String(p.pay_currency).toUpperCase()}). Waiting for the transfer.`);

  return json(publicPayment(p));
}

// Plans have fixed prices calculated by the database at order time (orders.estimate),
// so there is nothing to quote: confirm the order at that total and let the client pay now.
const money2 = (n) => `$${Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
function checkoutNotes(e, es) {
  const name = (x) => (es ? x.name_es : x.name_en);
  const per = es ? '/mes' : '/mo';
  const once = e.billing === 'once';
  const lines = [
    `${es ? 'Plan' : 'Plan'} ${es ? e.plan_name?.es : e.plan_name?.en} · ${once ? (es ? 'pago único' : 'buy once') : e.billing === 'yearly' ? (es ? 'anual' : 'yearly') : es ? 'mensual' : 'monthly'}`,
    ...(e.lines || []).map((l) => `+ ${name(l)}${l.qty > 1 ? ` ×${l.qty}` : ''}: ${l.kind === 'monthly' && !once ? `${money2(l.total)}${per}` : money2(once && l.kind === 'monthly' ? l.total * 30 : l.total)}`),
    `${es ? 'Pago único (instalación y extras)' : 'One-time (setup and extras)'}: ${money2(e.one_time)}`,
    once ? `${es ? 'Licencia' : 'License'}: ${money2(e.license)}` : `${e.billing === 'yearly' ? (es ? 'Primer año' : 'First year') : es ? 'Primer mes' : 'First month'}: ${money2(e.recurring)}`,
    `${es ? 'Total' : 'Total'}: ${money2(e.due_today)}`,
  ];
  return lines.join('\n');
}

async function checkout(request, env) {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) return json({ error: 'database_not_configured' }, 503);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }
  const token = String(body.token || '');
  if (!/^[0-9a-f-]{36}$/i.test(token)) return json({ error: 'invalid_token' }, 400);
  const rows = await sb(env, `orders?token=eq.${encodeURIComponent(token)}&select=id,status,estimate,estimated_total,lang,created_at`);
  const order = rows[0];
  if (!order) return json({ error: 'order_not_found' }, 404);
  if (order.status === 'accepted') return json({ ok: true, already: true });
  if (order.status !== 'new') return json({ error: 'order_not_open', status: order.status }, 409);
  const total = Number(order.estimated_total);
  if (!order.estimate || !total || total <= 0) return json({ error: 'needs_quote' }, 409); // custom request: we send a quote
  if (Date.now() - new Date(order.created_at).getTime() > 24 * 3600 * 1000) return json({ error: 'needs_quote' }, 409);
  const es = order.lang === 'es';
  const validUntil = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
  await patchOrder(env, order.id, {
    status: 'accepted',
    quote_amount: total,
    quote_currency: 'USD',
    quote_valid_until: validUntil,
    quote_notes: checkoutNotes(order.estimate, es),
  });
  await addEvent(env, order.id, 'update', es ? `Pedido confirmado. Total a pagar: ${money2(total)}.` : `Order confirmed. Total to pay: ${money2(total)}.`);
  return json({ ok: true, total });
}

async function statusCheck(url, env) {
  if (!env.NOWPAYMENTS_API_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) return json({ error: 'payments_not_configured' }, 503);
  const token = url.searchParams.get('t') || '';
  if (!/^[0-9a-f-]{36}$/i.test(token)) return json({ error: 'invalid_token' }, 400);
  const order = await getOrderByToken(env, token);
  if (!order) return json({ error: 'order_not_found' }, 404);
  if (!isCrypto(order)) return json({ order_status: order.status, payment: null });
  const p = await getPayment(env, order.payment_reference);
  if (!p) return json({ order_status: order.status, payment: null });
  if (String(p.order_id) !== order.order_number) return json({ order_status: order.status, payment: null });
  const applied = await applyPayment(env, order, p, { fromPoll: true }); // catches up if a webhook was missed
  return json({ order_status: applied.status ?? applied.already ?? order.status, payment: publicPayment(p) });
}

async function ipn(request, env) {
  const raw = await request.text();
  const check = await verifyIpn(raw, request.headers.get('x-nowpayments-sig'), env.NOWPAYMENTS_IPN_SECRET);
  if (!check.ok) return json({ error: check.reason }, check.reason === 'missing_secret' ? 503 : 401);
  if (!env.SUPABASE_SERVICE_ROLE_KEY) return json({ error: 'database_not_configured' }, 503);

  const p = check.payload;
  const order = await getOrderByNumber(env, String(p.order_id || ''));
  if (!order) return json({ ok: true, ignored: 'unknown_order' }); // 200 so NOWPayments stops retrying
  if (order.payment_reference && String(order.payment_reference) !== String(p.payment_id)) {
    await addEvent(env, order.id, 'update', `Ignored notification for a different payment (${p.payment_id}).`, false);
    return json({ ok: true, ignored: 'other_payment' });
  }
  const applied = await applyPayment(env, order, p);
  if (applied.already) return json({ ok: true, already: applied.already });
  const status = String(p.payment_status || '');
  return json({ ok: true, status });
}

async function health(env) {
  const configured = {
    NOWPAYMENTS_API_KEY: !!env.NOWPAYMENTS_API_KEY,
    NOWPAYMENTS_IPN_SECRET: !!env.NOWPAYMENTS_IPN_SECRET,
    SUPABASE_SERVICE_ROLE_KEY: !!env.SUPABASE_SERVICE_ROLE_KEY,
  };
  const out = { configured };
  try {
    const s = await fetch(`${NOWPAYMENTS}/status`);
    out.api_status = { http: s.status, body: await s.json().catch(() => null) };
  } catch (e) {
    out.api_status = { error: String(e) };
  }
  if (env.NOWPAYMENTS_API_KEY) {
    // First contact with the API using the key (the merchant check below is the strict one).
    try {
      const c = await fetch(`${NOWPAYMENTS}/currencies`, { headers: { 'x-api-key': env.NOWPAYMENTS_API_KEY } });
      const b = await c.json().catch(() => ({}));
      out.api_key_check = { http: c.status, ok: c.ok, currencies: Array.isArray(b.currencies) ? b.currencies.length : undefined, message: c.ok ? undefined : b.message };
    } catch (e) {
      out.api_key_check = { error: String(e) };
    }
  }
  out.mode = NOWPAYMENTS === NOWPAYMENTS_SANDBOX ? 'sandbox' : 'live';
  // Which coins this NOWPayments account accepts, and the minimum for each checkout network.
  if (env.NOWPAYMENTS_API_KEY) {
    const h = { 'x-api-key': env.NOWPAYMENTS_API_KEY };
    try {
      const m = await fetch(`${NOWPAYMENTS}/merchant/coins`, { headers: h });
      const b = await m.json().catch(() => ({}));
      const coins = (b.selectedCurrencies || []).map((c) => String(c).toLowerCase());
      out.merchant_coins = { http: m.status, total: coins.length, usdttrc20: coins.includes('usdttrc20'), usdtbsc: coins.includes('usdtbsc'), message: m.ok ? undefined : b.message };
    } catch (e) {
      out.merchant_coins = { error: String(e) };
    }
    out.min_amounts = {};
    for (const c of ['usdttrc20', 'usdtbsc']) {
      try {
        const m = await fetch(`${NOWPAYMENTS}/min-amount?currency_from=${c}&currency_to=${c}&fiat_equivalent=usd`, { headers: h });
        const b = await m.json().catch(() => ({}));
        out.min_amounts[c] = m.ok ? { min: b.min_amount, usd: b.fiat_equivalent } : { http: m.status, message: b.message };
      } catch (e) {
        out.min_amounts[c] = { error: String(e) };
      }
    }
  }
  // If the key is refused, see whether it is a sandbox (test) key.
  if (env.NOWPAYMENTS_API_KEY && out.merchant_coins?.http !== 200) {
    const other = NOWPAYMENTS === NOWPAYMENTS_LIVE ? NOWPAYMENTS_SANDBOX : NOWPAYMENTS_LIVE;
    try {
      const m = await fetch(`${other}/merchant/coins`, { headers: { 'x-api-key': env.NOWPAYMENTS_API_KEY } });
      const b = await m.json().catch(() => ({}));
      out.key_works_on = m.ok ? (other === NOWPAYMENTS_SANDBOX ? 'sandbox' : 'live') : 'neither';
      out.other_server = { http: m.status, message: m.ok ? undefined : b.message };
    } catch (e) {
      out.other_server = { error: String(e) };
    }
  }
  // /v1/currencies answers even with a bad key, so the real test is a merchant endpoint.
  if (out.api_key_check) out.api_key_check.ok = out.api_key_check.ok && out.merchant_coins?.http === 200;
  out.ready = configured.NOWPAYMENTS_API_KEY && configured.NOWPAYMENTS_IPN_SECRET && configured.SUPABASE_SERVICE_ROLE_KEY && !!out.api_key_check?.ok;
  return json(out);
}

export async function handlePayments(request, env, url) {
  NOWPAYMENTS = String(env.NOWPAYMENTS_SANDBOX || '').toLowerCase() === 'true' ? NOWPAYMENTS_SANDBOX : NOWPAYMENTS_LIVE;
  try {
    if (url.pathname === '/api/pay/health' && request.method === 'GET') return await health(env);
    if (url.pathname === '/api/pay/status' && request.method === 'GET') return await statusCheck(url, env);
    if (url.pathname === '/api/pay/checkout' && request.method === 'POST') return await checkout(request, env);
    if (url.pathname === '/api/pay/create' && request.method === 'POST') return await create(request, env);
    if (url.pathname === '/api/pay/ipn' && request.method === 'POST') return await ipn(request, env);
    return json({ error: 'not_found' }, 404);
  } catch (e) {
    console.error('payments error', e);
    return json({ error: 'server_error' }, 500);
  }
}
