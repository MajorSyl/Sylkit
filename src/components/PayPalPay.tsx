import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';
import type { Lang } from '../i18n';
import { tx } from '../i18n';
import { paypalTest } from '../lib/payOptions';
import { colors } from '../theme';
import { Button } from './Button';

// "Pay with PayPal or card" on the order tracking page.
// POST /api/paypal/checkout sends the customer to PayPal; PayPal sends them back with
// ?paid=paypal&token=<PayPal order id>, and we call POST /api/paypal/capture to take the payment.

const go = (url: string) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') window.location.assign(url);
  else Linking.openURL(url);
};

const errorText = (code: string) =>
  ({
    order_not_payable: tx('This order is not ready for payment. Accept the quote first.', 'Este pedido no está listo para pagar. Acepta la cotización primero.', 'Este pedido ainda não está pronto para pagamento. Aceite o orçamento primeiro.'),
    already_paid: tx('This order is already paid.', 'Este pedido ya está pagado.', 'Este pedido já está pago.'),
    no_quote_amount: tx('This order has no amount yet. Please contact us.', 'Este pedido todavía no tiene monto. Escríbenos.', 'Este pedido ainda não tem valor. Fale conosco.'),
    payments_not_configured: tx('PayPal is not available right now. Use another method or contact us.', 'PayPal no está disponible ahora. Usa otro método o escríbenos.', 'O PayPal não está disponível agora. Use outro método ou fale conosco.'),
    declined: tx('PayPal declined the payment. Try another card or method.', 'PayPal rechazó el pago. Prueba otra tarjeta u otro método.', 'O PayPal recusou o pagamento. Tente outro cartão ou método.'),
  })[code] ?? tx('Could not complete the payment. Please try again.', 'No se pudo completar el pago. Intenta de nuevo.', 'Não foi possível concluir o pagamento. Tente de novo.');

type Billing = 'yearly' | 'monthly' | 'once' | undefined;

export function PayPalPay({ token, billing, returned, paypalOrder, pending, onChanged }: { token: string; lang: Lang; billing: Billing; returned: boolean; paypalOrder?: string; pending?: boolean; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(returned && !!paypalOrder);
  const [error, setError] = useState('');
  const once = useRef(false);

  // Back from PayPal: capture the payment.
  useEffect(() => {
    if (!returned || !paypalOrder || once.current) return;
    once.current = true;
    (async () => {
      try {
        const r = await fetch('/api/paypal/capture', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token, paypal_order: paypalOrder }) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok && !j.order_status) setError(errorText(j.error));
        else if (j.order_status === 'accepted') setError(errorText(j.error));
      } catch {
        setError(errorText(''));
      } finally {
        setChecking(false);
        onChanged();
      }
    })();
  }, [returned, paypalOrder, token, onChanged]);

  // Opened again later (e.g. paid on PayPal but closed the tab before coming back): quietly check
  // whether PayPal approved it and, if so, take the payment. Nothing is shown if it wasn't approved.
  useEffect(() => {
    if (returned || !pending || once.current) return;
    once.current = true;
    fetch('/api/paypal/capture', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token }) })
      .then((r) => r.json())
      .then((j) => {
        if (j?.order_status && j.order_status !== 'accepted') onChanged();
      })
      .catch(() => null);
  }, [returned, pending, token, onChanged]);

  const pay = async () => {
    setError('');
    setBusy(true);
    try {
      const r = await fetch('/api/paypal/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token, test: paypalTest() }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.url) return setError(errorText(j.error));
      go(j.url);
    } catch {
      setError(errorText(''));
    } finally {
      setBusy(false);
    }
  };

  const next =
    billing === 'yearly'
      ? tx('Renewal: we send you a PayPal invoice each year.', 'Renovación: te enviamos una factura de PayPal cada año.', 'Renovação: enviamos uma fatura do PayPal todo ano.')
      : billing === 'monthly'
        ? tx('Next months: we send you a PayPal invoice each month.', 'Próximos meses: te enviamos una factura de PayPal cada mes.', 'Próximos meses: enviamos uma fatura do PayPal todo mês.')
        : null;

  return (
    <View style={styles.box}>
      <View style={styles.titleRow}>
        <Ionicons name="logo-paypal" size={20} color="#003087" />
        <Text style={styles.title}>{tx('Pay with PayPal or card', 'Pagar con PayPal o tarjeta', 'Pagar com PayPal ou cartão')}</Text>
      </View>
      <Text style={styles.muted}>
        {tx(
          "Use your PayPal account, or pay with a debit or credit card on PayPal's secure page. Your order is marked as paid instantly.",
          'Usa tu cuenta PayPal o paga con tarjeta de débito o crédito en la página segura de PayPal. Tu pedido se marca como pagado al instante.',
          'Use sua conta PayPal ou pague com cartão de débito ou crédito na página segura do PayPal. Seu pedido é marcado como pago na hora.',
        )}
      </Text>
      {next ? <Text style={styles.muted}>{next}</Text> : null}
      {paypalTest() ? <Text style={styles.test}>{tx('TEST MODE: PayPal sandbox, no real money.', 'MODO PRUEBA: PayPal sandbox, sin dinero real.', 'MODO TESTE: PayPal sandbox, sem dinheiro real.')}</Text> : null}
      {checking ? (
        <Text style={styles.muted}>{tx('Confirming your payment…', 'Confirmando tu pago…', 'Confirmando seu pagamento…')}</Text>
      ) : (
        <Button label={tx('Pay with PayPal', 'Pagar con PayPal', 'Pagar com PayPal')} icon="lock-closed" onPress={pay} loading={busy} />
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: 8, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  muted: { fontSize: 13, lineHeight: 19, color: colors.muted },
  test: { fontSize: 12, fontWeight: '700', color: '#B54708' },
  error: { fontSize: 13, color: '#D92D20' },
});
