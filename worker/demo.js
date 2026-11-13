// Sylkit 2.0 live demos: hotel booking engine, event ticketing with QR check-in, logistics tracking
// and construction project management.
//
// Isolation: everything lives in the separate D1 database DEMO_DB (sylkit-demo), never the production
// databases. Each visitor gets their own demo workspace ("ws"): a random 24-character key created by
// POST /api/demo/ws and kept in their browser. The workspace key is the owner/staff credential: only
// it can see the front desk, guest lists, check tickets in or update shipments. Public pages (a ticket,
// a tracking code, a client progress link) only see what that code allows, never other customers.
// All names, emails and numbers are synthetic sample data.
//
// Double bookings are prevented in the database itself: a booking is a single conditional INSERT that
// only writes when no active booking overlaps that room for those nights, so two people pressing
// "Book" at the same moment can't both get the last room. Ticket sales use the same pattern against
// each tier's capacity, and a ticket can be checked in exactly once (conditional UPDATE).

import { overLimit } from './support.js';
import { qrSvg } from './qr.js';

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const bad = (error, status = 400) => json({ error }, status);
const clean = (s, max = 80) => String(s ?? '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, max);
const isWs = (s) => /^[A-Za-z0-9]{24}$/.test(String(s || ''));
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || '')) && !isNaN(Date.parse(s));
const day = (offset = 0) => new Date(Date.now() + offset * 864e5).toISOString().slice(0, 10);
const nightsBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
const ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const code = (n = 8) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => ABC[b % ABC.length]).join('');
const key24 = () => Array.from(crypto.getRandomValues(new Uint8Array(24)), (b) => 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 56]).join('');

// ---------- catalog (static demo content) ----------

export const ROOMS = [
  { type: 'standard', price: 85, guests: 2, units: 3 },
  { type: 'deluxe', price: 120, guests: 2, units: 2 },
  { type: 'family', price: 160, guests: 4, units: 2 },
  { type: 'suite', price: 240, guests: 3, units: 1 },
];
const roomOf = (t) => ROOMS.find((r) => r.type === t);

export const EVENTS = [
  { id: 'jazz', date: 18, tiers: [{ id: 'general', price: 25, cap: 120 }, { id: 'vip', price: 60, cap: 12 }] },
  { id: 'summit', date: 32, tiers: [{ id: 'general', price: 40, cap: 200 }, { id: 'vip', price: 95, cap: 20 }] },
  { id: 'market', date: 9, tiers: [{ id: 'general', price: 8, cap: 300 }] },
];
const eventOf = (id) => EVENTS.find((e) => e.id === id);

const SHIP_STATUSES = ['received', 'in_transit', 'at_hub', 'out_for_delivery', 'delivered', 'issue'];

// ---------- schema ----------

let ready = null;
function schema(db) {
  ready ||= db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS ws (id TEXT PRIMARY KEY, created TEXT)'),
    db.prepare(`CREATE TABLE IF NOT EXISTS hotel_bookings (id INTEGER PRIMARY KEY AUTOINCREMENT, ws TEXT, room_type TEXT, unit INTEGER, guest TEXT, email TEXT,
      check_in TEXT, check_out TEXT, nights INTEGER, total REAL, code TEXT, status TEXT, created TEXT)`),
    db.prepare('CREATE INDEX IF NOT EXISTS hb_ws ON hotel_bookings (ws, room_type, unit, status)'),
    db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS hb_code ON hotel_bookings (code)'),
    db.prepare(`CREATE TABLE IF NOT EXISTS ev_tickets (id INTEGER PRIMARY KEY AUTOINCREMENT, ws TEXT, event_id TEXT, tier TEXT, code TEXT, name TEXT, email TEXT,
      order_code TEXT, checked_in TEXT, created TEXT)`),
    db.prepare('CREATE INDEX IF NOT EXISTS et_ws ON ev_tickets (ws, event_id, tier)'),
    db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS et_code ON ev_tickets (code)'),
    db.prepare(`CREATE TABLE IF NOT EXISTS lg_shipments (id INTEGER PRIMARY KEY AUTOINCREMENT, ws TEXT, code TEXT, sender TEXT, receiver TEXT, origin TEXT, dest TEXT,
      weight REAL, status TEXT, driver TEXT, eta TEXT, created TEXT)`),
    db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS ls_code ON lg_shipments (code)'),
    db.prepare('CREATE INDEX IF NOT EXISTS ls_ws ON lg_shipments (ws)'),
    db.prepare('CREATE TABLE IF NOT EXISTS lg_events (id INTEGER PRIMARY KEY AUTOINCREMENT, shipment INTEGER, status TEXT, place TEXT, note TEXT, at TEXT)'),
    db.prepare('CREATE INDEX IF NOT EXISTS le_s ON lg_events (shipment)'),
    db.prepare(`CREATE TABLE IF NOT EXISTS cx_projects (id INTEGER PRIMARY KEY AUTOINCREMENT, ws TEXT, share TEXT, name TEXT, client TEXT, site TEXT,
      budget REAL, start TEXT, due TEXT, created TEXT)`),
    db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS cp_share ON cx_projects (share)'),
    db.prepare('CREATE INDEX IF NOT EXISTS cp_ws ON cx_projects (ws)'),
    db.prepare('CREATE TABLE IF NOT EXISTS cx_tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, project INTEGER, name TEXT, phase TEXT, cost REAL, spent REAL, done INTEGER, due TEXT)'),
    db.prepare('CREATE INDEX IF NOT EXISTS ct_p ON cx_tasks (project)'),
    db.prepare('CREATE TABLE IF NOT EXISTS cx_reports (id INTEGER PRIMARY KEY AUTOINCREMENT, project INTEGER, note TEXT, weather TEXT, crew INTEGER, at TEXT)'),
    db.prepare('CREATE INDEX IF NOT EXISTS cr_p ON cx_reports (project)'),
  ]).catch((e) => {
    ready = null;
    throw e;
  });
  return ready;
}

// ---------- workspace + synthetic seed data ----------

const GUESTS = [
  ['Ana Torres', 'ana.torres@example.com'],
  ['James Carter', 'james.carter@example.com'],
  ['Mariana Lopes', 'mariana.lopes@example.com'],
  ['Kofi Mensah', 'kofi.mensah@example.com'],
  ['Lucía Ramírez', 'lucia.ramirez@example.com'],
  ['Emma Wilson', 'emma.wilson@example.com'],
  ['Pedro Alves', 'pedro.alves@example.com'],
  ['Fatmata Kamara', 'fatmata.kamara@example.com'],
];

async function seed(db, ws) {
  const now = new Date().toISOString();
  const s = [];
  // Hotel: a realistic week at the front desk.
  const hb = [
    ['deluxe', 1, 0, -1, 3],
    ['standard', 1, 1, 0, 2],
    ['standard', 2, 2, 1, 4],
    ['family', 1, 3, 2, 6],
    ['suite', 1, 4, 3, 5],
    ['deluxe', 2, 5, 5, 8],
    ['standard', 3, 6, 6, 9],
    ['deluxe', 1, 7, 4, 7],
  ];
  for (const [type, unit, g, a, b] of hb) {
    const r = roomOf(type);
    s.push(
      db.prepare(`INSERT INTO hotel_bookings (ws, room_type, unit, guest, email, check_in, check_out, nights, total, code, status, created) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
        .bind(ws, type, unit, GUESTS[g][0], GUESTS[g][1], day(a), day(b), b - a, (b - a) * r.price, 'H' + code(7), a <= 0 ? 'checked_in' : 'confirmed', now),
    );
  }
  // Events: tickets already sold, a few checked in at the market.
  const sold = [['jazz', 'general', 34], ['jazz', 'vip', 9], ['summit', 'general', 61], ['summit', 'vip', 7], ['market', 'general', 88]];
  for (const [ev, tier, n] of sold) {
    for (let i = 0; i < n; i++) {
      const g = GUESTS[i % GUESTS.length];
      s.push(
        db.prepare('INSERT INTO ev_tickets (ws, event_id, tier, code, name, email, order_code, checked_in, created) VALUES (?,?,?,?,?,?,?,?,?)')
          .bind(ws, ev, tier, 'T' + code(9), g[0], g[1], 'O' + code(6), ev === 'market' && i < 23 ? now : null, now),
      );
    }
  }
  await db.batch(s);

  // Logistics: shipments in every state, each with its timeline.
  const ships = [
    ['Andes Coffee Co.', 'Ana Torres', 'Caracas', 'Valencia', 12, 'out_for_delivery', 'Luis Pérez', 0],
    ['Freetown Textiles', 'Kofi Mensah', 'Freetown', 'Bo', 40, 'in_transit', 'Mohamed Sesay', 1],
    ['São Paulo Parts', 'Pedro Alves', 'São Paulo', 'Campinas', 230, 'delivered', 'Rafael Costa', -1],
    ['Green Market', 'Lucía Ramírez', 'Maracaibo', 'Caracas', 75, 'at_hub', 'Carlos Díaz', 2],
    ['Lumen Electronics', 'Emma Wilson', 'Miami', 'Orlando', 18, 'received', '', 3],
    ['Casa Bella', 'Mariana Lopes', 'Rio de Janeiro', 'Niterói', 9, 'issue', 'Bruno Lima', 1],
  ];
  const path = { received: ['received'], in_transit: ['received', 'in_transit'], at_hub: ['received', 'in_transit', 'at_hub'], out_for_delivery: ['received', 'in_transit', 'at_hub', 'out_for_delivery'], delivered: ['received', 'in_transit', 'at_hub', 'out_for_delivery', 'delivered'], issue: ['received', 'in_transit', 'issue'] };
  for (const [sender, receiver, o, d, w, st, driver, eta] of ships) {
    const c = 'SK' + code(8);
    const row = await db.prepare('INSERT INTO lg_shipments (ws, code, sender, receiver, origin, dest, weight, status, driver, eta, created) VALUES (?,?,?,?,?,?,?,?,?,?,?) RETURNING id')
      .bind(ws, c, sender, receiver, o, d, w, st, driver, day(eta), now).first();
    const steps = path[st];
    await db.batch(
      steps.map((x, i) =>
        db.prepare('INSERT INTO lg_events (shipment, status, place, note, at) VALUES (?,?,?,?,?)')
          .bind(row.id, x, i === 0 ? o : x === 'delivered' || x === 'out_for_delivery' ? d : x === 'at_hub' ? `${d} hub` : `${o} → ${d}`, x === 'issue' ? 'Address incomplete, calling receiver' : '', new Date(Date.now() - (steps.length - i) * 7 * 36e5).toISOString()),
      ),
    );
  }

  // Construction: two projects with phases, budget and site reports.
  const projects = [
    ['Residencial Las Palmas · 12 apartments', 'Grupo Horizonte', 'Valencia', 480000, -60, 120, [
      ['Site preparation', 'foundation', 28000, 27400, 1, -45], ['Foundations', 'foundation', 64000, 66100, 1, -20], ['Structure, floors 1–3', 'structure', 120000, 71000, 0, 15],
      ['Structure, floors 4–6', 'structure', 110000, 0, 0, 45], ['Electrical and plumbing', 'installations', 72000, 8000, 0, 70], ['Finishes and painting', 'finishes', 86000, 0, 0, 110],
    ]],
    ['Clínica San Rafael · extension', 'Fundación San Rafael', 'Caracas', 150000, -20, 90, [
      ['Demolition', 'foundation', 9000, 8600, 1, -10], ['Foundations', 'foundation', 26000, 12000, 0, 10], ['Steel structure', 'structure', 48000, 0, 0, 35],
      ['Installations', 'installations', 37000, 0, 0, 60], ['Finishes', 'finishes', 30000, 0, 0, 85],
    ]],
  ];
  for (const [name, client, site, budget, start, due, tasks] of projects) {
    const p = await db.prepare('INSERT INTO cx_projects (ws, share, name, client, site, budget, start, due, created) VALUES (?,?,?,?,?,?,?,?,?) RETURNING id')
      .bind(ws, 'P' + code(10), name, client, site, budget, day(start), day(due), now).first();
    await db.batch([
      ...tasks.map(([n, ph, cost, spent, done, d]) => db.prepare('INSERT INTO cx_tasks (project, name, phase, cost, spent, done, due) VALUES (?,?,?,?,?,?,?)').bind(p.id, n, ph, cost, spent, done, day(d))),
      db.prepare('INSERT INTO cx_reports (project, note, weather, crew, at) VALUES (?,?,?,?,?)').bind(p.id, 'Concrete poured on level 2 slab. Inspection passed.', 'sunny', 18, new Date(Date.now() - 2 * 864e5).toISOString()),
      db.prepare('INSERT INTO cx_reports (project, note, weather, crew, at) VALUES (?,?,?,?,?)').bind(p.id, 'Steel delivery received and checked against the order.', 'cloudy', 14, new Date(Date.now() - 864e5).toISOString()),
    ]);
  }
}

async function createWs(request, env) {
  if (await overLimit(env, request, 'demo_ws').catch(() => false)) return bad('rate_limited', 429);
  const db = env.DEMO_DB;
  const ws = key24();
  await db.prepare('INSERT INTO ws (id, created) VALUES (?, ?)').bind(ws, new Date().toISOString()).run();
  await seed(db, ws);
  return json({ ws });
}

async function wsOk(db, ws) {
  if (!isWs(ws)) return false;
  return !!(await db.prepare('SELECT 1 FROM ws WHERE id = ?').bind(ws).first());
}

// ---------- hotel ----------

async function availability(db, ws, a, b) {
  const rows = (await db.prepare(
    `SELECT room_type, unit FROM hotel_bookings WHERE ws = ? AND status != 'cancelled' AND check_in < ? AND check_out > ?`,
  ).bind(ws, b, a).all()).results || [];
  return ROOMS.map((r) => {
    const busy = new Set(rows.filter((x) => x.room_type === r.type).map((x) => x.unit));
    return { type: r.type, price: r.price, guests: r.guests, units: r.units, free: r.units - busy.size };
  });
}

function checkDates(a, b) {
  if (!isDate(a) || !isDate(b)) return 'bad_dates';
  const n = nightsBetween(a, b);
  if (n < 1) return 'bad_dates';
  if (n > 30) return 'too_long';
  if (a < day(-1)) return 'past_dates';
  if (a > day(365)) return 'too_far';
  return null;
}

async function hotel(request, env, url, parts) {
  const db = env.DEMO_DB;
  const action = parts[0];
  const ws = url.searchParams.get('ws') || request.headers.get('x-demo-ws') || '';
  if (!(await wsOk(db, ws))) return bad('no_workspace', 401);

  if (action === 'availability' && request.method === 'GET') {
    const a = url.searchParams.get('in');
    const b = url.searchParams.get('out');
    const err = checkDates(a, b);
    if (err) return bad(err);
    return json({ nights: nightsBetween(a, b), rooms: await availability(db, ws, a, b) });
  }

  if (action === 'book' && request.method === 'POST') {
    if (await overLimit(env, request, 'demo').catch(() => false)) return bad('rate_limited', 429);
    const body = await request.json().catch(() => ({}));
    const r = roomOf(body.type);
    if (!r) return bad('bad_room');
    const err = checkDates(body.in, body.out);
    if (err) return bad(err);
    const guest = clean(body.guest, 60);
    const email = clean(body.email, 80).toLowerCase();
    if (guest.length < 2) return bad('bad_name');
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email)) return bad('bad_email');
    const n = nightsBetween(body.in, body.out);
    const c = 'H' + code(7);
    // Try each physical room of that type; the INSERT only happens if that room is free for every night.
    for (let unit = 1; unit <= r.units; unit++) {
      const res = await db.prepare(
        `INSERT INTO hotel_bookings (ws, room_type, unit, guest, email, check_in, check_out, nights, total, code, status, created)
         SELECT ?,?,?,?,?,?,?,?,?,?, 'confirmed', ?
         WHERE NOT EXISTS (SELECT 1 FROM hotel_bookings WHERE ws = ? AND room_type = ? AND unit = ? AND status != 'cancelled' AND check_in < ? AND check_out > ?)`,
      ).bind(ws, r.type, unit, guest, email, body.in, body.out, n, n * r.price, c, new Date().toISOString(), ws, r.type, unit, body.out, body.in).run();
      if (res.meta.changes === 1) return json({ ok: true, code: c, unit, nights: n, total: n * r.price });
    }
    return bad('sold_out', 409);
  }

  if (action === 'bookings' && request.method === 'GET') {
    const from = isDate(url.searchParams.get('from')) ? url.searchParams.get('from') : day(-3);
    const to = isDate(url.searchParams.get('to')) ? url.searchParams.get('to') : day(14);
    const rows = (await db.prepare(
      `SELECT room_type, unit, guest, email, check_in, check_out, nights, total, code, status FROM hotel_bookings
       WHERE ws = ? AND check_in < ? AND check_out > ? ORDER BY check_in, room_type, unit LIMIT 300`,
    ).bind(ws, to, from).all()).results;
    const today = day(0);
    const occ = await availability(db, ws, today, day(1));
    const total = ROOMS.reduce((s, r) => s + r.units, 0);
    const free = occ.reduce((s, r) => s + r.free, 0);
    return json({ rooms: ROOMS, bookings: rows, today, occupancy: Math.round(((total - free) / total) * 100), arrivals: rows.filter((b) => b.check_in === today && b.status !== 'cancelled').length, departures: rows.filter((b) => b.check_out === today && b.status !== 'cancelled').length });
  }

  if (action === 'status' && request.method === 'POST') {
    const body = await request.json().catch(() => ({}));
    if (!['confirmed', 'checked_in', 'checked_out', 'cancelled'].includes(body.status)) return bad('bad_status');
    const res = await db.prepare('UPDATE hotel_bookings SET status = ? WHERE ws = ? AND code = ?').bind(body.status, ws, clean(body.code, 12)).run();
    return res.meta.changes ? json({ ok: true }) : bad('not_found', 404);
  }
  return bad('not_found', 404);
}

// ---------- events and tickets ----------

async function sold(db, ws, ev) {
  const rows = (await db.prepare('SELECT tier, COUNT(*) n, SUM(checked_in IS NOT NULL) inside FROM ev_tickets WHERE ws = ? AND event_id = ? GROUP BY tier').bind(ws, ev).all()).results || [];
  return Object.fromEntries(rows.map((r) => [r.tier, { sold: r.n, inside: r.inside || 0 }]));
}

async function events(request, env, url, parts) {
  const db = env.DEMO_DB;
  const action = parts[0];

  // Public: a ticket (by its own code) and its QR image. No workspace key, no other tickets.
  if (action === 'ticket' && request.method === 'GET') {
    const c = clean(parts[1], 12);
    if (!/^T[A-Z0-9]{9}$/.test(c)) return bad('not_found', 404);
    const t = await db.prepare('SELECT event_id, tier, code, name, checked_in FROM ev_tickets WHERE code = ?').bind(c).first();
    if (!t) return bad('not_found', 404);
    if (parts[2] === 'qr.svg') {
      return new Response(qrSvg(`SYLKIT-TICKET:${t.code}`, { scale: 8, margin: 4 }), { headers: { 'content-type': 'image/svg+xml', 'cache-control': 'public, max-age=86400' } });
    }
    const e = eventOf(t.event_id);
    return json({ ticket: { ...t, date: day(e.date) } });
  }

  const ws = url.searchParams.get('ws') || request.headers.get('x-demo-ws') || '';
  if (!(await wsOk(db, ws))) return bad('no_workspace', 401);

  if (action === 'list' && request.method === 'GET') {
    const out = [];
    for (const e of EVENTS) {
      const s = await sold(db, ws, e.id);
      out.push({ id: e.id, date: day(e.date), tiers: e.tiers.map((t) => ({ ...t, sold: s[t.id]?.sold || 0, inside: s[t.id]?.inside || 0, left: t.cap - (s[t.id]?.sold || 0) })) });
    }
    return json({ events: out });
  }

  if (action === 'buy' && request.method === 'POST') {
    if (await overLimit(env, request, 'demo').catch(() => false)) return bad('rate_limited', 429);
    const body = await request.json().catch(() => ({}));
    const e = eventOf(body.event);
    const tier = e?.tiers.find((t) => t.id === body.tier);
    if (!e || !tier) return bad('bad_event');
    const qty = Math.floor(Number(body.qty));
    if (!(qty >= 1 && qty <= 6)) return bad('bad_qty');
    const name = clean(body.name, 60);
    const email = clean(body.email, 80).toLowerCase();
    if (name.length < 2) return bad('bad_name');
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email)) return bad('bad_email');
    const order = 'O' + code(6);
    const codes = [];
    for (let i = 0; i < qty; i++) {
      const c = 'T' + code(9);
      // Each ticket only inserts while the tier still has room: capacity can never be oversold.
      const res = await db.prepare(
        `INSERT INTO ev_tickets (ws, event_id, tier, code, name, email, order_code, created)
         SELECT ?,?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM ev_tickets WHERE ws = ? AND event_id = ? AND tier = ?) < ?`,
      ).bind(ws, e.id, tier.id, c, name, email, order, new Date().toISOString(), ws, e.id, tier.id, tier.cap).run();
      if (res.meta.changes !== 1) break;
      codes.push(c);
    }
    if (!codes.length) return bad('sold_out', 409);
    return json({ ok: true, order, codes, total: codes.length * tier.price, partial: codes.length < qty });
  }

  if (action === 'checkin' && request.method === 'POST') {
    if (await overLimit(env, request, 'demo').catch(() => false)) return bad('rate_limited', 429);
    const body = await request.json().catch(() => ({}));
    const raw = clean(body.code, 40).toUpperCase().replace(/^SYLKIT-TICKET:/, '');
    const t = await db.prepare('SELECT id, event_id, tier, name, checked_in FROM ev_tickets WHERE ws = ? AND code = ?').bind(ws, raw).first();
    if (!t) return json({ result: 'invalid' });
    if (body.event && t.event_id !== body.event) return json({ result: 'wrong_event', ticket: { event_id: t.event_id, tier: t.tier, name: t.name } });
    const res = await db.prepare('UPDATE ev_tickets SET checked_in = ? WHERE id = ? AND checked_in IS NULL').bind(new Date().toISOString(), t.id).run();
    if (res.meta.changes !== 1) return json({ result: 'already', ticket: { tier: t.tier, name: t.name, checked_in: t.checked_in } });
    return json({ result: 'ok', ticket: { tier: t.tier, name: t.name } });
  }

  if (action === 'attendees' && request.method === 'GET') {
    const ev = eventOf(url.searchParams.get('event'));
    if (!ev) return bad('bad_event');
    const rows = (await db.prepare('SELECT tier, code, name, email, checked_in FROM ev_tickets WHERE ws = ? AND event_id = ? ORDER BY id DESC LIMIT 200').bind(ws, ev.id).all()).results;
    return json({ attendees: rows });
  }
  return bad('not_found', 404);
}

// ---------- logistics ----------

async function shipmentWithEvents(db, s) {
  const ev = (await db.prepare('SELECT status, place, note, at FROM lg_events WHERE shipment = ? ORDER BY at, id').bind(s.id).all()).results;
  return { ...s, events: ev };
}

async function logistics(request, env, url, parts) {
  const db = env.DEMO_DB;
  const action = parts[0];

  // Public tracking: only the shipment with that code, without contact details.
  if (action === 'track' && request.method === 'GET') {
    const c = clean(parts[1], 12).toUpperCase();
    if (!/^SK[A-Z0-9]{8}$/.test(c)) return bad('not_found', 404);
    const s = await db.prepare('SELECT id, code, origin, dest, status, eta, weight FROM lg_shipments WHERE code = ?').bind(c).first();
    if (!s) return bad('not_found', 404);
    const out = await shipmentWithEvents(db, s);
    delete out.id;
    return json({ shipment: out });
  }

  const ws = url.searchParams.get('ws') || request.headers.get('x-demo-ws') || '';
  if (!(await wsOk(db, ws))) return bad('no_workspace', 401);

  if (action === 'list' && request.method === 'GET') {
    const rows = (await db.prepare('SELECT id, code, sender, receiver, origin, dest, weight, status, driver, eta, created FROM lg_shipments WHERE ws = ? ORDER BY id DESC LIMIT 100').bind(ws).all()).results;
    const out = [];
    for (const s of rows) out.push(await shipmentWithEvents(db, s));
    return json({ shipments: out.map(({ id, ...s }) => s), statuses: SHIP_STATUSES });
  }

  if (action === 'create' && request.method === 'POST') {
    if (await overLimit(env, request, 'demo').catch(() => false)) return bad('rate_limited', 429);
    const b = await request.json().catch(() => ({}));
    const f = { sender: clean(b.sender, 60), receiver: clean(b.receiver, 60), origin: clean(b.origin, 40), dest: clean(b.dest, 40), driver: clean(b.driver, 40) };
    const weight = Number(b.weight);
    if (Object.entries(f).some(([k, v]) => k !== 'driver' && v.length < 2)) return bad('missing_fields');
    if (!(weight > 0 && weight <= 30000)) return bad('bad_weight');
    const c = 'SK' + code(8);
    const s = await db.prepare('INSERT INTO lg_shipments (ws, code, sender, receiver, origin, dest, weight, status, driver, eta, created) VALUES (?,?,?,?,?,?,?,?,?,?,?) RETURNING id')
      .bind(ws, c, f.sender, f.receiver, f.origin, f.dest, weight, 'received', f.driver, day(3), new Date().toISOString()).first();
    await db.prepare('INSERT INTO lg_events (shipment, status, place, note, at) VALUES (?,?,?,?,?)').bind(s.id, 'received', f.origin, '', new Date().toISOString()).run();
    return json({ ok: true, code: c });
  }

  if (action === 'update' && request.method === 'POST') {
    if (await overLimit(env, request, 'demo').catch(() => false)) return bad('rate_limited', 429);
    const b = await request.json().catch(() => ({}));
    if (!SHIP_STATUSES.includes(b.status)) return bad('bad_status');
    const s = await db.prepare('SELECT id, status FROM lg_shipments WHERE ws = ? AND code = ?').bind(ws, clean(b.code, 12)).first();
    if (!s) return bad('not_found', 404);
    if (s.status === 'delivered') return bad('already_delivered', 409);
    await db.batch([
      db.prepare('UPDATE lg_shipments SET status = ?, driver = COALESCE(NULLIF(?, \'\'), driver) WHERE id = ?').bind(b.status, clean(b.driver, 40), s.id),
      db.prepare('INSERT INTO lg_events (shipment, status, place, note, at) VALUES (?,?,?,?,?)').bind(s.id, b.status, clean(b.place, 60), clean(b.note, 140), new Date().toISOString()),
    ]);
    return json({ ok: true });
  }
  return bad('not_found', 404);
}

// ---------- construction ----------

async function projectFull(db, p, pub) {
  const tasks = (await db.prepare('SELECT id, name, phase, cost, spent, done, due FROM cx_tasks WHERE project = ? ORDER BY id').bind(p.id).all()).results;
  const reports = (await db.prepare('SELECT note, weather, crew, at FROM cx_reports WHERE project = ? ORDER BY at DESC LIMIT 30').bind(p.id).all()).results;
  const planned = tasks.reduce((s, t) => s + t.cost, 0);
  const spent = tasks.reduce((s, t) => s + t.spent, 0);
  const progress = planned ? Math.round((tasks.filter((t) => t.done).reduce((s, t) => s + t.cost, 0) / planned) * 100) : 0;
  const out = { ...p, tasks, reports, planned, spent, progress };
  if (pub) {
    // Client view: progress and reports, not internal costs per task.
    delete out.ws;
    out.tasks = tasks.map(({ name, phase, done, due }) => ({ name, phase, done, due }));
    delete out.spent;
  }
  delete out.ws;
  return out;
}

async function construction(request, env, url, parts) {
  const db = env.DEMO_DB;
  const action = parts[0];

  if (action === 'share' && request.method === 'GET') {
    const c = clean(parts[1], 12);
    if (!/^P[A-Z0-9]{10}$/.test(c)) return bad('not_found', 404);
    const p = await db.prepare('SELECT id, share, name, client, site, budget, start, due FROM cx_projects WHERE share = ?').bind(c).first();
    if (!p) return bad('not_found', 404);
    const out = await projectFull(db, p, true);
    delete out.id;
    delete out.budget;
    return json({ project: out });
  }

  const ws = url.searchParams.get('ws') || request.headers.get('x-demo-ws') || '';
  if (!(await wsOk(db, ws))) return bad('no_workspace', 401);

  if (action === 'list' && request.method === 'GET') {
    const rows = (await db.prepare('SELECT id, share, name, client, site, budget, start, due FROM cx_projects WHERE ws = ? ORDER BY id').bind(ws).all()).results;
    const out = [];
    for (const p of rows) out.push(await projectFull(db, p, false));
    return json({ projects: out });
  }

  const owns = async (id) => !!(await db.prepare('SELECT 1 FROM cx_projects WHERE id = ? AND ws = ?').bind(Number(id), ws).first());

  if (action === 'task' && request.method === 'POST') {
    if (await overLimit(env, request, 'demo').catch(() => false)) return bad('rate_limited', 429);
    const b = await request.json().catch(() => ({}));
    const t = await db.prepare('SELECT t.id FROM cx_tasks t JOIN cx_projects p ON p.id = t.project WHERE t.id = ? AND p.ws = ?').bind(Number(b.id), ws).first();
    if (!t) return bad('not_found', 404);
    const spent = Number(b.spent);
    const okSpent = b.spent !== undefined && b.spent !== '' && Number.isFinite(spent) && spent >= 0 && spent <= 1e7;
    await db.prepare('UPDATE cx_tasks SET done = ?, spent = COALESCE(?, spent) WHERE id = ?').bind(b.done ? 1 : 0, okSpent ? spent : null, t.id).run();
    return json({ ok: true });
  }

  if (action === 'report' && request.method === 'POST') {
    if (await overLimit(env, request, 'demo').catch(() => false)) return bad('rate_limited', 429);
    const b = await request.json().catch(() => ({}));
    if (!(await owns(b.project))) return bad('not_found', 404);
    const note = clean(b.note, 400);
    if (note.length < 3) return bad('bad_note');
    const crew = Math.max(0, Math.min(500, Math.floor(Number(b.crew) || 0)));
    const weather = ['sunny', 'cloudy', 'rain', 'storm'].includes(b.weather) ? b.weather : 'sunny';
    await db.prepare('INSERT INTO cx_reports (project, note, weather, crew, at) VALUES (?,?,?,?,?)').bind(Number(b.project), note, weather, crew, new Date().toISOString()).run();
    return json({ ok: true });
  }
  return bad('not_found', 404);
}

// ---------- router + cleanup ----------

export async function handleDemo(request, env, url) {
  try {
    if (!env.DEMO_DB) return bad('demo_unavailable', 503);
    await schema(env.DEMO_DB);
    const parts = url.pathname.replace(/^\/api\/demo\/?/, '').split('/').filter(Boolean);
    const area = parts.shift();
    if (area === 'ws' && request.method === 'POST') return await createWs(request, env);
    if (area === 'hotel') return await hotel(request, env, url, parts);
    if (area === 'events') return await events(request, env, url, parts);
    if (area === 'logistics') return await logistics(request, env, url, parts);
    if (area === 'construction') return await construction(request, env, url, parts);
    return bad('not_found', 404);
  } catch (e) {
    console.log('demo error', String(e?.message || e));
    return bad('server_error', 500);
  }
}

// Demo workspaces expire after 7 days (only demo data in DEMO_DB; nothing else is touched).
export async function sweepDemos(env) {
  if (!env.DEMO_DB) return;
  const db = env.DEMO_DB;
  await schema(db);
  const cut = new Date(Date.now() - 7 * 864e5).toISOString();
  const old = (await db.prepare('SELECT id FROM ws WHERE created < ? LIMIT 20').bind(cut).all()).results || [];
  for (const { id } of old) {
    await db.batch([
      db.prepare('DELETE FROM hotel_bookings WHERE ws = ?').bind(id),
      db.prepare('DELETE FROM ev_tickets WHERE ws = ?').bind(id),
      db.prepare('DELETE FROM lg_events WHERE shipment IN (SELECT id FROM lg_shipments WHERE ws = ?)').bind(id),
      db.prepare('DELETE FROM lg_shipments WHERE ws = ?').bind(id),
      db.prepare('DELETE FROM cx_tasks WHERE project IN (SELECT id FROM cx_projects WHERE ws = ?)').bind(id),
      db.prepare('DELETE FROM cx_reports WHERE project IN (SELECT id FROM cx_projects WHERE ws = ?)').bind(id),
      db.prepare('DELETE FROM cx_projects WHERE ws = ?').bind(id),
      db.prepare('DELETE FROM ws WHERE id = ?').bind(id),
    ]);
  }
}
