// Customer cancel checks (POST /api/order/cancel) with a fake Supabase. Run: node --no-warnings worker/test/cancel.test.mjs
import { DatabaseSync } from 'node:sqlite';
import assert from 'node:assert/strict';
import { handleOrders } from '../orders.js';

const db = new DatabaseSync(':memory:');
db.exec('CREATE TABLE usage (ip TEXT NOT NULL, day TEXT NOT NULL, kind TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (ip, day, kind));');
const stmt = (sql) => { let a = []; const o = { bind: (...x) => { a = x; return o; }, first: async () => db.prepare(sql).get(...a) ?? null, all: async () => ({ results: db.prepare(sql).all(...a) }), run: async () => db.prepare(sql).run(...a) }; return o; };
const env = { SUPPORT_DB: { prepare: stmt }, SUPABASE_SERVICE_ROLE_KEY: 'eyJtest', NTFY_TOPIC: 't' };

const T = (n) => `00000000-0000-4000-8000-00000000000${n}`;
const orders = { [T(1)]: { id: 1, order_number: 'SK-1', status: 'new', lang: 'en' }, [T(2)]: { id: 2, order_number: 'SK-2', status: 'paid', lang: 'es' }, [T(3)]: { id: 3, order_number: 'SK-3', status: 'quoted', lang: 'es' }, [T(4)]: { id: 4, order_number: 'SK-4', status: 'cancelled', lang: 'en' } };
const byId = (id) => Object.values(orders).find((o) => o.id === id);
const events = []; const alerts = [];
let raceTo = null;
globalThis.fetch = async (u, o = {}) => {
  u = decodeURIComponent(String(u));
  if (u.includes('ntfy')) { alerts.push(o.headers?.Title || ''); return new Response('{}'); }
  const m = (re) => (u.match(re) || [])[1];
  if (u.includes('/orders?token=eq.')) { const r = orders[m(/token=eq\.([0-9a-f-]+)/)]; return new Response(JSON.stringify(r ? [{ ...r, products: { name_es: 'POS' } }] : [])); }
  if (u.includes('/orders?id=eq.') && (o.method || 'GET') === 'PATCH') {
    const r = byId(Number(m(/id=eq\.(\d+)/))); const need = m(/status=eq\.([a-z_]+)/);
    if (raceTo) { r.status = raceTo; raceTo = null; }
    if (r.status === need) Object.assign(r, JSON.parse(o.body));
    return new Response(null, { status: 204 });
  }
  if (u.includes('/orders?id=eq.')) return new Response(JSON.stringify([{ status: byId(Number(m(/id=eq\.(\d+)/))).status }]));
  if (u.includes('/order_events')) { events.push(JSON.parse(o.body)); return new Response(null, { status: 201 }); }
  throw new Error('unexpected ' + u);
};
const call = async (body, ip = '1.1.1.1') => {
  const r = await handleOrders(new Request('https://x/api/order/cancel', { method: 'POST', body: JSON.stringify(body), headers: { 'cf-connecting-ip': ip, 'content-type': 'application/json' } }), env, new URL('https://x/api/order/cancel'));
  return { ...(await r.json()), status: r.status };
};

let r = await call({ token: T(1), reason: 'Too expensive' });
assert.equal(r.status, 200); assert.equal(orders[T(1)].status, 'cancelled');
assert.match(events[0].message, /You cancelled this order\. Reason: Too expensive/); assert.equal(events[0].public, true);
assert.equal(alerts.length, 1);
r = await call({ token: T(1) }); assert.equal(r.status, 200, 'cancelling twice is fine');
r = await call({ token: T(2) }); assert.equal(r.status, 409); assert.equal(r.error, 'cannot_cancel'); assert.equal(orders[T(2)].status, 'paid', 'paid orders stay paid');
raceTo = 'payment_submitted';
r = await call({ token: T(3) }); assert.equal(r.status, 409, 'a payment reported at the same moment wins'); assert.equal(orders[T(3)].status, 'payment_submitted');
r = await call({ token: 'nope' }); assert.equal(r.status, 400);
r = await call({ token: T(9) }); assert.equal(r.status, 404);
r = await call({ token: T(4) }); assert.equal(r.status, 200);
for (let i = 0; i < 25; i++) r = await call({ token: 'x' }, '9.9.9.9');
assert.equal(r.status, 429, 'rate limited');
console.log('cancel tests passed');
