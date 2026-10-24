import { Ionicons } from '@expo/vector-icons';
import { CryptoPay } from '../src/components/CryptoPay';
import { EstimateBreakdown, ServerEstimate } from '../src/components/EstimateBreakdown';
import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../src/components/Button';
import { Field, formStyles } from '../src/components/Field';
import { Footer } from '../src/components/Footer';
import { Header } from '../src/components/Header';
import { useLang } from '../src/i18n';
import { formatDate, formatMoney, OrderStatus, statusColor, statusLabel, stepIndex, steps } from '../src/lib/status';
import { friendlyError, supabase } from '../src/lib/supabase';
import { colors, shadow, waLink } from '../src/theme';

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

type Method = { id: string; name: string; kind: string; details_es: string; details_en: string };

export default function TrackPage() {
  const { t: token, new: isNew } = useLocalSearchParams<{ t?: string; new?: string }>();
  const { t, lang } = useLang();
  const es = lang === 'es';
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [methods, setMethods] = useState<Method[]>([]);
  const [method, setMethod] = useState('');
  const [reference, setReference] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

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
    supabase
      .from('payment_methods')
      .select('id,name,kind,details_es,details_en')
      .eq('active', true)
      .order('sort')
      .then(({ data }) => setMethods((data as Method[]) ?? []));
  }, [load]);

  const accept = async () => {
    setActionError('');
    setBusy(true);
    const { error: err } = await supabase.rpc('accept_quote', { p_token: token });
    setBusy(false);
    if (err) return setActionError(friendlyError(err, lang));
    load();
  };

  const pay = async () => {
    setActionError('');
    if (!method) return setActionError(es ? 'Elige el método de pago.' : 'Choose the payment method.');
    setBusy(true);
    const { error: err } = await supabase.rpc('submit_payment', { p_token: token, p_method: method, p_reference: reference });
    setBusy(false);
    if (err) return setActionError(friendlyError(err, lang));
    setReference('');
    load();
  };

  const help = () =>
    Linking.openURL(
      waLink(es ? `Hola, tengo una pregunta sobre mi pedido ${order?.order_number ?? ''}.` : `Hi, I have a question about my order ${order?.order_number ?? ''}.`),
    );

  const body = () => {
    if (loading) return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />;
    if (!token || (!order && !error))
      return (
        <View style={[styles.card, shadow, { alignItems: 'center' }]}>
          <Ionicons name="search" size={32} color={colors.primary} />
          <Text style={styles.h2}>{es ? 'Pedido no encontrado' : 'Order not found'}</Text>
          <Text style={styles.muted}>
            {es ? 'Usa el enlace que te enviamos por correo.' : 'Use the link we sent you by email.'}
          </Text>
        </View>
      );
    if (error || !order) return <Text style={formStyles.error}>{error}</Text>;

    const idx = stepIndex(order.status);
    const sc = statusColor[order.status];
    const product = es ? order.product_name_es : order.product_name_en;

    return (
      <View style={{ gap: 16 }}>
        {isNew ? (
          <View style={[formStyles.success as object, { flexDirection: 'row', gap: 10, alignItems: 'center' }]}>
            <Ionicons name="checkmark-circle" size={22} color="#067647" />
            <Text style={{ color: '#067647', flex: 1, fontSize: 14 }}>
              {es
                ? 'Solicitud enviada. Guarda esta página: aquí verás tu cotización. También te enviaremos el enlace por correo.'
                : 'Request sent. Save this page: your quote will appear here. We will also email you the link.'}
            </Text>
          </View>
        ) : null}

        <View style={[styles.card, shadow]}>
          <View style={styles.headRow}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.muted}>{es ? 'Pedido' : 'Order'}</Text>
              <Text style={styles.orderNo}>{order.order_number}</Text>
              <Text style={styles.muted}>
                {product ?? (es ? 'Sistema a medida' : 'Custom system')} · {formatDate(order.created_at, lang)}
              </Text>
            </View>
            <View style={[styles.pill, { backgroundColor: sc.bg }]}>
              <Text style={[styles.pillText, { color: sc.fg }]}>{t(statusLabel[order.status])}</Text>
            </View>
          </View>

          {order.status !== 'cancelled' && (
            <View style={styles.steps}>
              {steps.map((s, i) => {
                const done = i <= idx;
                return (
                  <View key={s} style={styles.step}>
                    <View style={[styles.dot, done && styles.dotDone]}>
                      {done ? <Ionicons name="checkmark" size={14} color="#fff" /> : <Text style={styles.dotNum}>{i + 1}</Text>}
                    </View>
                    <Text style={[styles.stepText, done && { color: colors.text, fontWeight: '700' }]}>{t(statusLabel[s])}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {order.estimate && (order.status === 'new' || order.quote_amount == null) ? (
          <View style={[styles.card, shadow]}>
            <Text style={styles.h2}>{es ? 'Tu plan' : 'Your plan'}</Text>
            <EstimateBreakdown est={order.estimate} lang={lang} />
            <Text style={styles.muted}>
              {es ? 'Revisaremos tu solicitud y te enviaremos la cotización final.' : 'We will review your request and send you the final quote.'}
            </Text>
          </View>
        ) : null}

        {order.quote_amount != null && order.status !== 'new' && (
          <View style={[styles.card, shadow]}>
            <Text style={styles.h2}>{es ? 'Tu cotización' : 'Your quote'}</Text>
            <Text style={styles.amount}>{formatMoney(order.quote_amount, order.quote_currency)}</Text>
            {order.quote_valid_until ? (
              <Text style={styles.muted}>
                {es ? 'Válida hasta' : 'Valid until'} {formatDate(order.quote_valid_until, lang)}
              </Text>
            ) : null}
            {order.quote_notes ? <Text style={styles.notes}>{order.quote_notes}</Text> : null}
            {order.status === 'quoted' && (
              <Button label={es ? 'Aceptar cotización' : 'Accept quote'} icon="checkmark-circle" onPress={accept} loading={busy} />
            )}
          </View>
        )}

        {(order.status === 'accepted' || order.status === 'payment_submitted') && (
          <View style={[styles.card, shadow]}>
            <Text style={styles.h2}>{es ? 'Pago' : 'Payment'}</Text>
            {order.status === 'accepted' || String(order.payment_method ?? '').startsWith('crypto:') ? (
              <CryptoPay token={String(token)} lang={lang} onChanged={load} />
            ) : null}
            {String(order.payment_method ?? '').startsWith('crypto:') && order.status === 'payment_submitted' ? null : (
            <>
            {order.status === 'payment_submitted' ? (
              <Text style={formStyles.success}>
                {es
                  ? `Recibimos tu reporte de pago (${order.payment_method ?? ''}). Lo estamos verificando.`
                  : `We received your payment report (${order.payment_method ?? ''}). We are verifying it.`}
              </Text>
            ) : null}
            {order.status === 'accepted' ? (
              <View style={styles.orRow}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>{es ? 'o paga de otra forma' : 'or pay another way'}</Text>
                <View style={styles.orLine} />
              </View>
            ) : null}
            <Text style={styles.muted}>{es ? 'Elige cómo vas a pagar y luego reporta tu pago:' : 'Choose how you will pay, then report your payment:'}</Text>
            <View style={{ gap: 8 }}>
              {methods.map((m) => {
                const on = method === m.name;
                return (
                  <Pressable key={m.id} onPress={() => setMethod(m.name)} style={[styles.method, on && styles.methodOn]} accessibilityRole="radio" accessibilityState={{ checked: on }}>
                    <Ionicons name={on ? 'radio-button-on' : 'radio-button-off'} size={20} color={on ? colors.primary : colors.muted} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={styles.methodName}>{m.name}</Text>
                      <Text style={styles.muted}>{es ? m.details_es : m.details_en}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <Field
              label={es ? 'Referencia o número de confirmación' : 'Reference or confirmation number'}
              value={reference}
              onChangeText={setReference}
            />
            <Button label={es ? 'Reportar pago' : 'Report payment'} icon="cash" onPress={pay} loading={busy} variant="secondary" />
            </>
            )}
          </View>
        )}

        {actionError ? <Text style={formStyles.error}>{actionError}</Text> : null}

        {order.events.length > 0 && (
          <View style={[styles.card, shadow]}>
            <Text style={styles.h2}>{es ? 'Historial' : 'History'}</Text>
            {order.events
              .slice()
              .reverse()
              .map((e, i) => (
                <View key={i} style={styles.event}>
                  <View style={styles.eventDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eventTitle}>{statusLabel[e.kind as OrderStatus] ? t(statusLabel[e.kind as OrderStatus]) : e.kind}</Text>
                    {e.message ? <Text style={styles.muted}>{e.message}</Text> : null}
                    <Text style={styles.eventDate}>{formatDate(e.at, lang)}</Text>
                  </View>
                </View>
              ))}
          </View>
        )}

        <Button label={es ? '¿Preguntas? Escríbenos por WhatsApp' : 'Questions? Message us on WhatsApp'} icon="logo-whatsapp" variant="secondary" onPress={help} />
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Head>
        <title>{es ? 'Mi pedido · Sylkit' : 'My order · Sylkit'}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Header />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>{body()}</View>
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 24 },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, gap: 12, borderWidth: 1, borderColor: colors.border },
  headRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' },
  orderNo: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  h2: { fontSize: 20, fontWeight: '800', color: colors.text },
  muted: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  pillText: { fontSize: 13, fontWeight: '800' },
  steps: { gap: 10, marginTop: 8 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.bg, borderWidth: 1, borderColor: '#D5DCEA', alignItems: 'center', justifyContent: 'center' },
  dotDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  dotNum: { fontSize: 12, color: colors.muted, fontWeight: '700' },
  stepText: { fontSize: 15, color: colors.muted },
  amount: { fontSize: 34, fontWeight: '800', color: colors.primary },
  notes: { fontSize: 15, lineHeight: 22, color: colors.text, backgroundColor: colors.bg, padding: 14, borderRadius: 12 },
  method: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#D5DCEA', alignItems: 'flex-start' },
  methodOn: { borderColor: colors.primary, backgroundColor: colors.softBlue },
  methodName: { fontSize: 15, fontWeight: '800', color: colors.text },
  event: { flexDirection: 'row', gap: 12 },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  orLine: { flex: 1, height: 1, backgroundColor: colors.border },
  orText: { fontSize: 12, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  eventDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.cyan, marginTop: 5 },
  eventTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  eventDate: { fontSize: 12, color: colors.muted },
});
