import { Ionicons } from '@expo/vector-icons';
import { useClientWidth } from '../src/lib/useClientWidth';
import Head from 'expo-router/head';
import { useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Footer } from '../src/components/Footer';
import { Header } from '../src/components/Header';
import { Showroom } from '../src/components/Showroom';
import { HomeHero } from '../src/components/HomeHero';
import { IndustryGrid } from '../src/components/IndustryGrid';
import { useProducts } from '../src/lib/catalog';
import { useRouter } from 'expo-router';
import { steps, ui, useLang } from '../src/i18n';
import { colors, glass, shadow, waLink } from '../src/theme';
import { tx } from '../src/i18n';
import { tplText } from '../src/lib/names';

const doors: { href: string; icon: string; title: { es: string; en: string; pt?: string }; sub: { es: string; en: string; pt?: string } }[] = [
  { href: '#catalog', icon: 'apps-outline', title: { en: 'Software', pt: "Software", es: 'Software' }, sub: { en: 'Ready-made or custom systems', pt: "Sistemas prontos ou sob medida", es: 'Sistemas listos o a medida' } },
  { href: '/build', icon: 'sparkles-outline', title: { en: 'Website with AI', pt: 'Site com IA', es: 'Web con IA' }, sub: { en: 'Describe your business, get your site', pt: 'Descreva seu negócio e tenha seu site', es: 'Describe tu negocio y obtén tu web' } },
  { href: '/domains', icon: 'globe-outline', title: { en: 'Domains & hosting', pt: "Domínios e hospedagem", es: 'Dominios y hosting' }, sub: { en: 'Your .com, email and hosting', pt: "Seu .com, e-mail e hospedagem", es: 'Tu .com, correo y hosting' } },
  { href: '/security', icon: 'shield-checkmark-outline', title: { en: 'Security', pt: "Segurança", es: 'Seguridad' }, sub: { en: 'Check and protect your app', pt: "Verifique e proteja seu app", es: 'Revisa y protege tu app' } },
  { href: '/quote', icon: 'construct-outline', title: { en: 'Custom system', pt: "Sistema sob medida", es: 'Sistema a medida' }, sub: { en: 'Tell us what you need, we build it', pt: "Conte o que você precisa, nós construímos", es: 'Cuéntanos qué necesitas y lo construimos' } },
];

export default function Home() {
  const { t, lang } = useLang();
  const width = useClientWidth();
  const products = useProducts();
  const router = useRouter();

  const cols = width >= 1024 ? 3 : width >= 640 ? 2 : 1;
  const wide = width >= 820;


  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Head>
        <title>{tx('Sylkit · Software that runs real businesses', 'Sylkit · Software que hace funcionar negocios reales', 'Sylkit · Software que faz negócios reais funcionarem')}</title>
        <meta name="description" content={t(ui.heroSub)} />
      </Head>
      <Header />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <HomeHero width={width} />

        {/* Four clear doors */}
        <View style={styles.container}>
          <View style={styles.doors}>
            {doors.map((d, i) => (
              <View key={d.href} style={{ width: wide ? '20%' : i === doors.length - 1 ? '100%' : '50%', padding: 6 }}>
                <Pressable style={[styles.door, shadow]} onPress={() => {
                    if (d.href === '#catalog') {
                      try {
                        document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      } catch {}
                    } else router.push(d.href as any);
                  }} accessibilityRole="link">
                  <View style={styles.doorIcon}>
                    <Ionicons name={d.icon as any} size={22} color={colors.primary} />
                  </View>
                  <Text style={styles.doorTitle}>{t(d.title)}</Text>
                  <Text style={styles.doorSub}>{t(d.sub)}</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        {/* Work by industry: real photography, each card opens a live demo */}
        <View style={[styles.container, { marginTop: 40 }]} nativeID="work">
          <Text style={styles.kicker}>{tx('Our work', 'Nuestro trabajo', 'Nosso trabalho')}</Text>
          <Text style={[styles.h2, wide && { fontSize: 34 }]}>{tx('Built for the way your industry works', 'Hecho para cómo trabaja tu industria', 'Feito para como sua indústria trabalha')}</Text>
          <Text style={[styles.sectionSub, { marginTop: 8, marginBottom: 20 }]}>
            {tx('Open any card to use a working demo with sample data. Nothing to install.', 'Abre cualquier tarjeta para usar un demo funcional con datos de ejemplo. Sin instalar nada.', 'Abra qualquer cartão para usar uma demo funcional com dados de exemplo. Nada para instalar.')}
          </Text>
          <IndustryGrid width={width} />
        </View>

        {/* Catalog: systems and design templates as a showroom of screenshot cards */}
        {/* Full-width gallery, like Behance */}
        <View style={{ width: '100%', paddingHorizontal: width >= 1100 ? 32 : 16, marginTop: 8 }} nativeID="catalog">
          <View style={[styles.sectionHead, { marginTop: 8 }]}>
            <Text style={styles.h2}>{tx('All systems and designs', 'Todos los sistemas y diseños', 'Todos os sistemas e designs')}</Text>
            <Pressable onPress={() => router.push('/templates' as any)} accessibilityRole="link">
              <Text style={styles.tplAll}>{tx('Templates →', 'Plantillas →', 'Modelos →')}</Text>
            </Pressable>
          </View>
          <Text style={[styles.sectionSub, { marginBottom: 14 }]}>{t(ui.featuredSub)}</Text>
          <Showroom products={products} />
        </View>

        <View style={styles.container}>

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
  kicker: { fontSize: 13, fontWeight: '700', color: colors.primary, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6 },
  tplAll: { fontSize: 15, fontWeight: '700', color: colors.primary },
  tplCard: { width: 150, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', paddingBottom: 10 },
  tplShot: { width: '100%', height: 230, marginBottom: 8 },
  tplName: { fontSize: 15, fontWeight: '800', color: colors.text, paddingHorizontal: 10 },
  tplTag: { fontSize: 12, color: colors.muted, paddingHorizontal: 10 },
  container: { width: '100%', maxWidth: 1180, alignSelf: 'center', paddingHorizontal: 16 },
  doors: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6, marginBottom: 8 },
  door: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, gap: 6, borderWidth: 1, borderColor: colors.border, minHeight: 122 },
  doorIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.softBlue, alignItems: 'center', justifyContent: 'center' },
  doorTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  doorSub: { fontSize: 13, color: colors.muted, lineHeight: 18 },
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
  sectionSub: { fontSize: 15, lineHeight: 22, color: colors.muted, marginTop: -6, marginBottom: 12, maxWidth: 720 },
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
