import { useEffect, useState } from 'react';
import type { Lang } from '../i18n';
import { supabase } from './supabase';
import { tx } from '../i18n';

// Every way a client can pay, in one list used by both the checkout and the order page.
//   card   -> Stripe Checkout (automatic, renews by itself)
//   crypto -> NOWPayments USDT (automatic)
//   manual -> methods from the payment_methods table (Pago Móvil, Binance Pay…): client reports the reference
//
// Pago Móvil only works with a Venezuelan bank account, so it is shown only to clients in Venezuela
// (Cloudflare country cookie, Caracas time zone, or Venezuela typed as the order's country).

export type PayOption = {
  id: string; // 'paypal' | 'card' | 'crypto' | manual method id
  kind: 'paypal' | 'card' | 'crypto' | 'manual';
  name: string;
  details?: { es: string; en: string; pt?: string };
};

type Manual = { id: string; name: string; kind: string; details_es: string; details_en: string };

let cache: PayOption[] | null = null;

// Venezuelan bank methods (Pago Móvil, bank transfer in bolívares) are shown only to clients in Venezuela.
const VENEZUELA_ONLY = /pago\s*m[oó]vil|mercantil|transferencia|bank\s*transfer|banco|bol[ií]var/i;
/** True for methods paid in bolívares inside Venezuela (shown with the amount at the BCV rate). */
export const isBolivarMethod = (o: PayOption) => o.kind === 'manual' && VENEZUELA_ONLY.test(o.name) && !/usd|d[oó]lar/i.test(o.name);

// Not accepted by Sylkit; hidden even if a row is still switched on in the table.
const NOT_ACCEPTED = /zelle/i;

function inVenezuela(country?: string | null) {
  if (country && /^(ve|ven|venezuela)$/i.test(country.trim())) return true;
  if (typeof document !== 'undefined' && /(?:^|; )sk_cc=VE(?:;|$)/.test(document.cookie)) return true;
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone === 'America/Caracas';
  } catch {
    return false;
  }
}

/** Hide Venezuela-only methods for clients elsewhere. `keep` is a method the order already uses. */
function forClient(list: PayOption[], country?: string | null, keep?: string) {
  if (inVenezuela(country)) return list;
  return list.filter((o) => o.kind !== 'manual' || o.id === keep || !VENEZUELA_ONLY.test(o.name));
}

// Sandbox PayPal (fake money) is only offered on a page opened with ?paypaltest=1.
export const paypalTest = () => {
  try {
    return typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('paypaltest') === '1';
  } catch {
    return false;
  }
};

export function usePayOptions(client?: { country?: string | null; keep?: string }) {
  const [options, setOptions] = useState<PayOption[] | null>(cache);
  useEffect(() => {
    let alive = true;
    (async () => {
      const [auto, manual] = await Promise.all([
        fetch(`/api/order/methods${paypalTest() ? '?paypaltest=1' : ''}`)
          .then((r) => (r.ok ? r.json() : { card: false, crypto: true }))
          .catch(() => ({ card: false, crypto: true })),
        supabase
          .from('payment_methods')
          .select('id,name,kind,details_es,details_en')
          .eq('active', true)
          .order('sort')
          .then(({ data }) => (data as Manual[]) ?? []),
      ]);
      const list: PayOption[] = [];
      if (auto.paypal) list.push({ id: 'paypal', kind: 'paypal', name: 'paypal' });
      if (auto.card) list.push({ id: 'card', kind: 'card', name: 'card' });
      if (auto.crypto) list.push({ id: 'crypto', kind: 'crypto', name: 'crypto' });
      for (const m of manual) {
        // Crypto rows in the table duplicate the automatic USDT option.
        if (auto.crypto && /usdt|crypto|cripto/i.test(`${m.kind} ${m.name}`)) continue;
        if (NOT_ACCEPTED.test(m.name)) continue;
        list.push({ id: m.id, kind: 'manual', name: m.name, details: { es: m.details_es, en: m.details_en } });
      }
      cache = list;
      if (alive) setOptions(list);
    })();
    return () => {
      alive = false;
    };
  }, []);
  return options && forClient(options, client?.country, client?.keep);
}

export function payTitle(o: PayOption, lang: Lang) {
  const es = lang === 'es';
  if (o.kind === 'paypal') return tx('PayPal or card', 'PayPal o tarjeta', "PayPal ou cartão");
  if (o.kind === 'card') return tx('Credit or debit card', 'Tarjeta de crédito o débito', "Cartão de crédito ou débito");
  if (o.kind === 'crypto') return tx('Crypto (USDT)', 'Cripto (USDT)', "Cripto (USDT)");
  return o.name;
}

export function paySub(o: PayOption, lang: Lang) {
  const es = lang === 'es';
  if (o.kind === 'paypal') return tx('Pay with your PayPal account or a debit/credit card. Confirmed instantly.', 'Paga con tu cuenta PayPal o con tarjeta de débito o crédito. Se confirma al instante.', "Pague com sua conta PayPal ou cartão de débito/crédito. Confirmado na hora.");
  if (o.kind === 'card') return tx('Visa, Mastercard, Apple Pay. Secure payment by Stripe.', 'Visa, Mastercard, Apple Pay. Pago seguro con Stripe.', "Visa, Mastercard, Apple Pay. Pagamento seguro pela Stripe.");
  if (o.kind === 'crypto') return tx('TRC20 or BEP20. Confirmed automatically.', 'TRC20 o BEP20. Se confirma automáticamente.', "TRC20 ou BEP20. Confirmado automaticamente.");
  return tx('You pay and send us the reference. We confirm it within hours.', 'Pagas y nos envías la referencia. Lo confirmamos en pocas horas.', "Você paga e nos envia a referência. Confirmamos em poucas horas.");
}

export const payIcon = (o: PayOption) => (o.kind === 'paypal' ? 'logo-paypal' : o.kind === 'card' ? 'card' : o.kind === 'crypto' ? 'logo-bitcoin' : 'swap-horizontal');
