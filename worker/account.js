// Customer accounts (Supabase Auth: Google or an email magic link).
//
//   POST /api/account/link    { token }  -> { ok }      links an order the customer just placed to their account
//   GET  /api/account/orders             -> { email, orders[], conversations[] }   the "My orders" page
//
// Every call needs the customer's Supabase session (Authorization: Bearer <access token>); the
// worker checks it with Supabase before doing anything. Which orders belong to which account is kept
// in the D1 table account_orders (SUPPORT_DB), so the production orders table is not changed.
// An account also sees older orders placed with the same, verified email address.

import { overLimit } from './support.js';

const SUPABASE_URL = 'https://chcljhwcvzlmxrrhetfv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_A0oOnUNRvW4ig6sXbM0CFw_1Tr2MwYy';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const bad = (error, status = 400) => json({ error }, status);

function sbHeaders(env) {
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  const h = { apikey: key, 'content-type': 'application/json' };
  if (key && key.startsWith('eyJ')) h.authorization = `Bearer ${key}`;
  return h;
}
async function sb(env, path, init = {}) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: { ...sbHeaders(env), ...(init.headers || {}) } });
  const text = await r.text();
  if (!r.ok) throw new Error(`supabase ${r.status}: ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}

// The signed-in customer, checked with Supabase Auth (never trusted from the browser).
async function userOf(request) {
  const auth = request.headers.get('authorization') || '';
  const jwt = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (jwt.length < 20) return null;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_KEY, authorization: `Bearer ${jwt}` } }).catch(() => null);
  if (!r?.ok) return null;
  const u = await r.json().catch(() => null);
  if (!u?.id) return null;
  return { id: u.id, email: String(u.email || '').toLowerCase(), verified: !!(u.email_confirmed_at || u.confirmed_at) };
}

let ready = null;
function schema(env) {
  ready ||= env.SUPPORT_DB.batch([
    env.SUPPORT_DB.prepare('CREATE TABLE IF NOT EXISTS account_orders (order_token TEXT PRIMARY KEY, user_id TEXT NOT NULL, order_number TEXT, linked_at TEXT)'),
    env.SUPPORT_DB.prepare('CREATE INDEX IF NOT EXISTS account_orders_user ON account_orders (user_id)'),
  ]).catch((e) => {
    ready = null;
    throw e;
  });
  return ready;
}

const isToken = (t) => /^[0-9a-f-]{36}$/i.test(String(t || ''));

async function link(request, env, user) {
  if (await overLimit(env, request, 'account').catch(() => false)) return bad('rate_limited', 429);
  const b = await request.json().catch(() => ({}));
  if (!isToken(b.token)) return bad('invalid_token');
  const rows = await sb(env, `orders?token=eq.${b.token}&select=order_number`);
  if (!rows?.[0]) return bad('order_not_found', 404);
  // Holding the order's secret token proves it's theirs (it was just shown to them after ordering).
  // An order already linked to another account is never moved.
  await env.SUPPORT_DB.prepare('INSERT OR IGNORE INTO account_orders (order_token, user_id, order_number, linked_at) VALUES (?, ?, ?, ?)')
    .bind(b.token, user.id, rows[0].order_number, new Date().toISOString())
    .run();
  const owner = await env.SUPPORT_DB.prepare('SELECT user_id FROM account_orders WHERE order_token = ?').bind(b.token).first();
  return owner?.user_id === user.id ? json({ ok: true }) : bad('linked_to_another_account', 409);
}

const ORDER_FIELDS = 'id,token,order_number,status,created_at,updated_at,estimate,quote_amount,quote_currency,payment_method,products(slug,name_en,name_es)';

async function orders(env, user) {
  const linked = (await env.SUPPORT_DB.prepare('SELECT order_token FROM account_orders WHERE user_id = ? LIMIT 200').bind(user.id).all()).results || [];
  const tokens = linked.map((r) => r.order_token).filter(isToken);
  const found = [];
  if (tokens.length) found.push(...((await sb(env, `orders?token=in.(${tokens.join(',')})&select=${ORDER_FIELDS}`)) || []));
  // Older orders placed with the same email (only once that email is verified by Google or the magic link).
  if (user.verified && user.email && !user.email.includes('*')) {
    const byEmail = (await sb(env, `orders?email=ilike.${encodeURIComponent(user.email.replace(/([%_\\])/g, '\\$1'))}&select=${ORDER_FIELDS}&limit=100`).catch(() => [])) || [];
    for (const o of byEmail) if (!found.some((f) => f.token === o.token)) found.push(o);
  }
  found.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));

  // Updates Sylkit posted on each order (the same public notes the order page shows).
  const ids = found.map((o) => o.id);
  const events = ids.length ? (await sb(env, `order_events?order_id=in.(${ids.join(',')})&public=eq.true&select=order_id,message,created_at&order=created_at.asc`).catch(() => [])) || [] : [];

  // Support chats started with this email (help widget), customer and Sylkit messages only.
  let conversations = [];
  if (user.verified && user.email) {
    const tickets = (await env.SUPPORT_DB.prepare('SELECT id, token, number, status, updated_at FROM tickets WHERE lower(email) = ? ORDER BY updated_at DESC LIMIT 20').bind(user.email).all()).results || [];
    for (const t of tickets) {
      const msgs = (await env.SUPPORT_DB.prepare("SELECT sender, body, created_at FROM messages WHERE ticket_id = ? AND sender IN ('customer','admin') ORDER BY id").bind(t.id).all()).results || [];
      conversations.push({ token: t.token, number: t.number, status: t.status, updated_at: t.updated_at, messages: msgs });
    }
  }

  return json({
    email: user.email,
    orders: found.map((o) => ({
      token: o.token,
      order_number: o.order_number,
      status: o.status,
      created_at: o.created_at,
      product: o.products ? { slug: o.products.slug, en: o.products.name_en, es: o.products.name_es } : null,
      amount: o.quote_amount ?? o.estimate?.due_today ?? null,
      currency: o.quote_currency || 'USD',
      payment_method: o.payment_method,
      updates: events.filter((e) => e.order_id === o.id).map((e) => ({ message: e.message, at: e.created_at })),
    })),
    conversations,
  });
}

export async function handleAccount(request, env, url) {
  try {
    if (!env.SUPPORT_DB || !env.SUPABASE_SERVICE_ROLE_KEY) return bad('not_configured', 503);
    const user = await userOf(request);
    if (!user) return bad('sign_in_required', 401);
    await schema(env);
    const p = url.pathname;
    if (p === '/api/account/link' && request.method === 'POST') return await link(request, env, user);
    if (p === '/api/account/orders' && request.method === 'GET') return await orders(env, user);
    return bad('not_found', 404);
  } catch (e) {
    console.log('account error', String(e?.message || e).slice(0, 200));
    return bad('server_error', 500);
  }
}

// One-time clean-up after retiring the AI website builder (14 Nov 2026): hides its product in the
// catalog database and drops its D1 table (it only held 2 unpublished test sites). Runs once.
export async function retireAiBuilder(env) {
  if (!env.SUPPORT_DB || !env.SUPABASE_SERVICE_ROLE_KEY) return;
  const db = env.SUPPORT_DB;
  const done = await db.prepare("SELECT 1 FROM jobs WHERE id = 'retire_ai_builder'").first().catch(() => null);
  if (done) return;
  await sb(env, 'products?slug=eq.web-con-ia', { method: 'PATCH', body: JSON.stringify({ active: false }), headers: { prefer: 'return=minimal' } });
  await db.prepare('DROP TABLE IF EXISTS ai_sites').run();
  await db.prepare("INSERT INTO jobs (id, status, detail, at) VALUES ('retire_ai_builder', 'done', 'product web-con-ia inactive; ai_sites dropped', ?)").bind(new Date().toISOString()).run();
}
