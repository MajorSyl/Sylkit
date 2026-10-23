// Sylkit edge worker:
// - sylkit.com / www: serves the static site (dist/)
// - <demo>.sylkit.com: serves that product's live demo from /demos/<demo>/
// - daily cron keeps the free Supabase database from pausing
const SUPABASE_URL = 'https://chcljhwcvzlmxrrhetfv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_A0oOnUNRvW4ig6sXbM0CFw_1Tr2MwYy';

// subdomain -> folder under public/demos
const DEMOS = Object.fromEntries(
  ['alertas', 'pos', 'inventario', 'farmacia', 'clinica', 'restaurante', 'salon', 'taller', 'servicios', 'escuela', 'nomina', 'facturas', 'tienda', 'portafolio', 'asistente'].map((d) => [d, d]),
);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const sub = url.hostname.split('.')[0];
    const demo = url.hostname.endsWith('sylkit.com') ? DEMOS[sub] : undefined;

    if (demo && !url.pathname.startsWith('/_kit/')) {
      const target = new URL(url);
      target.pathname = `/demos/${demo}${url.pathname === '/' ? '/' : url.pathname}`;
      const res = await env.ASSETS.fetch(new Request(target, request));
      if (res.status !== 404) return res;
      return env.ASSETS.fetch(new Request(new URL(`/demos/${demo}/`, url), request));
    }

    const res = await env.ASSETS.fetch(request);
    if (res.status !== 404) return res;
    const notFound = await env.ASSETS.fetch(new Request(new URL('/+not-found', url), request));
    return new Response(notFound.body, { status: 404, headers: notFound.headers });
  },

  async scheduled(_event, _env, ctx) {
    ctx.waitUntil(
      fetch(`${SUPABASE_URL}/rest/v1/products?select=slug&limit=1`, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      }),
    );
  },
};
