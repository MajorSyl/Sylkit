// Temporary job from the 8 Nov 2026 site test. Remove this file and its two lines in index.js when done.
//  1. Applies the 2 Nov 2026 changes that never reached the database (supabase/price_update_2026-11-02.sql was
//     not run): Pharmacy, School and AI assistant prices; Pharmacy founding-offer badge, description and plan
//     details; the "Connect your own AI" line on the plans that have it; the Clinic AI note.
//     The 7 Nov price review is kept: its prices are not touched here. Runs once (D1 table jobs).
//  2. Cancels the test orders placed by Claude during the site test (customer name starts with "TEST Claude",
//     email test-…@example.com). Runs on every call, only touches those orders.

const SUPABASE_URL = 'https://chcljhwcvzlmxrrhetfv.supabase.co';
const JOB = 'fix_2026_11_08';
const TIERS = ['starter', 'business', 'pro'];

const PRICES = {
  'farmacia-pos': [[29, 79], [49, 129], [79, 199]],
  'gestion-escolar': [[35, 119], [69, 219], [119, 399]],
  'asistente-ia-para-negocios': [[35, 119], [69, 219], [119, 399]],
};
const AI = { es: 'Conecta tu propia IA (Claude, OpenAI u otra) con tu clave de API', en: 'Connect your own AI (Claude, OpenAI or other) with your API key' };
const AI_PLANS = {
  'alertas-de-vencimiento': ['pro'],
  'punto-de-venta': ['pro'],
  'control-de-inventario': ['pro'],
  'taller-mecanico': ['pro'],
  'nomina-asistencia': ['pro'],
  'clinica-citas-historias': ['business', 'pro'],
  'restaurante-menu-qr': ['pro'],
  'servicios-a-domicilio': ['pro'],
  'salon-barberia-reservas': ['pro'],
  'gestion-escolar': ['pro'],
  facturacion: ['pro'],
  'asistente-ia-para-negocios': ['pro'],
};
const PHARMACY_INCLUDES = {
  starter: [
    { es: '1 sucursal · hasta 3 usuarios', en: '1 branch · up to 3 users' },
    { es: 'Todas las funciones principales', en: 'All core features' },
    { es: 'Soporte: respuesta el siguiente día hábil', en: 'Support: reply by the next business day' },
    { es: 'Actualizaciones incluidas', en: 'Updates included' },
  ],
  business: [
    { es: 'Hasta 3 sucursales · 10 usuarios', en: 'Up to 3 branches · 10 users' },
    { es: 'Reportes avanzados', en: 'Advanced reports' },
    { es: 'Capacitación en línea para tu equipo', en: 'Online training for your team' },
    { es: 'Soporte el mismo día en horario laboral', en: 'Same-day support during office hours' },
    AI,
    { es: 'Todo lo del plan Inicial', en: 'Everything in Starter' },
  ],
  pro: [
    { es: 'Sucursales y usuarios ilimitados', en: 'Unlimited branches and users' },
    { es: 'Soporte con máxima prioridad en horario laboral', en: 'Highest-priority support during office hours' },
    { es: 'Copias de seguridad diarias', en: 'Daily backups' },
    AI,
    { es: 'Todo lo del plan Negocio', en: 'Everything in Business' },
  ],
};
const PHARMACY_TEXT = {
  badge_es: '10 farmacias fundadoras: instalación $0',
  badge_en: '10 founding pharmacies: $0 setup',
  es: ' Oferta fundadora: las primeras 10 farmacias no pagan instalación ($0) y reciben importación de datos y capacitación gratis, garantía de 60 días y su precio congelado por 12 meses. Recomendamos el plan Negocio. Soporte de lunes a sábado de 9:00 a 18:00 (hora de Caracas): Inicial responde el siguiente día hábil, Negocio el mismo día y Pro con máxima prioridad. Para funciones avanzadas puedes conectar tu propia IA (Claude, OpenAI u otra) con tu clave de API.',
  en: ' Founding offer: the first 10 pharmacies pay no setup fee ($0) and get free data import and training, a 60-day guarantee and their price locked for 12 months. We recommend the Business plan. Support Monday to Saturday, 9:00 to 18:00 (Caracas time): Starter gets a reply by the next business day, Business the same day and Pro the highest priority. For advanced features you can connect your own AI (Claude, OpenAI or other) with your API key.',
};
const CLINIC_TEXT = {
  es: ' En los planes Negocio y Pro puedes conectar tu propia IA (Claude, OpenAI u otra) con tu clave de API para funciones avanzadas.',
  en: ' On the Business and Pro plans you can connect your own AI (Claude, OpenAI or other) with your API key for advanced features.',
};

function headers(env, extra = {}) {
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  const h = { apikey: key, 'content-type': 'application/json', prefer: 'return=minimal', ...extra };
  if (key && key.startsWith('eyJ')) h.authorization = `Bearer ${key}`;
  return h;
}
async function sb(env, method, path, body, extra) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { method, headers: headers(env, extra), body: body ? JSON.stringify(body) : undefined });
  const t = await r.text();
  if (!r.ok) throw new Error(`${method} ${path.split('?')[0]} ${r.status}: ${t.slice(0, 200)}`);
  return t ? JSON.parse(t) : null;
}

const hasAi = (list) => Array.isArray(list) && list.some((x) => x && x.en === AI.en);
// AI line goes just before the last line ("Everything in …"), like the 2 Nov SQL.
const withAi = (list) => {
  const l = Array.isArray(list) ? list : [];
  if (hasAi(l)) return l;
  if (!l.length) return [AI];
  return [...l.slice(0, -1), AI, l[l.length - 1]];
};

async function applyFix(env) {
  const slugs = [...new Set([...Object.keys(PRICES), ...Object.keys(AI_PLANS)])];
  const rows = await sb(env, 'GET', `products?slug=in.(${slugs.join(',')})&select=slug,pricing,description_es,description_en,badge_es,badge_en`);
  const done = [];
  for (const row of rows || []) {
    const plans = row.pricing?.plans;
    if (!Array.isArray(plans)) continue;
    const next = plans.map((pl) => {
      const i = TIERS.indexOf(pl.id);
      if (i < 0) return pl;
      let out = { ...pl };
      if (PRICES[row.slug]) out = { ...out, monthly: PRICES[row.slug][i][0], setup: PRICES[row.slug][i][1] };
      if (row.slug === 'farmacia-pos') out.includes = PHARMACY_INCLUDES[pl.id];
      else if (AI_PLANS[row.slug]?.includes(pl.id)) out.includes = withAi(pl.includes);
      return out;
    });
    const patch = { pricing: { ...row.pricing, plans: next, price_update_2026_11_02: true } };
    patch.price_from = Math.min(...next.map((p) => Number(p.monthly)).filter((n) => Number.isFinite(n)));
    if (row.slug === 'farmacia-pos') {
      patch.badge_es = PHARMACY_TEXT.badge_es;
      patch.badge_en = PHARMACY_TEXT.badge_en;
      if (!String(row.description_en || '').includes('Founding offer')) {
        patch.description_es = `${row.description_es || ''}${PHARMACY_TEXT.es}`;
        patch.description_en = `${row.description_en || ''}${PHARMACY_TEXT.en}`;
      }
    }
    if (row.slug === 'clinica-citas-historias' && !String(row.description_en || '').includes('connect your own AI')) {
      patch.description_es = `${row.description_es || ''}${CLINIC_TEXT.es}`;
      patch.description_en = `${row.description_en || ''}${CLINIC_TEXT.en}`;
    }
    await sb(env, 'PATCH', `products?slug=eq.${encodeURIComponent(row.slug)}`, patch);
    done.push(row.slug);
  }
  return { products: done };
}

async function cancelTestOrders(env) {
  const rows = await sb(env, 'GET', `orders?customer_name=like.${encodeURIComponent('TEST Claude*')}&email=like.${encodeURIComponent('test-*@example.com')}&status=neq.cancelled&select=id,order_number`, null, { prefer: '' });
  for (const o of rows || []) {
    await sb(env, 'PATCH', `orders?id=eq.${o.id}`, { status: 'cancelled' });
    await sb(env, 'POST', 'order_events', { order_id: o.id, kind: 'update', message: 'Test order placed by Claude during the 8 Nov 2026 site test. Cancelled automatically.', public: false });
  }
  return (rows || []).map((o) => o.order_number);
}

let running = false;
export async function runFixJob(env) {
  if (running || !env.SUPPORT_DB || !env.SUPABASE_SERVICE_ROLE_KEY) return;
  running = true;
  const db = env.SUPPORT_DB;
  try {
    await db.prepare('CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY, status TEXT, detail TEXT, at TEXT)').run();
    const prev = await db.prepare('SELECT status FROM jobs WHERE id = ?').bind(JOB).first();
    if (prev?.status !== 'done') {
      try {
        const out = await applyFix(env);
        await db.prepare("INSERT OR REPLACE INTO jobs VALUES (?, 'done', ?, datetime('now'))").bind(JOB, JSON.stringify(out)).run();
      } catch (e) {
        await db.prepare("INSERT OR REPLACE INTO jobs VALUES (?, 'error', ?, datetime('now'))").bind(JOB, String(e?.message || e)).run();
      }
    }
    const cancelled = await cancelTestOrders(env);
    if (cancelled.length) await db.prepare("INSERT OR REPLACE INTO jobs VALUES (?, 'done', ?, datetime('now'))").bind(`${JOB}_cancel_${Date.now()}`, JSON.stringify(cancelled)).run();
  } catch (e) {
    await db.prepare("INSERT OR REPLACE INTO jobs VALUES (?, 'error', ?, datetime('now'))").bind(`${JOB}_cancel`, String(e?.message || e)).run().catch(() => {});
  } finally {
    running = false;
  }
}
