// node --no-warnings worker/test/email.test.mjs
import assert from 'node:assert/strict';
import { compose, emailCustomer, afterPaid } from '../email.js';

const order = { id: 'o1', token: '11111111-2222-3333-4444-555555555555', order_number: 'SK-1001', status: 'paid', lang: 'es', customer_name: 'Ana Pérez', email: 'ana@example.com', quote_amount: 129, quote_currency: 'USD', products: { name_en: 'Pharmacy', name_es: 'Farmacia' } };

// Wording per kind and language
for (const kind of ['received', 'reported', 'paid'])
  for (const lang of ['en', 'es', 'pt']) {
    const m = compose({ ...order, lang }, kind);
    assert.ok(m.subject.includes('SK-1001'), `${kind}/${lang} subject`);
    assert.ok(m.text.includes(`https://sylkit.com/order?t=${order.token}`), `${kind}/${lang} link`);
    assert.ok(m.html.startsWith('<!doctype html>'));
  }
assert.match(compose(order, 'paid').text, /Hola Ana,/);
assert.match(compose({ ...order, quote_amount: null }, 'received').subject, /solicitud/);
assert.match(compose({ ...order, lang: 'en', customer_name: '<b>x' }, 'paid').html, /&lt;b&gt;x/);

// Sending: once per (order, kind); nothing without a key
const sent = [], notes = [];
const seen = new Set();
const D1 = { prepare: (sql) => ({ bind: (...a) => ({ run: async () => { const k = a.slice(0, 2).join(':'); const n = seen.has(k) ? 0 : 1; seen.add(k); return { meta: { changes: n } }; } }), run: async () => ({}) }) };
globalThis.fetch = async (url, init = {}) => {
  url = String(url);
  if (url.includes('/rest/v1/orders')) return new Response(JSON.stringify([order]));
  if (url.includes('/rest/v1/order_events')) { notes.push(JSON.parse(init.body)); return new Response(''); }
  if (url.includes('api.resend.com')) { sent.push(JSON.parse(init.body)); return new Response('{}'); }
  if (url.includes('ntfy.sh')) return new Response('');
  throw new Error('unexpected ' + url);
};
assert.equal(await emailCustomer({ SUPABASE_SERVICE_ROLE_KEY: 'k', SUPPORT_DB: D1 }, 'o1', 'paid'), false, 'no key, no email');
const env = { RESEND_API_KEY: 'r', SUPABASE_SERVICE_ROLE_KEY: 'k', SUPPORT_DB: D1, NTFY_TOPIC: 't' };
await afterPaid(env, order);
await afterPaid(env, order); // retry of the same payment: note again is harmless, email not repeated
assert.equal(sent.length, 1);
assert.equal(sent[0].to[0], 'ana@example.com');
assert.equal(sent[0].reply_to, 'sylvanus@sylkit.com');
assert.ok(notes[0].public && /Instalación iniciada/.test(notes[0].message));
assert.equal(await emailCustomer(env, 'o1', 'received'), true);
// A failing mail provider never throws
globalThis.fetch = async () => { throw new Error('down'); };
assert.equal(await emailCustomer({ ...env, SUPPORT_DB: undefined }, 'o1', 'reported'), false);
await afterPaid(env, order);
console.log('email tests passed');
