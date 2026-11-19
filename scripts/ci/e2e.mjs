// End-to-end check of the customer journey on a deployed Sylkit (default: the sylkit-2 preview).
// Runs on GitHub Actions (needs internet + Playwright). Writes .ci/e2e/report.json and screenshots.
//   node scripts/ci/e2e.mjs [baseUrl]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.argv[2] || 'https://sylkit-2-sylkit.fannah2026.workers.dev';
const OUT = path.resolve('.ci/e2e');
fs.mkdirSync(OUT, { recursive: true });
const SB = 'https://chcljhwcvzlmxrrhetfv.supabase.co';
const KEY = 'sb_publishable_A0oOnUNRvW4ig6sXbM0CFw_1Tr2MwYy';
const report = { base: BASE, at: new Date().toISOString(), checks: [] };
const ok = (name, pass, detail = '') => { report.checks.push({ name, pass: !!pass, detail: String(detail).slice(0, 400) }); console.log(pass ? 'PASS' : 'FAIL', name, detail ? `- ${String(detail).slice(0, 200)}` : ''); };
const IGNORE = /favicon|fonts\.g|unsplash|Download the React DevTools|ResizeObserver|net::ERR_BLOCKED|google-analytics|cloudflareinsights|ERR_ABORTED/i;

const browser = await chromium.launch();
async function page(viewport = { width: 1280, height: 800 }) {
  const ctx = await browser.newContext({ viewport, locale: 'en-US', deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  p._errors = [];
  p.on('pageerror', (e) => p._errors.push('pageerror: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !IGNORE.test(m.text())) p._errors.push('console: ' + m.text()); });
  p.on('response', (r) => { if (r.status() >= 500 && !IGNORE.test(r.url())) p._errors.push(`${r.status()} ${r.url()}`); });
  return p;
}
const shot = (p, name) => p.screenshot({ path: path.join(OUT, `${name}.png`) }).catch(() => null);

// 1. Every public page loads without errors.
const demos = fs.readdirSync('public/demos').filter((d) => fs.existsSync(`public/demos/${d}/index.html`));
const previews = fs.readdirSync('public/preview').filter((d) => fs.existsSync(`public/preview/${d}/index.html`));
const pages = ['/', '/templates', '/work', '/account', '/order', '/quote', '/domains', '/security', '/terms', '/privacy', '/refunds', '/product/punto-de-venta', '/product/farmacia-pos', '/product/sitio-web-para-negocios',
  '/demo/hotel', '/demo/events', '/demo/realestate', ...demos.map((d) => `/demos/${d}/`), ...previews.map((d) => `/preview/${d}/`)];
{
  const p = await page();
  for (const u of pages) {
    p._errors = [];
    const r = await p.goto(BASE + u, { waitUntil: 'networkidle', timeout: 45000 }).catch((e) => ({ status: () => 0, err: e.message }));
    await p.waitForTimeout(600);
    const text = (await p.evaluate(() => document.body?.innerText || '').catch(() => '')).trim();
    const status = r.status ? r.status() : 0;
    ok(`page ${u}`, status === 200 && text.length > 40 && !p._errors.length, status !== 200 ? `HTTP ${status} ${r.err || ''}` : p._errors.join(' | ') || (text.length <= 40 ? 'empty page' : ''));
  }
  await p.context().close();
}

// 2. Gallery: cards, order, chips.
{
  const p = await page();
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  const txt = await p.evaluate(() => document.body.innerText);
  const m = txt.match(/(\d+)\s+results/i);
  ok('gallery shows results count', m && Number(m[1]) >= 50, m ? m[0] : 'no "results" text');
  const iHotel = txt.search(/Hotels? (&|and)/i), iRide = txt.indexOf('Ride-hailing'), iPos = txt.search(/Point of Sale/i);
  ok('gallery order: hotel, then ride app, before POS', iHotel >= 0 && iRide > iHotel && (iPos < 0 || iRide < iPos), `hotel@${iHotel} ride@${iRide} pos@${iPos}`);
  await shot(p, 'home-desktop');
  await p.context().close();
}

// 3. Phone: menu has sign in; account page shows the sign-in form; signing out is offered only when signed in.
{
  const p = await page({ width: 390, height: 844 });
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);
  await shot(p, 'phone-home');
  await p.mouse.wheel(0, 1400);
  await p.evaluate(() => document.querySelectorAll('div').forEach((d) => { if (d.scrollHeight > d.clientHeight + 200 && getComputedStyle(d).overflowY !== 'visible') d.scrollTop += 1400; }));
  await p.waitForTimeout(900);
  await shot(p, 'phone-home-scrolled');
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  await p.getByLabel('Open menu').first().click().catch(() => null);
  await p.waitForTimeout(600);
  const menu = await p.evaluate(() => document.body.innerText);
  ok('phone menu offers sign in', /Sign in · My orders/.test(menu));
  ok('phone menu has no sign out when signed out', !/Sign out/.test(menu));
  await shot(p, 'phone-menu');
  await p.goto(BASE + '/account', { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  const acct = await p.evaluate(() => document.body.innerText);
  ok('account page asks to sign in', /Sign in to see your orders/.test(acct), acct.slice(0, 200));
  ok('account page has email sign-in', (await p.locator('input').count()) >= 1);
  await shot(p, 'phone-account');
  await p.context().close();
}

// 3b. Guest checkout: the checkout form shows straight away, no sign-in wall.
{
  const p = await page({ width: 390, height: 844 });
  await p.goto(`${BASE}/checkout?product=punto-de-venta&lang=en`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  const txt = await p.evaluate(() => document.body.innerText);
  ok('checkout opens without signing in', /Your details/.test(txt) && !/Sign in to order/.test(txt), txt.slice(0, 200));
  await shot(p, 'checkout-guest');
  await p.context().close();
}

// 4. Order journey: request a quote, open the order page, cancel it, check it shows as cancelled.
{
  const rpc = await fetch(`${SB}/rest/v1/rpc/create_order`, {
    method: 'POST', headers: { apikey: KEY, authorization: `Bearer ${KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ p_customer_name: 'Sylkit automated test', p_email: 'test@sylkit.com', p_whatsapp: null, p_business_name: 'QA', p_country: 'VE', p_details: 'Automated end-to-end test of cancelling an order. Please ignore.', p_product_slug: null, p_lang: 'en', p_source: 'e2e-test', p_config: null }),
  }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => null) }));
  const token = rpc.body?.token;
  ok('create a quote request', rpc.status === 200 && token, JSON.stringify(rpc.body).slice(0, 200));
  if (token) {
    const p = await page({ width: 390, height: 844 });
    await p.goto(`${BASE}/order?t=${token}`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(1200);
    ok('order page shows the request', /We received your request/.test(await p.evaluate(() => document.body.innerText)));
    await shot(p, 'order-before');
    const btn = p.getByText('Cancel this order', { exact: true });
    ok('cancel button shown on unpaid order', (await btn.count()) === 1);
    await btn.click().catch(() => null);
    await p.getByText('Ordered by mistake', { exact: true }).click().catch(() => null);
    await shot(p, 'order-confirm-cancel');
    await p.getByText('Yes, cancel order', { exact: true }).click().catch(() => null);
    await p.getByText('This order was cancelled').first().waitFor({ timeout: 15000 }).catch(() => null);
    const after = await p.evaluate(() => document.body.innerText);
    ok('order shows as cancelled', /This order was cancelled/.test(after), after.slice(0, 300));
    ok('cancel button gone after cancelling', (await p.getByText('Cancel this order', { exact: true }).count()) === 0);
    await shot(p, 'order-after');
    const state = await fetch(`${SB}/rest/v1/rpc/get_order`, { method: 'POST', headers: { apikey: KEY, authorization: `Bearer ${KEY}`, 'content-type': 'application/json' }, body: JSON.stringify({ p_token: token }) }).then((r) => r.json()).catch(() => null);
    ok('database says cancelled', state?.status === 'cancelled', state?.status);
    const again = await fetch(`${BASE}/api/order/cancel`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token }) }).then((r) => r.json());
    ok('cancelling twice is harmless', again.ok === true);
    await p.context().close();
  }
  const badTok = await fetch(`${BASE}/api/order/cancel`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"token":"x"}' });
  ok('cancel rejects a bad link', badTok.status === 400);
}

await browser.close();
report.passed = report.checks.filter((c) => c.pass).length;
report.failed = report.checks.filter((c) => !c.pass).length;
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
console.log(`\n${report.passed} passed, ${report.failed} failed`);
