import { createHmac } from 'node:crypto';
import assert from 'node:assert/strict';
import { verifyIpn, sortDeep, hmacSha512Hex } from '../payments.js';
import worker from '../index.js';

const SECRET = 'test_ipn_secret_123';
const nodeSig = (obj) => createHmac('sha512', SECRET).update(JSON.stringify(sortDeep(obj))).digest('hex');
let pass = 0; const ok = (m) => { pass++; console.log('  ✓', m); };

// 1. Web Crypto HMAC matches Node's crypto
assert.equal(await hmacSha512Hex(SECRET, 'hello'), createHmac('sha512', SECRET).update('hello').digest('hex')); ok('HMAC-SHA512 (Web Crypto) matches Node crypto');

// 2. signature over a NOWPayments-shaped payload, keys deliberately unsorted
const payload = { payment_status: 'finished', payment_id: 5524759814, order_id: 'SK-1003', price_amount: 450, price_currency: 'usd', pay_amount: 450.12, actually_paid: 450.12, pay_currency: 'usdttrc20', fee: { depositFee: 0.1, currency: 'usdttrc20', withdrawalFee: 0 } };
const raw = JSON.stringify(payload);
assert.equal((await verifyIpn(raw, nodeSig(payload), SECRET)).ok, true); ok('valid signature accepted (nested keys sorted)');
assert.equal((await verifyIpn(raw, nodeSig(payload).toUpperCase(), SECRET)).ok, true); ok('uppercase hex signature accepted');
assert.equal((await verifyIpn(raw, nodeSig({ ...payload, price_amount: 1 }), SECRET)).reason, 'bad_signature'); ok('tampered body rejected');
assert.equal((await verifyIpn(raw, null, SECRET)).reason, 'missing_signature'); ok('missing header rejected');
assert.equal((await verifyIpn(raw, nodeSig(payload), undefined)).reason, 'missing_secret'); ok('missing secret reported');

// 3. full worker flow with mocked NOWPayments + Supabase
const order = { id: 'o1', order_number: 'SK-1003', status: 'accepted', quote_amount: 450, quote_currency: 'USD', payment_method: null, payment_reference: null, lang: 'en' };
let npStatus = 'waiting'; let created = 0; let events = 0;
const calls = [];
globalThis.fetch = async (url, init = {}) => {
  url = String(url); calls.push({ url, init });
  const H = init.headers || {};
  if (url.endsWith('/v1/status')) return new Response(JSON.stringify({ message: 'OK' }));
  if (url.endsWith('/v1/currencies')) return H['x-api-key'] === 'np_key' ? new Response(JSON.stringify({ currencies: ['btc', 'usdttrc20'] })) : new Response(JSON.stringify({ message: 'Invalid api key' }), { status: 403 });
  if (url.includes('/v1/payment/')) { assert.equal(H['x-api-key'], 'np_key'); return new Response(JSON.stringify({ payment_id: 5524759814, order_id: 'SK-1003', payment_status: npStatus, pay_address: 'TXYZ', pay_amount: 450.12, actually_paid: npStatus === 'finished' ? 450.12 : 0, pay_currency: 'usdttrc20', price_amount: 450, price_currency: 'usd' })); }
  if (url.endsWith('/v1/payment')) {
    created++; assert.equal(H['x-api-key'], 'np_key'); const b = JSON.parse(init.body);
    assert.equal(b.price_amount, 450); assert.equal(b.order_id, 'SK-1003'); assert.equal(b.ipn_callback_url, 'https://sylkit.com/api/pay/ipn');
    return new Response(JSON.stringify({ payment_id: 5524759814, payment_status: 'waiting', pay_address: 'TXYZ', pay_amount: 450.12, pay_currency: 'usdttrc20', price_amount: 450, price_currency: 'usd', network: 'trx' }), { status: 201 });
  }
  if (url.includes('/rest/v1/orders?token=') || url.includes('/rest/v1/orders?order_number=')) { assert.equal(H.apikey, 'sb_secret_x'); return new Response(JSON.stringify([order])); }
  if (url.includes('/rest/v1/orders?id=') && init.method === 'PATCH') { Object.assign(order, JSON.parse(init.body)); return new Response(null, { status: 204 }); }
  if (url.includes('/rest/v1/order_events')) { events++; return new Response(null, { status: 201 }); }
  if (false) return new Response('', { status: 201 });
  throw new Error('unexpected fetch ' + url);
};
const env = { NOWPAYMENTS_API_KEY: 'np_key', NOWPAYMENTS_IPN_SECRET: SECRET, SUPABASE_SERVICE_ROLE_KEY: 'sb_secret_x', ASSETS: { fetch: () => new Response('asset') } };
const req = (path, init) => new Request('https://sylkit.com' + path, init);

let r = await worker.fetch(req('/api/pay/health'), {});
let j = await r.json(); assert.equal(j.ready, false); assert.equal(j.configured.NOWPAYMENTS_API_KEY, false); ok('health: reports missing secrets when unbound (today\'s live situation)');
r = await worker.fetch(req('/api/pay/health'), env); j = await r.json(); assert.equal(j.ready, true); assert.equal(j.api_key_check.ok, true); ok('health: ready when all secrets bound and key accepted');
r = await worker.fetch(req('/api/pay/health'), { ...env, NOWPAYMENTS_API_KEY: 'wrong' }); j = await r.json(); assert.equal(j.api_key_check.http, 403); assert.equal(j.ready, false); ok('health: detects a rejected API key');
assert.ok(!JSON.stringify(j).includes('wrong') && !JSON.stringify(j).includes(SECRET)); ok('health never echoes secret values');

r = await worker.fetch(req('/api/pay/create', { method: 'POST', body: JSON.stringify({ token: '00000000-0000-0000-0000-000000000000' }) }), { ...env, NOWPAYMENTS_API_KEY: undefined }); assert.equal(r.status, 503); ok('create: 503 when API key missing');
r = await worker.fetch(req('/api/pay/create', { method: 'POST', body: JSON.stringify({ token: 'nope' }) }), env); assert.equal(r.status, 400); ok('create: rejects bad token');
r = await worker.fetch(req('/api/pay/create', { method: 'POST', body: JSON.stringify({ token: '00000000-0000-0000-0000-000000000000', currency: 'usdttrc20' }) }), env);
j = await r.json(); assert.equal(r.status, 200, JSON.stringify(j)); assert.equal(j.pay_address, 'TXYZ'); assert.equal(order.payment_reference, '5524759814'); ok('create: calls /v1/payment with x-api-key, price from DB, saves payment id');

r = await worker.fetch(req('/api/pay/ipn', { method: 'POST', body: raw, headers: { 'x-nowpayments-sig': 'deadbeef' } }), env); assert.equal(r.status, 401); assert.equal(order.status, 'accepted'); ok('ipn: forged signature → 401, order untouched');
const confirming = { ...payload, payment_status: 'confirming' };
r = await worker.fetch(req('/api/pay/ipn', { method: 'POST', body: JSON.stringify(confirming), headers: { 'x-nowpayments-sig': nodeSig(confirming) } }), env); assert.equal(r.status, 200); assert.equal(order.status, 'payment_submitted'); ok('ipn: confirming → payment_submitted');
r = await worker.fetch(req('/api/pay/ipn', { method: 'POST', body: raw, headers: { 'x-nowpayments-sig': nodeSig(payload) } }), env); assert.equal(r.status, 200); assert.equal(order.status, 'paid'); ok('ipn: finished + correct amount → paid');
r = await worker.fetch(req('/api/pay/ipn', { method: 'POST', body: raw, headers: { 'x-nowpayments-sig': nodeSig(payload) } }), env); j = await r.json(); assert.equal(j.already, 'paid'); ok('ipn: duplicate notification is idempotent');

order.status = 'accepted'; order.payment_reference = '5524759814';
const cheap = { ...payload, price_amount: 1 };
r = await worker.fetch(req('/api/pay/ipn', { method: 'POST', body: JSON.stringify(cheap), headers: { 'x-nowpayments-sig': nodeSig(cheap) } }), env); assert.equal(order.status, 'accepted'); ok('ipn: amount mismatch is NOT marked paid');

r = await worker.fetch(req('/api/domain?name=x'), env); ok('existing /api/domain route still reachable');
// ---- status polling, reuse, missed-webhook catch-up ----
Object.assign(order, { status: 'accepted', payment_method: 'crypto:usdttrc20', payment_reference: '5524759814' }); npStatus = 'waiting'; created = 0;
const T = '00000000-0000-0000-0000-000000000000';
r = await worker.fetch(req('/api/pay/create', { method: 'POST', body: JSON.stringify({ token: T }) }), env); j = await r.json();
assert.equal(j.reused, true); assert.equal(created, 0); ok('create: reuses the open payment instead of making a second address');
r = await worker.fetch(req('/api/pay/status?t=' + T), env); j = await r.json(); assert.equal(j.payment.payment_status, 'waiting'); assert.equal(j.payment.pay_address, 'TXYZ'); ok('status: returns address, amount and waiting status');
npStatus = 'confirming'; r = await worker.fetch(req('/api/pay/status?t=' + T), env); j = await r.json(); assert.equal(order.status, 'payment_submitted'); ok('status: confirming moves order to payment_submitted');
npStatus = 'partially_paid'; events = 0; for (let k = 0; k < 3; k++) await worker.fetch(req('/api/pay/status?t=' + T), env); assert.equal(events, 0); ok('status polling does not spam history notes');
npStatus = 'finished'; r = await worker.fetch(req('/api/pay/status?t=' + T), env); j = await r.json(); assert.equal(order.status, 'paid'); assert.equal(j.order_status, 'paid'); ok('status: catches a missed webhook and marks paid');
r = await worker.fetch(req('/api/pay/status?t=bad'), env); assert.equal(r.status, 400); ok('status: rejects bad token');
Object.assign(order, { status: 'accepted', payment_method: 'crypto:usdttrc20', payment_reference: '5524759814' }); npStatus = 'expired';
await worker.fetch(req('/api/pay/status?t=' + T), env); assert.equal(order.payment_reference, null); ok('status: expired payment is cleared so a new one can be created');
console.log(`\n${pass} checks passed`);
