// Support API checks against a real SQLite database standing in for D1. Run: node --no-warnings worker/test/support.test.mjs
import { DatabaseSync } from 'node:sqlite';
import { handleSupport } from '../support.js';
const db = new DatabaseSync(':memory:');
db.exec(`CREATE TABLE tickets (id INTEGER PRIMARY KEY AUTOINCREMENT, token TEXT NOT NULL UNIQUE, number TEXT NOT NULL UNIQUE, name TEXT NOT NULL, email TEXT, whatsapp TEXT, lang TEXT NOT NULL DEFAULT 'en', page TEXT, status TEXT NOT NULL DEFAULT 'new', unread INTEGER NOT NULL DEFAULT 1, ip TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE messages (id INTEGER PRIMARY KEY AUTOINCREMENT, ticket_id INTEGER NOT NULL, sender TEXT NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE usage (ip TEXT NOT NULL, day TEXT NOT NULL, kind TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (ip, day, kind));`);
const stmt = (sql) => { let args = []; const o = {
  bind: (...a) => { args = a; return o; },
  first: async () => db.prepare(sql).get(...args) ?? null,
  all: async () => ({ results: db.prepare(sql).all(...args) }),
  run: async () => db.prepare(sql).run(...args) }; return o; };
const D1 = { prepare: stmt, batch: async (s) => { for (const x of s) await x.run(); } };
const sent = [];
globalThis.fetch = async (u, o) => {
  u = String(u);
  if (u.includes('rpc/is_admin')) return new Response(JSON.stringify(o.headers.authorization === 'Bearer ADMIN'), { status: 200 });
  if (u.includes('/rest/v1/products')) return new Response(JSON.stringify([{ slug: 'punto-de-venta', name_en: 'Point of Sale', short_en: 'Sell fast', pricing: { plans: [{ id: 'starter', name: { en: 'Starter' }, monthly: 20, setup: 50 }] } }]));
  if (u.includes('anthropic')) { const b = JSON.parse(o.body); sent.push(b); return new Response(JSON.stringify({ content: [{ type: 'text', text: 'POS starts at $20/mo. [HANDOFF]' }] })); }
  if (u.includes('resend') || u.includes('ntfy')) { sent.push(u); return new Response('{}'); }
  throw new Error('unexpected ' + u);
};
const env = { SUPPORT_DB: D1, ANTHROPIC_API_KEY: 'k', RESEND_API_KEY: 'r', NTFY_TOPIC: 'topic' };
const waits = []; const ctx = { waitUntil: (p) => waits.push(p) };
const call = async (method, path, body, headers = {}) => {
  const url = new URL('https://sylkit.com' + path);
  const req = new Request(url, { method, headers: { 'content-type': 'application/json', 'cf-connecting-ip': '1.2.3.4', ...headers }, body: body ? JSON.stringify(body) : undefined });
  const r = await handleSupport(req, env, url, ctx); return { status: r.status, body: await r.json() };
};
const ok = (c, m) => { if (!c) { console.error('FAIL', m); process.exitCode = 1; } else console.log('ok', m); };
let r = await call('GET', '/api/support/status'); ok(r.body.ai === true && typeof r.body.open === 'boolean', 'status');
r = await call('POST', '/api/support/ai', { lang: 'es', messages: [{ role: 'user', content: '¿Cuánto cuesta el POS?' }] });
ok(r.body.reply === 'POS starts at $20/mo.' && r.body.handoff === true, 'ai reply + handoff');
ok(sent[0].system.includes('Point of Sale') && sent[0].system.includes('Spanish'), 'ai prompt has catalog and language');
r = await call('POST', '/api/support/ticket', { name: 'A', email: 'x@y.com', message: 'hi' }); ok(r.status === 400 && r.body.error === 'invalid_name', 'name validation');
r = await call('POST', '/api/support/ticket', { name: 'Ana', message: 'hola' }); ok(r.body.error === 'need_contact', 'contact required');
r = await call('POST', '/api/support/ticket', { name: 'Ana Pérez', email: 'Ana@Mail.com', message: 'Necesito ayuda con mi pedido', lang: 'es', page: '/', transcript: 'Q: precio\nA: $20' });
ok(r.status === 200 && r.body.number === 'S-1001' && r.body.token.length === 36, 'ticket created ' + r.body.number);
const tok = r.body.token; await Promise.all(waits);
ok(sent.some((s) => String(s).includes('resend')) && sent.some((s) => String(s).includes('ntfy')), 'admin notified by email and push');
r = await call('GET', '/api/support/thread?t=' + tok); ok(r.body.messages.length === 2 && r.body.messages[0].sender === 'ai', 'thread with transcript');
r = await call('POST', '/api/support/message', { t: tok, body: 'Otra cosa' }); ok(r.body.messages.length === 3, 'customer message');
r = await call('GET', '/api/support/admin/tickets'); ok(r.status === 403, 'admin needs auth');
r = await call('GET', '/api/support/admin/tickets', null, { authorization: 'Bearer USER' }); ok(r.status === 403, 'non-admin rejected');
const A = { authorization: 'Bearer ADMIN' };
r = await call('GET', '/api/support/admin/tickets', null, A); ok(r.body.tickets.length === 1 && r.body.tickets[0].last_body === 'Otra cosa' && r.body.counts.new === 1, 'admin list');
r = await call('GET', '/api/support/admin/thread?id=1', null, A); ok(r.body.messages.length === 3 && !r.body.ticket.token, 'admin thread hides token');
sent.length = 0;
r = await call('POST', '/api/support/admin/reply', { id: 1, body: 'Hola Ana, ya lo revisamos.' }, A); ok(r.body.ok && r.body.emailed, 'admin reply emailed');
r = await call('GET', '/api/support/thread?t=' + tok); ok(r.body.status === 'answered' && r.body.messages.at(-1).sender === 'admin', 'customer sees reply');
r = await call('POST', '/api/support/admin/status', { id: 1, status: 'closed' }, A); ok(r.body.ok, 'close ticket');
r = await call('GET', '/api/support/admin/tickets', null, A); ok(r.body.tickets.length === 0, 'closed hidden from open list');
for (let i = 0; i < 6; i++) await call('POST', '/api/support/ticket', { name: 'Spam', email: 's@s.com', message: 'x' + i });
r = await call('POST', '/api/support/ticket', { name: 'Spam', email: 's@s.com', message: 'again' }); ok(r.status === 429, 'rate limited');
delete env.ANTHROPIC_API_KEY; r = await call('POST', '/api/support/ai', { messages: [{ role: 'user', content: 'hi' }] }); ok(r.body.unavailable, 'ai off without key');
