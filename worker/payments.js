// NOWPayments (crypto) for Sylkit orders.
//
//   POST /api/pay/create   { token, currency? }  -> creates a NOWPayments payment for an accepted quote
//   POST /api/pay/ipn      NOWPayments webhook   -> verifies x-nowpayments-sig, then updates the order
//   GET  /api/pay/health                         -> says which secrets are bound and whether NOWPayments answers (never returns secret values)
//
// Runtime secrets (Worker > Settings > Variables and Secrets, type "Secret"):
//   NOWPAYMENTS_API_KEY, NOWPAYMENTS_IPN_SECRET, SUPABASE_SERVICE_ROLE_KEY
// No imports needed: HMAC uses the Web Crypto API built into Workers (crypto.subtle).

const NOWPAYMENTS = 'https://api.nowpayments.io/v1';
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
  sb(env, `orders?token=eq.${encodeURIComponent(token)}&select=id,order_number,status,quote_amount,quote_currency,payment_reference,lang`).then((r) => r[0]);
const getOrderByNumber = (env, n) =>
  sb(env, `orders?order_number=eq.${encodeURIComponent(n)}&select=id,order_number,status,quote_amount,quote_currency,payment_reference,lang`).then((r) => r[0]);
const patchOrder = (env, id, patch) => sb(env, `orders?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(patch), headers: { prefer: 'return=minimal' } });
const addEvent = (env, order_id, kind, message, isPublic = true) =>
  sb(env, 'order_events', { method: 'POST', body: JSON.stringify({ order_id, kind, message, public: isPublic }), headers: { prefer: 'return=minimal' } });

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
  if (!r.ok) return json({ error: 'nowpayments_error', status: r.status, message: p.message || p.code || 'unknown' }, 502);

  await patchOrder(env, order.id, { payment_method: `crypto:${p.pay_currency}`, payment_reference: String(p.payment_id) });
  await addEvent(env, order.id, 'update', `Crypto payment created (${String(p.pay_currency).toUpperCase()}). Waiting for the transfer.`);

  return json({
    payment_id: p.payment_id,
    payment_status: p.payment_status,
    pay_address: p.pay_address,
    pay_amount: p.pay_amount,
    pay_currency: p.pay_currency,
    price_amount: p.price_amount,
    price_currency: p.price_currency,
    network: p.network,
    payin_extra_id: p.payin_extra_id ?? null,
    expiration_estimate_date: p.expiration_estimate_date ?? null,
  });
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
  if (order.status === 'paid' || order.status === 'in_progress' || order.status === 'delivered') return json({ ok: true, already: order.status });

  const status = String(p.payment_status || '');
  const quote = Number(order.quote_amount);
  const priced = Number(p.price_amount);
  const amountOk = !quote || (priced && Math.abs(priced - quote) < 0.01);

  if (status === 'finished' && amountOk) {
    await patchOrder(env, order.id, { status: 'paid', payment_method: `crypto:${p.pay_currency}`, payment_reference: String(p.payment_id) });
    await addEvent(env, order.id, 'update', `Crypto payment confirmed: ${p.actually_paid ?? p.pay_amount} ${String(p.pay_currency).toUpperCase()}.`);
  } else if (['confirming', 'confirmed', 'sending'].includes(status) && order.status === 'accepted') {
    await patchOrder(env, order.id, { status: 'payment_submitted', payment_method: `crypto:${p.pay_currency}`, payment_reference: String(p.payment_id) });
  } else if (status === 'partially_paid') {
    await addEvent(env, order.id, 'update', `Partial payment received: ${p.actually_paid} of ${p.pay_amount} ${String(p.pay_currency).toUpperCase()}. Please send the rest or contact us.`);
  } else if (['failed', 'expired', 'refunded'].includes(status)) {
    await addEvent(env, order.id, 'update', `Crypto payment ${status}. You can start a new payment from this page.`);
    await patchOrder(env, order.id, { payment_reference: null });
  } else if (status === 'finished' && !amountOk) {
    await addEvent(env, order.id, 'update', `Payment ${p.payment_id} finished but the amount (${priced}) does not match the quote (${quote}). Check manually.`, false);
  }
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
    // /v1/currencies requires a valid key: 200 = key accepted, 401/403 = key rejected.
    try {
      const c = await fetch(`${NOWPAYMENTS}/currencies`, { headers: { 'x-api-key': env.NOWPAYMENTS_API_KEY } });
      const b = await c.json().catch(() => ({}));
      out.api_key_check = { http: c.status, ok: c.ok, currencies: Array.isArray(b.currencies) ? b.currencies.length : undefined, message: c.ok ? undefined : b.message };
    } catch (e) {
      out.api_key_check = { error: String(e) };
    }
  }
  out.ready = configured.NOWPAYMENTS_API_KEY && configured.NOWPAYMENTS_IPN_SECRET && configured.SUPABASE_SERVICE_ROLE_KEY && !!out.api_key_check?.ok;
  return json(out);
}

export async function handlePayments(request, env, url) {
  try {
    if (url.pathname === '/api/pay/health' && request.method === 'GET') return await health(env);
    if (url.pathname === '/api/pay/create' && request.method === 'POST') return await create(request, env);
    if (url.pathname === '/api/pay/ipn' && request.method === 'POST') return await ipn(request, env);
    return json({ error: 'not_found' }, 404);
  } catch (e) {
    console.error('payments error', e);
    return json({ error: 'server_error' }, 500);
  }
}
