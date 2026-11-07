import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';
import type { Lang } from '../i18n';
import { tx } from '../i18n';
import { colors } from '../theme';
import { Button } from './Button';

// Monime (Sierra Leone) on the order tracking page: Orange Money, Afrimoney, bank or Visa debit, in Leones.
// POST /api/monime/checkout sends the customer to Monime; Monime sends them back with ?paid=monime,
// and we ask POST /api/monime/confirm to check the payment with Monime (a few tries, it can take seconds).

const go = (url: string) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') window.location.assign(url);
  else Linking.openURL(url);
};

const errorText = (code: string) =>
  ({
    order_not_payable: tx('This order is not ready for payment. Accept the quote first.', 'Este pedido no está listo para pagar. Acepta la cotización primero.', 'Este pedido ainda não está pronto para pagamento. Aceite o orçamento primeiro.'),
    already_paid: tx('This order is already paid.', 'Este pedido ya está pagado.', 'Este pedido já está pago.'),
    no_quote_amount: tx('This order has no amount yet. Please contact us.', 'Este pedido todavía no tiene monto. Escríbenos.', 'Este pedido ainda não tem valor. Fale conosco.'),
    payments_not_configured: tx('Monime is not available right now. Use another method or contact us.', 'Monime no está disponible ahora. Usa otro método o escríbenos.', 'O Monime não está disponível agora. Use outro método ou fale conosco.'),
    rate_unavailable: tx('We could not get the Leone exchange rate. Try again in a minute.', 'No pudimos obtener la tasa del leone. Intenta en un minuto.', 'Não conseguimos a taxa do leone. Tente em um minuto.'),
  })[code] ?? tx('Could not complete the payment. Please try again.', 'No se pudo completar el pago. Intenta de nuevo.', 'Não foi possível concluir o pagamento. Tente de novo.');

type Billing = 'yearly' | 'monthly' | 'once' | undefined;

export function MonimePay({ token, billing, returned, onChanged }: { token: string; lang: Lang; billing: Billing; returned: boolean; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(returned);
  const [error, setError] = useState('');
  const once = useRef(false);

  // Back from Monime: confirm the payment (Monime may need a few seconds).
  useEffect(() => {
    if (!returned || once.current) return;
    once.current = true;
    (async () => {
      let status = '';
      for (let i = 0; i < 4 && status !== 'paid' && status !== 'payment_submitted'; i++) {
        if (i) await new Promise((r) => setTimeout(r, 3000));
        try {
          const r = await fetch('/api/monime/confirm', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token }) });
          const j = await r.json().catch(() => ({}));
          status = j.order_status || '';
        } catch {}
      }
      if (status !== 'paid' && status !== 'payment_submitted')
        setError(tx('We have not received the payment yet. If you paid, it will update here in a few minutes.', 'Aún no recibimos el pago. Si ya pagaste, se actualizará aquí en unos minutos.', 'Ainda não recebemos o pagamento. Se você já pagou, isso será atualizado aqui em alguns minutos.'));
      setChecking(false);
      onChanged();
    })();
  }, [returned, token, onChanged]);

  const pay = async () => {
    setError('');
    setBusy(true);
    try {
      const r = await fetch('/api/monime/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token }) });
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
      ? tx('Renewal: we send you a new payment link each year.', 'Renovación: te enviamos un nuevo enlace de pago cada año.', 'Renovação: enviamos um novo link de pagamento todo ano.')
      : billing === 'monthly'
        ? tx('Next months: we send you a new payment link each month.', 'Próximos meses: te enviamos un nuevo enlace de pago cada mes.', 'Próximos meses: enviamos um novo link de pagamento todo mês.')
        : null;

  return (
    <View style={styles.box}>
      <View style={styles.titleRow}>
        <Ionicons name="phone-portrait" size={20} color="#FF7900" />
        <Text style={styles.title}>{tx('Orange Money, Afrimoney or card', 'Orange Money, Afrimoney o tarjeta', 'Orange Money, Afrimoney ou cartão')}</Text>
      </View>
      <Text style={styles.muted}>
        {tx(
          "Pay in Leones on Monime's secure page with Orange Money, Afrimoney, your bank or a Visa debit card. Your order is marked as paid instantly.",
          'Paga en leones en la página segura de Monime con Orange Money, Afrimoney, tu banco o Visa débito. Tu pedido se marca como pagado al instante.',
          'Pague em leones na página segura do Monime com Orange Money, Afrimoney, banco ou Visa débito. Seu pedido é marcado como pago na hora.',
        )}
      </Text>
      {next ? <Text style={styles.muted}>{next}</Text> : null}
      {checking ? (
        <Text style={styles.muted}>{tx('Confirming your payment…', 'Confirmando tu pago…', 'Confirmando seu pagamento…')}</Text>
      ) : (
        <Button label={tx('Pay with Monime', 'Pagar con Monime', 'Pagar com Monime')} icon="lock-closed" onPress={pay} loading={busy} />
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
