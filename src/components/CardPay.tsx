import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';
import type { Lang } from '../i18n';
import { colors } from '../theme';
import { Button } from './Button';
import { tx } from '../i18n';

// "Pay with card" on the order tracking page (Stripe Checkout).
// Talks to the Sylkit worker: POST /api/stripe/checkout, GET /api/stripe/status, POST /api/stripe/portal.

const go = (url: string) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') window.location.assign(url);
  else Linking.openURL(url);
};

const errorText = (code: string, es: boolean) =>
  ({
    order_not_payable: tx('This order is not ready for payment. Accept the quote first.', 'Este pedido no está listo para pagar. Acepta la cotización primero.', "Este pedido ainda não está pronto para pagamento. Aceite o orçamento primeiro."),
    already_paid: tx('This order is already paid.', 'Este pedido ya está pagado.', "Este pedido já está pago."),
    no_quote_amount: tx('This order has no amount yet. Please contact us.', 'Este pedido todavía no tiene monto. Escríbenos.', "Este pedido ainda não tem valor. Fale conosco."),
    payments_not_configured: tx('Card payment is not available right now. Use another method or contact us.', 'El pago con tarjeta no está disponible ahora. Usa otro método o escríbenos.', "O pagamento com cartão não está disponível agora. Use outro método ou fale conosco."),
    no_card_customer: tx('We could not find a card payment for this order.', 'No encontramos un pago con tarjeta para este pedido.', "Não encontramos um pagamento com cartão para este pedido."),
  })[code] ?? (tx('Could not open the payment. Please try again.', 'No se pudo abrir el pago. Intenta de nuevo.', "Não foi possível abrir o pagamento. Tente de novo."));

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
      ? tx('Renews automatically every year. Cancel anytime.', 'Se renueva automáticamente cada año. Cancela cuando quieras.', "Renova automaticamente todo ano. Cancele quando quiser.")
      : billing === 'monthly'
        ? tx('Renews automatically every month. Cancel anytime.', 'Se renueva automáticamente cada mes. Cancela cuando quieras.', "Renova automaticamente todo mês. Cancele quando quiser.")
        : null;

  return (
    <View style={styles.box}>
      <View style={styles.titleRow}>
        <Ionicons name="card" size={20} color={colors.primary} />
        <Text style={styles.title}>{tx('Pay with card', 'Pagar con tarjeta', "Pagar com cartão")}</Text>
      </View>
      <Text style={styles.muted}>
        {tx('Visa, Mastercard and more. Secure payment by Stripe; your order is marked as paid instantly.', 'Visa, Mastercard y más. Pago seguro con Stripe; tu pedido se marca como pagado al instante.', "Visa, Mastercard e mais. Pagamento seguro pela Stripe; seu pedido é marcado como pago na hora.")}
      </Text>
      {renews ? <Text style={styles.muted}>{renews}</Text> : null}
      {checking ? (
        <Text style={styles.muted}>{tx('Confirming your payment…', 'Confirmando tu pago…', "Confirmando seu pagamento…")}</Text>
      ) : (
        <Button label={tx('Pay with card', 'Pagar con tarjeta', "Pagar com cartão")} icon="lock-closed" onPress={pay} loading={busy || ready === null} />
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
        label={subscription ? (tx('Manage subscription and card', 'Gestionar suscripción y tarjeta', "Gerenciar assinatura e cartão")) : tx('View receipt', 'Ver recibo', "Ver recibo")}
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
