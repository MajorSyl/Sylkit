import { useEffect, useState } from 'react';
import type { Lang } from '../i18n';
import { supabase } from './supabase';

// Every way a client can pay, in one list used by both the checkout and the order page.
//   card   -> Stripe Checkout (automatic, renews by itself)
//   crypto -> NOWPayments USDT (automatic)
//   manual -> methods from the payment_methods table (Pago Móvil, Zelle, Binance Pay…): client reports the reference

export type PayOption = {
  id: string; // 'card' | 'crypto' | manual method id
  kind: 'card' | 'crypto' | 'manual';
  name: string;
  details?: { es: string; en: string };
};

type Manual = { id: string; name: string; kind: string; details_es: string; details_en: string };

let cache: PayOption[] | null = null;

export function usePayOptions() {
  const [options, setOptions] = useState<PayOption[] | null>(cache);
  useEffect(() => {
    let alive = true;
    (async () => {
      const [auto, manual] = await Promise.all([
        fetch('/api/order/methods')
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
      if (auto.card) list.push({ id: 'card', kind: 'card', name: 'card' });
      if (auto.crypto) list.push({ id: 'crypto', kind: 'crypto', name: 'crypto' });
      for (const m of manual) {
        // Crypto rows in the table duplicate the automatic USDT option.
        if (auto.crypto && /usdt|crypto|cripto/i.test(`${m.kind} ${m.name}`)) continue;
        list.push({ id: m.id, kind: 'manual', name: m.name, details: { es: m.details_es, en: m.details_en } });
      }
      cache = list;
      if (alive) setOptions(list);
    })();
    return () => {
      alive = false;
    };
  }, []);
  return options;
}

export function payTitle(o: PayOption, lang: Lang) {
  const es = lang === 'es';
  if (o.kind === 'card') return es ? 'Tarjeta de crédito o débito' : 'Credit or debit card';
  if (o.kind === 'crypto') return es ? 'Cripto (USDT)' : 'Crypto (USDT)';
  return o.name;
}

export function paySub(o: PayOption, lang: Lang) {
  const es = lang === 'es';
  if (o.kind === 'card') return es ? 'Visa, Mastercard, Apple Pay. Pago seguro con Stripe.' : 'Visa, Mastercard, Apple Pay. Secure payment by Stripe.';
  if (o.kind === 'crypto') return es ? 'TRC20 o BEP20. Se confirma automáticamente.' : 'TRC20 or BEP20. Confirmed automatically.';
  return es ? 'Pagas y nos envías la referencia. Lo confirmamos en pocas horas.' : 'You pay and send us the reference. We confirm it within hours.';
}

export const payIcon = (o: PayOption) => (o.kind === 'card' ? 'card' : o.kind === 'crypto' ? 'logo-bitcoin' : 'swap-horizontal');
