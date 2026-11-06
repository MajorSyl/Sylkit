// PayPal Checkout for Sylkit orders: the customer pays with their PayPal balance or a debit/credit
// card on PayPal's own page, comes back to the order page, and we capture the payment and mark the
// order paid.
//
//   POST /api/paypal/checkout  { token }                 -> { url }   (redirect the customer there)
//   POST /api/paypal/capture   { token, paypal_order }   -> { order_status }
//   GET  /api/paypal/health                               -> configuration check (no secrets)
//
// Secrets (Cloudflare Worker -> Settings -> Variables and Secrets):
//   PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET                  live app (real money)
//   PAYPAL_SANDBOX_CLIENT_ID / PAYPAL_SANDBOX_CLIENT_SECRET  sandbox app (fake money, for testing)
//
// Live is used whenever live keys exist. Sandbox is only used for an order opened with ?paypaltest=1
// and only while no live keys are set. A sandbox capture never marks an order as paid: it moves it to
// "payment_submitted" with an internal note, so fake money can never unlock real work.

const SUPABASE_URL = 'https://chcljhwcvzlmxrrhetfv.supabase.co';
const SITE = 'https://sylkit.com';
const LIVE_API = 'https://api-m.paypal.com';
const SANDBOX_API = 'https://api-m.sandbox.paypal.com';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const money2 = (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const hasLive = (env) => !!(env.PAYPAL_CLIENT_ID && env.PAYPAL_CLIENT_SECRET);
export const hasSandbox = (env) => !!(env.PAYPAL_SANDBOX_CLIENT_ID && env.PAYPAL_SANDBOX_CLIENT_SECRET);

// Which PayPal environment a request may use. `wantTest` comes from the page (?paypaltest=1).
function modeFor(env, wantTest) {
  if (hasLive(env)) return 'live';
  if (wantTest && hasSandbox(env)) return 'sandbox';
  return null;
}

function creds(env, mode) {
  return mode === 'live'
    ? { base: LIVE_API, id: env.PAYPAL_CLIENT_ID, secret: env.PAYPAL_CLIENT_SECRET }
    : { base: SANDBOX_API, id: env.PAYPAL_SANDBOX_CLIENT_ID, secret: env.PAYPAL_SANDBOX_CLIENT_SECRET };
}

// ---------- PayPal REST ----------

const tokenCache = {};
async function accessToken(env, mode) {
  const c = creds(env, mode);
  const hit = tokenCache[mode];
  if (hit && hit.exp > Date.now() + 60_000 && hit.id === c.id) return hit.token;
  const r = await fetch(`${c.base}/v1/oauth2/token`, {
    method: 'POST',
    headers: { authorization: `Basic ${btoa(`${c.id}:${c.secret}`)}`, 'content-type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) {
    const e = new Error(`paypal auth ${r.status}: ${j.error_description || j.error || 'failed'}`);
    e.status = r.status;
    e.code = 'paypal_auth_failed';
    throw e;
  }
  tokenCache[mode] = { token: j.access_token, exp: Date.now() + Number(j.expires_in || 300) * 1000, id: c.id };
  return j.access_token;
}

async function paypal(env, mode, method, path, body, requestId) {
  const c = creds(env, mode);
  const headers = { authorization: `Bearer ${await accessToken(env, mode)}`, 'content-type': 'application/json', prefer: 'return=representation' };
  if (requestId) headers['paypal-request-id'] = requestId;
  const r = await fetch(`${c.base}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const issue = data?.details?.[0]?.issue || data?.name || 'unknown';
    const e = new Error(`paypal ${r.status}: ${issue} ${data?.details?.[0]?.description || data?.message || ''}`.trim());
    e.status = r.status;
    e.code = issue;
    throw e;
  }
  return data;
}

// ---------- Supabase (service role) ----------

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

const DONE = new Set(['paid', 'in_progress', 'delivered']);
const TOKEN_RE = /^[0-9a-f-]{36}$/i;

async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

// ---------- checkout ----------

async function checkout(request, env) {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) return json({ error: 'database_not_configured' }, 503);
  const body = await readBody(request);
  if (!body) return json({ error: 'bad_request' }, 400);
  const mode = modeFor(env, body.test === true);
  if (!mode) return json({ error: 'payments_not_configured' }, 503);
  const token = String(body.token || '');
  if (!TOKEN_RE.test(token)) return json({ error: 'invalid_token' }, 400);
  const order = await getOrder(env, 'token', token);
  if (!order) return json({ error: 'order_not_found' }, 404);
  if (DONE.has(order.status)) return json({ error: 'already_paid' }, 409);
  if (order.status !== 'accepted') return json({ error: 'order_not_payable', status: order.status }, 409);
  const total = Number(order.quote_amount);
  if (!total || total <= 0) return json({ error: 'no_quote_amount' }, 409);
  const currency = String(order.quote_currency || 'USD').toUpperCase();
  const es = order.lang === 'es';
  const name = order.product_name_es && es ? order.product_name_es : order.product_name_en || order.product_name_es || 'Sylkit';
  const back = `${SITE}/order?t=${token}${mode === 'sandbox' ? '&paypaltest=1' : ''}`;

  const purchase = {
    reference_id: order.order_number,
    custom_id: order.order_number,
    // invoice_id must be unique per payment on the PayPal account, so a retried order gets a new one.
    invoice_id: `${order.order_number}-${Date.now().toString(36)}`,
    description: `Sylkit ${order.order_number} · ${name}`.slice(0, 127),
    soft_descriptor: 'SYLKIT',
    amount: { currency_code: currency, value: total.toFixed(2) },
  };
  // Same order + amount within 20 minutes reuses the same PayPal order instead of creating duplicates.
  const win = Math.floor(Date.now() / (20 * 60 * 1000));
  let pp;
  try {
    pp = await paypal(
      env,
      mode,
      'POST',
      '/v2/checkout/orders',
      {
        intent: 'CAPTURE',
        purchase_units: [purchase],
        payment_source: {
          paypal: {
            experience_context: {
              brand_name: 'Sylkit',
              locale: es ? 'es-VE' : 'en-US',
              shipping_preference: 'NO_SHIPPING',
              user_action: 'PAY_NOW',
              landing_page: 'NO_PREFERENCE',
              return_url: `${back}&paid=paypal`,
              cancel_url: `${back}&pay=paypal`,
            },
          },
        },
      },
      `sylkit-${order.order_number}-${Math.round(total * 100)}-${mode}-${win}`,
    );
  } catch (e) {
    await addEvent(env, order.id, 'update', `PayPal checkout failed (${mode}, ${e.status || '?'} ${e.code || ''}): ${e.message}`, false).catch(() => {});
    throw e;
  }
  const url = (pp.links || []).find((l) => l.rel === 'payer-action' || l.rel === 'approve')?.href;
  if (!url) return json({ error: 'paypal_no_link' }, 502);
  await patchOrder(env, order.id, { payment_method: mode === 'live' ? 'paypal:pending' : 'paypal:sandbox', payment_reference: pp.id });
  await addEvent(env, order.id, 'update', mode === 'live' ? 'PayPal payment started.' : 'PayPal SANDBOX payment started (test, not real money).', false);
  return json({ url, mode });
}

// ---------- capture (customer is back from PayPal) ----------

function firstCapture(pp) {
  return pp?.purchase_units?.[0]?.payments?.captures?.[0] || null;
}

async function capture(request, env) {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) return json({ error: 'database_not_configured' }, 503);
  const body = await readBody(request);
  if (!body) return json({ error: 'bad_request' }, 400);
  const token = String(body.token || '');
  const ppId = String(body.paypal_order || '');
  if (!TOKEN_RE.test(token) || !/^[A-Z0-9]{8,32}$/.test(ppId)) return json({ error: 'bad_request' }, 400);
  const order = await getOrder(env, 'token', token);
  if (!order) return json({ error: 'order_not_found' }, 404);
  if (DONE.has(order.status)) return json({ order_status: order.status });
  // Only the PayPal order we created for this Sylkit order can be captured against it.
  if (String(order.payment_reference || '') !== ppId) return json({ error: 'not_this_order', order_status: order.status }, 409);
  const method = String(order.payment_method || '');
  const mode = method === 'paypal:sandbox' ? 'sandbox' : 'live';
  if (mode === 'sandbox' ? !hasSandbox(env) : !hasLive(env)) return json({ error: 'payments_not_configured' }, 503);

  let pp;
  try {
    pp = await paypal(env, mode, 'POST', `/v2/checkout/orders/${ppId}/capture`, {}, `capture-${ppId}`);
  } catch (e) {
    // Already captured (e.g. page refreshed): read the order instead.
    if (e.code === 'ORDER_ALREADY_CAPTURED') pp = await paypal(env, mode, 'GET', `/v2/checkout/orders/${ppId}`);
    else {
      await addEvent(env, order.id, 'update', `PayPal capture failed (${mode}, ${e.status || '?'} ${e.code || ''}): ${e.message}`, false).catch(() => {});
      return json({ error: e.code === 'INSTRUMENT_DECLINED' ? 'declined' : 'capture_failed', code: e.code, order_status: order.status }, 402);
    }
  }

  const unit = pp?.purchase_units?.[0] || {};
  const cap = firstCapture(pp);
  const es = order.lang === 'es';
  if (unit.custom_id && unit.custom_id !== order.order_number) {
    await addEvent(env, order.id, 'update', `PayPal ${ppId} belongs to ${unit.custom_id}, not this order. Check manually.`, false);
    return json({ error: 'not_this_order', order_status: order.status }, 409);
  }
  if (!cap || (cap.status !== 'COMPLETED' && cap.status !== 'PENDING')) {
    return json({ error: 'not_completed', paypal_status: cap?.status || pp?.status, order_status: order.status }, 402);
  }
  const paid = Number(cap.amount?.value);
  const quote = Number(order.quote_amount);
  const ccy = String(cap.amount?.currency_code || '').toUpperCase();
  if (Math.abs(paid - quote) > 0.01 || ccy !== String(order.quote_currency || 'USD').toUpperCase()) {
    await addEvent(env, order.id, 'update', `PayPal capture ${cap.id} amount ${ccy} ${paid} does not match the quote (${quote}). Check manually.`, false);
    await patchOrder(env, order.id, { status: 'payment_submitted', payment_reference: cap.id });
    return json({ order_status: 'payment_submitted' });
  }

  if (mode === 'sandbox') {
    await patchOrder(env, order.id, { status: 'payment_submitted', payment_method: 'paypal:sandbox', payment_reference: cap.id });
    await addEvent(env, order.id, 'update', `PayPal SANDBOX test capture ${cap.id} OK (${money2(paid)}). Not real money: do not start work.`, false);
    return json({ order_status: 'payment_submitted', sandbox: true });
  }
  if (cap.status === 'PENDING') {
    // PayPal is still reviewing (e.g. eCheck or risk review). The team confirms it when it clears.
    await patchOrder(env, order.id, { status: 'payment_submitted', payment_method: 'paypal', payment_reference: cap.id });
    await addEvent(env, order.id, 'update', `PayPal payment ${cap.id} is pending at PayPal (${cap.status_details?.reason || 'review'}).`, false);
    await addEvent(env, order.id, 'update', es ? 'Recibimos tu pago por PayPal; PayPal lo está revisando. Te avisamos al confirmarse.' : 'We received your PayPal payment; PayPal is reviewing it. We will let you know when it clears.');
    return json({ order_status: 'payment_submitted' });
  }
  await patchOrder(env, order.id, { status: 'paid', payment_method: 'paypal', payment_reference: cap.id });
  await addEvent(env, order.id, 'update', es ? `Pago con PayPal confirmado: ${money2(paid)}.` : `PayPal payment confirmed: ${money2(paid)}.`);
  return json({ order_status: 'paid' });
}

// ---------- health (no secrets) ----------

async function health(env) {
  const out = { live: hasLive(env), sandbox: hasSandbox(env), checks: {} };
  for (const mode of ['live', 'sandbox']) {
    if (!out[mode]) continue;
    try {
      await accessToken(env, mode);
      out.checks[mode] = { ok: true };
    } catch (e) {
      out.checks[mode] = { ok: false, message: String(e.message || e).slice(0, 200) };
    }
  }
  out.ready = !!out.checks.live?.ok;
  return json(out);
}

export async function handlePaypal(request, env, url) {
  try {
    if (url.pathname === '/api/paypal/health' && request.method === 'GET') return await health(env);
    if (url.pathname === '/api/paypal/checkout' && request.method === 'POST') return await checkout(request, env);
    if (url.pathname === '/api/paypal/capture' && request.method === 'POST') return await capture(request, env);
    return json({ error: 'not_found' }, 404);
  } catch (e) {
    console.error('paypal error', e);
    return json({ error: e.status && e.status < 500 ? 'paypal_error' : 'server_error', code: e.code || undefined, message: String(e.message || '').slice(0, 300) || undefined }, e.status && e.status < 500 ? 502 : 500);
  }
}
