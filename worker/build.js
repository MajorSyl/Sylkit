// Sylkit AI Builder API: a customer describes their business, the AI writes the site data,
// the customer previews and edits it by chat, pays to publish, and the site goes live on
// <name>.sylkit.com (also reachable at sylkit.com/s/<name>).
//
//   POST /api/build/start     { prompt, lang }                -> { id, token, questions[] }   (AI asks what's missing)
//   POST /api/build/generate  { id, token, answers[], style } -> { site, slug }                (writes the site)
//        (old form { prompt, lang } still works: no questions, new site)
//   POST /api/build/upload?id=&t=&kind=logo|photo  (image bytes) -> { media }
//   POST /api/build/unmedia   { id, token, url }              -> { media }
//   GET  /api/build/img/<id>/<file>                           -> the image (Workers KV SITE_MEDIA)
//   POST /api/build/domain    { id, token, hostname }         -> { domain, status, target }   ('' removes it)
//   POST /api/build/edit      { id, token, instruction }      -> { site }
//   GET  /api/build/site?id=&t=                               -> { site, slug, status, live, url, order_number }
//   GET  /api/build/preview?id=&t=                            -> the preview page (HTML)
//   POST /api/build/slug      { id, token, slug }             -> { slug, url } | { error }
//   POST /api/build/link      { id, token, order_token }      -> { ok }  (called by the checkout right after the order)
//
// Storage: D1 table ai_sites (SUPPORT_DB). The secret token is the only way to edit a site.
// AI: OpenRouter (OPENROUTER_API_KEY). Cheap, good models first, a free one as last resort; the list
// can be changed with the OPENROUTER_MODELS variable (comma separated) without touching code.
// Customer domains: with Cloudflare for SaaS switched on and a CF_SAAS_TOKEN secret, a domain is added
// as a custom hostname automatically; without it, the request is sent to the owner to connect by hand.
// A site is only public once the order linked to it is paid (or later, in progress / delivered).

import { overLimit } from './support.js';
import { alertOwner } from './notify.js';
import { renderSite, renderWaiting, sanitizeSite } from './aisite.js';

const SUPABASE_URL = 'https://chcljhwcvzlmxrrhetfv.supabase.co';
const PRODUCT = 'web-con-ia';
// GLM 5.3 Flash first (good Spanish/Portuguese, about $0.0015 per site), Qwen Flash as a good cheap
// backup, a free model last. (openrouter/free was dropped: it sometimes picks tiny 1-2B models.)
const MODELS = ['z-ai/glm-5.3-flash', 'qwen/qwen3.8-flash', 'google/gemma-4-31b-it:free'];
const ZONE_ID = 'bf9c8b4c9aa081fca506a46ef6503c7f'; // sylkit.com
const CNAME_TARGET = 'sites.sylkit.com';
const IMG_BASE = 'https://sylkit.com/api/build/img/';
const MAX_PHOTOS = 8;
const MAX_BYTES = 1_600_000;
const LIVE_STATUSES = new Set(['paid', 'in_progress', 'delivered']);
const MAX_EDITS = 80; // per site, for good
const RESERVED = new Set([
  'www', 'api', 'admin', 'app', 'mail', 'email', 'smtp', 'ftp', 'blog', 'shop', 'store', 'help', 'support', 'status', 'docs', 'dev', 'test', 'staging',
  'sylkit', 'sylvanus', 'sylvanusfannah', 'aromyst', 'sites', 'billing', 'pay', 'login', 'secure', 'account', 'cdn', 'static', 'build', 'preview', 'demo',
  'alertas', 'pos', 'inventario', 'farmacia', 'clinica', 'restaurante', 'salon', 'taller', 'servicios', 'escuela', 'nomina', 'facturas', 'tienda', 'portafolio', 'asistente',
]);
// We don't build sites that pretend to be a bank, a payment app or a big brand, or that ask for logins.
const BLOCK = /\b(banco de venezuela|banesco|banco mercantil|bbva provincial|bancamiga|bdv|paypal|zelle|binance|western union|payoneer|netflix|apple id|icloud|microsoft|outlook|gmail|google account|facebook login|instagram login|whatsapp web|metamask|trust wallet|seed phrase|frase semilla|wallet connect|airdrop|inicia sesi[oó]n|iniciar sesi[oó]n|log ?in page|contrase[ñn]a|password|verifica tu cuenta|verify your account|clave del banco|token del banco)\b/i;

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const bad = (error, status = 400, extra = {}) => json({ error, ...extra }, status);
const ID_RE = /^[a-z0-9]{12}$/;
const TOKEN_RE = /^[a-f0-9]{32}$/;

function rand(n, alphabet) {
  const b = new Uint8Array(n);
  crypto.getRandomValues(b);
  return [...b].map((x) => alphabet[x % alphabet.length]).join('');
}
const newId = () => rand(12, 'abcdefghijkmnpqrstuvwxyz23456789');
const newToken = () => rand(32, '0123456789abcdef');
const now = () => new Date().toISOString();

let ready = false;
async function db(env) {
  if (!env.SUPPORT_DB) throw new Error('no_db');
  if (!ready) {
    await env.SUPPORT_DB.prepare(
      `CREATE TABLE IF NOT EXISTS ai_sites (id TEXT PRIMARY KEY, token TEXT NOT NULL, slug TEXT UNIQUE, data TEXT NOT NULL, prompt TEXT, lang TEXT,
       ip TEXT, status TEXT NOT NULL DEFAULT 'draft', order_token TEXT, order_number TEXT, edits INTEGER NOT NULL DEFAULT 0,
       created_at TEXT, updated_at TEXT, checked_at TEXT, live_at TEXT)`,
    ).run();
    // Columns added after launch (ignored when they already exist).
    for (const col of ['media TEXT', 'domain TEXT', 'domain_status TEXT', 'domain_id TEXT']) {
      await env.SUPPORT_DB.prepare(`ALTER TABLE ai_sites ADD COLUMN ${col}`).run().catch(() => {});
    }
    ready = true;
  }
  return env.SUPPORT_DB;
}

async function getSite(env, id, token) {
  if (!ID_RE.test(String(id || '')) || !TOKEN_RE.test(String(token || ''))) return null;
  const row = await (await db(env)).prepare('SELECT * FROM ai_sites WHERE id = ?').bind(id).first();
  return row && row.token === token ? row : null;
}

function mediaOf(row) {
  try {
    const m = JSON.parse(row.media || '{}');
    return { logo: m.logo ? IMG_BASE + m.logo : '', photos: (m.photos || []).map((k) => IMG_BASE + k) };
  } catch {
    return { logo: '', photos: [] };
  }
}
const rawMedia = (row) => {
  try {
    const m = JSON.parse(row.media || '{}');
    return { logo: m.logo || '', photos: Array.isArray(m.photos) ? m.photos : [] };
  } catch {
    return { logo: '', photos: [] };
  }
};

// ---------- AI ----------

const SHAPE = `{
  "name": "business name",
  "icon": "one emoji for the business",
  "style": "clean | warm | bold | elegant | fresh",
  "accent": "#hex brand color (medium or dark, readable with white text)",
  "tagline": "short line: what and where, e.g. 'Panadería artesanal en Petare'",
  "hero": { "title": "main headline, max 8 words", "subtitle": "1-2 sentences", "button": "short action, e.g. 'Pedir por WhatsApp'" },
  "features": [ { "icon": "emoji", "title": "reason to choose them", "text": "one short sentence" } ],
  "services": { "title": "section title", "intro": "one sentence", "items": [ { "icon": "emoji", "name": "service or product", "text": "one sentence", "price": "only if the customer gave it, else empty" } ] },
  "about": { "title": "section title", "text": "2-4 sentences about the business" },
  "hours": [ { "days": "e.g. Lunes a sábado", "time": "e.g. 8:00 a 18:00" } ],
  "faq": [ { "q": "question", "a": "answer" } ],
  "cta": { "title": "closing call to action", "text": "one sentence", "button": "short action" },
  "contact": { "whatsapp": "", "phone": "", "email": "", "address": "", "city": "", "instagram": "", "facebook": "", "tiktok": "" }
}`;
const LANG_NAME = { es: 'Spanish (Latin America)', en: 'English', pt: 'Portuguese (Brazil)' };

function rules(lang) {
  return `You write one-page websites for small businesses. Reply with ONE JSON object only (no markdown, no comments) with exactly this shape:
${SHAPE}
Rules:
- Write every text in ${LANG_NAME[lang] || LANG_NAME.es}, simple and warm, like a good local copywriter. No clichés, no exaggeration.
- Write WhatsApp and phone numbers in international format with the country code when the country is clear (e.g. +58 412 555 1234, +232 76 123 456, +55 11 90000 0000).
- Use ONLY facts the customer gave for phone numbers, WhatsApp, email, address, city, social handles, prices, hours, years, numbers of clients, awards and reviews. Never invent them: leave "" or [] when unknown.
- You may describe the services they mention and add a few obvious ones for that kind of business, without prices.
- 3 features, 3 to 8 services, 0 to 4 FAQ (only real, useful questions), hours only if given.
- Pick the style and accent color that fit the business (e.g. warm for bakeries and cafés, bold for gyms and workshops, elegant for salons and law firms, fresh for health and cleaning, clean for everything else).
- Never write links, HTML, or anything asking visitors for passwords or bank details.`;
}

function parseJson(text) {
  const t = String(text || '').replace(/```(?:json)?/gi, '');
  const a = t.indexOf('{');
  const b = t.lastIndexOf('}');
  if (a < 0 || b <= a) throw new Error('no_json');
  return JSON.parse(t.slice(a, b + 1));
}

async function askAI(env, messages, { maxTokens = 3500 } = {}) {
  if (!env.OPENROUTER_API_KEY) throw new Error('ai_not_configured');
  const models = String(env.OPENROUTER_MODELS || '').split(',').map((m) => m.trim()).filter(Boolean);
  const list = models.length ? models : MODELS;
  let last = 'ai_failed';
  for (const model of list) {
    try {
      const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { authorization: `Bearer ${env.OPENROUTER_API_KEY}`, 'content-type': 'application/json', 'HTTP-Referer': 'https://sylkit.com', 'X-Title': 'Sylkit AI Builder' },
        body: JSON.stringify({ model, messages, temperature: 0.6, max_tokens: maxTokens, response_format: { type: 'json_object' } }),
        signal: AbortSignal.timeout(55000),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok || !j?.choices?.[0]?.message?.content) {
        last = `${model}: ${r.status} ${j?.error?.message || ''}`.slice(0, 200);
        continue;
      }
      return { data: parseJson(j.choices[0].message.content), model };
    } catch (e) {
      last = `${model}: ${e?.message || e}`.slice(0, 200);
    }
  }
  throw new Error(last);
}

// ---------- slugs ----------

function slugify(name) {
  return String(name || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, 'y')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30)
    .replace(/-+$/g, '');
}
const validSlug = (s) => /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/.test(s) && !s.includes('--') && !RESERVED.has(s);

async function freeSlug(env, base, selfId) {
  const root = validSlug(base) ? base : 'mi-negocio';
  for (let i = 0; i < 20; i++) {
    const s = i === 0 ? root : `${root.slice(0, 26)}-${i + 1}`;
    if (!validSlug(s)) continue;
    const row = await (await db(env)).prepare('SELECT id FROM ai_sites WHERE slug = ?').bind(s).first();
    if (!row || row.id === selfId) return s;
  }
  return `${root.slice(0, 20)}-${rand(4, 'abcdefghjkmnpqrstuvwxyz23456789')}`;
}

// ---------- live status ----------

function sbHeaders(env) {
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  const h = { apikey: key, 'content-type': 'application/json' };
  if (key && key.startsWith('eyJ')) h.authorization = `Bearer ${key}`;
  return h;
}
async function orderByToken(env, token) {
  if (!env.SUPABASE_SERVICE_ROLE_KEY || !/^[0-9a-f-]{36}$/i.test(String(token || ''))) return null;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/orders?token=eq.${encodeURIComponent(token)}&select=id,order_number,status,details,products(slug)`, { headers: sbHeaders(env) });
  if (!r.ok) return null;
  return (await r.json())?.[0] || null;
}

// Paid → live. Checked against the order at most every 2 minutes while waiting, and once a day after
// going live (a cancelled order takes the site down).
async function refreshStatus(env, row) {
  if (!row.order_token) return row;
  const last = row.checked_at ? Date.parse(row.checked_at) : 0;
  const wait = row.status === 'live' ? 24 * 3600e3 : 2 * 60e3;
  if (Date.now() - last < wait) return row;
  const o = await orderByToken(env, row.order_token).catch(() => null);
  let status = row.status;
  if (o && LIVE_STATUSES.has(o.status)) status = 'live';
  else if (o && o.status === 'cancelled') status = 'off';
  const liveAt = status === 'live' && !row.live_at ? now() : row.live_at;
  await (await db(env)).prepare('UPDATE ai_sites SET status = ?, checked_at = ?, live_at = ? WHERE id = ?').bind(status, now(), liveAt, row.id).run();
  return { ...row, status, live_at: liveAt, checked_at: now() };
}

const urlOf = (slug) => (slug ? `https://${slug}.sylkit.com` : null);

// ---------- handlers ----------

const DEFAULT_Q = {
  es: [
    ['name', '¿Cómo se llama tu negocio?', 'Ej.: Panadería Dulce Hogar'],
    ['offer', '¿Qué vendes u ofreces? Si quieres, con precios.', 'Ej.: Pan canilla $1, tortas desde $15, cachitos $1,50'],
    ['where', '¿Dónde estás?', 'Ej.: Calle Principal de Petare, Caracas'],
    ['hours', '¿Cuál es tu horario?', 'Ej.: Lunes a sábado de 7:00 a 19:00'],
    ['contact', '¿Tu WhatsApp y redes sociales?', 'Ej.: 0414 123 4567 · Instagram @minegocio'],
  ],
  en: [
    ['name', "What's your business called?", 'e.g. Sunrise Bakery'],
    ['offer', 'What do you sell or offer? Add prices if you like.', 'e.g. Bread $1, custom cakes from $15'],
    ['where', 'Where are you located?', 'e.g. 12 Wilkinson Road, Freetown'],
    ['hours', 'What are your opening hours?', 'e.g. Monday to Saturday, 7am to 7pm'],
    ['contact', 'Your WhatsApp and social media?', 'e.g. +232 76 123 456 · Instagram @mybusiness'],
  ],
  pt: [
    ['name', 'Qual é o nome do seu negócio?', 'Ex.: Padaria Pão Quente'],
    ['offer', 'O que você vende ou oferece? Com preços, se quiser.', 'Ex.: Pão francês R$1, bolos a partir de R$50'],
    ['where', 'Onde você fica?', 'Ex.: Rua das Flores, 120, Campinas'],
    ['hours', 'Qual é o seu horário?', 'Ex.: Segunda a sábado, das 6h às 20h'],
    ['contact', 'Seu WhatsApp e redes sociais?', 'Ex.: (19) 99876-5432 · Instagram @meunegocio'],
  ],
};
const defaultQuestions = (lang) => (DEFAULT_Q[lang] || DEFAULT_Q.es).map(([id, q, ph]) => ({ id, q, placeholder: ph }));

function questionRules(lang) {
  return `You help a small business owner create their website. Read what they wrote and ask 3 to 5 short, friendly questions about what is MISSING for a great one-page business website.
Priorities: business name, what they sell or offer (and prices if they want to show them), location or service area, opening hours, WhatsApp or phone, social media, anything special about them.
Never ask about things they already told you. Never ask for passwords, bank details or ID numbers.
Write in ${LANG_NAME[lang] || LANG_NAME.es}. Reply with ONE JSON object only:
{"questions":[{"id":"short_id","q":"the question","placeholder":"a short realistic example answer"}]}`;
}

async function start(request, env) {
  const body = await request.json().catch(() => ({}));
  const prompt = String(body.prompt || '').trim().slice(0, 1500);
  const lang = ['es', 'en', 'pt'].includes(body.lang) ? body.lang : 'es';
  if (prompt.length < 8) return bad('prompt_too_short');
  if (BLOCK.test(prompt)) return bad('not_allowed', 422);
  if (await overLimit(env, request, 'build_q').catch(() => false)) return bad('rate_limited', 429);
  let questions = [];
  try {
    const out = await askAI(env, [
      { role: 'system', content: questionRules(lang) },
      { role: 'user', content: `The business owner wrote:\n"""${prompt}"""` },
    ], { maxTokens: 700 });
    questions = (Array.isArray(out.data?.questions) ? out.data.questions : [])
      .slice(0, 5)
      .map((x, i) => ({
        id: String(x?.id || `q${i}`).replace(/[^a-z0-9_]/gi, '').slice(0, 20) || `q${i}`,
        q: String(x?.q || '').replace(/[<>]/g, '').trim().slice(0, 160),
        placeholder: String(x?.placeholder || '').replace(/[<>]/g, '').trim().slice(0, 120),
      }))
      .filter((x) => x.q.length > 5 && !BLOCK.test(x.q));
  } catch (e) {
    console.log('build questions failed', String(e?.message || e));
  }
  if (questions.length < 2) questions = defaultQuestions(lang);
  const id = newId();
  const token = newToken();
  await (await db(env))
    .prepare('INSERT INTO ai_sites (id, token, data, prompt, lang, ip, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(id, token, '{}', prompt, lang, request.headers.get('cf-connecting-ip') || '', now(), now())
    .run();
  return json({ id, token, questions });
}

async function generate(request, env) {
  const body = await request.json().catch(() => ({}));
  // New flow: the site was started with /start (questions answered). Old flow: just a prompt.
  const existing = body.id ? await getSite(env, body.id, body.token) : null;
  if (body.id && !existing) return bad('not_found', 404);
  const lang = existing ? existing.lang : ['es', 'en', 'pt'].includes(body.lang) ? body.lang : 'es';
  const basePrompt = existing ? String(existing.prompt || '') : String(body.prompt || '').trim().slice(0, 1500);
  const answers = (Array.isArray(body.answers) ? body.answers : [])
    .slice(0, 8)
    .map((a) => ({ q: String(a?.q || '').slice(0, 160), a: String(a?.a || '').trim().slice(0, 600) }))
    .filter((a) => a.a);
  const style = ['clean', 'warm', 'bold', 'elegant', 'fresh'].includes(body.style) ? body.style : '';
  const prompt = [basePrompt, ...answers.map((a) => `${a.q}\n${a.a}`)].join('\n\n');
  if (prompt.trim().length < 12) return bad('prompt_too_short');
  if (BLOCK.test(prompt)) return bad('not_allowed', 422);
  if (await overLimit(env, request, 'build').catch(() => false)) return bad('rate_limited', 429);
  let out;
  try {
    out = await askAI(env, [
      { role: 'system', content: rules(lang) + (style ? `\n- Use the style "${style}" (the customer chose it).` : '') },
      { role: 'user', content: `The customer wrote:\n"""${prompt}"""\nCreate their website.` },
    ]);
  } catch (e) {
    console.log('build generate failed', String(e?.message || e));
    return bad('ai_busy', 503);
  }
  let site;
  try {
    site = sanitizeSite({ ...out.data, lang });
  } catch {
    return bad('ai_busy', 503);
  }
  if (style) site.style = style;
  if (BLOCK.test(JSON.stringify(site))) return bad('not_allowed', 422);
  let id = existing?.id;
  let token = existing?.token;
  if (existing) {
    await (await db(env)).prepare('UPDATE ai_sites SET data = ?, prompt = ?, updated_at = ? WHERE id = ?').bind(JSON.stringify(site), prompt.slice(0, 4000), now(), id).run();
  } else {
    id = newId();
    token = newToken();
    await (await db(env))
      .prepare('INSERT INTO ai_sites (id, token, data, prompt, lang, ip, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, token, JSON.stringify(site), prompt, lang, request.headers.get('cf-connecting-ip') || '', now(), now())
      .run();
  }
  const slug = existing?.slug || (await freeSlug(env, slugify(site.name), id));
  return json({ id, token, site, slug, model: out.model });
}

async function edit(request, env) {
  const body = await request.json().catch(() => ({}));
  const row = await getSite(env, body.id, body.token);
  if (!row) return bad('not_found', 404);
  const instruction = String(body.instruction || '').trim().slice(0, 600);
  if (instruction.length < 2) return bad('empty');
  if (BLOCK.test(instruction)) return bad('not_allowed', 422);
  if (row.edits >= MAX_EDITS) return bad('edit_limit', 429);
  if (await overLimit(env, request, 'build_edit').catch(() => false)) return bad('rate_limited', 429);
  const current = JSON.parse(row.data);
  if (!current.name) return bad('not_generated', 409);
  let out;
  try {
    out = await askAI(env, [
      { role: 'system', content: `${rules(current.lang)}\nYou are now EDITING an existing website. Apply the customer's change and return the FULL updated JSON with the same shape. Change only what they asked for; keep everything else exactly as it is.` },
      { role: 'user', content: `Current website JSON:\n${JSON.stringify(current)}\n\nThe customer's change:\n"""${instruction}"""` },
    ]);
  } catch (e) {
    console.log('build edit failed', String(e?.message || e));
    return bad('ai_busy', 503);
  }
  let site;
  try {
    site = sanitizeSite({ ...out.data, lang: current.lang });
  } catch {
    return bad('ai_busy', 503);
  }
  if (BLOCK.test(JSON.stringify(site))) return bad('not_allowed', 422);
  await (await db(env)).prepare('UPDATE ai_sites SET data = ?, edits = edits + 1, updated_at = ? WHERE id = ?').bind(JSON.stringify(site), now(), row.id).run();
  return json({ site });
}

async function siteInfo(env, url) {
  let row = await getSite(env, url.searchParams.get('id'), url.searchParams.get('t'));
  if (!row) return bad('not_found', 404);
  row = await refreshStatus(env, row);
  const site = JSON.parse(row.data);
  if (!site.name) return json({ site: null, pending: true, media: mediaOf(row) });
  const suggested = row.slug ? null : await freeSlug(env, slugify(site.name), row.id);
  if (row.domain && row.domain_id && row.domain_status !== 'active') row = await refreshDomain(env, row);
  return json({
    site, slug: row.slug, suggested, status: row.status, live: row.status === 'live', url: urlOf(row.slug), order_number: row.order_number,
    media: mediaOf(row), domain: row.domain || null, domain_status: row.domain_status || null, target: CNAME_TARGET,
  });
}

async function preview(env, url) {
  const row = await getSite(env, url.searchParams.get('id'), url.searchParams.get('t'));
  if (!row) return new Response('Not found', { status: 404 });
  const site = JSON.parse(row.data);
  if (!site.name) return new Response('Not ready', { status: 404 });
  return new Response(renderSite(site, { preview: true, media: mediaOf(row) }), {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' },
  });
}

async function setSlug(request, env) {
  const body = await request.json().catch(() => ({}));
  const row = await getSite(env, body.id, body.token);
  if (!row) return bad('not_found', 404);
  const slug = slugify(body.slug);
  if (row.status === 'live' && row.slug && slug !== row.slug) return bad('already_live', 409, { slug: row.slug });
  if (!validSlug(slug)) return bad(RESERVED.has(slug) ? 'reserved' : 'invalid');
  const other = await (await db(env)).prepare('SELECT id FROM ai_sites WHERE slug = ?').bind(slug).first();
  if (other && other.id !== row.id) return bad('taken', 409, { suggestion: await freeSlug(env, slug, row.id) });
  await (await db(env)).prepare('UPDATE ai_sites SET slug = ?, updated_at = ? WHERE id = ?').bind(slug, now(), row.id).run();
  return json({ slug, url: urlOf(slug) });
}

async function link(request, env) {
  const body = await request.json().catch(() => ({}));
  const row = await getSite(env, body.id, body.token);
  if (!row) return bad('not_found', 404);
  if (!row.slug) return bad('no_slug');
  const o = await orderByToken(env, body.order_token);
  if (!o || o.products?.slug !== PRODUCT) return bad('order_not_found', 404);
  await (await db(env))
    .prepare('UPDATE ai_sites SET order_token = ?, order_number = ?, checked_at = NULL, updated_at = ? WHERE id = ?')
    .bind(body.order_token, o.order_number, now(), row.id)
    .run();
  // Put the site's address and edit link on the order, so the client and the admin see them.
  const note = `Sitio con IA / AI website: ${urlOf(row.slug)}\nEditar / Edit: https://sylkit.com/build?site=${row.id}&t=${row.token}`;
  if (!String(o.details || '').includes(urlOf(row.slug))) {
    await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${o.id}`, {
      method: 'PATCH',
      headers: { ...sbHeaders(env), prefer: 'return=minimal' },
      body: JSON.stringify({ details: [o.details, note].filter(Boolean).join('\n\n') }),
    }).catch(() => null);
  }
  return json({ ok: true, url: urlOf(row.slug) });
}

// name.sylkit.com and sylkit.com/s/name. Returns null when no AI site has that name.
export async function serveSite(env, slug) {
  if (!validSlug(slug)) return null;
  const row = await (await db(env)).prepare('SELECT * FROM ai_sites WHERE slug = ?').bind(slug).first();
  if (!row) return null;
  return render(env, row);
}

// A customer's own domain (www.theirbusiness.com) pointed at sites.sylkit.com.
export async function serveDomain(env, host) {
  const h = String(host || '').toLowerCase();
  const alt = h.startsWith('www.') ? h.slice(4) : `www.${h}`;
  const row = await (await db(env)).prepare('SELECT * FROM ai_sites WHERE domain = ? OR domain = ? LIMIT 1').bind(h, alt).first();
  if (!row) return null;
  return render(env, row, `https://${row.domain}`);
}

async function render(env, row, canonical) {
  row = await refreshStatus(env, row);
  const site = JSON.parse(row.data);
  if (!site.name) return null;
  if (row.status !== 'live') {
    return new Response(renderWaiting(site.lang, site.name), { status: 200, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
  }
  return new Response(renderSite(site, { url: canonical || urlOf(row.slug), media: mediaOf(row) }), { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=60' } });
}

// ---------- logo and photos (Workers KV: SITE_MEDIA) ----------

function imageType(bytes) {
  const b = bytes;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png';
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'image/webp';
  return '';
}

async function upload(request, env, url) {
  if (!env.SITE_MEDIA) return bad('storage_not_configured', 503);
  const row = await getSite(env, url.searchParams.get('id'), url.searchParams.get('t'));
  if (!row) return bad('not_found', 404);
  const kind = url.searchParams.get('kind') === 'logo' ? 'logo' : 'photo';
  if (await overLimit(env, request, 'build_upload').catch(() => false)) return bad('rate_limited', 429);
  const buf = new Uint8Array(await request.arrayBuffer());
  if (!buf.length || buf.length > MAX_BYTES) return bad('too_big', 413);
  const type = imageType(buf);
  if (!type) return bad('not_an_image', 415);
  const media = rawMedia(row);
  if (kind === 'photo' && media.photos.length >= MAX_PHOTOS) return bad('too_many', 409);
  const key = `${row.id}/${kind}-${rand(10, 'abcdefghijkmnpqrstuvwxyz23456789')}`;
  await env.SITE_MEDIA.put(key, buf, { metadata: { type } });
  if (kind === 'logo') {
    if (media.logo) await env.SITE_MEDIA.delete(media.logo).catch(() => {});
    media.logo = key;
  } else media.photos.push(key);
  await (await db(env)).prepare('UPDATE ai_sites SET media = ?, updated_at = ? WHERE id = ?').bind(JSON.stringify(media), now(), row.id).run();
  return json({ media: mediaOf({ media: JSON.stringify(media) }) });
}

async function unmedia(request, env) {
  const body = await request.json().catch(() => ({}));
  const row = await getSite(env, body.id, body.token);
  if (!row) return bad('not_found', 404);
  const key = String(body.url || '').replace(IMG_BASE, '');
  const media = rawMedia(row);
  if (media.logo === key) media.logo = '';
  media.photos = media.photos.filter((k) => k !== key);
  if (key.startsWith(`${row.id}/`)) await env.SITE_MEDIA?.delete(key).catch(() => {});
  await (await db(env)).prepare('UPDATE ai_sites SET media = ?, updated_at = ? WHERE id = ?').bind(JSON.stringify(media), now(), row.id).run();
  return json({ media: mediaOf({ media: JSON.stringify(media) }) });
}

async function image(env, url) {
  const key = url.pathname.slice('/api/build/img/'.length);
  if (!/^[a-z0-9]{12}\/(logo|photo)-[a-z0-9]{10}$/.test(key) || !env.SITE_MEDIA) return new Response('Not found', { status: 404 });
  const { value, metadata } = await env.SITE_MEDIA.getWithMetadata(key, { type: 'arrayBuffer' });
  if (!value) return new Response('Not found', { status: 404 });
  return new Response(value, { headers: { 'content-type': metadata?.type || 'image/jpeg', 'cache-control': 'public, max-age=31536000, immutable', 'access-control-allow-origin': '*' } });
}

// ---------- customer's own domain ----------

const HOST_RE = /^(?=.{4,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/;

async function cf(env, method, path, body) {
  const r = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method,
    headers: { authorization: `Bearer ${env.CF_SAAS_TOKEN}`, 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.success === false) throw new Error(j.errors?.[0]?.message || `cloudflare ${r.status}`);
  return j.result;
}

async function refreshDomain(env, row) {
  if (!env.CF_SAAS_TOKEN || !row.domain_id) return row;
  try {
    const h = await cf(env, 'GET', `/zones/${ZONE_ID}/custom_hostnames/${row.domain_id}`);
    const status = h.status === 'active' && h.ssl?.status === 'active' ? 'active' : 'pending';
    if (status !== row.domain_status) await (await db(env)).prepare('UPDATE ai_sites SET domain_status = ? WHERE id = ?').bind(status, row.id).run();
    return { ...row, domain_status: status };
  } catch {
    return row;
  }
}

async function setDomain(request, env) {
  const body = await request.json().catch(() => ({}));
  const row = await getSite(env, body.id, body.token);
  if (!row) return bad('not_found', 404);
  const host = String(body.hostname || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/\.$/, '');
  const d1 = await db(env);
  // Remove the current domain.
  if (!host) {
    if (row.domain_id && env.CF_SAAS_TOKEN) await cf(env, 'DELETE', `/zones/${ZONE_ID}/custom_hostnames/${row.domain_id}`).catch(() => {});
    await d1.prepare('UPDATE ai_sites SET domain = NULL, domain_status = NULL, domain_id = NULL WHERE id = ?').bind(row.id).run();
    return json({ domain: null });
  }
  if (!HOST_RE.test(host) || host.endsWith('sylkit.com')) return bad('invalid_domain');
  const taken = await d1.prepare('SELECT id FROM ai_sites WHERE domain = ? AND id != ?').bind(host, row.id).first();
  if (taken) return bad('domain_taken', 409);
  if (row.domain === host) return json({ domain: host, status: row.domain_status, target: CNAME_TARGET });
  if (row.domain_id && env.CF_SAAS_TOKEN) await cf(env, 'DELETE', `/zones/${ZONE_ID}/custom_hostnames/${row.domain_id}`).catch(() => {});
  let status = 'manual';
  let domainId = null;
  if (env.CF_SAAS_TOKEN) {
    try {
      const h = await cf(env, 'POST', `/zones/${ZONE_ID}/custom_hostnames`, { hostname: host, ssl: { method: 'http', type: 'dv' } });
      domainId = h.id;
      status = 'pending';
    } catch (e) {
      console.log('custom hostname failed', String(e?.message || e));
    }
  }
  await d1.prepare('UPDATE ai_sites SET domain = ?, domain_status = ?, domain_id = ?, updated_at = ? WHERE id = ?').bind(host, status, domainId, now(), row.id).run();
  if (status === 'manual') {
    await alertOwner(env, {
      title: 'Dominio propio para web con IA',
      message: `${host} → ${row.slug ? `${row.slug}.sylkit.com` : row.id}${row.order_number ? ` (${row.order_number})` : ''}\nConéctalo en Cloudflare (custom hostname) o responde al cliente.`,
      tags: 'globe_with_meridians',
    }).catch(() => {});
  }
  return json({ domain: host, status, target: CNAME_TARGET });
}

export async function handleBuild(request, env, url) {
  try {
    const p = url.pathname;
    if (p === '/api/build/start' && request.method === 'POST') return await start(request, env);
    if (p === '/api/build/generate' && request.method === 'POST') return await generate(request, env);
    if (p === '/api/build/upload' && request.method === 'POST') return await upload(request, env, url);
    if (p === '/api/build/unmedia' && request.method === 'POST') return await unmedia(request, env);
    if (p === '/api/build/domain' && request.method === 'POST') return await setDomain(request, env);
    if (p.startsWith('/api/build/img/') && request.method === 'GET') return await image(env, url);
    if (p === '/api/build/edit' && request.method === 'POST') return await edit(request, env);
    if (p === '/api/build/slug' && request.method === 'POST') return await setSlug(request, env);
    if (p === '/api/build/link' && request.method === 'POST') return await link(request, env);
    if (p === '/api/build/site' && request.method === 'GET') return await siteInfo(env, url);
    if (p === '/api/build/preview' && request.method === 'GET') return await preview(env, url);
    return bad('not_found', 404);
  } catch (e) {
    console.log('build error', String(e?.message || e));
    return bad('server_error', 500);
  }
}
