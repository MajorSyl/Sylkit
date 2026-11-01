import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { useCallback, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Footer } from '../src/components/Footer';
import { Header } from '../src/components/Header';
import { Checkout, CheckoutBarState } from '../src/components/Checkout';
import { CheckoutBar } from '../src/components/CheckoutBar';
import { QuoteForm } from '../src/components/QuoteForm';
import { useLang } from '../src/i18n';
import { useProducts } from '../src/lib/catalog';
import { configFromQuery, estimate, useAddons } from '../src/lib/pricing';
import { colors } from '../src/theme';

export default function QuotePage() {
  const { product, plan, billing, add, domain } = useLocalSearchParams<{ product?: string; plan?: string; billing?: string; add?: string; domain?: string }>();
  const { t, lang } = useLang();
  const list = useProducts();
  const catalog = useAddons();
  const p = product ? list.find((x) => x.slug === product) : undefined;
  const es = lang === 'es';
  const cfg = p?.pricing ? configFromQuery({ plan, billing, add, domain }) : null;
  const est = cfg && p?.pricing ? estimate(p.pricing, catalog, cfg) : null;

  // Bottom bar state, owned here so the bar renders at the screen root (outside the ScrollView).
  const [bar, setBar] = useState<CheckoutBarState | null>(null);
  const [barHeight, setBarHeight] = useState(0);
  const onBarChange = useCallback((s: CheckoutBarState | null) => setBar(s), []);

  // Where the details form sits inside the scroll content (native scrolling).
  const scroll = useRef<ScrollView | null>(null);
  const offsets = useRef({ container: 0, checkout: 0, details: 0 });
  const goToForm = () => {
    if (Platform.OS === 'web') {
      try {
        document.getElementById('checkout-details')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      } catch {}
    }
    const o = offsets.current;
    scroll.current?.scrollTo({ y: Math.max(0, o.container + o.checkout + o.details - 12), animated: true });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Head>
        <title>{est ? (es ? 'Pagar · Sylkit' : 'Checkout · Sylkit') : es ? 'Solicitar cotización · Sylkit' : 'Request a quote · Sylkit'}</title>
      </Head>
      <Header />
      <ScrollView ref={scroll} contentContainerStyle={{ flexGrow: 1, paddingBottom: bar ? barHeight : 0 }}>
        <View style={styles.container} onLayout={(e) => (offsets.current.container = e.nativeEvent.layout.y)}>
          {p?.pricing ? <Text style={styles.kicker}>{es ? 'TU CARRITO · PASO 1 DE 2' : 'YOUR CART · STEP 1 OF 2'}</Text> : null}
          <Text style={styles.h1}>{p ? t(p.name) : es ? 'Sistema a medida' : 'Custom system'}</Text>
          <Text style={styles.sub}>
            {p?.pricing
              ? es
                ? 'Revisa tu plan, agrega lo que necesites y escribe tus datos. Pagas en el siguiente paso.'
                : 'Review your plan, add what you need and enter your details. You pay in the next step.'
              : es
                ? 'Cuéntanos qué necesitas. Te enviamos una cotización y un enlace para seguir tu pedido.'
                : 'Tell us what you need. We send you a quote and a link to track your order.'}
          </Text>
          {p?.pricing ? (
            <View onLayout={(e) => (offsets.current.checkout = e.nativeEvent.layout.y)}>
              <Checkout
                product={p}
                initial={cfg}
                onBarChange={onBarChange}
                onDetailsLayout={(y) => (offsets.current.details = y)}
              />
            </View>
          ) : (
            <QuoteForm productSlug={p?.slug} productName={p ? t(p.name) : undefined} config={null} />
          )}
        </View>
        <Footer />
      </ScrollView>
      {bar ? <CheckoutBar dueToday={bar.dueToday} dimmed={bar.needsDomain} onContinue={goToForm} onHeight={setBarHeight} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 1080, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 28, gap: 12 },
  kicker: { fontSize: 12, fontWeight: '800', color: colors.primary, letterSpacing: 1 },
  h1: { fontSize: 32, fontWeight: '800', color: colors.text, letterSpacing: -0.6 },
  sub: { fontSize: 15, lineHeight: 22, color: colors.muted, marginBottom: 8 },
  sum: { backgroundColor: colors.softBlue, borderRadius: 16, padding: 16, gap: 6 },
  sumTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  sumLine: { fontSize: 14, color: colors.text },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginTop: 4 },
  sumTotal: { fontSize: 24, fontWeight: '800', color: colors.primary },
  change: { fontSize: 14, fontWeight: '700', color: colors.primary, marginTop: 4 },
});
