import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { markets, type MarketCode } from '../data/markets';
import { steps, useLang } from '../i18n';
import { tx } from '../i18n';
import { useProducts } from '../lib/catalog';
import { useClientWidth } from '../lib/useClientWidth';
import { colors, shadow } from '../theme';
import { Button } from './Button';
import { Footer } from './Footer';
import { Header } from './Header';
import { ProductCard } from './ProductCard';
import { Reveal } from './motion';

// One country's landing page (sylkit.com/ve, /sl, /br). The content lives in src/data/markets.ts.

const openHelp = () => {
  try {
    window.dispatchEvent(new Event('sylkit:help'));
  } catch {}
};

export function MarketPage({ code }: { code: MarketCode }) {
  const m = markets[code];
  const { t } = useLang();
  const router = useRouter();
  const width = useClientWidth();
  const wide = width >= 820;
  const cols = width >= 1024 ? 4 : width >= 640 ? 2 : 1;
  const all = useProducts();
  const featured = m.featured.map((slug) => all.find((p) => p.slug === slug)).filter((p): p is NonNullable<typeof p> => !!p);
  const hasPharmacy = m.featured.includes('farmacia-pos');
  const title = `Sylkit ${t(m.country)} · ${t(m.h1)}`;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={t(m.sub)} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={t(m.sub)} />
        <meta property="og:locale" content={m.locale} />
      </Head>
      <Header />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          {/* Hero */}
          <View style={[styles.hero, shadow]}>
            <View style={styles.countryChip}>
              <Text style={styles.flag}>{m.flag}</Text>
              <Text style={styles.countryText}>Sylkit {t(m.country)}</Text>
            </View>
            <Text style={[styles.h1, !wide && { fontSize: 30, lineHeight: 36 }]}>{t(m.h1)}</Text>
            <Text style={styles.sub}>{t(m.sub)}</Text>
            <View style={[styles.ctas, !wide && { flexDirection: 'column', alignItems: 'stretch' }]}>
              <Button label={tx('Chat with us', 'Escríbenos', 'Fale com a gente')} icon="chatbubbles" onPress={openHelp} />
              <Button
                label={tx('See the systems', 'Ver los sistemas', 'Ver os sistemas')}
                icon="apps"
                variant="secondary"
                onPress={() => {
                  try {
                    document.getElementById('popular')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } catch {}
                }}
              />
            </View>
            <Text style={styles.remote}>
              <Ionicons name="globe-outline" size={14} color={colors.muted} /> {tx('Set up remotely, anywhere in the world.', 'Instalados a distancia, en cualquier parte del mundo.', 'Configurados remotamente, em qualquer lugar do mundo.')}
            </Text>
          </View>

          {/* Founding pharmacy offer (same offer as the product page) */}
          {hasPharmacy ? (
            <Pressable style={[styles.offer, wide && { flexDirection: 'row', alignItems: 'center' }]} onPress={() => router.push('/product/farmacia-pos')} accessibilityRole="link">
              <View style={{ flex: wide ? 1 : undefined, gap: 6 }}>
                <Text style={styles.offerTitle}>{tx('10 founding pharmacies: $0 setup', '10 farmacias fundadoras: instalación $0', '10 farmácias fundadoras: instalação $0')}</Text>
                <Text style={styles.offerSub}>
                  {tx(
                    'Free data import and training, a 60-day guarantee and your price locked for 12 months.',
                    'Importación de datos y capacitación gratis, garantía de 60 días y tu precio congelado por 12 meses.',
                    'Importação de dados e treinamento grátis, garantia de 60 dias e preço congelado por 12 meses.',
                  )}
                </Text>
              </View>
              <View style={styles.offerBtn}>
                <Text style={styles.offerBtnText}>{tx('See the offer', 'Ver la oferta', 'Ver a oferta')}</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.primary} />
              </View>
            </Pressable>
          ) : null}

          {/* Popular systems here */}
          <Text style={styles.h2} nativeID="popular">
            {tx('Popular', 'Lo más pedido', 'Mais pedidos')} {t(m.inCountry)}
          </Text>
          <View style={styles.grid}>
            {featured.map((p, i) => (
              <Reveal key={p.slug} delay={i * 60} style={{ width: `${100 / cols}%` as any, padding: 8 }}>
                <ProductCard product={p} compact={cols === 1} />
              </Reveal>
            ))}
          </View>
          <Pressable style={styles.allLink} onPress={() => router.push('/')} accessibilityRole="link">
            <Text style={styles.allLinkText}>{tx('See all systems and templates', 'Ver todos los sistemas y plantillas', 'Ver todos os sistemas e modelos')}</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </Pressable>

          {/* How you pay here */}
          <Text style={styles.h2}>{tx('How you pay', 'Cómo pagas', 'Como pagar')} {t(m.inCountry)}</Text>
          <View style={styles.grid}>
            {m.pay.map((p) => (
              <View key={p.name.en} style={{ width: wide ? '25%' : '100%', padding: 8 }}>
                <View style={[styles.payCard, shadow]}>
                  <View style={styles.icon}>
                    <Ionicons name={p.icon as any} size={22} color={colors.primary} />
                  </View>
                  <Text style={styles.cardTitle}>{t(p.name)}</Text>
                  <Text style={styles.cardBody}>{t(p.note)}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* How it works */}
          <Text style={styles.h2}>{tx('How it works', 'Cómo funciona', 'Como funciona')}</Text>
          <View style={styles.grid}>
            {steps.map((s, i) => (
              <View key={i} style={{ width: wide ? '33.333%' : '100%', padding: 8 }}>
                <View style={[styles.payCard, shadow]}>
                  <View style={styles.icon}>
                    <Ionicons name={s.icon as any} size={22} color={colors.primary} />
                  </View>
                  <Text style={styles.stepNum}>0{i + 1}</Text>
                  <Text style={styles.cardTitle}>{t(s.title)}</Text>
                  <Text style={styles.cardBody}>{t(s.body)}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Closing call to action */}
          <View style={[styles.closing, wide && { flexDirection: 'row', alignItems: 'center' }]}>
            <View style={{ flex: wide ? 1 : undefined, gap: 6 }}>
              <Text style={styles.closingTitle}>{tx('Tell us about your business', 'Cuéntanos sobre tu negocio', 'Conte sobre o seu negócio')}</Text>
              <Text style={styles.closingSub}>
                {tx('We reply fast and show you the right system.', 'Respondemos rápido y te mostramos el sistema indicado.', 'Respondemos rápido e mostramos o sistema certo.')}
              </Text>
            </View>
            <Button label={tx('Chat with us', 'Escríbenos', 'Fale com a gente')} icon="chatbubbles" variant="secondary" onPress={openHelp} />
          </View>
        </View>
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 1200, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 48 },
  hero: { backgroundColor: colors.surface, borderRadius: 28, padding: 28, gap: 14, borderWidth: 1, borderColor: colors.border },
  countryChip: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 8, backgroundColor: colors.softBlue, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 14 },
  flag: { fontSize: 18 },
  countryText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  h1: { fontSize: 44, lineHeight: 50, fontWeight: '800', color: colors.text, letterSpacing: -0.8, maxWidth: 820 },
  sub: { fontSize: 17, lineHeight: 26, color: colors.muted, maxWidth: 720 },
  ctas: { flexDirection: 'row', gap: 12, marginTop: 6, flexWrap: 'wrap' },
  remote: { fontSize: 13, color: colors.muted, marginTop: 4 },
  offer: { marginTop: 20, backgroundColor: colors.primary, borderRadius: 22, padding: 22, gap: 14 },
  offerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  offerSub: { color: 'rgba(255,255,255,0.88)', fontSize: 15, lineHeight: 22 },
  offerBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 999, paddingVertical: 12, paddingHorizontal: 18, alignSelf: 'flex-start' },
  offerBtnText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  h2: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 40, marginBottom: 8, letterSpacing: -0.4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 },
  allLink: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: 8, paddingVertical: 6 },
  allLinkText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  payCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, gap: 6, borderWidth: 1, borderColor: colors.border, height: '100%' },
  icon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.softBlue, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  stepNum: { color: colors.primary, fontWeight: '800', fontSize: 13 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  cardBody: { fontSize: 14, lineHeight: 21, color: colors.muted },
  closing: { marginTop: 40, backgroundColor: colors.surface, borderRadius: 22, padding: 22, gap: 14, borderWidth: 1, borderColor: colors.border },
  closingTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  closingSub: { fontSize: 15, color: colors.muted },
});
