// Serves the static site (dist/) and runs a daily keep-alive so the free
// Supabase database never pauses for inactivity.
const SUPABASE_URL = 'https://chcljhwcvzlmxrrhetfv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_A0oOnUNRvW4ig6sXbM0CFw_1Tr2MwYy';

export default {
  async fetch(request, env) {
    // Only reached when no static file matched: serve the app's 404 page.
    const url = new URL(request.url);
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
