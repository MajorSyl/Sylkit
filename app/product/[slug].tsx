import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { useRef } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Footer } from '../../src/components/Footer';
import { Header } from '../../src/components/Header';
import { PlanCards } from '../../src/components/PlanCards';
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
  const { slug, billing } = useLocalSearchParams<{ slug: string; billing?: string }>();
  const { t, lang } = useLang();
  const { width } = useWindowDimensions();
  const wide = width >= 860;
  const live = useProducts();
  const router = useRouter();
  const scroller = useRef<ScrollView>(null);
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
        <View style={[styles.container, { paddingTop: 16 }]}>
          <Link href="/" asChild>
            <Pressable style={styles.back} accessibilityRole="link">
              <Ionicons name="arrow-back" size={16} color={colors.primary} />
              <Text style={styles.backText}>{t(ui.back)}</Text>
            </Pressable>
          </Link>

          {/* Title */}
          <View style={styles.titleBlock}>
            {cat && <Text style={styles.cat}>{t(cat.name)}</Text>}
            <Text style={[styles.h1, wide && { fontSize: 42, lineHeight: 48 }]}>{name}</Text>
            <Text style={styles.lead}>{t(product.short)}</Text>
            <View style={styles.links}>
              <Pressable style={styles.linkBtn} onPress={() => Linking.openURL(product.demoUrl ?? msg('demo'))} accessibilityRole="link">
                <Ionicons name={product.demoUrl ? 'play-circle-outline' : 'logo-whatsapp'} size={16} color={colors.primary} />
                <Text style={styles.linkText}>{product.demoUrl ? (lang === 'es' ? 'Probar demo en vivo' : 'Try the live demo') : t(ui.demo)}</Text>
              </Pressable>
              <Pressable style={styles.linkBtn} onPress={() => router.push(product.pricing ? '/quote' : `/quote?product=${product.slug}`)} accessibilityRole="link">
                <Ionicons name="construct-outline" size={16} color={colors.primary} />
                <Text style={styles.linkText}>{t(ui.customVersion)}</Text>
              </Pressable>
            </View>
          </View>

          {/* Plans first: the decision people came to make */}
          {product.pricing ? (
            <PlanCards product={product} initialBilling={billing} />
          ) : (
            <View style={[styles.buyBox, shadow]}>
              <PriceLabel product={product} />
              <Text style={styles.plan}>{lang === 'es' ? 'Precio según lo que necesites. Te enviamos una cotización en menos de 24 horas.' : 'Priced to what you need. We send you a quote within 24 hours.'}</Text>
              <Pressable style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={() => router.push(`/quote?product=${product.slug}`)} accessibilityRole="button">
                <Ionicons name="document-text" size={18} color="#fff" />
                <Text style={styles.primaryBtnText}>{lang === 'es' ? 'Solicitar cotización' : 'Request a quote'}</Text>
              </Pressable>
            </View>
          )}

          {/* About the product */}
          <Text style={[styles.h2, { marginTop: 44, marginBottom: 12 }]}>{lang === 'es' ? 'Sobre este producto' : 'About this product'}</Text>
          <View style={[styles.layout, wide && { flexDirection: 'row', alignItems: 'flex-start' }]}>
            {product.image ? (
              <Pressable
                style={[styles.visual, styles.shot, wide && { flex: 1 }]}
                onPress={() => product.demoUrl && Linking.openURL(product.demoUrl)}
                accessibilityRole={product.demoUrl ? 'link' : undefined}
              >
                <Image source={{ uri: product.image }} style={{ width: '100%', aspectRatio: 16 / 10 }} resizeMode="cover" accessibilityLabel={name} />
                {product.demoUrl ? (
                  <View style={styles.playTag}>
                    <Ionicons name="play-circle" size={16} color="#fff" />
                    <Text style={styles.playText}>{lang === 'es' ? 'Probar demo en vivo' : 'Try the live demo'}</Text>
                  </View>
                ) : null}
              </Pressable>
            ) : (
              <View style={[styles.visual, { backgroundColor: tintBg }, wide && { flex: 1, height: 300 }]}>
                <View style={[styles.sphere, { width: 260, height: 260, top: -80, right: -60, backgroundColor: tintFg, opacity: 0.12 }]} />
                <Ionicons name={product.icon as any} size={80} color={tintFg} />
              </View>
            )}
            <View style={[styles.info, wide && { flex: 1 }]}>
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
            </View>
          </View>

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
  layout: { gap: 24 },
  titleBlock: { gap: 8, marginTop: 8, marginBottom: 24 },
  lead: { fontSize: 17, lineHeight: 26, color: colors.muted, maxWidth: 720 },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  linkBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.softBlue, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, minHeight: 38 },
  linkText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  visual: {
    height: 240,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  sphere: { position: 'absolute', borderRadius: 999 },
  shot: { height: 'auto' as any, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, alignItems: 'stretch' },
  playTag: { position: 'absolute', left: 12, bottom: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(15,23,42,0.82)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
  playText: { color: '#fff', fontWeight: '700', fontSize: 13 },
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
