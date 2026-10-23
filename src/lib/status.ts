import type { Text } from '../i18n';

export type OrderStatus =
  | 'new'
  | 'quoted'
  | 'accepted'
  | 'payment_submitted'
  | 'paid'
  | 'in_progress'
  | 'delivered'
  | 'cancelled';

export const statusLabel: Record<OrderStatus, Text> = {
  new: { es: 'Solicitud recibida', en: 'Request received' },
  quoted: { es: 'Cotización enviada', en: 'Quote sent' },
  accepted: { es: 'Cotización aceptada', en: 'Quote accepted' },
  payment_submitted: { es: 'Pago en verificación', en: 'Payment being verified' },
  paid: { es: 'Pago confirmado', en: 'Payment confirmed' },
  in_progress: { es: 'En desarrollo', en: 'In progress' },
  delivered: { es: 'Entregado', en: 'Delivered' },
  cancelled: { es: 'Cancelado', en: 'Cancelled' },
};

export const statusColor: Record<OrderStatus, { bg: string; fg: string }> = {
  new: { bg: '#E8F0FF', fg: '#1452CC' },
  quoted: { bg: '#FFF4E5', fg: '#B54708' },
  accepted: { bg: '#E3F8FD', fg: '#0E7F98' },
  payment_submitted: { bg: '#FFF4E5', fg: '#B54708' },
  paid: { bg: '#ECFDF3', fg: '#067647' },
  in_progress: { bg: '#F4EBFF', fg: '#6941C6' },
  delivered: { bg: '#ECFDF3', fg: '#067647' },
  cancelled: { bg: '#F2F4F7', fg: '#475467' },
};

// Customer-facing progress steps
export const steps: OrderStatus[] = ['new', 'quoted', 'accepted', 'paid', 'in_progress', 'delivered'];

export const stepIndex = (s: OrderStatus) => {
  if (s === 'payment_submitted') return steps.indexOf('accepted');
  return steps.indexOf(s);
};

export const formatMoney = (amount: number | null | undefined, currency = 'USD') =>
  amount == null ? '' : `${currency} ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatDate = (iso: string | null | undefined, lang: 'es' | 'en') => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(lang === 'es' ? 'es-VE' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
};
