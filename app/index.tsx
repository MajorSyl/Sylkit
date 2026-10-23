import { Ionicons } from '@expo/vector-icons';
import Head from 'expo-router/head';
import { useMemo, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Footer } from '../src/components/Footer';
import { Header } from '../src/components/Header';
import { ProductCard } from '../src/components/ProductCard';
import { categories, CategoryId } from '../src/data/products';
import { useProducts } from '../src/lib/catalog';
import { useRouter } from 'expo-router';
import { steps, ui, useLang } from '../src/i18n';
import { colors, glass, shadow, waLink } from '../src/theme';

export default function Home() {
  const { t, lang } = useLang();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<CategoryId | 'all'>('all');
  const products = useProducts();
  const router = useRouter();

  const cols = width >= 1024 ? 3 : width >= 640 ? 2 : 1;
  const wide = width >= 820;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (cat !== 'all' && p.category !== cat) return false;
      if (!q) return true;
      const hay = [p.name.es, p.name.en, p.short.es, p.short.en, ...p.platforms].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [query, cat, products]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Head>
        <title>Sylkit · {t(ui.tagline)}</title>
        <meta name="description" content={t(ui.heroSub)} />
      </Head>
      <Header />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={[styles.sphere, { width: 260, height: 260, top: -80, right: -60, backgroundColor: colors.cyan, opacity: 0.18 }]} />
          <View style={[styles.sphere, { width: 200, height: 200, bottom: -70, left: -50, backgroundColor: colors.primary, opacity: 0.12 }]} />
          <View style={styles.container}>
            <Text style={[styles.h1, wide && { fontSize: 52, lineHeight: 58 }]}>{t(ui.tagline)}</Text>
            <Text style={[styles.heroSub, wide && { fontSize: 18, lineHeight: 28 }]}>{t(ui.heroSub)}</Text>

            <View style={[styles.search, shadow, glass]}>
              <Ionicons name="search" size={20} color={colors.muted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={t(ui.search)}
                placeholderTextColor={colors.muted}
                style={styles.searchInput}
                accessibilityLabel={t(ui.search)}
                returnKeyType="search"
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery('')} accessibilityLabel="Clear" hitSlop={10}>
                  <Ionicons name="close-circle" size={20} color={colors.muted} />
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.container}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            <Chip label={t(ui.all)} icon="apps" active={cat === 'all'} onPress={() => setCat('all')} />
            {categories.map((c) => (
              <Chip key={c.id} label={t(c.name)} icon={c.icon} active={cat === c.id} onPress={() => setCat(c.id)} />
            ))}
          </ScrollView>

          {/* Products */}
          <View style={styles.sectionHead}>
            <Text style={styles.h2}>{t(ui.featured)}</Text>
            <Text style={styles.count}>{filtered.length}</Text>
          </View>

          {filtered.length === 0 ? (
            <View style={[styles.empty, shadow]}>
              <Ionicons name="construct" size={28} color={colors.primary} />
              <Text style={styles.emptyText}>{t(ui.noResults)}</Text>
              <WhatsAppButton
                label={t(ui.talk)}
                message={lang === 'es' ? `Hola, busco un sistema para: ${query}` : `Hi, I'm looking for a system for: ${query}`}
              />
            </View>
          ) : (
            <View style={styles.grid}>
              {filtered.map((p) => (
                <View key={p.slug} style={{ width: `${100 / cols}%`, padding: 8 }}>
                  <ProductCard product={p} />
                </View>
              ))}
            </View>
          )}

          {/* Custom banner */}
          <View style={[styles.banner, wide && { flexDirection: 'row', alignItems: 'center' }]}>
            <View style={[styles.sphere, { width: 220, height: 220, top: -90, right: -40, backgroundColor: '#fff', opacity: 0.12 }]} />
            <View style={{ flex: wide ? 1 : undefined, gap: 8 }}>
              <Text style={styles.bannerTitle}>{t(ui.customTitle)}</Text>
              <Text style={styles.bannerSub}>{t(ui.customSub)}</Text>
            </View>
            <Pressable
              style={styles.bannerBtn}
              onPress={() => router.push('/quote')}
              accessibilityRole="link"
            >
              <Text style={styles.bannerBtnText}>{t(ui.customCta)}</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.primary} />
            </Pressable>
          </View>

          {/* How it works */}
          <Text style={[styles.h2, { marginTop: 48, marginBottom: 8 }]}>{t(ui.howTitle)}</Text>
          <View style={styles.grid}>
            {steps.map((s, i) => (
              <View key={i} style={{ width: wide ? '33.333%' : '100%', padding: 8 }}>
                <View style={[styles.step, shadow]}>
                  <View style={styles.stepIcon}>
                    <Ionicons name={s.icon as any} size={22} color={colors.primary} />
                  </View>
                  <Text style={styles.stepNum}>0{i + 1}</Text>
                  <Text style={styles.stepTitle}>{t(s.title)}</Text>
                  <Text style={styles.stepBody}>{t(s.body)}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Proof */}
          <View style={[styles.proof, shadow]}>
            <View style={styles.proofIcon}>
              <Ionicons name="checkmark-circle" size={28} color="#0E9DBB" />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.proofTitle}>{t(ui.proofTitle)}</Text>
              <Text style={styles.proofSub}>{t(ui.proofSub)}</Text>
            </View>
          </View>
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
}

function Chip({ label, icon, active, onPress }: { label: string; icon: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Ionicons name={icon as any} size={16} color={active ? '#fff' : colors.primary} />
      <Text style={[styles.chipText, active && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

function WhatsAppButton({ label, message }: { label: string; message: string }) {
  return (
    <Pressable style={styles.waBtn} onPress={() => Linking.openURL(waLink(message))} accessibilityRole="link">
      <Ionicons name="logo-whatsapp" size={18} color="#fff" />
      <Text style={styles.waBtnText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 1180, alignSelf: 'center', paddingHorizontal: 16 },
  hero: { paddingTop: 48, paddingBottom: 36, overflow: 'hidden', position: 'relative' },
  sphere: { position: 'absolute', borderRadius: 999 },
  h1: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -1,
    textAlign: 'center',
    maxWidth: 760,
    alignSelf: 'center',
  },
  heroSub: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 14,
    maxWidth: 640,
    alignSelf: 'center',
  },
  search: {
    marginTop: 28,
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    minHeight: 54,
  },
  searchInput: { flex: 1, fontSize: 16, color: colors.text, paddingVertical: 14, outlineStyle: 'none' } as any,
  chips: { gap: 8, paddingVertical: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 40,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 14, fontWeight: '600', color: colors.text },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 28, marginBottom: 8 },
  h2: { fontSize: 24, fontWeight: '800', color: colors.text, letterSpacing: -0.4 },
  count: { fontSize: 14, color: colors.muted, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: { fontSize: 15, color: colors.muted, textAlign: 'center' },
  waBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.whatsapp,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
  },
  waBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  banner: {
    marginTop: 40,
    backgroundColor: colors.primary,
    borderRadius: 22,
    padding: 24,
    gap: 18,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: -0.4 },
  bannerSub: { fontSize: 15, lineHeight: 22, color: 'rgba(255,255,255,0.88)' },
  bannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  bannerBtnText: { color: colors.primary, fontWeight: '800', fontSize: 15 },
  step: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    height: '100%',
  },
  stepIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.softBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepNum: { fontSize: 12, fontWeight: '800', color: colors.cyan, letterSpacing: 1 },
  stepTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  stepBody: { fontSize: 14, lineHeight: 20, color: colors.muted },
  proof: {
    marginTop: 32,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  proofIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.softCyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proofTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  proofSub: { fontSize: 14, lineHeight: 20, color: colors.muted },
});
