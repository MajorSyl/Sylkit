// Stripe (card payments) for Sylkit orders.
//
//   POST /api/stripe/checkout  { token }  -> Stripe Checkout link for an accepted order
//   POST /api/stripe/webhook   Stripe webhook -> verifies Stripe-Signature, then updates the order
//   POST /api/stripe/portal    { token }  -> customer portal link (update card, see invoices, cancel)
//   GET  /api/stripe/status?t=<token>     -> re-checks the last Checkout session (fallback if a webhook was missed)
//   GET  /api/stripe/health                -> which secrets are bound, test or live mode (never returns secret values)
//
// How an order is charged (amounts always come from the database, never from the browser):
//   yearly / monthly plan -> subscription: recurring part renews automatically every year / month,
//                            setup fee and one-time extras are added to the first invoice only
//   buy once              -> single payment of the full total
//   custom quote          -> single payment of the quote amount
// Each plan is linked to its Stripe product (id "sylkit_<product-slug>_<plan>") so the Stripe dashboard
// shows which system was sold.
//
// Runtime secrets (Worker > Settings > Variables and Secrets, type "Secret"):
//   STRIPE_SECRET_KEY (sk_test_... or sk_live_...), STRIPE_WEBHOOK_SECRET (whsec_...), SUPABASE_SERVICE_ROLE_KEY

const STRIPE = 'https://api.stripe.com/v1';
const SUPABASE_URL = 'https://chcljhwcvzlmxrrhetfv.supabase.co';
const SITE = 'https://sylkit.com';
const TOLERANCE_SECONDS = 300;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

const cents = (n) => Math.round(Number(n) * 100);
const money2 = (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ---------- Stripe API (form-encoded, no SDK needed in Workers) ----------

export function formEncode(obj, prefix = '', out = []) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) v.forEach((item, i) => (item && typeof item === 'object' ? formEncode(item, `${key}[${i}]`, out) : out.push(`${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(item)}`)));
    else if (typeof v === 'object') formEncode(v, key, out);
    else out.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
  }
  return out.join('&');
}

async function stripe(env, method, path, params, idempotencyKey) {
  const headers = { authorization: `Bearer ${env.STRIPE_SECRET_KEY}` };
  let url = `${STRIPE}${path}`;
  let body;
  if (params && method === 'GET') url += `?${formEncode(params)}`;
  else if (params) {
    body = formEncode(params);
    headers['content-type'] = 'application/x-www-form-urlencoded';
  }
  if (idempotencyKey) headers['idempotency-key'] = idempotencyKey;
  const r = await fetch(url, { method, headers, body });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const err = new Error(`stripe ${r.status}: ${data?.error?.message || 'unknown'}`);
    err.status = r.status;
    err.code = data?.error?.code;
    throw err;
  }
  return data;
}

// ---------- webhook signature ----------

const toHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

async function hmacSha256Hex(secret, message) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message)));
}

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Stripe-Signature: t=<unix>,v1=<hex>[,v1=<hex>...]  signed payload = "<t>.<raw body>"
export async function verifyStripeSignature(rawBody, header, secret, now = Math.floor(Date.now() / 1000)) {
  if (!secret) return { ok: false, reason: 'missing_secret' };
  if (!header) return { ok: false, reason: 'missing_signature' };
  const parts = String(header).split(',').map((p) => p.trim().split('='));
  const t = parts.find(([k]) => k === 't')?.[1];
  const sigs = parts.filter(([k]) => k === 'v1').map(([, v]) => v);
  if (!t || !sigs.length) return { ok: false, reason: 'bad_signature' };
  if (Math.abs(now - Number(t)) > TOLERANCE_SECONDS) return { ok: false, reason: 'too_old' };
  const expected = await hmacSha256Hex(secret, `${t}.${rawBody}`);
  if (!sigs.some((s) => safeEqual(expected, s))) return { ok: false, reason: 'bad_signature' };
  try {
    return { ok: true, event: JSON.parse(rawBody) };
  } catch {
    return { ok: false, reason: 'bad_json' };
  }
}

// ---------- Supabase (service role, server side only) ----------

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
const isCard = (order) => String(order.payment_method || '').startsWith('card');

// ---------- building the Checkout session ----------

async function productFor(env, order, est) {
  const slug = order.product_slug;
  if (slug && est?.plan) {
    const id = `sylkit_${slug}_${est.plan}`;
    try {
      const p = await stripe(env, 'GET', `/products/${encodeURIComponent(id)}`);
      if (p?.active) return { product: p.id };
    } catch (e) {
      if (e.status !== 404) throw e;
    }
  }
  const name = order.product_name_en || order.product_name_es || 'Sylkit order';
  const plan = est?.plan_name?.en ? ` — ${est.plan_name.en}` : '';
  return { product_data: { name: `${name}${plan}`, metadata: { sylkit_order: order.order_number } } };
}

export function chargePlan(order) {
  const est = order.estimate;
  const total = Number(order.quote_amount);
  const fixed = est && (est.billing === 'yearly' || est.billing === 'monthly') && Number(est.recurring) > 0;
  // A fixed-price plan confirmed at its calculated total becomes a subscription.
  if (fixed && Math.abs(Number(est.due_today) - total) < 0.01) {
    return { mode: 'subscription', interval: est.billing === 'yearly' ? 'year' : 'month', recurring: Number(est.recurring), oneTime: Number(est.one_time) || 0, total };
  }
  return { mode: 'payment', total };
}

async function createCheckout(request, env) {
  if (!env.STRIPE_SECRET_KEY) return json({ error: 'payments_not_configured' }, 503);
  if (!env.SUPABASE_SERVICE_ROLE_KEY) return json({ error: 'database_not_configured' }, 503);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }
  const token = String(body.token || '');
  if (!/^[0-9a-f-]{36}$/i.test(token)) return json({ error: 'invalid_token' }, 400);
  const order = await getOrder(env, 'token', token);
  if (!order) return json({ error: 'order_not_found' }, 404);
  if (DONE.has(order.status)) return json({ error: 'already_paid' }, 409);
  if (order.status !== 'accepted') return json({ error: 'order_not_payable', status: order.status }, 409);
  const total = Number(order.quote_amount);
  if (!total || total <= 0) return json({ error: 'no_quote_amount' }, 409);
  const currency = String(order.quote_currency || 'usd').toLowerCase();

  const es = order.lang === 'es';
  const plan = chargePlan(order);
  const product = await productFor(env, order, order.estimate);
  const meta = { sylkit_order: order.order_number, sylkit_token: token };
  const track = `${SITE}/track?t=${token}`;

  const params = {
    mode: plan.mode,
    client_reference_id: order.order_number,
    success_url: `${track}&paid=card`,
    cancel_url: track,
    locale: es ? 'es' : 'en',
    metadata: meta,
    billing_address_collection: 'auto',
    ...(order.customer_email ? { customer_email: order.customer_email } : {}),
  };

  if (plan.mode === 'subscription') {
    params.line_items = [{ quantity: 1, price_data: { currency, unit_amount: cents(plan.recurring), recurring: { interval: plan.interval }, ...product } }];
    if (plan.oneTime > 0) {
      params.line_items.push({
        quantity: 1,
        price_data: { currency, unit_amount: cents(plan.oneTime), product_data: { name: es ? 'Instalación y extras (pago único)' : 'Setup and extras (one-time)' } },
      });
    }
    params.subscription_data = { metadata: meta, description: `Sylkit ${order.order_number}` };
  } else {
    params.line_items = [{ quantity: 1, price_data: { currency, unit_amount: cents(total), ...product } }];
    params.customer_creation = 'always';
    params.payment_intent_data = { metadata: meta, description: `Sylkit ${order.order_number}` };
    params.invoice_creation = { enabled: true, invoice_data: { metadata: meta } };
  }

  // Same order + same amount within a short window reuses the same session instead of making duplicates.
  const window = Math.floor(Date.now() / (20 * 60 * 1000));
  const session = await stripe(env, 'POST', '/checkout/sessions', params, `sylkit-${order.order_number}-${cents(total)}-${plan.mode}-${window}`);

  await patchOrder(env, order.id, { payment_method: 'card', payment_reference: session.id });
  await addEvent(env, order.id, 'update', es ? 'Pago con tarjeta iniciado.' : 'Card payment started.', false);
  return json({ url: session.url, mode: plan.mode });
}

// ---------- applying results ----------

async function markPaid(env, order, session) {
  if (DONE.has(order.status)) return { already: order.status };
  if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') return { status: order.status };
  const paidTotal = Number(session.amount_total) / 100;
  const quote = Number(order.quote_amount);
  const es = order.lang === 'es';
  const ref = session.subscription || session.payment_intent || session.id;
  if (quote && Math.abs(paidTotal - quote) > 0.01) {
    await addEvent(env, order.id, 'update', `Card payment ${session.id} total (${paidTotal}) does not match the quote (${quote}). Check manually.`, false);
    return { status: order.status };
  }
  await patchOrder(env, order.id, { status: 'paid', payment_method: session.mode === 'subscription' ? 'card:subscription' : 'card', payment_reference: String(ref) });
  const renew =
    session.mode === 'subscription'
      ? es
        ? ' Se renueva automáticamente; puedes gestionar tu tarjeta o cancelar desde esta página.'
        : ' It renews automatically; you can manage your card or cancel from this page.'
      : '';
  await addEvent(env, order.id, 'update', es ? `Pago con tarjeta confirmado: ${money2(paidTotal)}.${renew}` : `Card payment confirmed: ${money2(paidTotal)}.${renew}`);
  return { status: 'paid' };
}

const orderFromMeta = (env, obj) => {
  const n = obj?.metadata?.sylkit_order || obj?.client_reference_id;
  return n ? getOrder(env, 'order_number', String(n)) : null;
};

// Renewal invoices carry the subscription's metadata on the parent.subscription_details (new API)
// or subscription_details (older API).
const invoiceMeta = (inv) => inv?.parent?.subscription_details?.metadata || inv?.subscription_details?.metadata || inv?.metadata || {};

async function onInvoice(env, inv, kind) {
  const meta = invoiceMeta(inv);
  if (!meta.sylkit_order) return { ignored: 'no_order' };
  const order = await getOrder(env, 'order_number', String(meta.sylkit_order));
  if (!order) return { ignored: 'unknown_order' };
  const es = order.lang === 'es';
  const amount = money2(Number(inv.amount_paid || inv.amount_due) / 100);
  if (kind === 'paid' && inv.billing_reason === 'subscription_cycle') {
    await addEvent(env, order.id, 'update', es ? `Renovación pagada: ${amount}. ¡Gracias!` : `Renewal paid: ${amount}. Thank you!`);
  } else if (kind === 'failed') {
    await addEvent(
      env,
      order.id,
      'update',
      es
        ? `No pudimos cobrar la renovación (${amount}). Actualiza tu tarjeta desde esta página para no perder el servicio.`
        : `We could not charge your renewal (${amount}). Update your card from this page to keep your service.`,
    );
  }
  return { ok: true };
}

async function onSubscriptionEnded(env, sub) {
  const n = sub?.metadata?.sylkit_order;
  if (!n) return { ignored: 'no_order' };
  const order = await getOrder(env, 'order_number', String(n));
  if (!order) return { ignored: 'unknown_order' };
  const es = order.lang === 'es';
  await addEvent(env, order.id, 'update', es ? 'Tu suscripción terminó. Escríbenos si quieres reactivarla.' : 'Your subscription has ended. Message us if you want to reactivate it.');
  await addEvent(env, order.id, 'update', `Stripe subscription ${sub.id} ended (status ${sub.status}). Check if the service should be paused.`, false);
  return { ok: true };
}

async function webhook(request, env) {
  const raw = await request.text();
  const check = await verifyStripeSignature(raw, request.headers.get('stripe-signature'), env.STRIPE_WEBHOOK_SECRET);
  if (!check.ok) return json({ error: check.reason }, check.reason === 'missing_secret' ? 503 : 400);
  if (!env.SUPABASE_SERVICE_ROLE_KEY) return json({ error: 'database_not_configured' }, 503);
  const event = check.event;
  const obj = event?.data?.object || {};
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      const order = await orderFromMeta(env, obj);
      if (!order) return json({ ok: true, ignored: 'unknown_order' });
      return json({ ok: true, ...(await markPaid(env, order, obj)) });
    }
    case 'checkout.session.async_payment_failed': {
      const order = await orderFromMeta(env, obj);
      if (order) await addEvent(env, order.id, 'update', order.lang === 'es' ? 'El pago no se completó. Puedes intentarlo de nuevo.' : 'The payment did not go through. You can try again.');
      return json({ ok: true });
    }
    case 'invoice.paid':
      return json(await onInvoice(env, obj, 'paid'));
    case 'invoice.payment_failed':
      return json(await onInvoice(env, obj, 'failed'));
    case 'customer.subscription.deleted':
      return json(await onSubscriptionEnded(env, obj));
    default:
      return json({ ok: true, ignored: event.type });
  }
}

// Tracking page fallback: after returning from Stripe, re-read the session straight from Stripe.
async function statusCheck(url, env) {
  if (!env.STRIPE_SECRET_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) return json({ error: 'payments_not_configured' }, 503);
  const token = url.searchParams.get('t') || '';
  if (!/^[0-9a-f-]{36}$/i.test(token)) return json({ error: 'invalid_token' }, 400);
  const order = await getOrder(env, 'token', token);
  if (!order) return json({ error: 'order_not_found' }, 404);
  const ref = String(order.payment_reference || '');
  if (!isCard(order) || !ref.startsWith('cs_')) return json({ order_status: order.status });
  const session = await stripe(env, 'GET', `/checkout/sessions/${encodeURIComponent(ref)}`);
  if (session?.metadata?.sylkit_order !== order.order_number) return json({ order_status: order.status });
  const applied = await markPaid(env, order, session);
  return json({ order_status: applied.status ?? applied.already ?? order.status });
}

// Customer portal: update card, download invoices, cancel the subscription.
async function portal(request, env) {
  if (!env.STRIPE_SECRET_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) return json({ error: 'payments_not_configured' }, 503);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }
  const token = String(body.token || '');
  if (!/^[0-9a-f-]{36}$/i.test(token)) return json({ error: 'invalid_token' }, 400);
  const order = await getOrder(env, 'token', token);
  if (!order) return json({ error: 'order_not_found' }, 404);
  const ref = String(order.payment_reference || '');
  let customer;
  if (ref.startsWith('sub_')) customer = (await stripe(env, 'GET', `/subscriptions/${encodeURIComponent(ref)}`)).customer;
  else if (ref.startsWith('pi_')) customer = (await stripe(env, 'GET', `/payment_intents/${encodeURIComponent(ref)}`)).customer;
  if (!customer) return json({ error: 'no_card_customer' }, 409);
  const s = await stripe(env, 'POST', '/billing_portal/sessions', { customer, return_url: `${SITE}/track?t=${token}`, locale: order.lang === 'es' ? 'es' : 'en' });
  return json({ url: s.url });
}

async function health(env) {
  const key = String(env.STRIPE_SECRET_KEY || '');
  const out = {
    configured: { STRIPE_SECRET_KEY: !!key, STRIPE_WEBHOOK_SECRET: !!env.STRIPE_WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY: !!env.SUPABASE_SERVICE_ROLE_KEY },
    mode: key.startsWith('sk_live_') || key.startsWith('rk_live_') ? 'live' : key ? 'test' : null,
  };
  if (key) {
    try {
      const b = await stripe(env, 'GET', '/balance');
      out.api_key_check = { ok: true, currencies: (b.available || []).map((a) => a.currency) };
    } catch (e) {
      out.api_key_check = { ok: false, message: String(e.message || e) };
    }
  }
  out.ready = out.configured.STRIPE_SECRET_KEY && out.configured.STRIPE_WEBHOOK_SECRET && out.configured.SUPABASE_SERVICE_ROLE_KEY && !!out.api_key_check?.ok;
  return json(out);
}

export async function handleStripe(request, env, url) {
  try {
    if (url.pathname === '/api/stripe/health' && request.method === 'GET') return await health(env);
    if (url.pathname === '/api/stripe/status' && request.method === 'GET') return await statusCheck(url, env);
    if (url.pathname === '/api/stripe/checkout' && request.method === 'POST') return await createCheckout(request, env);
    if (url.pathname === '/api/stripe/portal' && request.method === 'POST') return await portal(request, env);
    if (url.pathname === '/api/stripe/webhook' && request.method === 'POST') return await webhook(request, env);
    return json({ error: 'not_found' }, 404);
  } catch (e) {
    console.error('stripe error', e);
    return json({ error: e.status && e.status < 500 ? 'stripe_error' : 'server_error', message: e.code || undefined }, e.status && e.status < 500 ? 502 : 500);
  }
}
