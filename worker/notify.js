// Instant alerts to the owner's phone for orders and payments, through the free ntfy app.
// Set the NTFY_TOPIC secret (already used by support messages) and subscribe to it in the ntfy app.
// Alerts never block or break the customer's flow: every error is swallowed.

const SITE = 'https://sylkit.com';

export async function alertOwner(env, { title, message, orderId, priority = 'default', tags = '' }) {
  if (!env.NTFY_TOPIC) return;
  try {
    await fetch(`https://ntfy.sh/${encodeURIComponent(env.NTFY_TOPIC)}`, {
      method: 'POST',
      headers: {
        Title: encodeHeader(title),
        Priority: priority,
        ...(tags ? { Tags: tags } : {}),
        ...(orderId ? { Click: `${SITE}/admin/order?id=${orderId}` } : {}),
      },
      body: message,
    });
  } catch {
    /* alerts are best effort */
  }
}

// ntfy headers must be ASCII-safe; it accepts RFC 2047 encoded UTF-8.
const encodeHeader = (s) => (/^[\x20-\x7E]*$/.test(s) ? s : `=?UTF-8?B?${btoa(unescape(encodeURIComponent(s)))}?=`);

const money = (n, c) => (n == null ? '' : `${c && c !== 'USD' ? c + ' ' : '$'}${Number(n).toFixed(2)}`);

// One line per order for the alert body.
export function orderLine(o) {
  const product = o.products?.name_es || o.products?.name_en || 'Pedido a medida';
  const who = [o.customer_name, o.whatsapp ? `WhatsApp ${o.whatsapp}` : null, o.email].filter(Boolean).join(' · ');
  return `${o.order_number} · ${product}${o.quote_amount != null ? ` · ${money(o.quote_amount, o.quote_currency)}` : ''}\n${who}`;
}
