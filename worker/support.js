// Customer support: help widget, AI assistant and the admin support inbox.
// Data lives in the Cloudflare D1 database "sylkit-support" (binding SUPPORT_DB).
//
// Customers (no account; a secret token identifies their conversation):
//   GET  /api/support/status                   -> { ai, open, hours } (is the assistant on, are we in office hours)
//   POST /api/support/ai       { messages, lang } -> { reply, handoff }   AI assistant answer (needs ANTHROPIC_API_KEY)
//   POST /api/support/ticket   { name, email, whatsapp, message, lang, page, transcript } -> { token, number }
//   GET  /api/support/thread?t=<token>         -> the conversation with Sylkit's replies
//   POST /api/support/message  { t, body }     -> adds a customer message
// Admin (Authorization: Bearer <Supabase session token of an admin account>):
//   GET  /api/support/admin/tickets?status=open|all
//   GET  /api/support/admin/thread?id=<id>
//   POST /api/support/admin/reply   { id, body }
//   POST /api/support/admin/status  { id, status }
// Notifications (each optional, switched on by its secret in Cloudflare):
//   RESEND_API_KEY -> email the admin about new messages and email customers when you reply
//   NTFY_TOPIC     -> instant push to your phone through the free ntfy app (ntfy.sh/<topic>)
//   SUPPORT_EMAIL  -> where admin emails go (default sylvanus@sylkit.com)

const SUPABASE_URL = 'https://chcljhwcvzlmxrrhetfv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_A0oOnUNRvW4ig6sXbM0CFw_1Tr2MwYy';
const SITE = 'https://sylkit.com';
const AI_MODEL = 'claude-haiku-5-5';

// Office hours: Monday to Saturday, 9:00 to 18:00 Caracas time (UTC-4, no daylight saving).
const HOURS = { days: [1, 2, 3, 4, 5, 6], from: 9, to: 18, utcOffset: -4 };
const HOURS_TEXT = {
  en: 'Mon–Sat, 9am–6pm (Caracas time)',
  es: 'Lun a sáb, 9 am a 6 pm (hora de Caracas)',
  pt: 'Seg a sáb, 9h às 18h (horário de Caracas)',
};
const LIMITS = { ticket: 6, message: 80, ai: 40, ping: 40, hook: 600, build: 8, build_edit: 60, build_q: 20, build_upload: 60 }; // per visitor (IP) per day

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const bad = (error, status = 400) => json({ error }, status);
const clean = (s, max) => String(s ?? '').replace(/\u0000/g, '').trim().slice(0, max);
const langOf = (l) => (l === 'es' || l === 'pt' ? l : 'en');

function isOpen(now = new Date()) {
  const local = new Date(now.getTime() + HOURS.utcOffset * 3600e3);
  const h = local.getUTCHours();
  return HOURS.days.includes(local.getUTCDay()) && h >= HOURS.from && h < HOURS.to;
}

function token() {
  const b = new Uint8Array(18);
  crypto.getRandomValues(b);
  return [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

export async function overLimit(env, request, kind) {
  if (!env.SUPPORT_DB) return false;
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const day = new Date().toISOString().slice(0, 10);
  const row = await env.SUPPORT_DB.prepare(
    'INSERT INTO usage (ip, day, kind, n) VALUES (?, ?, ?, 1) ON CONFLICT(ip, day, kind) DO UPDATE SET n = n + 1 RETURNING n',
  ).bind(ip, day, kind).first();
  return (row?.n ?? 0) > LIMITS[kind];
}

// ---------- Notifications ----------
async function sendEmail(env, to, subject, text, replyTo) {
  if (!env.RESEND_API_KEY || !to) return false;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: 'Sylkit <no-reply@sylkit.com>', to: [to], subject, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
  }).catch(() => null);
  return !!r?.ok;
}
async function notifyAdmin(env, ticket, body, isNew) {
  const title = `${isNew ? 'New support request' : 'New message'} ${ticket.number} · ${ticket.name}`;
  const text = `${body}\n\n${ticket.name}${ticket.email ? ` · ${ticket.email}` : ''}${ticket.whatsapp ? ` · WhatsApp ${ticket.whatsapp}` : ''}\nPage: ${ticket.page || '-'}\n\nReply: ${SITE}/admin/support?id=${ticket.id}`;
  const jobs = [sendEmail(env, env.SUPPORT_EMAIL || 'sylvanus@sylkit.com', title, text, ticket.email || undefined)];
  if (env.NTFY_TOPIC) {
    jobs.push(
      fetch(`https://ntfy.sh/${encodeURIComponent(env.NTFY_TOPIC)}`, {
        method: 'POST',
        headers: { Title: title.replace(/[^\x20-\x7E]/g, ''), Click: `${SITE}/admin/support?id=${ticket.id}`, Tags: 'speech_balloon' },
        body: body.slice(0, 1000),
      }).catch(() => null),
    );
  }
  await Promise.all(jobs);
}
const REPLY_EMAIL = {
  en: (n, num, body, link) => ({ subject: `Sylkit replied to your message ${num}`, text: `Hi ${n},\n\n${body}\n\nSee the conversation and reply here: ${link}\n\nSylkit Support` }),
  es: (n, num, body, link) => ({ subject: `Sylkit respondió tu mensaje ${num}`, text: `Hola ${n},\n\n${body}\n\nMira la conversación y responde aquí: ${link}\n\nSoporte Sylkit` }),
  pt: (n, num, body, link) => ({ subject: `A Sylkit respondeu sua mensagem ${num}`, text: `Olá ${n},\n\n${body}\n\nVeja a conversa e responda aqui: ${link}\n\nSuporte Sylkit` }),
};

// ---------- AI assistant ----------
let catalogCache = { at: 0, text: '' };
async function catalogText() {
  if (catalogCache.text && Date.now() - catalogCache.at < 10 * 60e3) return catalogCache.text;
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/products?select=slug,category,name_en,short_en,price_from,pricing,demo_url&active=eq.true&order=sort`, {
      headers: { apikey: SUPABASE_KEY, authorization: `Bearer ${SUPABASE_KEY}` },
    });
    const rows = r.ok ? await r.json() : [];
    const lines = rows.map((p) => {
      const plans = (p.pricing?.plans || []).map((pl) => `${pl.name?.en || pl.id}: $${pl.monthly}/mo${pl.setup ? ` + $${pl.setup} setup` : ''}`).join('; ');
      const billing = (p.pricing?.billing || ['yearly', 'monthly', 'once']).join('/');
      return `- ${p.name_en} (${SITE}/product/${p.slug}) — ${p.short_en}${plans ? ` Plans: ${plans}. Billing: ${billing}.` : ' Price on request (custom quote).'}${p.demo_url ? ` Live demo: ${p.demo_url}` : ''}`;
    });
    catalogCache = { at: Date.now(), text: lines.join('\n') };
  } catch (e) {
    /* keep the old copy */
  }
  return catalogCache.text;
}

function systemPrompt(catalog, lang) {
  const language = { en: 'English', es: 'Spanish', pt: 'Portuguese' }[lang];
  return `You are the customer support assistant on sylkit.com. Sylkit sells ready-made business software (POS, inventory, expiry alerts, pharmacy, clinic, restaurant, school, payroll, invoicing and more), online stores with WhatsApp orders, business websites, custom mobile apps, AI tools, domains, business email, hosting and security checks (Sylkit Shield). Sylkit sets up, hosts and maintains what it sells.

Reply in ${language} unless the customer clearly writes in another language; then use theirs. Be warm, short and concrete: 2 to 5 sentences, or a short list. Plain text only, no markdown headings or tables. Give real links from the catalog when they help.

Facts you can rely on:
- Prices: each system has plans with a monthly price and a one-time setup fee. Paying yearly costs 10 months (2 months free). "Buy once" is a lifetime license equal to 30 months, with the first 12 months of hosting, support and updates included and an optional care plan from year 2 (3 months' price per year). Domains are billed yearly.
- How to buy: choose a plan on the product page, then pay at checkout. Payment methods for everyone: PayPal or debit/credit card (on PayPal's secure page) and USDT crypto. Customers in Venezuela can also pay by Pago Móvil or bank transfer (Banco Mercantil), in bolívares at the BCV rate of the day. Zelle, Apple Pay and Google Pay are not accepted yet. The customer picks one at checkout.
- After paying, the customer gets an order page to track progress. Order status can be checked at ${SITE}/track.
- Design templates (online stores, websites, apps) are at ${SITE}/templates and are included free with the matching plan.
- Custom projects: ${SITE}/quote (Sylkit sends a quote).
- Human support hours: ${HOURS_TEXT.en}.

Current catalog:
${catalog || '(catalog unavailable right now; send people to the product pages)'}

Rules:
- Never invent prices, delivery dates, discounts, features or policies that are not above. If you are not sure, say so and offer to connect them with the team.
- Do not ask for passwords, card numbers or other sensitive data.
- Only help with Sylkit's products, orders and related business questions; politely decline anything else.
- If the customer asks for a person, has a problem with an existing order or payment, wants a refund, or you cannot answer, say the team will help and end your reply with the exact tag [HANDOFF].`;
}

async function aiReply(request, env) {
  if (!env.ANTHROPIC_API_KEY) return json({ reply: null, unavailable: true });
  if (await overLimit(env, request, 'ai')) return json({ reply: null, limited: true });
  const body = await request.json().catch(() => ({}));
  const lang = langOf(body.lang);
  const msgs = (Array.isArray(body.messages) ? body.messages : [])
    .slice(-12)
    .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: clean(m.content, 1500) }))
    .filter((m) => m.content);
  while (msgs.length && msgs[0].role !== 'user') msgs.shift();
  if (!msgs.length || msgs[msgs.length - 1].role !== 'user') return bad('no_question');
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: env.SUPPORT_AI_MODEL || AI_MODEL, max_tokens: 600, system: systemPrompt(await catalogText(), lang), messages: msgs }),
  }).catch(() => null);
  if (!r || !r.ok) return json({ reply: null, unavailable: true });
  const data = await r.json().catch(() => ({}));
  let text = (data.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n').trim();
  const handoff = text.includes('[HANDOFF]');
  text = text.replace(/\s*\[HANDOFF\]\s*/g, ' ').trim();
  return json({ reply: text || null, handoff });
}

// ---------- Customer conversations ----------
async function threadOf(env, ticket) {
  const { results } = await env.SUPPORT_DB.prepare('SELECT sender, body, created_at FROM messages WHERE ticket_id = ? ORDER BY id').bind(ticket.id).all();
  return { number: ticket.number, status: ticket.status, name: ticket.name, created_at: ticket.created_at, messages: results };
}

async function createTicket(request, env, ctx) {
  const b = await request.json().catch(() => ({}));
  const name = clean(b.name, 80), email = clean(b.email, 160).toLowerCase(), whatsapp = clean(b.whatsapp, 40), message = clean(b.message, 3000);
  if (name.length < 2) return bad('invalid_name');
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return bad('invalid_email');
  if (!email && whatsapp.replace(/\D/g, '').length < 7) return bad('need_contact');
  if (message.length < 2) return bad('invalid_message');
  if (await overLimit(env, request, 'ticket')) return bad('rate_limited', 429);
  const t = token();
  const ip = request.headers.get('cf-connecting-ip') || null;
  const row = await env.SUPPORT_DB.prepare('INSERT INTO tickets (token, number, name, email, whatsapp, lang, page, ip) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id')
    .bind(t, t, name, email || null, whatsapp || null, langOf(b.lang), clean(b.page, 300) || null, ip).first();
  const number = 'S-' + (1000 + row.id);
  const transcript = clean(b.transcript, 6000);
  const stmts = [env.SUPPORT_DB.prepare('UPDATE tickets SET number = ? WHERE id = ?').bind(number, row.id)];
  if (transcript) stmts.push(env.SUPPORT_DB.prepare("INSERT INTO messages (ticket_id, sender, body) VALUES (?, 'ai', ?)").bind(row.id, transcript));
  stmts.push(env.SUPPORT_DB.prepare("INSERT INTO messages (ticket_id, sender, body) VALUES (?, 'customer', ?)").bind(row.id, message));
  await env.SUPPORT_DB.batch(stmts);
  ctx.waitUntil(notifyAdmin(env, { id: row.id, number, name, email, whatsapp, page: clean(b.page, 300) }, message, true));
  return json({ token: t, number });
}

async function getThread(env, url) {
  const t = clean(url.searchParams.get('t'), 64);
  const ticket = t && (await env.SUPPORT_DB.prepare('SELECT * FROM tickets WHERE token = ?').bind(t).first());
  if (!ticket) return bad('not_found', 404);
  return json(await threadOf(env, ticket));
}

async function postMessage(request, env, ctx) {
  const b = await request.json().catch(() => ({}));
  const t = clean(b.t, 64), body = clean(b.body, 3000);
  if (body.length < 1) return bad('invalid_message');
  const ticket = t && (await env.SUPPORT_DB.prepare('SELECT * FROM tickets WHERE token = ?').bind(t).first());
  if (!ticket) return bad('not_found', 404);
  if (await overLimit(env, request, 'message')) return bad('rate_limited', 429);
  await env.SUPPORT_DB.batch([
    env.SUPPORT_DB.prepare("INSERT INTO messages (ticket_id, sender, body) VALUES (?, 'customer', ?)").bind(ticket.id, body),
    env.SUPPORT_DB.prepare("UPDATE tickets SET status = 'new', unread = 1, updated_at = datetime('now') WHERE id = ?").bind(ticket.id),
  ]);
  ctx.waitUntil(notifyAdmin(env, ticket, body, false));
  return json(await threadOf(env, { ...ticket, status: 'new' }));
}

// ---------- Admin inbox ----------
const adminCache = new Map();
async function isAdmin(request) {
  const auth = request.headers.get('authorization') || '';
  const jwt = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!jwt) return false;
  const hit = adminCache.get(jwt);
  if (hit && Date.now() - hit.at < 5 * 60e3) return hit.ok;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_admin`, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, authorization: `Bearer ${jwt}`, 'content-type': 'application/json' },
    body: '{}',
  }).catch(() => null);
  const ok = !!r && r.ok && (await r.json().catch(() => false)) === true;
  adminCache.set(jwt, { ok, at: Date.now() });
  if (adminCache.size > 200) adminCache.delete(adminCache.keys().next().value);
  return ok;
}

async function admin(request, env, url, ctx) {
  if (!(await isAdmin(request))) return bad('forbidden', 403);
  const db = env.SUPPORT_DB;
  const path = url.pathname.replace('/api/support/admin/', '');
  if (request.method === 'GET' && path === 'tickets') {
    const all = url.searchParams.get('status') === 'all';
    const { results } = await db.prepare(
      `SELECT t.id, t.number, t.name, t.email, t.whatsapp, t.lang, t.page, t.status, t.unread, t.created_at, t.updated_at,
        (SELECT body FROM messages m WHERE m.ticket_id = t.id ORDER BY m.id DESC LIMIT 1) AS last_body,
        (SELECT sender FROM messages m WHERE m.ticket_id = t.id ORDER BY m.id DESC LIMIT 1) AS last_sender
       FROM tickets t ${all ? '' : "WHERE t.status != 'closed'"} ORDER BY (t.status = 'new') DESC, t.updated_at DESC LIMIT 200`,
    ).all();
    const counts = await db.prepare("SELECT status, COUNT(*) AS n FROM tickets GROUP BY status").all();
    return json({ tickets: results, counts: Object.fromEntries(counts.results.map((c) => [c.status, c.n])), channels: { email: !!env.RESEND_API_KEY, push: !!env.NTFY_TOPIC, ai: !!env.ANTHROPIC_API_KEY } });
  }
  if (request.method === 'GET' && path === 'thread') {
    const id = Number(url.searchParams.get('id'));
    const ticket = await db.prepare('SELECT * FROM tickets WHERE id = ?').bind(id).first();
    if (!ticket) return bad('not_found', 404);
    await db.prepare('UPDATE tickets SET unread = 0 WHERE id = ?').bind(id).run();
    const { results } = await db.prepare('SELECT id, sender, body, created_at FROM messages WHERE ticket_id = ? ORDER BY id').bind(id).all();
    const { token: _t, ip: _ip, ...safe } = ticket;
    return json({ ticket: safe, messages: results });
  }
  if (request.method === 'POST' && path === 'reply') {
    const b = await request.json().catch(() => ({}));
    const id = Number(b.id), body = clean(b.body, 5000);
    if (!body) return bad('invalid_message');
    const ticket = await db.prepare('SELECT * FROM tickets WHERE id = ?').bind(id).first();
    if (!ticket) return bad('not_found', 404);
    await db.batch([
      db.prepare("INSERT INTO messages (ticket_id, sender, body) VALUES (?, 'admin', ?)").bind(id, body),
      db.prepare("UPDATE tickets SET status = 'answered', unread = 0, updated_at = datetime('now') WHERE id = ?").bind(id),
    ]);
    let emailed = false;
    if (ticket.email && env.RESEND_API_KEY) {
      const m = REPLY_EMAIL[langOf(ticket.lang)](ticket.name, ticket.number, body, `${SITE}/?support=${ticket.token}`);
      emailed = await sendEmail(env, ticket.email, m.subject, m.text, env.SUPPORT_EMAIL || 'sylvanus@sylkit.com');
    }
    return json({ ok: true, emailed });
  }
  if (request.method === 'POST' && path === 'status') {
    const b = await request.json().catch(() => ({}));
    if (!['new', 'answered', 'closed'].includes(b.status)) return bad('invalid_status');
    await db.prepare("UPDATE tickets SET status = ?, updated_at = datetime('now') WHERE id = ?").bind(b.status, Number(b.id)).run();
    return json({ ok: true });
  }
  return bad('not_found', 404);
}

export async function handleSupport(request, env, url, ctx) {
  if (!env.SUPPORT_DB) return bad('support_not_configured', 503);
  const p = url.pathname;
  try {
    if (p === '/api/support/status') return json({ ai: !!env.ANTHROPIC_API_KEY, open: isOpen(), hours: HOURS_TEXT });
    if (p === '/api/support/ai' && request.method === 'POST') return await aiReply(request, env);
    if (p === '/api/support/ticket' && request.method === 'POST') return await createTicket(request, env, ctx);
    if (p === '/api/support/thread' && request.method === 'GET') return await getThread(env, url);
    if (p === '/api/support/message' && request.method === 'POST') return await postMessage(request, env, ctx);
    if (p.startsWith('/api/support/admin/')) return await admin(request, env, url, ctx);
    return bad('not_found', 404);
  } catch (e) {
    return bad('server_error', 500);
  }
}
