// Temporary: adds the "web-con-ia" product (Sylkit AI Builder) to the database once. Remove after it ran.
const SUPABASE_URL = 'https://chcljhwcvzlmxrrhetfv.supabase.co';
const JOB = 'product_web_con_ia';
const ROW = {"slug": "web-con-ia", "category": "web", "icon": "sparkles", "tint": "blue", "badge_es": "Nuevo · IA", "badge_en": "New · AI", "price_from": 7, "name_es": "Crea tu web con IA", "name_en": "Build your website with AI", "short_es": "Describe tu negocio y obtén tu web en un minuto. Gratis para probar.", "short_en": "Describe your business and get your website in a minute. Free to try.", "description_es": "Escribe en pocas líneas qué hace tu negocio. La IA crea tu sitio web con tus servicios, horario y botón de WhatsApp. Pide cambios como en un chat y publícalo en tunombre.sylkit.com por $7 al mes.", "description_en": "Write a few lines about your business. The AI builds your website with your services, hours and a WhatsApp button. Ask for changes like in a chat and publish it on yourname.sylkit.com for $7 a month.", "features": [{"es": "Listo en un minuto", "en": "Ready in a minute"}, {"es": "Cambios por chat", "en": "Changes by chat"}, {"es": "Botón de WhatsApp", "en": "WhatsApp button"}, {"es": "Gratis para probar", "en": "Free to try"}], "platforms": ["Web"], "active": true, "sort": 8, "demo_url": null, "pricing": {"group": "aibuilder", "billing": ["monthly", "yearly"], "plans": [{"id": "starter", "name": {"es": "Web con IA", "en": "AI website", "pt": "Site com IA"}, "monthly": 7, "setup": 0, "includes": [{"es": "Tu web en tunombre.sylkit.com, con SSL", "en": "Your site on yourname.sylkit.com, with SSL", "pt": "Seu site em seunome.sylkit.com, com SSL"}, {"es": "Botón de WhatsApp en todas las páginas", "en": "WhatsApp button on every page", "pt": "Botão de WhatsApp em todas as páginas"}, {"es": "Cambios ilimitados con IA (uso justo)", "en": "Changes with AI anytime (fair use)", "pt": "Mudanças com IA quando quiser (uso justo)"}, {"es": "Agrega tu propio .com cuando quieras", "en": "Add your own .com whenever you want", "pt": "Adicione seu próprio .com quando quiser"}], "popular": true}], "addons": []}};

let started = false;
export async function runProductJob(env) {
  if (started || !env.SUPPORT_DB || !env.SUPABASE_SERVICE_ROLE_KEY) return;
  started = true;
  const db = env.SUPPORT_DB;
  await db.prepare('CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY, status TEXT, detail TEXT, at TEXT)').run();
  const prev = await db.prepare('SELECT status FROM jobs WHERE id = ?').bind(JOB).first();
  if (prev?.status === 'done') return;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  const headers = { apikey: key, 'content-type': 'application/json', prefer: 'resolution=merge-duplicates,return=representation' };
  if (key.startsWith('eyJ')) headers.authorization = `Bearer ${key}`;
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/products?on_conflict=slug`, { method: 'POST', headers, body: JSON.stringify(ROW) });
    const t = await r.text();
    await db.prepare("INSERT OR REPLACE INTO jobs VALUES (?, ?, ?, datetime('now'))").bind(JOB, r.ok ? 'done' : 'error', `${r.status} ${t.slice(0, 300)}`).run();
  } catch (e) {
    started = false;
    await db.prepare("INSERT OR REPLACE INTO jobs VALUES (?, 'error', ?, datetime('now'))").bind(JOB, String(e?.message || e)).run();
  }
}
