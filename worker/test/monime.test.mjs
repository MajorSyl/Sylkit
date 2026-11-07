import { handleMonime } from '../monime.js';
const tok = '123e4567-e89b-12d3-a456-426614174000';
let order, patches, events, alerts, sess, pays, created;
function reset(token = 'mon_live123') {
  order = { id: 9, token: tok, order_number: 'SK-1030', status: 'accepted', quote_amount: 25, quote_currency: 'USD', lang: 'en', product_name_en: 'POS', payment_method: null, payment_reference: null, customer_name: 'Ana' };
  patches = []; events = []; alerts = []; created = null;
  sess = { id: 'scs-abc123', status: 'completed', reference: 'SK-1030', orderNumber: 'ON1', metadata: { sle_minor: '57500' } };
  pays = [{ id: 'pay-1', status: 'completed', amount: { currency: 'SLE', value: 57500 }, channel: { provider: 'm18' } }];
  return { MONIME_ACCESS_TOKEN: token, MONIME_SPACE_ID: 'spc-x', SUPABASE_SERVICE_ROLE_KEY: 'k', NTFY_TOPIC: 't', MONIME_USD_RATE: '23' };
}
globalThis.fetch = async (url, init = {}) => {
  url = String(url);
  if (url.includes('ntfy')) { alerts.push(init.headers.Title); return new Response('ok'); }
  if (url.includes('supabase')) {
    if (init.method === 'PATCH') { const p = JSON.parse(init.body); patches.push(p); Object.assign(order, p); return new Response(''); }
    if (init.method === 'POST') { events.push(JSON.parse(init.body).message); return new Response(''); }
    return new Response(JSON.stringify([order]));
  }
  if (url.includes('/v1/checkout-sessions') && init.method === 'POST') { created = JSON.parse(init.body); return new Response(JSON.stringify({ success: true, result: { id: 'scs-abc123', redirectUrl: 'https://pay.monime.io/x' } })); }
  if (url.includes('/v1/checkout-sessions/')) return new Response(JSON.stringify({ success: true, result: sess }));
  if (url.includes('/v1/payments')) return new Response(JSON.stringify({ success: true, result: pays }));
  if (url.includes('/v1/webhooks')) return new Response(JSON.stringify({ success: true, result: [] }));
  return new Response('{}');
};
const call = (env, path, body) => handleMonime(new Request('https://sylkit.com' + path, { method: 'POST', body: JSON.stringify(body) }), env, new URL('https://sylkit.com' + path)).then((r) => r.json());
const ok = (c, m) => console.log(c ? '✓' : '✗ FAIL', m);

let env = reset();
let r = await call(env, '/api/monime/checkout', { token: tok });
ok(r.url === 'https://pay.monime.io/x' && r.sle === 575, 'checkout returns Monime link, $25 x 23 = NLe 575');
ok(created.lineItems[0].price.value === 57500 && created.lineItems[0].price.currency === 'SLE', 'price sent in SLE minor units');
ok(order.payment_method === 'monime:pending' && order.payment_reference === 'scs-abc123', 'order remembers the session');
r = await call(env, '/api/monime/confirm', { token: tok });
ok(r.order_status === 'paid' && order.status === 'paid' && alerts.some((a) => /Monime/.test(a)), 'completed payment marks paid + alerts owner');

env = reset(); order.payment_method = 'monime:pending'; order.payment_reference = 'scs-abc123'; pays[0].amount.value = 1000;
r = await call(env, '/api/monime/confirm', { token: tok });
ok(r.order_status === 'payment_submitted', 'underpayment is held for manual check');

env = reset(); order.payment_method = 'monime:pending'; order.payment_reference = 'scs-abc123'; sess.status = 'pending';
r = await call(env, '/api/monime/confirm', { token: tok });
ok(r.order_status === 'accepted', 'pending session changes nothing');

env = reset('mon_test_abc'); order.payment_method = 'monime:test'; order.payment_reference = 'scs-abc123';
r = await call(env, '/api/monime/confirm', { token: tok });
ok(r.order_status === 'payment_submitted', 'test-mode payment never marks paid');

env = reset(); order.payment_method = 'monime:pending'; order.payment_reference = 'scs-abc123';
r = await call(env, '/api/monime/webhook', { event: 'checkout_session.completed', data: { id: 'scs-abc123', reference: 'SK-1030' } });
ok(order.status === 'paid', 'webhook triggers a verified re-check and marks paid');

env = reset(); order.payment_method = 'monime:pending'; order.payment_reference = 'scs-abc123'; sess.reference = 'SK-9999';
r = await call(env, '/api/monime/confirm', { token: tok });
ok(r.order_status === 'accepted', 'session for another order is ignored');
