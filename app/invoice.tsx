import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ServerEstimate } from '../src/components/EstimateBreakdown';
import { Logo } from '../src/components/Logo';
import { useLang } from '../src/i18n';
import { money } from '../src/lib/pricing';
import { colors } from '../src/theme';

// Printable invoice for an order, opened from the order page (/invoice?t=<token>).
// "Print / Save as PDF" uses the browser's print dialog; the toolbar is hidden on paper.
// Card payments also link Stripe's official invoice PDF when there is one.

type Invoice = {
  order_number: string;
  status: string;
  created_at: string;
  paid: boolean;
  paid_at: string | null;
  customer: { name: string; business: string | null; email: string; whatsapp: string | null; country: string | null };
  product: { en: string; es: string } | null;
  estimate: ServerEstimate | null;
  amount: number | null;
  currency: string;
  notes: string | null;
  payment_method: string | null;
  stripe: { number: string | null; pdf: string | null; url: string | null } | null;
};

type Line = { label: string; sub?: string; amount: number };

const PRINT_CSS = `
@page { margin: 14mm; }
@media print {
  html, body, #root, #root > div, #invoice-scroll, #invoice-scroll > div { height: auto !important; overflow: visible !important; }
  #invoice-toolbar, #invoice-back { display: none !important; }
  body { background: #fff !important; }
  #invoice-paper { box-shadow: none !important; border: none !important; }
}`;

function methodName(m: string | null, es: boolean) {
  const v = String(m ?? '');
  if (v.startsWith('card')) return es ? 'Tarjeta (Stripe)' : 'Card (Stripe)';
  if (v.startsWith('crypto:')) return `Crypto (${v.slice(7).toUpperCase()})`;
  return v || '—';
}

function buildLines(inv: Invoice, es: boolean): Line[] {
  const product = inv.product ? (es ? inv.product.es : inv.product.en) : es ? 'Proyecto a medida' : 'Custom project';
  const est = inv.estimate;
  const total = Number(inv.amount ?? 0);
  if (!est) return [{ label: product, sub: inv.notes ?? undefined, amount: total }];
  const plan = est.plan_name?.[es ? 'es' : 'en'] ?? '';
  const name = (l: ServerEstimate['lines'][number]) => `${es ? l.name_es : l.name_en}${l.qty > 1 ? ` ×${l.qty}` : ''}`;
  const lines: Line[] = [];
  if (est.billing === 'once') {
    const monthlyExtras = est.lines.filter((l) => l.kind === 'monthly').map(name);
    lines.push({
      label: `${product} · ${es ? 'Plan' : 'Plan'} ${plan}`,
      sub: `${es ? 'Licencia de pago único, incluye 12 meses de soporte' : 'One-time license, includes 12 months of support'}${monthlyExtras.length ? ` · ${es ? 'incluye' : 'includes'}: ${monthlyExtras.join(', ')}` : ''}`,
      amount: Number(est.license ?? 0),
    });
  } else {
    const months = est.billing === 'yearly' ? 10 : 1;
    const period = est.billing === 'yearly' ? (es ? 'Suscripción anual (12 meses, 2 gratis)' : 'Yearly subscription (12 months, 2 free)') : es ? 'Suscripción mensual' : 'Monthly subscription';
    lines.push({ label: `${product} · ${es ? 'Plan' : 'Plan'} ${plan}`, sub: period, amount: Number(est.plan_monthly) * months });
    for (const l of est.lines.filter((x) => x.kind === 'monthly')) lines.push({ label: name(l), sub: period, amount: Number(l.total) * months });
  }
  if (Number(est.plan_setup) > 0) lines.push({ label: es ? 'Instalación y configuración' : 'Setup and configuration', sub: es ? 'Pago único' : 'One-time', amount: Number(est.plan_setup) });
  for (const l of est.lines.filter((x) => x.kind === 'one_time')) lines.push({ label: name(l), sub: es ? 'Pago único' : 'One-time', amount: Number(l.total) });
  const sum = lines.reduce((a, l) => a + l.amount, 0);
  // If the final price was adjusted by hand, show one honest line with the real total.
  if (Math.abs(sum - total) > 0.01) return [{ label: `${product} · ${es ? 'Plan' : 'Plan'} ${plan}`, sub: inv.notes ?? undefined, amount: total }];
  return lines;
}

export default function InvoicePage() {
  const { t: token } = useLocalSearchParams<{ t?: string }>();
  const { lang } = useLang();
  const es = lang === 'es';
  const [inv, setInv] = useState<Invoice | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    if (document.getElementById('invoice-print-css')) return;
    const style = document.createElement('style');
    style.id = 'invoice-print-css';
    style.textContent = PRINT_CSS;
    document.head.appendChild(style);
  }, []);

  useEffect(() => {
    if (!token) return setError(es ? 'Falta el enlace del pedido.' : 'The order link is missing.');
    fetch(`/api/order/invoice?t=${encodeURIComponent(String(token))}`)
      .then(async (r) => {
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || 'error');
        setInv(j as Invoice);
      })
      .catch(() => setError(es ? 'No pudimos cargar la factura. Intenta de nuevo o escríbenos.' : "We couldn't load the invoice. Try again or message us."));
  }, [token, es]);

  const date = (iso: string | null | undefined) =>
    iso ? new Date(iso).toLocaleDateString(es ? 'es' : 'en', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

  const body = () => {
    if (error) return <Text style={styles.error}>{error}</Text>;
    if (!inv) return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />;
    const lines = buildLines(inv, es);
    const total = Number(inv.amount ?? lines.reduce((a, l) => a + l.amount, 0));
    const cur = inv.currency || 'USD';
    const c = inv.customer;
    return (
      <View nativeID="invoice-paper" style={styles.paper}>
        <View style={styles.top}>
          <View style={{ gap: 6 }}>
            <Logo size={30} />
            <Text style={styles.small}>sylkit.com · billing@sylkit.com</Text>
            <Text style={styles.small}>WhatsApp +1 (646) 934-8752</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <Text style={styles.title}>{es ? 'FACTURA' : 'INVOICE'}</Text>
            <Text style={styles.small}>
              {es ? 'N.º' : 'No.'} {inv.order_number}
            </Text>
            <View style={[styles.stamp, inv.paid ? styles.stampPaid : styles.stampDue]}>
              <Text style={[styles.stampText, { color: inv.paid ? '#067647' : '#B54708' }]}>{inv.paid ? (es ? 'PAGADA' : 'PAID') : es ? 'PENDIENTE' : 'UNPAID'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.meta}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>{es ? 'Facturado a' : 'Billed to'}</Text>
            <Text style={styles.metaStrong}>{c.business || c.name}</Text>
            {c.business ? <Text style={styles.metaText}>{c.name}</Text> : null}
            <Text style={styles.metaText}>{c.email}</Text>
            {c.whatsapp ? <Text style={styles.metaText}>{c.whatsapp}</Text> : null}
            {c.country ? <Text style={styles.metaText}>{c.country}</Text> : null}
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>{es ? 'Fecha de emisión' : 'Issue date'}</Text>
            <Text style={styles.metaText}>{date(inv.created_at)}</Text>
            <Text style={[styles.metaLabel, { marginTop: 10 }]}>{inv.paid ? (es ? 'Fecha de pago' : 'Payment date') : es ? 'Estado' : 'Status'}</Text>
            <Text style={styles.metaText}>{inv.paid ? date(inv.paid_at ?? inv.created_at) : es ? 'Pendiente de pago' : 'Awaiting payment'}</Text>
            {inv.paid ? (
              <>
                <Text style={[styles.metaLabel, { marginTop: 10 }]}>{es ? 'Método de pago' : 'Payment method'}</Text>
                <Text style={styles.metaText}>{methodName(inv.payment_method, es)}</Text>
              </>
            ) : null}
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.tr, styles.th]}>
            <Text style={[styles.thText, { flex: 1 }]}>{es ? 'Descripción' : 'Description'}</Text>
            <Text style={[styles.thText, styles.amountCol]}>{es ? 'Importe' : 'Amount'}</Text>
          </View>
          {lines.map((l, i) => (
            <View key={i} style={styles.tr}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.tdLabel}>{l.label}</Text>
                {l.sub ? <Text style={styles.tdSub}>{l.sub}</Text> : null}
              </View>
              <Text style={[styles.tdAmount, styles.amountCol]}>{money(l.amount)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{inv.paid ? (es ? 'Total pagado' : 'Total paid') : es ? 'Total a pagar' : 'Total due'}</Text>
            <Text style={styles.totalValue}>
              {cur} {money(total)}
            </Text>
          </View>
        </View>

        <Text style={styles.thanks}>
          {inv.paid
            ? es
              ? '¡Gracias por tu compra! Si tienes preguntas sobre esta factura, escríbenos a billing@sylkit.com.'
              : 'Thank you for your business! Questions about this invoice? Email billing@sylkit.com.'
            : es
              ? `Paga desde la página de tu pedido. Referencia: ${inv.order_number}.`
              : `Pay from your order page. Reference: ${inv.order_number}.`}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Head>
        <title>{inv ? `${es ? 'Factura' : 'Invoice'} ${inv.order_number} · Sylkit` : es ? 'Factura · Sylkit' : 'Invoice · Sylkit'}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <ScrollView nativeID="invoice-scroll" contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <View nativeID="invoice-toolbar" style={styles.toolbar}>
            <Link href={token ? `/order?t=${token}` : '/order'} asChild>
              <Pressable style={styles.back} accessibilityRole="link">
                <Ionicons name="arrow-back" size={16} color={colors.primary} />
                <Text style={styles.backText}>{es ? 'Volver al pedido' : 'Back to order'}</Text>
              </Pressable>
            </Link>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {inv?.stripe?.pdf ? (
                <Pressable style={styles.tool} onPress={() => Linking.openURL(inv.stripe!.pdf!)} accessibilityRole="link">
                  <Ionicons name="download-outline" size={17} color={colors.primary} />
                  <Text style={styles.toolText}>{es ? 'Factura de Stripe (PDF)' : 'Stripe invoice (PDF)'}</Text>
                </Pressable>
              ) : null}
              {inv && Platform.OS === 'web' ? (
                <Pressable style={[styles.tool, styles.toolPrimary]} onPress={() => window.print()} accessibilityRole="button">
                  <Ionicons name="print-outline" size={17} color="#fff" />
                  <Text style={[styles.toolText, { color: '#fff' }]}>{es ? 'Imprimir / Guardar PDF' : 'Print / Save as PDF'}</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
          {body()}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 820, alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 24, gap: 16 },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40 },
  backText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  tool: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: colors.primary, borderRadius: 10, paddingHorizontal: 14, minHeight: 42 },
  toolPrimary: { backgroundColor: colors.primary },
  toolText: { fontSize: 14, fontWeight: '800', color: colors.primary },
  error: { color: '#B42318', fontSize: 15, backgroundColor: '#FEF3F2', padding: 14, borderRadius: 12 },
  paper: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 32, gap: 28, boxShadow: '0 10px 30px rgba(15,40,90,0.08)' } as any,
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: 2 },
  small: { fontSize: 13, color: colors.muted },
  stamp: { marginTop: 6, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6, borderWidth: 1.5 },
  stampPaid: { borderColor: '#12B76A', backgroundColor: '#ECFDF3' },
  stampDue: { borderColor: '#F79009', backgroundColor: '#FFF4E5' },
  stampText: { fontSize: 13, fontWeight: '800', letterSpacing: 1.5 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 24 },
  metaCol: { flexGrow: 1, flexBasis: 220, gap: 3 },
  metaLabel: { fontSize: 11, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.8 },
  metaStrong: { fontSize: 16, fontWeight: '800', color: colors.text },
  metaText: { fontSize: 14, color: colors.text },
  table: { borderTopWidth: 1, borderTopColor: '#E4E9F2' },
  tr: { flexDirection: 'row', gap: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EEF1F6', alignItems: 'flex-start' },
  th: { paddingVertical: 10 },
  thText: { fontSize: 11, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.8 },
  amountCol: { width: 120, textAlign: 'right' },
  tdLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
  tdSub: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  tdAmount: { fontSize: 15, fontWeight: '700', color: colors.text },
  totalRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'baseline', gap: 24, paddingTop: 16 },
  totalLabel: { fontSize: 16, fontWeight: '800', color: colors.text },
  totalValue: { fontSize: 22, fontWeight: '800', color: colors.text },
  thanks: { fontSize: 13, color: colors.muted, lineHeight: 20 },
});
