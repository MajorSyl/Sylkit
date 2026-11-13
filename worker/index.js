// Sylkit edge worker:
// - sylkit.com / www: serves the static site (dist/)
// - <demo>.sylkit.com: serves that product's live demo from /demos/<demo>/
// - sets a country cookie so pages can pick Spanish/English when the browser language is neither
// - /api/domain?name=mybusiness checks if a domain is free (public RDAP registry lookup, no API key)
// - /api/pay/* NOWPayments crypto checkout, webhook and health check (see payments.js)
// - /api/order/* payment methods on/off and invoice data for the order's token holder (see orders.js)
// - /api/stripe/* card payments: Stripe Checkout, subscriptions, customer portal and webhook (see stripe.js)
// - /api/monime/* Monime checkout for Sierra Leone (Orange Money, Afrimoney, cards), see monime.js
// - /api/paypal/* PayPal Checkout (PayPal balance or card on PayPal's page) and capture (see paypal.js)
// - /api/photos/* Unsplash search for the photo library and AI Builder (key stays server side, see unsplash.js)
// - /api/build/* AI website builder; <name>.sylkit.com and sylkit.com/s/<name> serve the published sites (see build.js)
// - /api/support/* help widget, AI assistant and the admin support inbox (see support.js, D1 database sylkit-support)
// - cron every 15 min: confirms PayPal/Monime payments whose customer never came back to the site,
//   and keeps the free Supabase database from pausing
import { handlePayments } from './payments.js';
import { handleStripe } from './stripe.js';
import { handleOrders } from './orders.js';
import { handlePaypal, sweepPaypal } from './paypal.js';
import { handleMonime, sweepMonime } from './monime.js';
import { handleSupport } from './support.js';
import { handleBuild, serveDomain, serveSite } from './build.js';
import { handlePhotos } from './unsplash.js';

const SUPABASE_URL = 'https://chcljhwcvzlmxrrhetfv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_A0oOnUNRvW4ig6sXbM0CFw_1Tr2MwYy';

// subdomain -> folder under public/demos
const DEMOS = Object.fromEntries(
  ['alertas', 'pos', 'inventario', 'farmacia', 'clinica', 'restaurante', 'salon', 'taller', 'servicios', 'escuela', 'nomina', 'facturas', 'tienda', 'portafolio', 'asistente'].map((d) => [d, d]),
);

// Extensions we register for clients at a price the "Your own domain" add-on covers,
// with each registry's public RDAP server (404 = not registered).
const RDAP = {
  com: (d) => `https://rdap.verisign.com/com/v1/domain/${d}`,
  net: (d) => `https://rdap.verisign.com/net/v1/domain/${d}`,
  org: (d) => `https://rdap.publicinterestregistry.org/rdap/domain/${d}`,
};
const TLDS = Object.keys(RDAP);

async function checkOne(domain, tld) {
  try {
    const r = await fetch(RDAP[tld](domain), { headers: { accept: 'application/rdap+json, application/json', 'user-agent': 'Sylkit domain check (sylkit.com)' } });
    if (r.status === 404) return 'available';
    if (r.ok) return 'taken';
  } catch {
    /* fall back to DNS below */
  }
  return checkDns(domain);
}

// Second opinion when a registry's RDAP server doesn't answer (the .org one sometimes doesn't):
// a registered domain has name servers; NXDOMAIN at the registry means it is free.
async function checkDns(domain) {
  try {
    const r = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=NS`, { headers: { accept: 'application/dns-json' } });
    const j = await r.json();
    if (j.Status === 3) return 'available';
    if (j.Status === 0) return 'taken';
  } catch {
    /* unknown */
  }
  return 'unknown';
}

async function domainApi(url) {
  const raw = (url.searchParams.get('name') || '').toLowerCase().trim();
  const label = raw
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('.')[0]
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63);
  const headers = { 'content-type': 'application/json', 'cache-control': 'public, max-age=300', 'access-control-allow-origin': '*' };
  if (label.length < 2) return new Response(JSON.stringify({ error: 'invalid_name' }), { status: 400, headers });
  const results = await Promise.all(TLDS.map(async (t) => ({ domain: `${label}.${t}`, status: await checkOne(`${label}.${t}`, t) })));
  return new Response(JSON.stringify({ label, subdomain: `${label}.sylkit.com`, results }), { headers });
}

async function route(request, env, ctx) {
  const url = new URL(request.url);
  if (url.pathname === '/api/domain') return domainApi(url);
  if (url.pathname.startsWith('/api/pay/')) return handlePayments(request, env, url);
  if (url.pathname.startsWith('/api/stripe/')) return handleStripe(request, env, url);
  if (url.pathname.startsWith('/api/order/')) return handleOrders(request, env, url);
  if (url.pathname.startsWith('/api/paypal/')) return handlePaypal(request, env, url);
  if (url.pathname.startsWith('/api/monime/')) return handleMonime(request, env, url);
  if (url.pathname.startsWith('/api/support/')) return handleSupport(request, env, url, ctx);
  if (url.pathname.startsWith('/api/build/')) return handleBuild(request, env, url);
  if (url.pathname.startsWith('/api/photos/')) return handlePhotos(request, env, url, ctx);
  const sub = url.hostname.split('.')[0];
  const isSub = url.hostname.endsWith('.sylkit.com') && url.hostname.split('.').length === 3 && sub !== 'www';
  const demo = isSub ? DEMOS[sub] : undefined;

  // A customer's own domain pointed at sites.sylkit.com (Cloudflare for SaaS): their AI website.
  const ours = url.hostname === 'sylkit.com' || url.hostname.endsWith('.sylkit.com') || url.hostname.endsWith('.workers.dev') || url.hostname === 'localhost';
  if (!ours) {
    const res = await serveDomain(env, url.hostname).catch(() => null);
    if (res) return res;
  }

  // Websites made with the AI builder: <name>.sylkit.com, or sylkit.com/s/<name>.
  const sPath = url.pathname.match(/^\/s\/([a-z0-9-]{3,30})\/?$/);
  if ((isSub && !demo && url.pathname === '/') || sPath) {
    const res = await serveSite(env, sPath ? sPath[1] : sub).catch(() => null);
    if (res) return res;
  }

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
}

function withCountry(res, request) {
  const cc = request.cf && request.cf.country;
  const type = res.headers.get('content-type') || '';
  if (!cc || !/^[A-Z]{2}$/.test(cc) || !type.includes('text/html')) return res;
  const out = new Response(res.body, res);
  out.headers.append('Set-Cookie', `sk_cc=${cc}; Path=/; Max-Age=2592000; SameSite=Lax; Secure`);
  return out;
}

// Browser security headers on every response:
//  - HTTPS only (HSTS), no MIME sniffing, no full URLs leaked to other sites (order links carry tokens),
//  - pages can only be framed by Sylkit itself (blocks clickjacking of checkout/admin),
//  - no camera/mic/location access.
const SECURITY_HEADERS = {
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'content-security-policy': "frame-ancestors 'self' https://sylkit.com https://*.sylkit.com; base-uri 'self'; object-src 'none'",
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=(self)',
  'cross-origin-opener-policy': 'same-origin-allow-popups',
};
function secure(res) {
  const out = new Response(res.body, res);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) if (!out.headers.has(k)) out.headers.set(k, v);
  return out;
}

export default {
  async fetch(request, env, ctx) {
    return secure(withCountry(await route(request, env, ctx), request));
  },

  async scheduled(_event, env, ctx) {
    ctx.waitUntil(sweepPaypal(env).catch(() => {}));
    ctx.waitUntil(sweepMonime(env).catch(() => {}));
    ctx.waitUntil(
      fetch(`${SUPABASE_URL}/rest/v1/products?select=slug&limit=1`, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      }),
    );
  },
};
