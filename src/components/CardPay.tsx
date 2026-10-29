import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';
import type { Lang } from '../i18n';
import { colors } from '../theme';
import { Button } from './Button';

// "Pay with card" on the order tracking page (Stripe Checkout).
// Talks to the Sylkit worker: POST /api/stripe/checkout, GET /api/stripe/status, POST /api/stripe/portal.

const go = (url: string) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') window.location.assign(url);
  else Linking.openURL(url);
};

const errorText = (code: string, es: boolean) =>
  ({
    order_not_payable: es ? 'Este pedido no está listo para pagar. Acepta la cotización primero.' : 'This order is not ready for payment. Accept the quote first.',
    already_paid: es ? 'Este pedido ya está pagado.' : 'This order is already paid.',
    no_quote_amount: es ? 'Este pedido todavía no tiene monto. Escríbenos.' : 'This order has no amount yet. Please contact us.',
    payments_not_configured: es ? 'El pago con tarjeta no está disponible ahora. Usa otro método o escríbenos.' : 'Card payment is not available right now. Use another method or contact us.',
    no_card_customer: es ? 'No encontramos un pago con tarjeta para este pedido.' : 'We could not find a card payment for this order.',
  })[code] ?? (es ? 'No se pudo abrir el pago. Intenta de nuevo.' : 'Could not open the payment. Please try again.');

type Billing = 'yearly' | 'monthly' | 'once' | undefined;

export function CardPay({ token, lang, billing, returned, onChanged }: { token: string; lang: Lang; billing: Billing; returned: boolean; onChanged: () => void }) {
  const es = lang === 'es';
  const [ready, setReady] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(returned);
  const [error, setError] = useState('');
  const tries = useRef(0);

  useEffect(() => {
    fetch('/api/stripe/health')
      .then((r) => r.json())
      .then((j) => setReady(!!j.configured?.STRIPE_SECRET_KEY))
      .catch(() => setReady(false));
  }, []);

  // Back from Stripe: confirm the payment straight away (the webhook usually beats us to it).
  useEffect(() => {
    if (!returned) return;
    let alive = true;
    const run = async () => {
      try {
        const r = await fetch(`/api/stripe/status?t=${encodeURIComponent(token)}`);
        const j = await r.json().catch(() => ({}));
        if (!alive) return;
        if (j.order_status === 'paid' || j.order_status === 'in_progress' || j.order_status === 'delivered') {
          setChecking(false);
          return onChanged();
        }
      } catch {
        /* retry below */
      }
      if (alive && ++tries.current < 6) setTimeout(run, 3000);
      else if (alive) setChecking(false);
    };
    run();
    return () => {
      alive = false;
    };
  }, [returned, token, onChanged]);

  const pay = async () => {
    setError('');
    setBusy(true);
    try {
      const r = await fetch('/api/stripe/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.url) return setError(errorText(j.error, es));
      go(j.url);
    } catch {
      setError(errorText('', es));
    } finally {
      setBusy(false);
    }
  };

  if (ready === false) return null;

  const renews =
    billing === 'yearly'
      ? es
        ? 'Se renueva automáticamente cada año. Cancela cuando quieras.'
        : 'Renews automatically every year. Cancel anytime.'
      : billing === 'monthly'
        ? es
          ? 'Se renueva automáticamente cada mes. Cancela cuando quieras.'
          : 'Renews automatically every month. Cancel anytime.'
        : null;

  return (
    <View style={styles.box}>
      <View style={styles.titleRow}>
        <Ionicons name="card" size={20} color={colors.primary} />
        <Text style={styles.title}>{es ? 'Pagar con tarjeta' : 'Pay with card'}</Text>
      </View>
      <Text style={styles.muted}>
        {es ? 'Visa, Mastercard y más. Pago seguro con Stripe; tu pedido se marca como pagado al instante.' : 'Visa, Mastercard and more. Secure payment by Stripe; your order is marked as paid instantly.'}
      </Text>
      {renews ? <Text style={styles.muted}>{renews}</Text> : null}
      {checking ? (
        <Text style={styles.muted}>{es ? 'Confirmando tu pago…' : 'Confirming your payment…'}</Text>
      ) : (
        <Button label={es ? 'Pagar con tarjeta' : 'Pay with card'} icon="lock-closed" onPress={pay} loading={busy || ready === null} />
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

// Shown on paid card orders: update the card, download invoices or cancel (Stripe customer portal).
export function ManageCard({ token, lang, subscription }: { token: string; lang: Lang; subscription: boolean }) {
  const es = lang === 'es';
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const open = async () => {
    setError('');
    setBusy(true);
    try {
      const r = await fetch('/api/stripe/portal', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.url) return setError(errorText(j.error, es));
      go(j.url);
    } catch {
      setError(errorText('', es));
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={{ gap: 8 }}>
      <Button
        label={subscription ? (es ? 'Gestionar suscripción y tarjeta' : 'Manage subscription and card') : es ? 'Ver recibo' : 'View receipt'}
        icon="card"
        variant="secondary"
        onPress={open}
        loading={busy}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: 8, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  muted: { fontSize: 13, color: colors.muted, lineHeight: 19 },
  error: { fontSize: 13, color: '#B42318' },
});
