import { Ionicons } from '@expo/vector-icons';
import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Footer } from '../src/components/Footer';
import { Header } from '../src/components/Header';
import { IndustryGrid } from '../src/components/IndustryGrid';
import { Photo } from '../src/components/Photo';
import type { PhotoCategory } from '../src/data/photoLibrary';
import { tx, useLang } from '../src/i18n';
import { useProducts } from '../src/lib/catalog';
import { pickPhotos } from '../src/lib/photos';
import { useClientWidth } from '../src/lib/useClientWidth';
import { colors } from '../src/theme';

// Portfolio: the Sylkit 2.0 industry systems first, then every product that has a live demo today.
// Each card opens the working software, so the page shows what we build instead of describing it.

const CAT_PHOTO: Record<string, PhotoCategory> = { retail: 'services', management: 'corporate', web: 'technology', mobile: 'technology', ai: 'technology', health: 'healthcare', food: 'restaurants', services: 'services', education: 'education', domains: 'technology' };

export default function Work() {
  const { t } = useLang();
  const width = useClientWidth() || 375;
  const wide = width >= 900;
  const router = useRouter();
  const products = useProducts().filter((p) => p.demoUrl);
  const cols = width >= 1100 ? 3 : width >= 700 ? 2 : 1;
  const cw = (Math.min(width, 1180) - 32 - (cols - 1) * 16) / cols;
  const seen: Record<string, number> = {};

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Head>
        <title>{tx('Our work · Sylkit', 'Nuestro trabajo · Sylkit', 'Nosso trabalho · Sylkit')}</title>
        <meta name="description" content={tx('Working demos of the systems Sylkit builds: hotel bookings, ticketing, logistics, construction, stores, clinics and more.', 'Demos funcionales de los sistemas que construye Sylkit: reservas de hotel, entradas, logística, construcción, tiendas, clínicas y más.', 'Demos funcionais dos sistemas que a Sylkit constrói: reservas de hotel, ingressos, logística, construção, lojas, clínicas e mais.')} />
      </Head>
      <Header />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <Text style={styles.kicker}>{tx('Portfolio', 'Portafolio', 'Portfólio')}</Text>
          <Text style={[styles.h1, wide && { fontSize: 48, lineHeight: 52 }]}>{tx('Don’t take our word for it. Use it.', 'No nos creas a nosotros. Pruébalo.', 'Não acredite só na gente. Use.')}</Text>
          <Text style={styles.sub}>{tx('Every project below is working software with sample data. Make a booking, buy a ticket, track a shipment, then ask us for yours.', 'Cada proyecto es software funcionando con datos de ejemplo. Haz una reserva, compra una entrada, rastrea un envío y luego pide el tuyo.', 'Cada projeto é software funcionando com dados de exemplo. Faça uma reserva, compre um ingresso, rastreie um envio e depois peça o seu.')}</Text>
        </View>

        <View style={[styles.container, { marginTop: 28 }]}>
          <Text style={styles.h2}>{tx('Industry systems', 'Sistemas por industria', 'Sistemas por setor')}</Text>
          <View style={{ height: 14 }} />
          <IndustryGrid width={width} />
        </View>

        <View style={[styles.container, { marginTop: 48 }]}>
          <Text style={styles.h2}>{tx('Ready-made systems with live demos', 'Sistemas listos con demo en vivo', 'Sistemas prontos com demo ao vivo')}</Text>
          <Text style={[styles.sub, { marginTop: 6, marginBottom: 16 }]}>{tx('Running for businesses today. Open the demo, then see plans and prices.', 'Funcionando hoy en negocios reales. Abre la demo y luego mira planes y precios.', 'Funcionando hoje em negócios reais. Abra a demo e depois veja planos e preços.')}</Text>
          <View style={styles.grid}>
            {products.map((p) => {
              const cat = CAT_PHOTO[p.category] || 'services';
              seen[cat] = (seen[cat] ?? -1) + 1;
              const photo = pickPhotos(cat, 1, seen[cat] + 1)[0];
              return (
                <View key={p.slug} style={[styles.card, { width: cw }]}>
                  <Photo photo={photo} width={cw} ratio={1.9} radius={16} />
                  <View style={{ padding: 6, gap: 6 }}>
                    <Text style={styles.name}>{t(p.name)}</Text>
                    <Text style={styles.short} numberOfLines={2}>{t(p.short)}</Text>
                    <View style={styles.row}>
                      <Pressable onPress={() => Linking.openURL(p.demoUrl!)} style={styles.btn} accessibilityRole="link">
                        <Ionicons name="play-circle-outline" size={16} color="#fff" />
                        <Text style={styles.btnText}>{tx('Open demo', 'Abrir demo', 'Abrir demo')}</Text>
                      </Pressable>
                      <Pressable onPress={() => router.push(`/product/${p.slug}` as any)} style={styles.btnAlt} accessibilityRole="link">
                        <Text style={styles.btnAltText}>{tx('Plans and prices', 'Planes y precios', 'Planos e preços')}</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.container, { marginTop: 48, marginBottom: 40 }]}>
          <View style={styles.cta}>
            <Text style={styles.ctaTitle}>{tx('Your business, your system', 'Tu negocio, tu sistema', 'Seu negócio, seu sistema')}</Text>
            <Text style={styles.ctaSub}>{tx('Tell us how you work. We adapt one of these systems or build a new one, in English, Spanish or Portuguese.', 'Cuéntanos cómo trabajas. Adaptamos uno de estos sistemas o creamos uno nuevo, en español, inglés o portugués.', 'Conte como você trabalha. Adaptamos um destes sistemas ou criamos um novo, em português, espanhol ou inglês.')}</Text>
            <Pressable onPress={() => router.push('/quote')} style={styles.ctaBtn} accessibilityRole="link">
              <Text style={styles.ctaBtnText}>{tx('Start a project', 'Iniciar un proyecto', 'Começar um projeto')}</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.text} />
            </Pressable>
          </View>
        </View>
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 1180, alignSelf: 'center', paddingHorizontal: 16 },
  kicker: { marginTop: 36, fontSize: 13, fontWeight: '700', color: colors.primary, letterSpacing: 0.6, textTransform: 'uppercase' },
  h1: { fontSize: 34, lineHeight: 40, fontWeight: '800', color: colors.text, letterSpacing: -1.2, marginTop: 8, maxWidth: 820 },
  h2: { fontSize: 24, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  sub: { fontSize: 16, lineHeight: 24, color: colors.muted, marginTop: 10, maxWidth: 680 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 8, gap: 8, borderWidth: 1, borderColor: colors.border },
  name: { fontSize: 17, fontWeight: '800', color: colors.text },
  short: { fontSize: 13.5, lineHeight: 19, color: colors.muted },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 4 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.text, borderRadius: 999, paddingHorizontal: 14, minHeight: 38 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 13.5 },
  btnAlt: { justifyContent: 'center', borderRadius: 999, paddingHorizontal: 14, minHeight: 38, borderWidth: 1, borderColor: 'rgba(11,27,58,0.16)' },
  btnAltText: { color: colors.text, fontWeight: '800', fontSize: 13.5 },
  cta: { backgroundColor: colors.text, borderRadius: 24, padding: 28, gap: 12 },
  ctaTitle: { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -0.6 },
  ctaSub: { color: 'rgba(255,255,255,0.8)', fontSize: 15.5, lineHeight: 23, maxWidth: 620 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 20, minHeight: 48, alignSelf: 'flex-start', marginTop: 6 },
  ctaBtnText: { color: colors.text, fontWeight: '800', fontSize: 15 },
});
