// One-time job: applies the 7 Nov 2026 price review to the database (same changes as
// supabase/price_review_2026-11-07.sql). Runs once, in the background, on the first request after deploy
// (and on the daily cron as a fallback). Records the result in D1 (table jobs) so it never runs twice.
// Safe to remove after it has run.

const SUPABASE_URL = 'https://chcljhwcvzlmxrrhetfv.supabase.co';
const JOB = 'price_review_2026_11_07';

const PLANS = {
  'alertas-de-vencimiento': [[19, 59], [45, 119], [79, 179]],
  'punto-de-venta': [[19, 59], [45, 119], [79, 179]],
  'control-de-inventario': [[19, 59], [45, 119], [79, 179]],
  'taller-mecanico': [[19, 59], [45, 119], [79, 179]],
  'nomina-asistencia': [[19, 59], [45, 119], [79, 179]],
  'tienda-online-whatsapp': [[19, 99], [45, 179], [79, 279]],
  'salon-barberia-reservas': [[19, 59], [45, 99], [79, 149]],
  facturacion: [[19, 49], [45, 79], [79, 129]],
  'restaurante-menu-qr': [[25, 79], [49, 129], [89, 199]],
  'servicios-a-domicilio': [[25, 79], [49, 129], [89, 199]],
  'clinica-citas-historias': [[35, 99], [59, 149], [99, 279]],
  'sitio-web-personal': [[12, 149], [19, 249], [29, 449]],
  'sitio-web-para-negocios': [[15, 199], [25, 399], [39, 699]],
  'app-movil-a-medida': [[29, 1499], [49, 2999], [89, 5999]],
  'hosting-web': [[7, 30], [15, 50], [29, 80]],
};
const TIERS = ['starter', 'business', 'pro'];
const ADDONS = { api_integration: 250, store_publishing: 250, online_payments: 150, seo_pack: 120, data_import: 75, onsite_training: 60, extra_pages: 40, extra_branch: 15, priority_support: 25 };

function headers(env) {
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  const h = { apikey: key, 'content-type': 'application/json', prefer: 'return=minimal' };
  if (key && key.startsWith('eyJ')) h.authorization = `Bearer ${key}`;
  return h;
}

async function sb(env, method, path, body) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { method, headers: headers(env), body: body ? JSON.stringify(body) : undefined });
  const t = await r.text();
  if (!r.ok) throw new Error(`${method} ${path.split('?')[0]} ${r.status}: ${t.slice(0, 200)}`);
  return t ? JSON.parse(t) : null;
}

async function apply(env) {
  const slugs = Object.keys(PLANS);
  const rows = await sb(env, 'GET', `products?slug=in.(${slugs.join(',')})&select=slug,pricing`);
  const done = [];
  for (const row of rows || []) {
    const plans = row.pricing?.plans;
    if (!Array.isArray(plans)) continue;
    const next = plans.map((pl) => {
      const i = TIERS.indexOf(pl.id);
      if (i < 0) return pl;
      const [monthly, setup] = PLANS[row.slug][i];
      return { ...pl, monthly, setup };
    });
    const price_from = Math.min(...next.map((p) => Number(p.monthly)).filter((n) => Number.isFinite(n)));
    await sb(env, 'PATCH', `products?slug=eq.${encodeURIComponent(row.slug)}`, { pricing: { ...row.pricing, plans: next, [JOB]: true }, price_from });
    done.push(row.slug);
  }
  for (const [id, price] of Object.entries(ADDONS)) await sb(env, 'PATCH', `addons?id=eq.${id}`, { price });
  return { products: done, addons: Object.keys(ADDONS).length };
}

let started = false;
export async function runPriceJob(env) {
  if (started || !env.SUPPORT_DB || !env.SUPABASE_SERVICE_ROLE_KEY) return;
  started = true;
  const db = env.SUPPORT_DB;
  await db.prepare('CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY, status TEXT, detail TEXT, at TEXT)').run();
  const prev = await db.prepare('SELECT status FROM jobs WHERE id = ?').bind(JOB).first();
  if (prev?.status === 'done') return;
  try {
    const out = await apply(env);
    await db.prepare("INSERT OR REPLACE INTO jobs VALUES (?, 'done', ?, datetime('now'))").bind(JOB, JSON.stringify(out)).run();
  } catch (e) {
    await db.prepare("INSERT OR REPLACE INTO jobs VALUES (?, 'error', ?, datetime('now'))").bind(JOB, String(e?.message || e)).run();
  }
}
