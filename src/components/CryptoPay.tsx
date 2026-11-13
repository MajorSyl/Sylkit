import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Lang } from '../i18n';
import { colors } from '../theme';
import { Button } from './Button';
import { tx } from '../i18n';

// "Pay with crypto (USDT)" on the order tracking page.
// Talks to the Sylkit worker: POST /api/pay/create and GET /api/pay/status (polled while a payment is open).

type Payment = {
  payment_id: number;
  payment_status: string;
  pay_address: string;
  pay_amount: number;
  actually_paid: number;
  pay_currency: string;
  price_amount: number;
  price_currency: string;
  network: string | null;
  payin_extra_id: string | null;
  expiration_estimate_date: string | null;
};

const NETWORKS = [
  { id: 'usdttrc20', label: 'USDT · TRC20 (Tron)', note: { es: 'Comisión más baja. Recomendado.', en: 'Lowest fees. Recommended.', pt: "Menores taxas. Recomendado." } },
  { id: 'usdtbsc', label: 'USDT · BEP20 (BNB Chain)', note: { es: 'Binance y la mayoría de billeteras.', en: 'Binance and most wallets.', pt: "Binance e a maioria das carteiras." } },
];
const NETWORK_NAME: Record<string, string> = { usdttrc20: 'TRC20 (Tron)', usdtbsc: 'BEP20 (BNB Chain)', usdterc20: 'ERC20 (Ethereum)' };
const OPEN = ['waiting', 'confirming', 'confirmed', 'sending', 'partially_paid'];

const L = {
  title: { es: 'Pagar con cripto (USDT)', en: 'Pay with crypto (USDT)', pt: "Pagar com cripto (USDT)" },
  intro: {
    es: 'Pago automático: apenas llegue tu transferencia, tu pedido se marca como pagado.',
    en: 'Automatic: as soon as your transfer arrives, your order is marked as paid.', pt: "Automático: assim que sua transferência chegar, seu pedido é marcado como pago.",
  },
  network: { es: 'Red', en: 'Network', pt: "Rede" },
  pay: { es: 'Pagar con cripto', en: 'Pay with crypto', pt: "Pagar com cripto" },
  send: { es: 'Envía exactamente', en: 'Send exactly', pt: "Envie exatamente" },
  to: { es: 'a esta dirección', en: 'to this address', pt: "para este endereço" },
  copy: { es: 'Copiar', en: 'Copy', pt: "Copiar" },
  copied: { es: '¡Copiado!', en: 'Copied!', pt: "Copiado!" },
  memo: { es: 'Memo / Tag (obligatorio)', en: 'Memo / Tag (required)', pt: "Memo / Tag (obrigatório)" },
  warn: {
    es: 'Usa solo la red indicada. Si envías por otra red, los fondos se pueden perder.',
    en: 'Use only the network shown. Sending on another network can lose the funds.', pt: "Use só a rede indicada. Enviar por outra rede pode fazer você perder os fundos.",
  },
  expires: { es: 'La dirección vence', en: 'Address expires', pt: "O endereço expira" },
  checking: { es: 'Revisamos el estado automáticamente cada 15 segundos.', en: 'We check the status automatically every 15 seconds.', pt: "Verificamos o status automaticamente a cada 15 segundos." },
  refresh: { es: 'Revisar ahora', en: 'Check now', pt: "Verificar agora" },
  newPay: { es: 'Crear un nuevo pago', en: 'Create a new payment', pt: "Criar um novo pagamento" },
  received: { es: 'Recibido', en: 'Received', pt: "Recebido" },
};

const STEPS = [
  { key: 'waiting', es: 'Esperando tu transferencia', en: 'Waiting for your transfer', pt: "Aguardando sua transferência" },
  { key: 'confirming', es: 'Confirmando en la blockchain', en: 'Confirming on the blockchain', pt: "Confirmando na blockchain" },
  { key: 'finished', es: 'Pago confirmado', en: 'Payment confirmed', pt: "Pagamento confirmado" },
];
const stepOf = (s: string) => (s === 'finished' ? 2 : ['confirming', 'confirmed', 'sending'].includes(s) ? 1 : 0);

const errorText = (code: string, es: boolean) =>
  ({
    order_not_payable: tx('This order is not ready for payment. Accept the quote first.', 'Este pedido no está listo para pagar. Acepta la cotización primero.', "Este pedido ainda não está pronto para pagamento. Aceite o orçamento primeiro."),
    no_quote_amount: tx('This order has no amount yet. Please contact us.', 'Este pedido todavía no tiene monto. Escríbenos.', "Este pedido ainda não tem valor. Fale conosco."),
    payments_not_configured: tx('Crypto payment is not available right now. Use another method or contact us.', 'El pago con cripto no está disponible ahora. Usa otro método o escríbenos.', "O pagamento com cripto não está disponível agora. Use outro método ou fale conosco."),
    nowpayments_error: tx('The payment processor did not respond. Try again in a minute.', 'El procesador de pagos no respondió. Intenta de nuevo en un minuto.', "O processador de pagamentos não respondeu. Tente de novo em um minuto."),
  })[code] ?? (tx('Could not create the payment. Please try again.', 'No se pudo crear el pago. Intenta de nuevo.', "Não foi possível criar o pagamento. Tente de novo."));

// TRC20 has a network minimum of about $11 at our processor, so small orders (e.g. a $7 AI website) use BEP20.
const TRC20_MIN_USD = 12;

export function CryptoPay({ token, lang, amount, onChanged }: { token: string; lang: Lang; amount?: number; onChanged: () => void }) {
  const small = amount != null && amount > 0 && amount < TRC20_MIN_USD;
  const es = lang === 'es';
  const t = (x: { es: string; en: string; pt?: string }) => (lang === 'pt' ? x.pt ?? x.es : x[lang]);
  const [network, setNetwork] = useState(small ? 'usdtbsc' : 'usdttrc20');
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const lastStatus = useRef('');

  const check = useCallback(async () => {
    try {
      const r = await fetch(`/api/pay/status?t=${encodeURIComponent(token)}`);
      const j = await r.json();
      if (!r.ok) return;
      setPayment(j.payment ?? null);
      const s = j.payment?.payment_status ?? '';
      if (s && s !== lastStatus.current) {
        if (lastStatus.current) onChanged(); // order status / history may have changed
        lastStatus.current = s;
      }
    } finally {
      setLoading(false);
    }
  }, [token, onChanged]);

  useEffect(() => {
    check();
  }, [check]);

  // Poll while a payment is open.
  useEffect(() => {
    if (!payment || !OPEN.includes(payment.payment_status)) return;
    const id = setInterval(check, 15000);
    return () => clearInterval(id);
  }, [payment, check]);

  const create = async () => {
    setError('');
    setBusy(true);
    try {
      const r = await fetch('/api/pay/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, currency: network }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) return setError(errorText(j.error, es) + (j.message ? ` (${j.message})` : ''));
      setPayment(j);
      lastStatus.current = j.payment_status;
      onChanged();
    } catch {
      setError(errorText('', es));
    } finally {
      setBusy(false);
    }
  };

  const copy = async (text: string, key: string) => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(''), 2000);
    } catch {
      /* the text is selectable anyway */
    }
  };

  if (loading) return <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />;

  const status = payment?.payment_status ?? '';
  const open = payment && OPEN.includes(status);
  const done = status === 'finished';
  const ended = payment && ['expired', 'failed', 'refunded'].includes(status);
  const currency = String(payment?.pay_currency ?? network).toUpperCase().replace(/(TRC20|BSC|ERC20)$/, '');

  return (
    <View style={styles.box}>
      <View style={styles.head}>
        <View style={styles.coin}>
          <Text style={styles.coinText}>₮</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{t(L.title)}</Text>
          <Text style={styles.muted}>{t(L.intro)}</Text>
        </View>
      </View>

      {!payment || ended ? (
        <>
          {ended ? (
            <Text style={styles.warnBox}>
              {tx(`The previous payment ${status === 'expired' ? 'expired' : 'did not complete'}. You can create a new one.`, `El pago anterior ${status === 'expired' ? 'venció' : 'no se completó'}. Puedes crear uno nuevo.`, `O pagamento anterior ${status === 'expired' ? 'expirou' : 'não foi concluído'}. Você pode criar um novo.`)}
            </Text>
          ) : null}
          <Text style={styles.label}>{t(L.network)}</Text>
          {NETWORKS.map((n) => {
            const on = network === n.id;
            const off = small && n.id === 'usdttrc20';
            return (
              <Pressable key={n.id} onPress={() => !off && setNetwork(n.id)} disabled={off} style={[styles.net, on && styles.netOn, off && { opacity: 0.5 }]} accessibilityRole="radio" accessibilityState={{ checked: on, disabled: off }}>
                <Ionicons name={on ? 'radio-button-on' : 'radio-button-off'} size={20} color={on ? colors.primary : colors.muted} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.netName}>{n.label}</Text>
                  <Text style={styles.muted}>{off ? tx(`Minimum $${TRC20_MIN_USD} on this network. Use BEP20.`, `Mínimo $${TRC20_MIN_USD} en esta red. Usa BEP20.`, `Mínimo $${TRC20_MIN_USD} nesta rede. Use BEP20.`) : t(n.note)}</Text>
                </View>
              </Pressable>
            );
          })}
          {error ? <Text style={styles.errorBox}>{error}</Text> : null}
          <Button label={ended ? t(L.newPay) : t(L.pay)} icon="wallet" onPress={create} loading={busy} />
        </>
      ) : (
        <>
          {/* Progress */}
          <View style={styles.steps}>
            {STEPS.map((s, i) => {
              const reached = i <= stepOf(status);
              const current = i === stepOf(status) && !done;
              return (
                <View key={s.key} style={styles.step}>
                  <View style={[styles.dot, reached && styles.dotOn]}>
                    {reached && !current ? <Ionicons name="checkmark" size={14} color="#fff" /> : current ? <ActivityIndicator size="small" color="#fff" /> : null}
                  </View>
                  <Text style={[styles.stepText, reached && { color: colors.text, fontWeight: '700' }]}>{t(s)}</Text>
                </View>
              );
            })}
          </View>

          {done ? (
            <View style={styles.okBox}>
              <Ionicons name="checkmark-circle" size={22} color="#067647" />
              <Text style={styles.okText}>
                {tx(`Payment confirmed: ${payment.actually_paid || payment.pay_amount} ${currency}. Thank you! We are starting on your order.`, `Pago confirmado: ${payment.actually_paid || payment.pay_amount} ${currency}. ¡Gracias! Empezamos con tu pedido.`, `Pagamento confirmado: ${payment.actually_paid || payment.pay_amount} ${currency}. Obrigado! Já estamos começando seu pedido.`)}
              </Text>
            </View>
          ) : null}

          {open ? (
            <>
              {status === 'partially_paid' ? (
                <Text style={styles.warnBox}>
                  {tx(`We received ${payment.actually_paid} of ${payment.pay_amount} ${currency}. Send the rest (${(payment.pay_amount - payment.actually_paid).toFixed(2)} ${currency}) to the same address.`, `Recibimos ${payment.actually_paid} de ${payment.pay_amount} ${currency}. Envía el resto (${(payment.pay_amount - payment.actually_paid).toFixed(2)} ${currency}) a la misma dirección.`, `Recebemos ${payment.actually_paid} de ${payment.pay_amount} ${currency}. Envie o restante (${(payment.pay_amount - payment.actually_paid).toFixed(2)} ${currency}) para o mesmo endereço.`)}
                </Text>
              ) : null}

              {status === 'waiting' || status === 'partially_paid' ? (
                <>
                  <Text style={styles.label}>{t(L.send)}</Text>
                  <View style={styles.copyRow}>
                    <Text style={styles.amount} selectable>
                      {payment.pay_amount} <Text style={styles.amountUnit}>{currency}</Text>
                    </Text>
                    <CopyBtn label={copied === 'amount' ? t(L.copied) : t(L.copy)} onPress={() => copy(String(payment.pay_amount), 'amount')} />
                  </View>
                  <Text style={styles.muted}>
                    ≈ {payment.price_amount} {String(payment.price_currency).toUpperCase()} · {t(L.network)}: <Text style={{ fontWeight: '800', color: colors.text }}>{NETWORK_NAME[payment.pay_currency] ?? payment.network ?? payment.pay_currency}</Text>
                  </Text>

                  <Text style={styles.label}>{t(L.to)}</Text>
                  <View style={styles.addressBox}>
                    <Text style={styles.address} selectable>
                      {payment.pay_address}
                    </Text>
                    <CopyBtn label={copied === 'address' ? t(L.copied) : t(L.copy)} onPress={() => copy(payment.pay_address, 'address')} />
                  </View>
                  {payment.payin_extra_id ? (
                    <>
                      <Text style={styles.label}>{t(L.memo)}</Text>
                      <View style={styles.addressBox}>
                        <Text style={styles.address} selectable>
                          {payment.payin_extra_id}
                        </Text>
                        <CopyBtn label={copied === 'memo' ? t(L.copied) : t(L.copy)} onPress={() => copy(payment.payin_extra_id!, 'memo')} />
                      </View>
                    </>
                  ) : null}
                  <Text style={styles.warnBox}>⚠️ {t(L.warn)}</Text>
                  {payment.expiration_estimate_date ? (
                    <Text style={styles.muted}>
                      {t(L.expires)}: {new Date(payment.expiration_estimate_date).toLocaleString(tx('en-US', 'es-VE', "pt-BR"), { dateStyle: 'medium', timeStyle: 'short' })}
                    </Text>
                  ) : null}
                </>
              ) : (
                <Text style={styles.muted}>
                  {tx(`Your transfer arrived (${payment.actually_paid || payment.pay_amount} ${currency}). Waiting for network confirmations; this usually takes a few minutes.`, `Tu transferencia llegó (${payment.actually_paid || payment.pay_amount} ${currency}). Esperando las confirmaciones de la red; normalmente toma pocos minutos.`, `Sua transferência chegou (${payment.actually_paid || payment.pay_amount} ${currency}). Aguardando as confirmações da rede; isso costuma levar alguns minutos.`)}
                </Text>
              )}
              <View style={styles.footRow}>
                <Text style={[styles.muted, { flex: 1 }]}>{t(L.checking)}</Text>
                <Pressable onPress={check} accessibilityRole="button">
                  <Text style={styles.link}>{t(L.refresh)}</Text>
                </Pressable>
              </View>
            </>
          ) : null}
        </>
      )}
    </View>
  );
}

function CopyBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.copyBtn} accessibilityRole="button" accessibilityLabel={label}>
      <Ionicons name="copy-outline" size={16} color={colors.primary} />
      <Text style={styles.copyText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 1, borderColor: '#BFE6D8', backgroundColor: '#F4FBF8', borderRadius: 16, padding: 16, gap: 10 },
  head: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  coin: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#26A17B', alignItems: 'center', justifyContent: 'center' },
  coinText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  title: { fontSize: 17, fontWeight: '800', color: colors.text },
  muted: { fontSize: 13, lineHeight: 19, color: colors.muted },
  label: { fontSize: 12, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },
  net: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#D5DCEA', backgroundColor: '#fff', alignItems: 'flex-start' },
  netOn: { borderColor: colors.primary, backgroundColor: colors.softBlue },
  netName: { fontSize: 15, fontWeight: '800', color: colors.text },
  steps: { gap: 8, backgroundColor: '#fff', borderRadius: 12, padding: 12 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.bg, borderWidth: 1, borderColor: '#D5DCEA', alignItems: 'center', justifyContent: 'center' },
  dotOn: { backgroundColor: '#26A17B', borderColor: '#26A17B' },
  stepText: { fontSize: 14, color: colors.muted },
  copyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  amount: { fontSize: 30, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  amountUnit: { fontSize: 18, color: colors.muted },
  addressBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#D5DCEA', padding: 12 },
  address: { flex: 1, minWidth: 0, fontSize: 14, fontWeight: '700', color: colors.text, fontFamily: Platform.select({ web: 'ui-monospace, Menlo, Consolas, monospace', default: undefined }) } as any,
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.softBlue, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  copyText: { color: colors.primary, fontWeight: '800', fontSize: 13 },
  warnBox: { fontSize: 13, lineHeight: 19, color: '#92400E', backgroundColor: '#FEF3C7', padding: 10, borderRadius: 10 },
  errorBox: { fontSize: 14, color: '#B42318', backgroundColor: '#FEF3F2', padding: 12, borderRadius: 10 },
  okBox: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: '#ECFDF3', padding: 12, borderRadius: 12 },
  okText: { flex: 1, color: '#067647', fontSize: 14, fontWeight: '700' },
  footRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  link: { color: colors.primary, fontWeight: '800', fontSize: 13 },
});
