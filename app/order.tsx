import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../src/components/Button';
import { CardPay, ManageCard } from '../src/components/CardPay';
import { CheckoutFooter, CheckoutHeader } from '../src/components/CheckoutHeader';
import { PayRow } from '../src/components/CheckoutFlow';
import { CryptoPay } from '../src/components/CryptoPay';
import { EstimateBreakdown, ServerEstimate } from '../src/components/EstimateBreakdown';
import { Field, formStyles } from '../src/components/Field';
import { useLang } from '../src/i18n';
import { PayOption, payTitle, usePayOptions } from '../src/lib/payOptions';
import { formatDate, formatMoney, OrderStatus, statusLabel } from '../src/lib/status';
import { friendlyError, supabase } from '../src/lib/supabase';
import { colors, shadow, waLink } from '../src/theme';

// The order page: where the client lands after checkout, after paying, and from the email link.
// Top to bottom: what is happening now → how to pay (only the method they chose) → what happens next
// → order summary with the invoice → activity. Old /track links show this same page.

type Order = {
  order_number: string;
  status: OrderStatus;
  request_type: string;
  customer_name: string;
  details: string | null;
  product_name_es: string | null;
  product_name_en: string | null;
  quote_amount: number | null;
  quote_currency: string;
  quote_notes: string | null;
  quote_valid_until: string | null;
  payment_method: string | null;
  created_at: string;
  estimate: ServerEstimate | null;
  events: { kind: string; message: string | null; at: string }[];
};

const PAID: OrderStatus[] = ['paid', 'in_progress', 'delivered'];

export default function OrderPage() {
  const params = useLocalSearchParams<{ t?: string; new?: string; pay?: string; paid?: string }>();
  const { t, lang } = useLang();
  const es = lang === 'es';
  const [token, setToken] = useState(params.t ? String(params.t) : '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const options = usePayOptions();
  const [payId, setPayId] = useState(params.pay ? String(params.pay) : '');
  const [choosing, setChoosing] = useState(false);
  const [reference, setReference] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [showActivity, setShowActivity] = useState(false);
  const [lastToken, setLastToken] = useState('');

  useEffect(() => {
    if (params.t) setToken(String(params.t));
    try {
      setLastToken(localStorage.getItem('sylkit_last_order') ?? '');
    } catch {
      /* optional */
    }
  }, [params.t]);

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    const { data, error: err } = await supabase.rpc('get_order', { p_token: token });
    setLoading(false);
    if (err) return setError(friendlyError(err, lang));
    setOrder((data as Order) ?? null);
  }, [token, lang]);

  useEffect(() => {
    load();
  }, [load]);

  // A crypto payment already started on this order keeps the crypto box open.
  useEffect(() => {
    if (!payId && order && String(order.payment_method ?? '').startsWith('crypto:')) setPayId('crypto');
  }, [order, payId]);

  const accept = async () => {
    setActionError('');
    setBusy(true);
    const { error: err } = await supabase.rpc('accept_quote', { p_token: token });
    setBusy(false);
    if (err) return setActionError(friendlyError(err, lang));
    load();
  };

  const report = async (method: PayOption) => {
    setActionError('');
    if (reference.trim().length < 3) return setActionError(es ? 'Escribe la referencia del pago.' : 'Please enter the payment reference.');
    setBusy(true);
    const { error: err } = await supabase.rpc('submit_payment', { p_token: token, p_method: method.name, p_reference: reference.trim() });
    setBusy(false);
    if (err) return setActionError(friendlyError(err, lang));
    setReference('');
    load();
  };

  const help = () => Linking.openURL(waLink(es ? `Hola, tengo una pregunta sobre mi pedido ${order?.order_number ?? ''}.` : `Hi, I have a question about my order ${order?.order_number ?? ''}.`));

  const body = () => {
    if (loading) return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />;
    if (!token || (!order && !error)) {
      return (
        <View style={[styles.card, shadow, { alignItems: 'center' }]}>
          <Ionicons name="receipt-outline" size={34} color={colors.primary} />
          <Text style={styles.h2}>{es ? 'Busca tu pedido' : 'Find your order'}</Text>
          <Text style={[styles.muted, { textAlign: 'center' }]}>
            {es ? 'Abre el enlace que te enviamos por correo después de comprar.' : 'Open the link we emailed you after you ordered.'}
          </Text>
          {lastToken ? (
            <Button label={es ? 'Abrir mi último pedido' : 'Open my last order'} icon="arrow-forward" onPress={() => setToken(lastToken)} />
          ) : null}
        </View>
      );
    }
    if (error || !order) return <Text style={formStyles.error}>{error}</Text>;

    const first = (order.customer_name || '').trim().split(/\s+/)[0] || '';
    const product = (es ? order.product_name_es : order.product_name_en) ?? (es ? 'Sistema a medida' : 'Custom system');
    const amount = order.quote_amount != null ? formatMoney(order.quote_amount, order.quote_currency) : '';
    const paid = PAID.includes(order.status);
    const cardReturn = params.paid === 'card' && order.status === 'accepted';
    const payable = order.status === 'accepted' || order.status === 'payment_submitted';
    const cryptoStarted = String(order.payment_method ?? '').startsWith('crypto:');
    const chosen = options?.find((o) => o.id === payId);
    const showChooser = order.status === 'accepted' && (choosing || !chosen);

    // ---------- hero ----------
    const hero = (() => {
      if (paid)
        return {
          icon: 'checkmark-circle',
          color: '#12B76A',
          title: es ? `¡Gracias${first ? `, ${first}` : ''}! Tu pago está confirmado.` : `Thank you${first ? `, ${first}` : ''}! Your payment is confirmed.`,
          sub:
            order.status === 'delivered'
              ? es
                ? 'Tu sistema está listo. Revisa tu correo para entrar.'
                : 'Your system is ready. Check your email to sign in.'
              : order.status === 'in_progress'
                ? es
                  ? 'Estamos preparando tu sistema. Te avisamos apenas esté listo.'
                  : "We're setting up your system. We'll tell you as soon as it's ready."
                : es
                  ? 'Te escribiremos por WhatsApp o correo en menos de 24 horas para empezar la instalación.'
                  : "We'll message you on WhatsApp or email within 24 hours to start the setup.",
        };
      if (order.status === 'payment_submitted' && !cryptoStarted)
        return {
          icon: 'time',
          color: '#F79009',
          title: es ? 'Estamos verificando tu pago' : "We're checking your payment",
          sub: es ? 'Normalmente lo confirmamos en pocas horas. Te avisamos por correo.' : 'We usually confirm it within a few hours. We will email you.',
        };
      if (cardReturn)
        return { icon: 'card', color: colors.primary, title: es ? 'Confirmando tu pago…' : 'Confirming your payment…', sub: es ? 'Esto toma unos segundos.' : 'This takes a few seconds.' };
      if (payable)
        return {
          icon: 'bag-check',
          color: colors.primary,
          title: es ? `Casi listo${first ? `, ${first}` : ''}. Completa tu pago.` : `Almost done${first ? `, ${first}` : ''}. Complete your payment.`,
          sub: es ? `Tu pedido está guardado. Paga ${amount} para empezar.` : `Your order is saved. Pay ${amount} to get started.`,
        };
      if (order.status === 'quoted')
        return { icon: 'document-text', color: colors.primary, title: es ? 'Tu cotización está lista' : 'Your quote is ready', sub: es ? 'Revísala abajo y acéptala para pagar.' : 'Review it below and accept it to pay.' };
      if (order.status === 'cancelled')
        return { icon: 'close-circle', color: '#667085', title: es ? 'Este pedido fue cancelado' : 'This order was cancelled', sub: es ? 'Escríbenos si fue un error.' : 'Message us if this was a mistake.' };
      return {
        icon: 'mail-open',
        color: colors.primary,
        title: es ? 'Recibimos tu solicitud' : 'We received your request',
        sub: es ? 'Te enviaremos un precio en menos de 24 horas a tu correo.' : "We'll email you a price within 24 hours.",
      };
    })();

    return (
      <View style={{ gap: 16 }}>
        <View style={[styles.card, shadow, styles.hero]}>
          <View style={[styles.heroIcon, { backgroundColor: `${hero.color}1A` }]}>
            <Ionicons name={hero.icon as any} size={34} color={hero.color} />
          </View>
          <Text style={styles.kicker}>
            {es ? 'Pedido' : 'Order'} {order.order_number}
          </Text>
          <Text style={styles.h1}>{hero.title}</Text>
          <Text style={[styles.muted, { textAlign: 'center' }]}>{hero.sub}</Text>
        </View>

        {/* ---------- payment ---------- */}
        {payable && !(order.status === 'payment_submitted' && !cryptoStarted) ? (
          <View style={[styles.card, shadow]}>
            <View style={styles.payHead}>
              <Text style={styles.h2}>{es ? 'Pago' : 'Payment'}</Text>
              {amount ? <Text style={styles.payAmount}>{amount}</Text> : null}
            </View>

            {options === null ? <ActivityIndicator color={colors.primary} /> : null}

            {options && showChooser ? (
              <View>
                {options.map((o, i) => (
                  <PayRow
                    key={o.id}
                    option={o}
                    on={payId === o.id}
                    first={i === 0}
                    last={i === options.length - 1}
                    onPress={() => {
                      setPayId(o.id);
                      setChoosing(false);
                    }}
                  />
                ))}
              </View>
            ) : null}

            {chosen && !showChooser ? (
              <View style={{ gap: 12 }}>
                {chosen.kind === 'card' ? (
                  <CardPay token={token} lang={lang} billing={order.estimate?.billing} returned={params.paid === 'card'} onChanged={load} />
                ) : chosen.kind === 'crypto' ? (
                  <CryptoPay token={token} lang={lang} onChanged={load} />
                ) : (
                  <View style={styles.manual}>
                    <Text style={styles.manualTitle}>{payTitle(chosen, lang)}</Text>
                    <Text style={styles.manualStep}>{es ? `1. Envía exactamente ${amount} usando estos datos:` : `1. Send exactly ${amount} using these details:`}</Text>
                    {chosen.details ? <Text style={styles.manualDetails}>{t(chosen.details)}</Text> : null}
                    <Text style={styles.manualStep}>{es ? '2. Escribe la referencia o número de confirmación:' : '2. Enter the reference or confirmation number:'}</Text>
                    <Field label={es ? 'Referencia' : 'Reference'} value={reference} onChangeText={setReference} placeholder={es ? 'Ej. 0012345678' : 'e.g. 0012345678'} />
                    <Button label={es ? 'Ya pagué' : "I've paid"} icon="checkmark-circle" onPress={() => report(chosen)} loading={busy} />
                  </View>
                )}
                {order.status === 'accepted' && !cardReturn ? (
                  <Pressable onPress={() => setChoosing(true)} style={styles.switch} accessibilityRole="button">
                    <Ionicons name="swap-horizontal" size={16} color={colors.primary} />
                    <Text style={styles.switchText}>{es ? 'Usar otro método de pago' : 'Use a different payment method'}</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}

        {actionError ? <Text style={formStyles.error}>{actionError}</Text> : null}

        {/* ---------- quote to accept (custom projects) ---------- */}
        {order.status === 'quoted' && order.quote_amount != null ? (
          <View style={[styles.card, shadow]}>
            <Text style={styles.h2}>{es ? 'Tu cotización' : 'Your quote'}</Text>
            <Text style={styles.payAmount}>{amount}</Text>
            {order.quote_valid_until ? (
              <Text style={styles.muted}>
                {es ? 'Válida hasta' : 'Valid until'} {formatDate(order.quote_valid_until, lang)}
              </Text>
            ) : null}
            {order.quote_notes ? <Text style={styles.notes}>{order.quote_notes}</Text> : null}
            <Button label={es ? 'Aceptar y pagar' : 'Accept and pay'} icon="checkmark-circle" onPress={accept} loading={busy} />
          </View>
        ) : null}

        {/* ---------- what happens next ---------- */}
        {order.status !== 'cancelled' && order.status !== 'new' && order.status !== 'quoted' ? (
          <View style={[styles.card, shadow]}>
            <Text style={styles.h2}>{es ? 'Qué sigue' : "What's next"}</Text>
            <Next
              done={paid}
              active={!paid}
              title={es ? 'Pago' : 'Payment'}
              text={paid ? (es ? 'Confirmado' : 'Confirmed') : order.status === 'payment_submitted' ? (es ? 'En verificación' : 'Being checked') : es ? 'Pendiente' : 'Waiting'}
            />
            <Next
              done={order.status === 'delivered'}
              active={order.status === 'paid' || order.status === 'in_progress'}
              title={es ? 'Instalación' : 'Setup'}
              text={es ? 'Configuramos tu sistema y cargamos tus datos (24–48 h).' : 'We set up your system and load your data (24–48 h).'}
            />
            <Next
              done={order.status === 'delivered'}
              active={false}
              last
              title={es ? 'Listo para usar' : 'Ready to use'}
              text={es ? 'Te enviamos tu acceso y te enseñamos a usarlo.' : 'We send your login and show you how to use it.'}
            />
          </View>
        ) : null}

        {/* ---------- summary + invoice ---------- */}
        <View style={[styles.card, shadow]}>
          <View style={styles.sumHead}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.h2}>{es ? 'Resumen del pedido' : 'Order summary'}</Text>
              <Text style={styles.muted}>
                {product} · {formatDate(order.created_at, lang)}
              </Text>
            </View>
            <View style={[styles.pill, paid ? styles.pillPaid : styles.pillOpen]}>
              <Text style={[styles.pillText, { color: paid ? '#067647' : '#B54708' }]}>{paid ? (es ? 'Pagado' : 'Paid') : t(statusLabel[order.status])}</Text>
            </View>
          </View>
          {order.estimate ? <EstimateBreakdown est={order.estimate} lang={lang} /> : null}
          {!order.estimate && order.quote_notes && order.status !== 'quoted' ? <Text style={styles.notes}>{order.quote_notes}</Text> : null}
          {order.quote_amount != null && order.status !== 'quoted' ? (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{paid ? (es ? 'Total pagado' : 'Total paid') : es ? 'Total a pagar' : 'Total to pay'}</Text>
              <Text style={styles.total}>{amount}</Text>
            </View>
          ) : null}
          {order.quote_amount != null && order.status !== 'new' && order.status !== 'quoted' && order.status !== 'cancelled' ? (
            <View style={styles.actions}>
              <Link href={`/invoice?t=${token}`} asChild>
                <Pressable style={styles.invoiceBtn} accessibilityRole="link">
                  <Ionicons name="document-text-outline" size={18} color={colors.primary} />
                  <Text style={styles.invoiceText}>{paid ? (es ? 'Ver factura' : 'View invoice') : es ? 'Ver factura (pendiente)' : 'View invoice (unpaid)'}</Text>
                </Pressable>
              </Link>
            </View>
          ) : null}
          {paid && String(order.payment_method ?? '').startsWith('card') ? (
            <ManageCard token={token} lang={lang} subscription={order.payment_method === 'card:subscription'} />
          ) : null}
        </View>

        {/* ---------- activity ---------- */}
        {order.events.length > 0 ? (
          <View style={[styles.card, shadow]}>
            <Pressable style={styles.actHead} onPress={() => setShowActivity((v) => !v)} accessibilityRole="button" accessibilityState={{ expanded: showActivity }}>
              <Text style={[styles.h2, { flex: 1 }]}>{es ? 'Actividad' : 'Activity'}</Text>
              <Ionicons name={showActivity ? 'chevron-up' : 'chevron-down'} size={20} color={colors.muted} />
            </Pressable>
            {showActivity
              ? order.events
                  .slice()
                  .reverse()
                  .map((e, i) => (
                    <View key={i} style={styles.event}>
                      <View style={styles.eventDot} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.eventTitle}>{statusLabel[e.kind as OrderStatus] ? t(statusLabel[e.kind as OrderStatus]) : es ? 'Actualización' : 'Update'}</Text>
                        {e.message ? <Text style={styles.muted}>{e.message}</Text> : null}
                        <Text style={styles.eventDate}>{formatDate(e.at, lang)}</Text>
                      </View>
                    </View>
                  ))
              : null}
          </View>
        ) : null}

        <Button label={es ? '¿Preguntas? Escríbenos por WhatsApp' : 'Questions? Message us on WhatsApp'} icon="logo-whatsapp" variant="secondary" onPress={help} />
      </View>
    );
  };

  const step: 1 | 2 | 3 = order && PAID.includes(order.status) ? 3 : order && (order.status === 'new' || order.status === 'quoted') ? 1 : 2;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Head>
        <title>{es ? 'Mi pedido · Sylkit' : 'My order · Sylkit'}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <CheckoutHeader step={order ? step : undefined} />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>{body()}</View>
        <CheckoutFooter />
      </ScrollView>
    </View>
  );
}

function Next({ done, active, title, text, last }: { done: boolean; active: boolean; title: string; text: string; last?: boolean }) {
  return (
    <View style={styles.next}>
      <View style={{ alignItems: 'center' }}>
        <View style={[styles.nextDot, done && styles.nextDone, active && !done && styles.nextActive]}>
          {done ? <Ionicons name="checkmark" size={14} color="#fff" /> : active ? <View style={styles.nextPulse} /> : null}
        </View>
        {!last ? <View style={[styles.nextLine, done && { backgroundColor: '#12B76A' }]} /> : null}
      </View>
      <View style={{ flex: 1, paddingBottom: last ? 0 : 16, gap: 2 }}>
        <Text style={styles.nextTitle}>{title}</Text>
        <Text style={styles.muted}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 680, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 24 },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, gap: 12, borderWidth: 1, borderColor: colors.border },
  hero: { alignItems: 'center', paddingVertical: 28 },
  heroIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  kicker: { fontSize: 13, fontWeight: '800', color: colors.muted, letterSpacing: 0.4 },
  h1: { fontSize: 24, lineHeight: 30, fontWeight: '800', color: colors.text, textAlign: 'center', letterSpacing: -0.4 },
  h2: { fontSize: 19, fontWeight: '800', color: colors.text },
  muted: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  payHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 },
  payAmount: { fontSize: 24, fontWeight: '800', color: colors.primary },
  manual: { gap: 10, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#D5DCEA', backgroundColor: colors.bg },
  manualTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  manualStep: { fontSize: 14, fontWeight: '700', color: colors.text },
  manualDetails: { fontSize: 15, lineHeight: 23, color: colors.text, backgroundColor: colors.surface, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  switch: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', minHeight: 40 },
  switchText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  notes: { fontSize: 15, lineHeight: 22, color: colors.text, backgroundColor: colors.bg, padding: 14, borderRadius: 12 },
  next: { flexDirection: 'row', gap: 12 },
  nextDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#D5DCEA', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  nextDone: { backgroundColor: '#12B76A', borderColor: '#12B76A' },
  nextActive: { borderColor: colors.primary },
  nextPulse: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  nextLine: { width: 2, flex: 1, minHeight: 16, backgroundColor: '#E4E9F2', marginVertical: 2 },
  nextTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  sumHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' },
  pill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 },
  pillPaid: { backgroundColor: '#ECFDF3' },
  pillOpen: { backgroundColor: '#FFF4E5' },
  pillText: { fontSize: 13, fontWeight: '800' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  totalLabel: { fontSize: 16, fontWeight: '800', color: colors.text },
  total: { fontSize: 22, fontWeight: '800', color: colors.text },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  invoiceBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: colors.primary, borderRadius: 12, paddingHorizontal: 16, minHeight: 46 },
  invoiceText: { fontSize: 15, fontWeight: '800', color: colors.primary },
  actHead: { flexDirection: 'row', alignItems: 'center', minHeight: 32 },
  event: { flexDirection: 'row', gap: 12 },
  eventDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.cyan, marginTop: 5 },
  eventTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  eventDate: { fontSize: 12, color: colors.muted },
});
