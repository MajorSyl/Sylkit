import { Link, useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Footer } from '../src/components/Footer';
import { Header } from '../src/components/Header';
import { QuoteForm } from '../src/components/QuoteForm';
import { useLang } from '../src/i18n';
import { useProducts } from '../src/lib/catalog';
import { configFromQuery, estimate, money, useAddons } from '../src/lib/pricing';
import { colors } from '../src/theme';

export default function QuotePage() {
  const { product, plan, billing, add } = useLocalSearchParams<{ product?: string; plan?: string; billing?: string; add?: string }>();
  const { t, lang } = useLang();
  const list = useProducts();
  const catalog = useAddons();
  const p = product ? list.find((x) => x.slug === product) : undefined;
  const es = lang === 'es';
  const cfg = p?.pricing ? configFromQuery({ plan, billing, add }) : null;
  const est = cfg && p?.pricing ? estimate(p.pricing, catalog, cfg) : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Head>
        <title>{es ? 'Solicitar cotización · Sylkit' : 'Request a quote · Sylkit'}</title>
      </Head>
      <Header />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <Text style={styles.h1}>{p ? t(p.name) : es ? 'Sistema a medida' : 'Custom system'}</Text>
          <Text style={styles.sub}>
            {es
              ? 'Completa el formulario. Recibirás un número de pedido y un enlace para seguirlo.'
              : 'Fill in the form. You will get an order number and a link to track it.'}
          </Text>
          {est && cfg ? (
            <View style={styles.sum}>
              <Text style={styles.sumTitle}>
                {es ? 'Plan' : 'Plan'} {t(est.plan.name)} · {cfg.billing === 'yearly' ? (es ? 'anual' : 'yearly') : es ? 'mensual' : 'monthly'}
              </Text>
              {est.lines.map((l) => (
                <Text key={l.id} style={styles.sumLine}>
                  + {t(l.name)}
                  {l.qty > 1 ? ` ×${l.qty}` : ''}
                </Text>
              ))}
              <View style={styles.sumRow}>
                <Text style={styles.sumLine}>{es ? 'Total estimado a pagar hoy' : 'Estimated total due today'}</Text>
                <Text style={styles.sumTotal}>{money(est.dueToday)}</Text>
              </View>
              <Text style={styles.sumLine}>
                {es ? 'Luego' : 'Then'} {money(est.recurring)}
                {cfg.billing === 'yearly' ? (es ? '/año' : '/year') : es ? '/mes' : '/mo'}
              </Text>
              <Link href={`/product/${p!.slug}`} style={styles.change}>
                {es ? 'Cambiar plan o extras' : 'Change plan or extras'}
              </Link>
            </View>
          ) : null}
          <QuoteForm productSlug={p?.slug} productName={p ? t(p.name) : undefined} config={est ? cfg : null} />
        </View>
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 28, gap: 12 },
  h1: { fontSize: 32, fontWeight: '800', color: colors.text, letterSpacing: -0.6 },
  sub: { fontSize: 15, lineHeight: 22, color: colors.muted, marginBottom: 8 },
  sum: { backgroundColor: colors.softBlue, borderRadius: 16, padding: 16, gap: 6 },
  sumTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  sumLine: { fontSize: 14, color: colors.text },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginTop: 4 },
  sumTotal: { fontSize: 24, fontWeight: '800', color: colors.primary },
  change: { fontSize: 14, fontWeight: '700', color: colors.primary, marginTop: 4 },
});
