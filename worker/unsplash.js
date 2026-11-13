// Unsplash photos for Sylkit (official API, server side only).
//
// The Access Key lives only in the worker secret UNSPLASH_ACCESS_KEY. It is never sent to browsers,
// logged or stored. Browsers call these endpoints instead:
//
//   GET  /api/photos/health                     -> { configured, ok, remaining }      (no secrets)
//   GET  /api/photos/search?q=&page=&orientation=&lang=  -> { results[], total, page }
//   POST /api/photos/use { id }                 -> { ok }   ("download" tracking when a photo is used)
//
// Unsplash rules we follow (https://unsplash.com/documentation, API guidelines):
//  - Hotlink: we only use the image URLs the API returns (with sizing params), never re-host.
//  - Attribution: every photo shows "Photo by <name> on Unsplash", linking the photographer's
//    profile and Unsplash, with utm_source=sylkit&utm_medium=referral.
//  - Downloads: when a photo is chosen for a site or the library, we call its download_location.
//  - Rate limits: results are cached for a day (Cache API), each visitor has a daily limit, and we
//    stop calling the API when Unsplash says the hourly quota is almost used up.

import { overLimit } from './support.js';

const API = 'https://api.unsplash.com';
const UTM = 'utm_source=sylkit&utm_medium=referral';
const CACHE_TTL = 86400;

const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...extra } });

let quota = { remaining: null, at: 0 };

async function unsplash(env, path) {
  const r = await fetch(`${API}${path}`, {
    headers: { authorization: `Client-ID ${env.UNSPLASH_ACCESS_KEY}`, 'accept-version': 'v1' },
  });
  const rem = Number(r.headers.get('x-ratelimit-remaining'));
  if (Number.isFinite(rem)) quota = { remaining: rem, at: Date.now() };
  return r;
}

const withUtm = (u) => (u ? `${u}${u.includes('?') ? '&' : '?'}${UTM}` : '');

// Only the fields Sylkit needs, with attribution links ready to use.
export function slimPhoto(p) {
  return {
    id: p.id,
    alt: p.alt_description || p.description || '',
    color: p.color || '#cccccc',
    blur: p.blur_hash || null,
    w: p.width,
    h: p.height,
    raw: p.urls?.raw || '',
    regular: p.urls?.regular || '',
    small: p.urls?.small || '',
    thumb: p.urls?.thumb || '',
    page: withUtm(p.links?.html),
    download: p.links?.download_location || '',
    by: p.user?.name || '',
    username: p.user?.username || '',
    profile: withUtm(p.user?.links?.html || (p.user?.username ? `https://unsplash.com/@${p.user.username}` : '')),
    likes: p.likes || 0,
  };
}

async function health(env) {
  if (!env.UNSPLASH_ACCESS_KEY) return json({ configured: false, ok: false });
  const r = await unsplash(env, '/photos?per_page=1').catch(() => null);
  return json({ configured: true, ok: !!r?.ok, status: r?.status ?? null, remaining: quota.remaining });
}

async function search(request, env, url, ctx) {
  if (!env.UNSPLASH_ACCESS_KEY) return json({ error: 'not_configured' }, 503);
  const q = String(url.searchParams.get('q') || '').trim().slice(0, 80);
  if (q.length < 2) return json({ error: 'bad_query' }, 400);
  const page = Math.max(1, Math.min(10, Number(url.searchParams.get('page')) || 1));
  const per = Math.max(1, Math.min(30, Number(url.searchParams.get('per')) || 24));
  const orientation = ['landscape', 'portrait', 'squarish'].includes(url.searchParams.get('orientation')) ? url.searchParams.get('orientation') : '';
  const lang = ['es', 'en', 'pt'].includes(url.searchParams.get('lang')) ? url.searchParams.get('lang') : 'en';

  // One cached answer per query for a day: the same search never spends quota twice.
  const key = new Request(`https://cache.sylkit.com/unsplash/search?q=${encodeURIComponent(q.toLowerCase())}&p=${page}&n=${per}&o=${orientation}&l=${lang}`);
  const cache = caches.default;
  const hit = await cache.match(key);
  if (hit) return new Response(hit.body, { headers: { 'content-type': 'application/json', 'x-cache': 'hit' } });

  if (await overLimit(env, request, 'photos').catch(() => false)) return json({ error: 'rate_limited' }, 429);
  if (quota.remaining !== null && quota.remaining < 5 && Date.now() - quota.at < 3600e3) return json({ error: 'busy' }, 503);

  const qs = new URLSearchParams({ query: q, page: String(page), per_page: String(per), content_filter: 'high', lang });
  if (orientation) qs.set('orientation', orientation);
  const r = await unsplash(env, `/search/photos?${qs}`).catch(() => null);
  if (!r) return json({ error: 'unavailable' }, 502);
  if (r.status === 403 || r.status === 429) return json({ error: 'busy' }, 503);
  if (!r.ok) return json({ error: 'unavailable', status: r.status }, 502);
  const data = await r.json();
  const body = JSON.stringify({ total: data.total || 0, page, results: (data.results || []).map(slimPhoto) });
  const res = new Response(body, { headers: { 'content-type': 'application/json', 'cache-control': `public, max-age=${CACHE_TTL}` } });
  ctx?.waitUntil(cache.put(key, res.clone()));
  return new Response(body, { headers: { 'content-type': 'application/json', 'x-cache': 'miss' } });
}

// Unsplash asks apps to call download_location when a photo is "used" (picked for a site, added to
// the library). Only that endpoint, for that photo id: callers can't make us fetch other URLs.
export async function trackUse(env, id) {
  if (!env.UNSPLASH_ACCESS_KEY || !/^[A-Za-z0-9_-]{6,20}$/.test(String(id || ''))) return false;
  const r = await unsplash(env, `/photos/${id}/download`).catch(() => null);
  return !!r?.ok;
}

// Download tracking for many photos at once (e.g. the photo library) is queued in D1 and sent a few
// at a time by the 15-minute cron, so it never eats the hourly quota that live searches need.
export async function drainUseQueue(env, max = 8) {
  if (!env.UNSPLASH_ACCESS_KEY || !env.SUPPORT_DB) return 0;
  const db = env.SUPPORT_DB;
  await db.prepare('CREATE TABLE IF NOT EXISTS unsplash_queue (id TEXT PRIMARY KEY, added TEXT, sent TEXT)').run();
  if (quota.remaining !== null && quota.remaining < 20 && Date.now() - quota.at < 3600e3) return 0;
  const rows = (await db.prepare('SELECT id FROM unsplash_queue WHERE sent IS NULL LIMIT ?').bind(max).all()).results || [];
  let n = 0;
  for (const { id } of rows) {
    if (await trackUse(env, id)) {
      await db.prepare("UPDATE unsplash_queue SET sent = datetime('now') WHERE id = ?").bind(id).run();
      n++;
    }
  }
  return n;
}

async function use(request, env) {
  const body = await request.json().catch(() => ({}));
  if (await overLimit(env, request, 'photos_use').catch(() => false)) return json({ error: 'rate_limited' }, 429);
  return json({ ok: await trackUse(env, body.id) });
}

export async function handlePhotos(request, env, url, ctx) {
  try {
    const p = url.pathname;
    if (p === '/api/photos/health' && request.method === 'GET') return await health(env);
    if (p === '/api/photos/search' && request.method === 'GET') return await search(request, env, url, ctx);
    if (p === '/api/photos/use' && request.method === 'POST') return await use(request, env);
    return json({ error: 'not_found' }, 404);
  } catch (e) {
    console.log('photos error', String(e?.message || e));
    return json({ error: 'server_error' }, 500);
  }
}
