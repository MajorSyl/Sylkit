import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Footer } from '../src/components/Footer';
import { Header } from '../src/components/Header';
import { ProductCard } from '../src/components/ProductCard';
import { useLang } from '../src/i18n';
import { useProducts } from '../src/lib/catalog';
import { checkDomain, DomainResult, money } from '../src/lib/pricing';
import { colors, shadow } from '../src/theme';

// Domains & hosting: search a domain, then buy it alone or with business email.
const DOMAIN_SLUG = 'dominio-y-correo';

const L = {
  title: { es: 'Tu dominio y correo, pagando en moneda local', en: 'Your domain and email, paid in local currency' },
  sub: {
    es: 'Busca el nombre de tu negocio. Lo registramos a tu nombre, configuramos tus correos y lo renovamos por ti.',
    en: 'Search your business name. We register it in your name, set up your email and renew it for you.',
  },
  placeholder: { es: 'nombre de tu negocio', en: 'your business name' },
  search: { es: 'Buscar', en: 'Search' },
  available: { es: 'Disponible', en: 'Available' },
  taken: { es: 'Ocupado', en: 'Taken' },
  unknown: { es: 'Por confirmar', en: 'To be confirmed' },
  domainOnly: { es: 'Solo dominio', en: 'Domain only' },
  withEmail: { es: 'Con correo', en: 'With email' },
  allTaken: { es: 'Esos están ocupados. Prueba agregar tu ciudad o tu rubro (ej. farmaciasanrafaelcaracas).', en: 'Those are taken. Try adding your city or trade (e.g. sunrisepharmacylagos).' },
  invalid: { es: 'Escribe un nombre válido (letras, números o guiones).', en: 'Enter a valid name (letters, numbers or hyphens).' },
  whyTitle: { es: 'Por qué con Sylkit', en: 'Why Sylkit' },
  packages: { es: 'Paquetes', en: 'Packages' },
  faqTitle: { es: 'Preguntas frecuentes', en: 'Questions' },
};

const why = [
  { icon: 'card', t: { es: 'Sin tarjeta internacional', en: 'No international card' }, d: { es: 'Paga con Pago Móvil, USDT u Orange Money.', en: 'Pay with Pago Móvil, USDT or Orange Money.' } },
  { icon: 'person-circle', t: { es: 'Es tuyo', en: 'It is yours' }, d: { es: 'Registrado a tu nombre. Si te vas, te lo transferimos gratis.', en: 'Registered in your name. If you leave, we transfer it free.' } },
  { icon: 'construct', t: { es: 'Lo hacemos por ti', en: 'We do it for you' }, d: { es: 'Conexión, correos y configuración en tu teléfono.', en: 'Connection, email and setup on your phone.' } },
  { icon: 'refresh-circle', t: { es: 'Nunca se vence', en: 'Never expires' }, d: { es: 'Renovación automática y aviso 30 días antes.', en: 'Auto-renewal and a reminder 30 days before.' } },
];

const faq = [
  {
    q: { es: '¿De quién es el dominio?', en: 'Who owns the domain?' },
    a: { es: 'Tuyo. Lo registramos con tus datos como dueño; nosotros solo lo administramos.', en: 'You do. We register it with you as the owner; we only manage it.' },
  },
  {
    q: { es: '¿Qué pasa si dejo de pagar?', en: 'What if I stop paying?' },
    a: {
      es: 'Funciona hasta el final del periodo pagado. Te avisamos 30 días antes del vencimiento. Si quieres irte, te lo transferimos gratis.',
      en: 'It keeps working until the end of the paid period. We remind you 30 days before it expires. If you want to leave, we transfer it free.',
    },
  },
  {
    q: { es: '¿Cuánto tarda?', en: 'How long does it take?' },
    a: { es: 'Normalmente menos de 24 horas después de confirmar tu pago.', en: 'Usually under 24 hours after your payment is confirmed.' },
  },
  {
    q: { es: '¿Y si ya tengo un dominio?', en: 'What if I already have a domain?' },
    a: { es: 'Lo conectamos gratis o lo traemos a nuestra gestión por un pago único.', en: 'We connect it free, or move it into our management for a one-time fee.' },
  },
];

export default function DomainsPage() {
  const { t, lang } = useLang();
  const router = useRouter();
  const list = useProducts();
  const domainProduct = list.find((p) => p.slug === DOMAIN_SLUG);
  const packages = list.filter((p) => p.category === 'domains');
  const plans = domainProduct?.pricing?.plans ?? [];
  const yearOf = (id: string) => (plans.find((p) => p.id === id)?.monthly ?? 0) * 10;
  const setupOf = (id: string) => plans.find((p) => p.id === id)?.setup ?? 0;

  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<DomainResult[] | null>(null);
  const [note, setNote] = useState('');

  const search = async () => {
    setNote('');
    setResults(null);
    const v = q.toLowerCase().trim();
    if (v.replace(/[^a-z0-9-]/g, '').length < 2) return setNote(t(L.invalid));
    setBusy(true);
    try {
      const r = await checkDomain(v);
      setResults(r.results);
      if (r.results.every((x) => x.status === 'taken')) setNote(t(L.allTaken));
    } catch {
      setNote(t(L.invalid));
    }
    setBusy(false);
  };

  const go = (domain: string, plan: string) => router.push(`/product/${DOMAIN_SLUG}?plan=${plan}&billing=yearly&domain=${encodeURIComponent(`new:${domain}`)}`);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Head>
        <title>{lang === 'es' ? 'Dominios, correo y hosting · Sylkit' : 'Domains, email and hosting · Sylkit'}</title>
        <meta name="description" content={t(L.sub)} />
      </Head>
      <Header />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.hero}>
          <View style={[styles.sphere, { width: 320, height: 320, top: -120, right: -80 }]} />
          <View style={[styles.sphere, { width: 200, height: 200, bottom: -90, left: -60, backgroundColor: colors.cyan }]} />
          <View style={styles.container}>
            <Text style={styles.h1}>{t(L.title)}</Text>
            <Text style={styles.sub}>{t(L.sub)}</Text>
            <View style={[styles.searchBox, shadow]}>
              <Ionicons name="globe-outline" size={20} color={colors.muted} />
              <TextInput
                value={q}
                onChangeText={setQ}
                onSubmitEditing={search}
                placeholder={t(L.placeholder)}
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.searchInput}
                accessibilityLabel={t(L.placeholder)}
              />
              <Pressable onPress={search} style={styles.searchBtn} accessibilityRole="button">
                {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.searchBtnText}>{t(L.search)}</Text>}
              </Pressable>
            </View>
            <Text style={styles.hint}>.com · .net · .org — {lang === 'es' ? 'desde' : 'from'} {money(yearOf('starter') || 25)}{lang === 'es' ? '/año' : '/year'}</Text>

            {results ? (
              <View style={[styles.results, shadow]}>
                {results.map((r) => (
                  <View key={r.domain} style={styles.resultRow}>
                    <View style={{ flex: 1, minWidth: 160, gap: 4 }}>
                      <Text style={styles.domain}>{r.domain}</Text>
                      <Text style={[styles.pill, r.status === 'available' ? styles.ok : r.status === 'taken' ? styles.no : styles.maybe]}>
                        {t(r.status === 'available' ? L.available : r.status === 'taken' ? L.taken : L.unknown)}
                      </Text>
                    </View>
                    {r.status !== 'taken' ? (
                      <View style={styles.buyRow}>
                        <Pressable onPress={() => go(r.domain, 'starter')} style={styles.buyGhost} accessibilityRole="link">
                          <Text style={styles.buyGhostText}>{t(L.domainOnly)}</Text>
                          <Text style={styles.buyGhostPrice}>{money(yearOf('starter'))}{lang === 'es' ? '/año' : '/yr'}</Text>
                        </Pressable>
                        <Pressable onPress={() => go(r.domain, 'business')} style={styles.buy} accessibilityRole="link">
                          <Text style={styles.buyText}>{t(L.withEmail)}</Text>
                          <Text style={styles.buyPrice}>
                            {money(yearOf('business'))}
                            {lang === 'es' ? '/año' : '/yr'}
                            {setupOf('business') ? ` + ${money(setupOf('business'))}` : ''}
                          </Text>
                        </Pressable>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}
            {note ? <Text style={styles.note}>{note}</Text> : null}
          </View>
        </View>

        <View style={[styles.container, { paddingTop: 32, gap: 16 }]}>
          <Text style={styles.h2}>{t(L.whyTitle)}</Text>
          <View style={styles.grid}>
            {why.map((w) => (
              <View key={w.icon} style={[styles.why, shadow]}>
                <Ionicons name={w.icon as any} size={26} color={colors.primary} />
                <Text style={styles.whyTitle}>{t(w.t)}</Text>
                <Text style={styles.whyText}>{t(w.d)}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.h2, { marginTop: 16 }]}>{t(L.packages)}</Text>
          <View style={styles.grid}>
            {packages.map((p) => (
              <View key={p.slug} style={styles.cardCell}>
                <ProductCard product={p} />
              </View>
            ))}
          </View>

          <Text style={[styles.h2, { marginTop: 16 }]}>{t(L.faqTitle)}</Text>
          <View style={{ gap: 10 }}>
            {faq.map((f, i) => (
              <View key={i} style={[styles.faq, shadow]}>
                <Text style={styles.whyTitle}>{t(f.q)}</Text>
                <Text style={styles.whyText}>{t(f.a)}</Text>
              </View>
            ))}
          </View>
          <Link href="/" style={styles.back}>
            {lang === 'es' ? '← Ver todos los sistemas' : '← See all systems'}
          </Link>
        </View>
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 1000, alignSelf: 'center', paddingHorizontal: 16 },
  hero: { paddingTop: 40, paddingBottom: 36, overflow: 'hidden', position: 'relative' },
  sphere: { position: 'absolute', borderRadius: 999, backgroundColor: colors.primary, opacity: 0.08 },
  h1: { fontSize: 36, lineHeight: 42, fontWeight: '800', color: colors.text, letterSpacing: -0.8, maxWidth: 720 },
  sub: { fontSize: 16, lineHeight: 24, color: colors.muted, marginTop: 10, maxWidth: 640 },
  searchBox: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingLeft: 14,
    padding: 6,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 680,
  },
  searchInput: { flex: 1, minWidth: 0, fontSize: 17, paddingVertical: 12, color: colors.text, outlineStyle: 'none' } as any,
  searchBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 20, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  searchBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  hint: { fontSize: 13, color: colors.muted, marginTop: 8 },
  results: { marginTop: 16, backgroundColor: colors.surface, borderRadius: 16, padding: 8, borderWidth: 1, borderColor: colors.border, maxWidth: 680 },
  resultRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, padding: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  domain: { fontSize: 17, fontWeight: '800', color: colors.text },
  pill: { alignSelf: 'flex-start', fontSize: 12, fontWeight: '800', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
  ok: { backgroundColor: '#DCFCE7', color: '#166534' },
  no: { backgroundColor: '#FEE2E2', color: '#991B1B' },
  maybe: { backgroundColor: '#FEF3C7', color: '#92400E' },
  buyRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  buyGhost: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center' },
  buyGhostText: { fontSize: 13, fontWeight: '800', color: colors.primary },
  buyGhostPrice: { fontSize: 12, color: colors.muted },
  buy: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center' },
  buyText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  buyPrice: { fontSize: 12, color: 'rgba(255,255,255,0.85)' },
  note: { fontSize: 14, color: colors.muted, marginTop: 10 },
  h2: { fontSize: 24, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  why: { flexGrow: 1, flexBasis: 200, backgroundColor: colors.surface, borderRadius: 16, padding: 16, gap: 6, borderWidth: 1, borderColor: colors.border },
  whyTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  whyText: { fontSize: 14, lineHeight: 20, color: colors.muted },
  cardCell: { flexGrow: 1, flexBasis: 280, maxWidth: 480, minWidth: 0 },
  faq: { backgroundColor: colors.surface, borderRadius: 14, padding: 16, gap: 4, borderWidth: 1, borderColor: colors.border },
  back: { fontSize: 15, fontWeight: '700', color: colors.primary, marginTop: 12, marginBottom: 12 },
});
