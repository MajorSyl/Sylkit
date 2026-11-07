import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../src/components/Button';
import { CardPay, ManageCard } from '../src/components/CardPay';
import { PayPalPay } from '../src/components/PayPalPay';
import { CheckoutFooter, CheckoutHeader } from '../src/components/CheckoutHeader';
import { PayRow } from '../src/components/CheckoutFlow';
import { CryptoPay } from '../src/components/CryptoPay';
import type { ServerEstimate } from '../src/components/EstimateBreakdown';
import { Field, formStyles } from '../src/components/Field';
import { useLang } from '../src/i18n';
import { productName } from '../src/lib/names';
import { orderLines } from '../src/lib/orderLines';
import { isBolivarMethod, PayOption, payTitle, usePayOptions } from '../src/lib/payOptions';
import { money } from '../src/lib/pricing';
import { formatDate, formatMoney, OrderStatus, statusLabel } from '../src/lib/status';
import { friendlyError, supabase } from '../src/lib/supabase';
import { colors, shadow, waLink } from '../src/theme';
import { tx } from '../src/i18n';

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
  country?: string | null;
  created_at: string;
  estimate: ServerEstimate | null;
  events: { kind: string; message: string | null; at: string }[];
};

const PAID: OrderStatus[] = ['paid', 'in_progress', 'delivered'];

export default function OrderPage() {
  const params = useLocalSearchParams<{ t?: string; new?: string; pay?: string; paid?: string; token?: string }>();
  const { t, lang } = useLang();
  const es = lang === 'es';
  const [token, setToken] = useState(params.t ? String(params.t) : '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Back from PayPal/Stripe the URL has ?paid=<method> but no ?pay=, so reopen that method to confirm it.
  const [payId, setPayId] = useState(params.pay ? String(params.pay) : params.paid === 'paypal' || params.paid === 'card' ? String(params.paid) : '');
  const options = usePayOptions({ country: order?.country, keep: payId });
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
    if (reference.trim().length < 3) return setActionError(tx('Please enter the payment reference.', 'Escribe la referencia del pago.', "Digite a referência do pagamento."));
    setBusy(true);
    const { error: err } = await supabase.rpc('submit_payment', { p_token: token, p_method: method.name, p_reference: reference.trim() });
    setBusy(false);
    if (err) return setActionError(friendlyError(err, lang));
    fetch('/api/order/ping', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token, event: 'reported' }) }).catch(() => null);
    setReference('');
    load();
  };

  const help = () => Linking.openURL(waLink(tx(`Hi, I have a question about my order ${order?.order_number ?? ''}.`, `Hola, tengo una pregunta sobre mi pedido ${order?.order_number ?? ''}.`, `Olá, tenho uma pergunta sobre meu pedido ${order?.order_number ?? ''}.`)));

  const body = () => {
    if (loading) return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />;
    if (!token || (!order && !error)) {
      return (
        <View style={[styles.card, shadow, { alignItems: 'center' }]}>
          <Ionicons name="receipt-outline" size={34} color={colors.primary} />
          <Text style={styles.h2}>{tx('Find your order', 'Busca tu pedido', "Encontre seu pedido")}</Text>
          <Text style={[styles.muted, { textAlign: 'center' }]}>
            {tx('Open the link we emailed you after you ordered.', 'Abre el enlace que te enviamos por correo después de comprar.', "Abra o link que enviamos por e-mail depois da sua compra.")}
          </Text>
          {lastToken ? (
            <Button label={tx('Open my last order', 'Abrir mi último pedido', "Abrir meu último pedido")} icon="arrow-forward" onPress={() => setToken(lastToken)} />
          ) : null}
        </View>
      );
    }
    if (error || !order) return <Text style={formStyles.error}>{error}</Text>;

    const first = (order.customer_name || '').trim().split(/\s+/)[0] || '';
    const product = (order.product_name_en ? productName(order.product_name_en, order.product_name_es ?? order.product_name_en) : null) ?? (tx('Custom system', 'Sistema a medida', "Sistema sob medida"));
    const amount = order.quote_amount != null ? formatMoney(order.quote_amount, order.quote_currency) : '';
    const paid = PAID.includes(order.status);
    const cardReturn = (params.paid === 'card' || params.paid === 'paypal') && order.status === 'accepted';
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
          title: tx(`Thank you${first ? `, ${first}` : ''}! Your payment is confirmed.`, `¡Gracias${first ? `, ${first}` : ''}! Tu pago está confirmado.`, `Obrigado${first ? `, ${first}` : ''}! Seu pagamento foi confirmado.`),
          sub:
            order.status === 'delivered'
              ? tx('Your system is ready. We sent your access on WhatsApp.', 'Tu sistema está listo. Te enviamos el acceso por WhatsApp.', "Seu sistema está pronto. Enviamos o acesso pelo WhatsApp.")
              : order.status === 'in_progress'
                ? tx("We're setting up your system. We'll tell you as soon as it's ready.", 'Estamos preparando tu sistema. Te avisamos apenas esté listo.', "Estamos preparando seu sistema. Avisaremos assim que estiver pronto.")
                : tx("We're reviewing your order now. We'll message you on WhatsApp, usually the same day, with your access and next steps.", 'Estamos revisando tu pedido. Te escribimos por WhatsApp, normalmente el mismo día, con tu acceso y los siguientes pasos.', "Estamos revisando seu pedido. Escrevemos pelo WhatsApp, normalmente no mesmo dia, com seu acesso e os próximos passos."),
        };
      if (order.status === 'payment_submitted' && !cryptoStarted)
        return {
          icon: 'time',
          color: '#F79009',
          title: tx("We're checking your payment", 'Estamos verificando tu pago', "Estamos verificando seu pagamento"),
          sub: tx('We usually confirm it within a few hours (Mon–Sat, 9:00–18:00 Caracas). We will message you on WhatsApp.', 'Normalmente lo confirmamos en pocas horas (lun–sáb, 9:00–18:00 hora de Caracas). Te avisamos por WhatsApp.', "Normalmente confirmamos em poucas horas (seg–sáb, 9:00–18:00, horário de Caracas). Avisaremos pelo WhatsApp."),
        };
      if (cardReturn)
        return { icon: 'card', color: colors.primary, title: tx('Confirming your payment…', 'Confirmando tu pago…', "Confirmando seu pagamento…"), sub: tx('This takes a few seconds.', 'Esto toma unos segundos.', "Isso leva alguns segundos.") };
      if (payable)
        return {
          icon: 'bag-check',
          color: colors.primary,
          title: tx(`Almost done${first ? `, ${first}` : ''}. Complete your payment.`, `Casi listo${first ? `, ${first}` : ''}. Completa tu pago.`, `Quase pronto${first ? `, ${first}` : ''}. Conclua seu pagamento.`),
          sub: tx(`Your order is saved. Pay ${amount} to get started.`, `Tu pedido está guardado. Paga ${amount} para empezar.`, `Seu pedido está salvo. Pague ${amount} para começar.`),
        };
      if (order.status === 'quoted')
        return { icon: 'document-text', color: colors.primary, title: tx('Your quote is ready', 'Tu cotización está lista', "Seu orçamento está pronto"), sub: tx('Review it below and accept it to pay.', 'Revísala abajo y acéptala para pagar.', "Confira abaixo e aceite para pagar.") };
      if (order.status === 'cancelled')
        return { icon: 'close-circle', color: '#667085', title: tx('This order was cancelled', 'Este pedido fue cancelado', "Este pedido foi cancelado"), sub: tx('Message us if this was a mistake.', 'Escríbenos si fue un error.', "Fale conosco se foi um engano.") };
      return {
        icon: 'mail-open',
        color: colors.primary,
        title: tx('We received your request', 'Recibimos tu solicitud', "Recebemos sua solicitação"),
        sub: tx("We got your message. We'll reply on WhatsApp, usually the same day.", 'Recibimos tu mensaje. Te respondemos por WhatsApp, normalmente el mismo día.', "Recebemos sua mensagem. Respondemos pelo WhatsApp, normalmente no mesmo dia."),
      };
    })();

    return (
      <View style={{ gap: 16 }}>
        <View style={[styles.card, shadow, styles.hero]}>
          <View style={[styles.heroIcon, { backgroundColor: `${hero.color}1A` }]}>
            <Ionicons name={hero.icon as any} size={34} color={hero.color} />
          </View>
          <Text style={styles.kicker}>
            {tx('Order', 'Pedido', "Pedido")} {order.order_number}
          </Text>
          <Text style={styles.h1}>{hero.title}</Text>
          <Text style={[styles.muted, { textAlign: 'center' }]}>{hero.sub}</Text>
          {!payable || order.status === 'payment_submitted' ? (
            <Pressable onPress={help} style={styles.heroWa} accessibilityRole="link">
              <Ionicons name="logo-whatsapp" size={18} color="#fff" />
              <Text style={styles.heroWaText}>{tx('Chat with us about this order', 'Escríbenos sobre este pedido', 'Fale com a gente sobre este pedido')}</Text>
            </Pressable>
          ) : null}
        </View>

        {/* ---------- payment ---------- */}
        {payable && !(order.status === 'payment_submitted' && !cryptoStarted) ? (
          <View style={[styles.card, shadow]}>
            <View style={styles.payHead}>
              <Text style={styles.h2}>{tx('Payment', 'Pago', "Pagamento")}</Text>
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
                {chosen.kind === 'paypal' ? (
                  <PayPalPay token={token} lang={lang} billing={order.estimate?.billing} returned={params.paid === 'paypal'} paypalOrder={params.token ? String(params.token) : undefined} onChanged={load} />
                ) : chosen.kind === 'card' ? (
                  <CardPay token={token} lang={lang} billing={order.estimate?.billing} returned={params.paid === 'card'} onChanged={load} />
                ) : chosen.kind === 'crypto' ? (
                  <CryptoPay token={token} lang={lang} onChanged={load} />
                ) : (
                  <View style={styles.manual}>
                    <Text style={styles.manualTitle}>{payTitle(chosen, lang)}</Text>
                    {isBolivarMethod(chosen) && (order.quote_currency || 'USD') === 'USD' && order.quote_amount != null ? (
                      <BolivarAmount usd={Number(order.quote_amount)} amount={amount} />
                    ) : (
                      <Text style={styles.manualStep}>{tx(`1. Send exactly ${amount} using these details:`, `1. Envía exactamente ${amount} usando estos datos:`, `1. Envie exatamente ${amount} usando estes dados:`)}</Text>
                    )}
                    {chosen.details ? <Text style={styles.manualDetails} selectable>{t(chosen.details)}</Text> : null}
                    {chosen.details ? <CopyButton text={t(chosen.details)} /> : null}
                    <Text style={styles.manualStep}>{tx('2. Enter the reference or confirmation number:', '2. Escribe la referencia o número de confirmación:', "2. Digite a referência ou número de confirmação:")}</Text>
                    <Field label={tx('Reference', 'Referencia', "Referência")} value={reference} onChangeText={setReference} placeholder={tx('e.g. 0012345678', 'Ej. 0012345678', "ex.: 0012345678")} />
                    <Button label={tx("I've paid", 'Ya pagué', "Já paguei")} icon="checkmark-circle" onPress={() => report(chosen)} loading={busy} />
                  </View>
                )}
                {order.status === 'accepted' && !cardReturn ? (
                  <Pressable onPress={() => setChoosing(true)} style={styles.switch} accessibilityRole="button">
                    <Ionicons name="swap-horizontal" size={16} color={colors.primary} />
                    <Text style={styles.switchText}>{tx('Use a different payment method', 'Usar otro método de pago', "Usar outra forma de pagamento")}</Text>
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
            <Text style={styles.h2}>{tx('Your quote', 'Tu cotización', "Seu orçamento")}</Text>
            <Text style={styles.payAmount}>{amount}</Text>
            {order.quote_valid_until ? (
              <Text style={styles.muted}>
                {tx('Valid until', 'Válida hasta', "Válido até")} {formatDate(order.quote_valid_until, lang)}
              </Text>
            ) : null}
            {order.quote_notes ? <Text style={styles.notes}>{order.quote_notes}</Text> : null}
            <Button label={tx('Accept and pay', 'Aceptar y pagar', "Aceitar e pagar")} icon="checkmark-circle" onPress={accept} loading={busy} />
          </View>
        ) : null}

        {/* ---------- what happens next ---------- */}
        {order.status !== 'cancelled' && order.status !== 'new' && order.status !== 'quoted' ? (
          <View style={[styles.card, shadow]}>
            <Text style={styles.h2}>{tx("What's next", 'Qué sigue', "Próximos passos")}</Text>
            <Next
              done={paid}
              active={!paid}
              title={tx('Payment', 'Pago', "Pagamento")}
              text={paid ? (tx('Confirmed', 'Confirmado', "Confirmado")) : order.status === 'payment_submitted' ? (tx('Being checked', 'En verificación', "Em verificação")) : tx('Waiting', 'Pendiente', "Pendente")}
            />
            <Next
              done={order.status === 'delivered'}
              active={order.status === 'paid' || order.status === 'in_progress'}
              title={tx('Setup', 'Instalación', "Instalação")}
              text={tx('We set up your system and load your data (24–48 h).', 'Configuramos tu sistema y cargamos tus datos (24–48 h).', "Configuramos seu sistema e carregamos seus dados (24–48 h).")}
            />
            <Next
              done={order.status === 'delivered'}
              active={false}
              last
              title={tx('Ready to use', 'Listo para usar', "Pronto para usar")}
              text={tx('We send your login and show you how to use it.', 'Te enviamos tu acceso y te enseñamos a usarlo.', "Enviamos seu acesso e mostramos como usar.")}
            />
          </View>
        ) : null}

        {/* ---------- summary + invoice ---------- */}
        <View style={[styles.card, shadow]}>
          <View style={styles.sumHead}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.h2}>{tx('Order summary', 'Resumen del pedido', "Resumo do pedido")}</Text>
              <Text style={styles.muted}>
                {product} · {formatDate(order.created_at, lang)}
              </Text>
            </View>
            <View style={[styles.pill, paid ? styles.pillPaid : styles.pillOpen]}>
              <Text style={[styles.pillText, { color: paid ? '#067647' : '#B54708' }]}>
                {paid
                  ? tx('Paid', 'Pagado', "Pago")
                  : order.status === 'accepted'
                    ? tx('Awaiting payment', 'Pendiente de pago', "Aguardando pagamento")
                    : t(statusLabel[order.status])}
              </Text>
            </View>
          </View>
          {order.quote_amount != null && order.status !== 'quoted'
            ? orderLines({ estimate: order.estimate, amount: order.quote_amount, notes: order.quote_notes, product: order.product_name_en ? { en: order.product_name_en, es: order.product_name_es ?? order.product_name_en, pt: productName(order.product_name_en, order.product_name_es ?? order.product_name_en, 'pt') } : null }, es).map((l, i) => (
                <View key={i} style={styles.lineRow}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.lineLabel}>{l.label}</Text>
                    {l.sub ? <Text style={styles.muted}>{l.sub}</Text> : null}
                  </View>
                  <Text style={styles.lineAmount}>{money(l.amount)}</Text>
                </View>
              ))
            : order.estimate
              ? <Text style={styles.muted}>{tx("We'll review your request and send you the final price.", 'Revisaremos tu solicitud y te enviaremos el precio final.', "Vamos analisar sua solicitação e enviar o preço final.")}</Text>
              : null}
          {order.quote_amount != null && order.status !== 'quoted' ? (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{paid ? (tx('Total paid', 'Total pagado', "Total pago")) : tx('Total to pay', 'Total a pagar', "Total a pagar")}</Text>
              <Text style={styles.total}>{amount}</Text>
            </View>
          ) : null}
          {order.quote_amount != null && order.status !== 'new' && order.status !== 'quoted' && order.status !== 'cancelled' ? (
            <View style={styles.actions}>
              <Link href={`/invoice?t=${token}`} asChild>
                <Pressable style={styles.invoiceBtn} accessibilityRole="link">
                  <Ionicons name="document-text-outline" size={18} color={colors.primary} />
                  <Text style={styles.invoiceText}>{paid ? (tx('View invoice', 'Ver factura', "Ver fatura")) : tx('View invoice (unpaid)', 'Ver factura (pendiente)', "Ver fatura (pendente)")}</Text>
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
              <Text style={[styles.h2, { flex: 1 }]}>{tx('Activity', 'Actividad', "Atividade")}</Text>
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
                        <Text style={styles.eventTitle}>{statusLabel[e.kind as OrderStatus] ? t(statusLabel[e.kind as OrderStatus]) : tx('Update', 'Actualización', "Atualização")}</Text>
                        {e.message ? <Text style={styles.muted}>{e.message}</Text> : null}
                        <Text style={styles.eventDate}>{formatDate(e.at, lang)}</Text>
                      </View>
                    </View>
                  ))
              : null}
          </View>
        ) : null}

        <Button label={tx('Questions? Message us on WhatsApp', '¿Preguntas? Escríbenos por WhatsApp', "Dúvidas? Fale conosco no WhatsApp")} icon="logo-whatsapp" variant="secondary" onPress={help} />
      </View>
    );
  };

  const step: 1 | 2 | 3 = order && PAID.includes(order.status) ? 3 : order && (order.status === 'new' || order.status === 'quoted') ? 1 : 2;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Head>
        <title>{tx('My order · Sylkit', 'Mi pedido · Sylkit', "Meu pedido · Sylkit")}</title>
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


// Amount in bolívares at today's official BCV rate (Pago Móvil and bank transfers in Venezuela).
function BolivarAmount({ usd, amount }: { usd: number; amount: string }) {
  const [rate, setRate] = useState<{ rate: number; date: string | null } | null | undefined>(undefined);
  useEffect(() => {
    fetch('/api/order/bcv')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setRate(j && j.rate ? j : null))
      .catch(() => setRate(null));
  }, []);
  const bs = (n: number) => 'Bs. ' + n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (rate === undefined) return <Text style={styles.manualStep}>{tx('1. Getting today\'s BCV rate…', '1. Consultando la tasa BCV de hoy…', '1. Consultando a taxa BCV de hoje…')}</Text>;
  if (!rate)
    return (
      <Text style={styles.manualStep}>
        {tx(`1. Send ${amount} in bolívares at today's official BCV rate, using these details:`, `1. Envía ${amount} en bolívares a la tasa oficial BCV del día, usando estos datos:`, `1. Envie ${amount} em bolívares à taxa oficial BCV do dia, usando estes dados:`)}
      </Text>
    );
  const total = Math.round(usd * rate.rate * 100) / 100;
  return (
    <View style={{ gap: 4 }}>
      <Text style={styles.manualStep}>{tx('1. Send exactly this amount using these details:', '1. Envía exactamente este monto usando estos datos:', '1. Envie exatamente este valor usando estes dados:')}</Text>
      <Text style={styles.bsAmount} selectable>{bs(total)}</Text>
      <Text style={styles.bsNote}>
        {tx(`${amount} at the BCV rate of ${bs(rate.rate)} per dollar. If the rate changes before you pay, use the rate of the day you pay.`, `${amount} a la tasa BCV de ${bs(rate.rate)} por dólar. Si la tasa cambia antes de pagar, usa la del día en que pagues.`, `${amount} à taxa BCV de ${bs(rate.rate)} por dólar. Se a taxa mudar antes de pagar, use a do dia do pagamento.`)}
      </Text>
    </View>
  );
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      /* the details stay selectable */
    }
  };
  if (typeof navigator === 'undefined' || !navigator.clipboard) return null;
  return (
    <Pressable onPress={copy} style={styles.switch} accessibilityRole="button">
      <Ionicons name={done ? 'checkmark' : 'copy-outline'} size={16} color={colors.primary} />
      <Text style={styles.switchText}>{done ? tx('Copied', 'Copiado', 'Copiado') : tx('Copy payment details', 'Copiar datos de pago', 'Copiar dados de pagamento')}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heroWa: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.whatsapp, borderRadius: 999, paddingHorizontal: 18, height: 44, marginTop: 6 },
  heroWaText: { color: '#fff', fontSize: 15, fontWeight: '800' },
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
  bsAmount: { fontSize: 26, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  bsNote: { fontSize: 13, lineHeight: 19, color: colors.muted },
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
  lineRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  lineLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
  lineAmount: { fontSize: 15, fontWeight: '700', color: colors.text },
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
