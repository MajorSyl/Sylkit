import { hasLive, hasSandbox } from './paypal.js';
// Customer-facing order helpers (read only, keyed by the secret order token).
//
//   GET /api/order/methods            -> which automatic payment methods are switched on { card, crypto }
//   GET /api/order/invoice?t=<token>  -> everything the printable invoice page needs
//
// The invoice includes the customer's own contact details, so it is only returned to someone
// who holds the order's unguessable token (the same link that opens the order page).

const SUPABASE_URL = 'https://chcljhwcvzlmxrrhetfv.supabase.co';
const STRIPE = 'https://api.stripe.com/v1';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

function sbHeaders(env) {
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  const h = { apikey: key, 'content-type': 'application/json' };
  if (key && key.startsWith('eyJ')) h.authorization = `Bearer ${key}`;
  return h;
}

async function sb(env, path) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: sbHeaders(env) });
  const text = await r.text();
  if (!r.ok) throw new Error(`supabase ${r.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

const PAID = new Set(['paid', 'in_progress', 'delivered']);
const PAID_WORDS = /confirm|paid|pagad|recibid|received/i;

// For card subscriptions, link the official Stripe invoice (PDF) as well.
async function stripeInvoice(env, ref, orderNumber) {
  if (!env.STRIPE_SECRET_KEY || !ref) return null;
  const auth = { authorization: `Bearer ${env.STRIPE_SECRET_KEY}` };
  try {
    let invoiceId = null;
    if (ref.startsWith('sub_')) {
      const s = await fetch(`${STRIPE}/subscriptions/${encodeURIComponent(ref)}`, { headers: auth }).then((r) => r.json());
      invoiceId = typeof s.latest_invoice === 'string' ? s.latest_invoice : s.latest_invoice?.id;
    } else if (orderNumber) {
      // One-time card payments create an invoice tagged with the order number (see stripe.js).
      const q = encodeURIComponent(`metadata['sylkit_order']:'${String(orderNumber).replace(/'/g, '')}'`);
      const list = await fetch(`${STRIPE}/invoices/search?limit=1&query=${q}`, { headers: auth }).then((r) => r.json());
      invoiceId = list?.data?.[0]?.id ?? null;
    }
    if (!invoiceId) return null;
    const inv = await fetch(`${STRIPE}/invoices/${encodeURIComponent(invoiceId)}`, { headers: auth }).then((r) => r.json());
    return inv?.id ? { number: inv.number ?? null, pdf: inv.invoice_pdf ?? null, url: inv.hosted_invoice_url ?? null } : null;
  } catch {
    return null;
  }
}

async function invoice(url, env) {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) return json({ error: 'database_not_configured' }, 503);
  const token = url.searchParams.get('t') || '';
  if (!/^[0-9a-f-]{36}$/i.test(token)) return json({ error: 'invalid_token' }, 400);
  const rows = await sb(
    env,
    `orders?token=eq.${encodeURIComponent(token)}&select=id,order_number,status,created_at,customer_name,business_name,email,whatsapp,country,lang,estimate,quote_amount,quote_currency,quote_notes,payment_method,payment_reference,products(name_en,name_es)`,
  );
  const o = rows?.[0];
  if (!o) return json({ error: 'order_not_found' }, 404);
  const events = await sb(env, `order_events?order_id=eq.${o.id}&public=eq.true&select=message,created_at&order=created_at.asc`).catch(() => []);
  const paidEvent = PAID.has(o.status) ? (events || []).filter((e) => PAID_WORDS.test(String(e.message || ''))).pop() : null;
  const ref = String(o.payment_reference || '');
  return json({
    order_number: o.order_number,
    status: o.status,
    created_at: o.created_at,
    paid: PAID.has(o.status),
    paid_at: paidEvent?.created_at ?? null,
    customer: { name: o.customer_name, business: o.business_name, email: o.email, whatsapp: o.whatsapp, country: o.country },
    product: o.products ? { en: o.products.name_en, es: o.products.name_es } : null,
    estimate: o.estimate,
    amount: o.quote_amount,
    currency: o.quote_currency || 'USD',
    notes: o.quote_notes,
    payment_method: o.payment_method,
    stripe: String(o.payment_method || '').startsWith('card') ? await stripeInvoice(env, ref, o.order_number) : null,
  });
}

// Card is only offered while the Stripe account can actually take charges. If Stripe has paused
// payments (e.g. overdue verification tasks), customers see the other methods instead of an error.
// Cached per Worker instance for 5 minutes so the order page stays fast.
let cardCache = { at: 0, ok: false };
async function cardAvailable(env) {
  if (!env.STRIPE_SECRET_KEY) return false;
  if (Date.now() - cardCache.at < 5 * 60 * 1000) return cardCache.ok;
  let ok = false;
  try {
    const r = await fetch(`${STRIPE}/account`, { headers: { authorization: `Bearer ${env.STRIPE_SECRET_KEY}` } });
    const a = await r.json();
    ok = r.ok && a.charges_enabled === true && (a.capabilities?.card_payments ?? 'active') === 'active';
  } catch {
    ok = false;
  }
  cardCache = { at: Date.now(), ok };
  return ok;
}

export async function handleOrders(request, env, url) {
  try {
    if (request.method !== 'GET') return json({ error: 'not_found' }, 404);
    if (url.pathname === '/api/order/methods') {
      // PayPal: live keys show it to everyone; sandbox keys only for a test page (?paypaltest=1).
      const paypal = hasLive(env) || (url.searchParams.get('paypaltest') === '1' && hasSandbox(env));
      return json({ card: await cardAvailable(env), paypal, paypal_test: !hasLive(env) && paypal, crypto: !!env.NOWPAYMENTS_API_KEY });
    }
    if (url.pathname === '/api/order/invoice') return await invoice(url, env);
    return json({ error: 'not_found' }, 404);
  } catch (e) {
    console.error('orders error', e);
    return json({ error: 'server_error' }, 500);
  }
}
