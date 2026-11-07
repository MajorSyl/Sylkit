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
// - /api/support/* help widget, AI assistant and the admin support inbox (see support.js, D1 database sylkit-support)
// - daily cron keeps the free Supabase database from pausing
import { handlePayments } from './payments.js';
import { handleStripe } from './stripe.js';
import { handleOrders } from './orders.js';
import { handlePaypal } from './paypal.js';
import { handleMonime } from './monime.js';
import { handleSupport } from './support.js';
import { runPriceJob } from './priceJob.js';

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
    return 'unknown';
  } catch {
    return 'unknown';
  }
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
    ctx.waitUntil(runPriceJob(env).catch(() => {}));
    return secure(withCountry(await route(request, env, ctx), request));
  },

  async scheduled(_event, env, ctx) {
    ctx.waitUntil(runPriceJob(env).catch(() => {}));
    ctx.waitUntil(
      fetch(`${SUPABASE_URL}/rest/v1/products?select=slug&limit=1`, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      }),
    );
  },
};
