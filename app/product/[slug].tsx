import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { useRef } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Footer } from '../../src/components/Footer';
import { Header } from '../../src/components/Header';
import { PricingCalculator } from '../../src/components/PricingCalculator';
import { PriceLabel } from '../../src/components/ProductCard';
import { categories, getProduct, products } from '../../src/data/products';
import { useProducts } from '../../src/lib/catalog';
import { ui, useLang } from '../../src/i18n';
import { colors, shadow, waLink } from '../../src/theme';

// Pre-render one static HTML page per product (good for Google).
export async function generateStaticParams(): Promise<Record<string, string>[]> {
  return products.map((p) => ({ slug: p.slug }));
}

export default function ProductPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { t, lang } = useLang();
  const { width } = useWindowDimensions();
  const wide = width >= 860;
  const live = useProducts();
  const router = useRouter();
  const scroller = useRef<ScrollView>(null);
  const pricingY = useRef(0);
  const product = live.find((p) => p.slug === String(slug)) ?? getProduct(String(slug));

  if (!product) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <Header />
        <View style={[styles.container, { paddingTop: 60, alignItems: 'center', gap: 16 }]}>
          <Text style={styles.h1}>{t(ui.notFound)}</Text>
          <Link href="/" style={styles.backLink}>
            {t(ui.back)}
          </Link>
        </View>
      </View>
    );
  }

  const cat = categories.find((c) => c.id === product.category);
  const tintBg = product.tint === 'cyan' ? colors.softCyan : colors.softBlue;
  const tintFg = product.tint === 'cyan' ? '#0E9DBB' : colors.primary;
  const name = t(product.name);

  const msg = (kind: 'buy' | 'demo' | 'custom') => {
    const es = {
      buy: `Hola, quiero comprar "${product.name.es}" de Sylkit.`,
      demo: `Hola, quiero una demostración de "${product.name.es}".`,
      custom: `Hola, quiero una versión personalizada de "${product.name.es}" para mi negocio.`,
    };
    const en = {
      buy: `Hi, I want to buy "${product.name.en}" from Sylkit.`,
      demo: `Hi, I'd like a demo of "${product.name.en}".`,
      custom: `Hi, I want a custom version of "${product.name.en}" for my business.`,
    };
    return waLink((lang === 'es' ? es : en)[kind]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Head>
        <title>{name} · Sylkit</title>
        <meta name="description" content={t(product.short)} />
      </Head>
      <Header />
      <ScrollView ref={scroller} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[styles.container, { paddingTop: 20 }]}>
          <Link href="/" asChild>
            <Pressable style={styles.back} accessibilityRole="link">
              <Ionicons name="arrow-back" size={16} color={colors.primary} />
              <Text style={styles.backText}>{t(ui.back)}</Text>
            </Pressable>
          </Link>

          <View style={[styles.layout, wide && { flexDirection: 'row', alignItems: 'flex-start' }]}>
            {/* Visual */}
            <View style={[styles.visual, { backgroundColor: tintBg }, wide && { flex: 1, height: 380 }]}>
              <View style={[styles.sphere, { width: 260, height: 260, top: -80, right: -60, backgroundColor: tintFg, opacity: 0.12 }]} />
              <View style={[styles.sphere, { width: 160, height: 160, bottom: -50, left: -30, backgroundColor: '#fff', opacity: 0.5 }]} />
              <Ionicons name={product.icon as any} size={96} color={tintFg} />
            </View>

            {/* Info */}
            <View style={[styles.info, wide && { flex: 1 }]}>
              {cat && <Text style={styles.cat}>{t(cat.name)}</Text>}
              <Text style={styles.h1}>{name}</Text>
              {product.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{t(product.badge)}</Text>
                </View>
              )}
              <Text style={styles.desc}>{t(product.description)}</Text>

              <View style={styles.platforms}>
                {product.platforms.map((p) => (
                  <Text key={p} style={styles.platform}>
                    {p}
                  </Text>
                ))}
              </View>

              <View style={[styles.buyBox, shadow]}>
                <PriceLabel product={product} />
                <Text style={styles.plan}>{t(ui.plan)}</Text>
                <Pressable style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={() =>
                    product.pricing
                      ? scroller.current?.scrollTo({ y: Math.max(pricingY.current - 12, 0), animated: true })
                      : router.push(`/quote?product=${product.slug}`)
                  }
                  accessibilityRole="button"
                >
                  <Ionicons name={product.pricing ? 'calculator' : 'document-text'} size={18} color="#fff" />
                  <Text style={styles.primaryBtnText}>
                    {product.pricing ? (lang === 'es' ? 'Ver planes y calcular precio' : 'See plans and calculate price') : lang === 'es' ? 'Solicitar cotización' : 'Request a quote'}
                  </Text>
                </Pressable>
                <Pressable style={styles.secondaryBtn} onPress={() => Linking.openURL(product.demoUrl ?? msg('demo'))} accessibilityRole="link">
                  <Ionicons name={product.demoUrl ? 'play-circle' : 'logo-whatsapp'} size={18} color={colors.primary} />
                  <Text style={styles.secondaryBtnText}>
                    {product.demoUrl ? (lang === 'es' ? 'Probar demo en vivo' : 'Try the live demo') : t(ui.demo)}
                  </Text>
                </Pressable>
                <Pressable style={styles.textBtn} onPress={() => router.push('/quote')} accessibilityRole="link">
                  <Text style={styles.textBtnText}>{t(ui.customVersion)}</Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                </Pressable>
              </View>
            </View>
          </View>

          {product.pricing ? (
            <View style={{ marginTop: 36 }} onLayout={(e) => (pricingY.current = e.nativeEvent.layout.y)}>
              <PricingCalculator product={product} />
            </View>
          ) : null}

          {/* Features */}
          <Text style={[styles.h2, { marginTop: 36, marginBottom: 12 }]}>{t(ui.features)}</Text>
          <View style={styles.featGrid}>
            {product.features.map((f, i) => (
              <View key={i} style={{ width: wide ? '50%' : '100%', padding: 6 }}>
                <View style={styles.feat}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.cyan} />
                  <Text style={styles.featText}>{t(f)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 1180, alignSelf: 'center', paddingHorizontal: 16 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', minHeight: 40 },
  backText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  backLink: { fontSize: 15, fontWeight: '700', color: colors.primary },
  layout: { marginTop: 12, gap: 24 },
  visual: {
    height: 240,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  sphere: { position: 'absolute', borderRadius: 999 },
  info: { gap: 10 },
  cat: { fontSize: 12, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.6 },
  h1: { fontSize: 34, lineHeight: 40, fontWeight: '800', color: colors.text, letterSpacing: -0.8 },
  h2: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.softCyan,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#0E7F98' },
  desc: { fontSize: 16, lineHeight: 25, color: colors.muted },
  platforms: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  platform: {
    fontSize: 12,
    color: colors.muted,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  buyBox: {
    marginTop: 8,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  plan: { fontSize: 13, lineHeight: 19, color: colors.muted },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.whatsapp,
    paddingVertical: 14,
    borderRadius: 14,
    minHeight: 48,
  },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.softBlue,
    paddingVertical: 14,
    borderRadius: 14,
    minHeight: 48,
  },
  secondaryBtnText: { color: colors.primary, fontWeight: '800', fontSize: 15 },
  textBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 40 },
  textBtnText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  featGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  feat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featText: { fontSize: 15, color: colors.text, fontWeight: '600', flexShrink: 1 },
});
