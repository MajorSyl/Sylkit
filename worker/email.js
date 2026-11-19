// Automatic emails to customers, so nobody who orders or pays is left waiting in silence.
//
//   received  -> right after an order or quote request is placed (with the order link)
//   reported  -> after the customer reports a manual payment (Pago Móvil, bank transfer…)
//   paid      -> the moment a payment is confirmed (receipt, invoice link, what happens next)
//
// Sent with Resend from no-reply@sylkit.com; replies go to SUPPORT_EMAIL (sylvanus@sylkit.com).
// Until the RESEND_API_KEY secret is set, nothing is sent and nothing breaks.
// Each (order, kind) is emailed at most once: the D1 table `emails_sent` remembers it.
//
// afterPaid() is called by every payment provider (PayPal, crypto, Monime, Stripe) when an order
// turns paid. It adds the public "setup has started" note to the order page and sends the receipt.

import { alertOwner, orderLine } from './notify.js';

const SUPABASE_URL = 'https://chcljhwcvzlmxrrhetfv.supabase.co';
const SITE = 'https://sylkit.com';
const WHATSAPP = '16469348752';

function sbHeaders(env) {
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  const h = { apikey: key, 'content-type': 'application/json' };
  if (key && key.startsWith('eyJ')) h.authorization = `Bearer ${key}`;
  return h;
}

async function loadOrder(env, id) {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(id)}&select=id,token,order_number,status,lang,customer_name,email,whatsapp,quote_amount,quote_currency,payment_method,products(name_en,name_es)`,
    { headers: sbHeaders(env) },
  );
  if (!r.ok) return null;
  return (await r.json())?.[0] ?? null;
}

async function publicNote(env, orderId, message) {
  await fetch(`${SUPABASE_URL}/rest/v1/order_events`, {
    method: 'POST',
    headers: { ...sbHeaders(env), prefer: 'return=minimal' },
    body: JSON.stringify({ order_id: orderId, kind: 'update', message, public: true }),
  }).catch(() => null);
}

// true the first time for (order, kind), false afterwards. Without D1 it allows the send.
async function firstTime(env, orderId, kind) {
  if (!env.SUPPORT_DB) return true;
  try {
    await env.SUPPORT_DB.prepare('CREATE TABLE IF NOT EXISTS emails_sent (order_id TEXT NOT NULL, kind TEXT NOT NULL, at TEXT NOT NULL, PRIMARY KEY (order_id, kind))').run();
    const r = await env.SUPPORT_DB.prepare('INSERT OR IGNORE INTO emails_sent (order_id, kind, at) VALUES (?, ?, ?)').bind(String(orderId), kind, new Date().toISOString()).run();
    return (r?.meta?.changes ?? 1) > 0;
  } catch {
    return true;
  }
}

const L = (lang) => (lang === 'es' ? 'es' : lang === 'pt' ? 'pt' : 'en');
const pick = (lang, en, es, pt) => ({ en, es, pt })[L(lang)];
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const money = (n, c) => (n == null ? '' : `${c && c !== 'USD' ? c + ' ' : '$'}${Number(n).toFixed(2)}`);

// What the customer reads. One place to change the promises Sylkit makes.
export function compose(o, kind) {
  const lang = o.lang;
  const first = String(o.customer_name || '').trim().split(/\s+/)[0] || '';
  const hi = pick(lang, `Hi${first ? ` ${first}` : ''},`, `Hola${first ? ` ${first}` : ''},`, `Olá${first ? ` ${first}` : ''},`);
  const product = (L(lang) === 'en' ? o.products?.name_en : o.products?.name_es) || o.products?.name_en || pick(lang, 'Custom system', 'Sistema a medida', 'Sistema sob medida');
  const amount = money(o.quote_amount, o.quote_currency);
  const orderUrl = `${SITE}/order?t=${o.token}`;
  const invoiceUrl = `${SITE}/invoice?t=${o.token}`;
  const wa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(pick(lang, `Hi, about my order ${o.order_number}`, `Hola, sobre mi pedido ${o.order_number}`, `Olá, sobre meu pedido ${o.order_number}`))}`;
  const custom = o.quote_amount == null;

  let subject, lines, button;
  if (kind === 'received') {
    subject = custom
      ? pick(lang, `We got your request ${o.order_number}`, `Recibimos tu solicitud ${o.order_number}`, `Recebemos sua solicitação ${o.order_number}`)
      : pick(lang, `Your order ${o.order_number} is saved`, `Tu pedido ${o.order_number} está guardado`, `Seu pedido ${o.order_number} está salvo`);
    lines = custom
      ? [
          pick(lang, `Thanks for your request for ${product}. It reached us and a real person is reading it.`, `Gracias por tu solicitud de ${product}. Ya nos llegó y una persona la está leyendo.`, `Obrigado pela sua solicitação de ${product}. Ela chegou e uma pessoa está lendo.`),
          pick(lang, 'We reply with a price the same day during office hours (Mon–Sat, 9:00–18:00 Caracas time).', 'Te respondemos con un precio el mismo día en horario de atención (lun–sáb, 9:00–18:00 hora de Caracas).', 'Respondemos com um preço no mesmo dia no horário de atendimento (seg–sáb, 9:00–18:00, horário de Caracas).'),
        ]
      : [
          pick(lang, `Your order for ${product} (${amount}) is saved.`, `Tu pedido de ${product} (${amount}) está guardado.`, `Seu pedido de ${product} (${amount}) está salvo.`),
          pick(lang, 'If you have not paid yet, you can finish the payment any time from your order page. Setup starts as soon as the payment is confirmed.', 'Si aún no pagaste, puedes completar el pago cuando quieras desde la página de tu pedido. La instalación empieza apenas se confirme el pago.', 'Se ainda não pagou, conclua o pagamento quando quiser na página do pedido. A instalação começa assim que o pagamento for confirmado.'),
        ];
    button = pick(lang, 'Open my order', 'Ver mi pedido', 'Ver meu pedido');
  } else if (kind === 'reported') {
    subject = pick(lang, `We're checking your payment for ${o.order_number}`, `Estamos verificando tu pago de ${o.order_number}`, `Estamos verificando seu pagamento de ${o.order_number}`);
    lines = [
      pick(lang, 'Thanks! We got your payment details and are checking them with the bank.', '¡Gracias! Recibimos los datos de tu pago y los estamos verificando con el banco.', 'Obrigado! Recebemos os dados do seu pagamento e estamos verificando com o banco.'),
      pick(lang, 'We usually confirm within a few hours (Mon–Sat, 9:00–18:00 Caracas). You will get another email the moment it is confirmed.', 'Normalmente lo confirmamos en pocas horas (lun–sáb, 9:00–18:00 Caracas). Recibirás otro correo apenas se confirme.', 'Normalmente confirmamos em poucas horas (seg–sáb, 9:00–18:00, Caracas). Você receberá outro e-mail assim que for confirmado.'),
    ];
    button = pick(lang, 'Open my order', 'Ver mi pedido', 'Ver meu pedido');
  } else {
    subject = pick(lang, `Payment confirmed: ${o.order_number}`, `Pago confirmado: ${o.order_number}`, `Pagamento confirmado: ${o.order_number}`);
    lines = [
      pick(lang, `We received your payment of ${amount} for ${product}. Thank you!`, `Recibimos tu pago de ${amount} por ${product}. ¡Gracias!`, `Recebemos seu pagamento de ${amount} por ${product}. Obrigado!`),
      pick(lang, 'Setup has started. Here is what happens now:', 'La instalación ya empezó. Esto es lo que sigue:', 'A instalação já começou. Veja o que acontece agora:'),
      pick(lang, '1. We message you on WhatsApp to confirm your business name, logo and any data to load.', '1. Te escribimos por WhatsApp para confirmar el nombre de tu negocio, tu logo y los datos a cargar.', '1. Escrevemos pelo WhatsApp para confirmar o nome do negócio, o logo e os dados a carregar.'),
      pick(lang, '2. We set up your system and load your data (usually 24–48 h).', '2. Configuramos tu sistema y cargamos tus datos (normalmente 24–48 h).', '2. Configuramos seu sistema e carregamos seus dados (normalmente 24–48 h).'),
      pick(lang, '3. You get your login and a short walkthrough.', '3. Recibes tu acceso y una guía corta de uso.', '3. Você recebe seu acesso e um guia rápido.'),
      pick(lang, 'Want to go faster? Send us your logo and product or price list on WhatsApp now.', '¿Quieres que sea más rápido? Envíanos ahora tu logo y tu lista de productos o precios por WhatsApp.', 'Quer mais rapidez? Envie agora seu logo e sua lista de produtos ou preços pelo WhatsApp.'),
      `${pick(lang, 'Invoice', 'Factura', 'Fatura')}: ${invoiceUrl}`,
    ];
    button = pick(lang, 'See my order', 'Ver mi pedido', 'Ver meu pedido');
  }
  const sign = pick(lang, 'The Sylkit team', 'El equipo de Sylkit', 'Equipe Sylkit');
  const waLine = pick(lang, 'Questions? Just reply to this email or write to us on WhatsApp', '¿Preguntas? Responde a este correo o escríbenos por WhatsApp', 'Dúvidas? Responda este e-mail ou fale conosco no WhatsApp');

  const text = [hi, '', ...lines, '', `${button}: ${orderUrl}`, '', `${waLine}: ${wa}`, '', sign].join('\n');
  const html = `<!doctype html><html><body style="margin:0;background:#F5F5F7;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1D1D1F">
<div style="max-width:560px;margin:0 auto;padding:28px 16px">
<div style="font-size:22px;font-weight:800;letter-spacing:-0.5px;margin-bottom:16px">sylkit</div>
<div style="background:#fff;border-radius:18px;padding:26px 24px;border:1px solid #E4E7EC">
<div style="font-size:12px;font-weight:700;color:#667085;letter-spacing:.6px;text-transform:uppercase">${esc(o.order_number)}</div>
<h1 style="font-size:22px;line-height:1.25;margin:6px 0 14px">${esc(subject)}</h1>
<p style="font-size:15px;line-height:1.55;margin:0 0 12px">${esc(hi)}</p>
${lines.map((l) => `<p style="font-size:15px;line-height:1.55;margin:0 0 10px">${esc(l)}</p>`).join('')}
<a href="${orderUrl}" style="display:inline-block;margin-top:10px;background:#2558E8;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:13px 22px;border-radius:12px">${esc(button)}</a>
<p style="font-size:14px;line-height:1.5;color:#475467;margin:20px 0 0">${esc(waLine)}: <a href="${wa}" style="color:#2558E8">WhatsApp</a></p>
</div>
<p style="font-size:12px;color:#98A2B3;margin:16px 4px">${esc(sign)} · sylkit.com</p>
</div></body></html>`;
  return { subject, text, html };
}

async function send(env, to, msg) {
  if (!env.RESEND_API_KEY || !to) return false;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: 'Sylkit <no-reply@sylkit.com>', to: [to], reply_to: env.SUPPORT_EMAIL || 'sylvanus@sylkit.com', subject: msg.subject, text: msg.text, html: msg.html }),
  }).catch(() => null);
  return !!r?.ok;
}

/** Emails the customer about their order once per kind. Never throws. */
export async function emailCustomer(env, orderOrId, kind) {
  try {
    if (!env.RESEND_API_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) return false;
    const id = typeof orderOrId === 'object' ? orderOrId.id : orderOrId;
    const o = await loadOrder(env, id);
    if (!o?.email || !o.token) return false;
    if (!(await firstTime(env, o.id, kind))) return false;
    return await send(env, o.email, compose(o, kind));
  } catch {
    return false;
  }
}

/**
 * Runs once an order has just turned paid (all providers call it). Never throws.
 * ownerAlert: pass a title when the provider has not already alerted the owner.
 */
export async function afterPaid(env, order, { ownerAlert } = {}) {
  try {
    const es = order.lang === 'es';
    const pt = order.lang === 'pt';
    await publicNote(
      env,
      order.id,
      es
        ? 'Instalación iniciada. Te escribimos por WhatsApp para pedirte tu logo y tus datos, y tu sistema queda listo normalmente en 24–48 h.'
        : pt
          ? 'Instalação iniciada. Vamos escrever pelo WhatsApp para pedir seu logo e seus dados; seu sistema fica pronto normalmente em 24–48 h.'
          : "Setup started. We'll message you on WhatsApp for your logo and data; your system is usually ready in 24–48 h.",
    );
    if (ownerAlert) await alertOwner(env, { title: ownerAlert, message: `${orderLine(order)}\nRevisa y empieza la instalación.`, orderId: order.id, priority: 'high', tags: 'moneybag' });
    await emailCustomer(env, order.id, 'paid');
  } catch {
    /* best effort: the payment is already recorded */
  }
}
