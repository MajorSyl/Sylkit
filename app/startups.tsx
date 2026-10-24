import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { Footer } from '../src/components/Footer';
import { Header } from '../src/components/Header';
import { ListingCard } from '../src/components/ListingCard';
import { useLang } from '../src/i18n';
import { budgets, listingCategories, ListingCategory, useListings } from '../src/lib/listings';
import { colors, shadow, waLink } from '../src/theme';

// Marketplace of small online businesses for sale (apps, SaaS, stores, content sites).

export default function StartupsPage() {
  const { t, lang } = useLang();
  const es = lang === 'es';
  const router = useRouter();
  const { width } = useWindowDimensions();
  const cols = width >= 1060 ? 3 : width >= 700 ? 2 : 1;
  const { list } = useListings();
  const [cat, setCat] = useState<ListingCategory | 'all'>('all');
  const [budget, setBudget] = useState('all');
  const [q, setQ] = useState('');

  const forSale = useMemo(() => {
    const b = budgets.find((x) => x.id === budget)!;
    const term = q.trim().toLowerCase();
    return (list ?? []).filter((l) => {
      if (l.status === 'sold') return false;
      if (cat !== 'all' && l.category !== cat) return false;
      const price = Number(l.asking_price);
      if (b.max != null && price > b.max) return false;
      if (b.min != null && price < b.min) return false;
      if (term && !`${l.title} ${l.tagline} ${l.tech_stack.join(' ')}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [list, cat, budget, q]);
  const sold = useMemo(() => (list ?? []).filter((l) => l.status === 'sold').slice(0, 6), [list]);

  const grid = (items: typeof forSale) => (
    <View style={styles.grid}>
      {items.map((l) => (
        <View key={l.id} style={{ width: `${100 / cols}%` as any, padding: 8 }}>
          <ListingCard listing={l} />
        </View>
      ))}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Head>
        <title>{es ? 'Negocios en venta · Sylkit' : 'Startups for sale · Sylkit'}</title>
        <meta
          name="description"
          content={
            es
              ? 'Apps, SaaS, tiendas online y sitios web creados por Sylkit, listos para un nuevo dueño.'
              : 'Apps, SaaS, online stores and websites built by Sylkit, ready for a new owner.'
          }
        />
      </Head>
      <Header />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.hero}>
          <View style={[styles.sphere, { width: 340, height: 340, top: -140, right: -90 }]} />
          <View style={[styles.sphere, { width: 220, height: 220, bottom: -110, left: -70, backgroundColor: colors.cyan }]} />
          <View style={styles.container}>
            <Text style={styles.kicker}>{es ? 'NEGOCIOS EN VENTA POR SYLKIT' : 'STARTUPS FOR SALE BY SYLKIT'}</Text>
            <Text style={styles.h1}>{es ? 'Sé dueño de un negocio online' : 'Own an online business'}</Text>
            <Text style={styles.sub}>
              {es
                ? 'Compras el negocio completo, con su marca, usuarios e ingresos, y pasa a ser tuyo. Apps, SaaS, tiendas y sitios web creados por Sylkit. Paga con USDT, Pago Móvil u Orange Money.'
                : 'You buy the whole business, with its brand, users and revenue, and it becomes yours. Apps, SaaS, stores and websites built by Sylkit. Pay with USDT, Pago Móvil or Orange Money.'}
            </Text>
            <Link href="/" style={styles.crossLink}>
              {es ? '¿Buscas software para usar en tu negocio? Ver el catálogo →' : 'Looking for software to use in your business? See the catalog →'}
            </Link>
            <View style={styles.heroBtns}>
              <Pressable style={[styles.primary, { backgroundColor: colors.whatsapp }]} onPress={() => Linking.openURL(waLink(es ? 'Hola, me interesa comprar un negocio de Sylkit.' : "Hi, I'm interested in buying a business from Sylkit."))} accessibilityRole="link">
                <Ionicons name="logo-whatsapp" size={18} color="#fff" />
                <Text style={styles.primaryText}>{es ? 'Preguntar por WhatsApp' : 'Ask on WhatsApp'}</Text>
              </Pressable>
              <View style={styles.feeNote}>
                <Text style={styles.feeText}>{es ? 'Incluye código, marca y dominio + 30 días de soporte' : 'Includes code, brand and domain + 30 days of support'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.container, { gap: 14, paddingTop: 8 }]}>
          <View style={[styles.search, shadow]}>
            <Ionicons name="search" size={18} color={colors.muted} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder={es ? 'Buscar por nombre, tecnología…' : 'Search by name, tech stack…'}
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
              accessibilityLabel={es ? 'Buscar' : 'Search'}
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            <Chip on={cat === 'all'} label={es ? 'Todas' : 'All'} onPress={() => setCat('all')} />
            {listingCategories.map((c) => (
              <Chip key={c.id} on={cat === c.id} label={t(c.name)} onPress={() => setCat(c.id)} />
            ))}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {budgets.map((b) => (
              <Chip key={b.id} on={budget === b.id} label={t(b.name)} onPress={() => setBudget(b.id)} light />
            ))}
          </ScrollView>

          {list == null ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 60 }} />
          ) : forSale.length ? (
            grid(forSale)
          ) : (
            <View style={[styles.empty, shadow]}>
              <Ionicons name="rocket" size={36} color={colors.primary} />
              <Text style={styles.emptyTitle}>
                {(list ?? []).some((l) => l.status !== 'sold')
                  ? es
                    ? 'Nada con esos filtros'
                    : 'Nothing matches those filters'
                  : es
                    ? 'Nuevos negocios muy pronto'
                    : 'New startups coming soon'}
              </Text>
              <Text style={styles.emptyText}>
                {es
                  ? 'Dinos qué tipo de negocio quieres tener y te avisamos apenas tengamos uno para ti.'
                  : 'Tell us what kind of business you want to own and we will let you know as soon as we have one for you.'}
              </Text>
              <Pressable
                style={[styles.primary, { backgroundColor: colors.whatsapp }]}
                onPress={() => Linking.openURL(waLink(es ? 'Hola, quiero comprar un negocio online. Busco:' : 'Hi, I want to buy an online business. I am looking for:'))}
                accessibilityRole="link"
              >
                <Ionicons name="logo-whatsapp" size={18} color="#fff" />
                <Text style={styles.primaryText}>{es ? 'Avísame por WhatsApp' : 'Notify me on WhatsApp'}</Text>
              </Pressable>
            </View>
          )}

          {sold.length ? (
            <>
              <Text style={[styles.h2, { marginTop: 24 }]}>{es ? 'Vendidos recientemente' : 'Recently sold'}</Text>
              {grid(sold)}
            </>
          ) : null}

          {/* How it works */}
          <Text style={[styles.h2, { marginTop: 24 }]}>{es ? 'Cómo funciona' : 'How it works'}</Text>
          <View style={styles.howGrid}>
            {[
              {
                icon: 'search',
                t: es ? '1. Elige un negocio' : '1. Pick a business',
                d: es ? 'Mira los números, prueba la demo y revisa qué incluye.' : 'Check the numbers, try the demo and see what is included.',
              },
              {
                icon: 'chatbubbles',
                t: es ? '2. Pide detalles u oferta' : '2. Ask or make an offer',
                d: es ? 'Te respondemos en menos de 24 horas con la información completa.' : 'We reply within 24 hours with the full details.',
              },
              {
                icon: 'shield-checkmark',
                t: es ? '3. Recibe tu negocio' : '3. Take it over',
                d: es
                  ? 'Firmamos el acuerdo, pagas y te entregamos código, dominio y cuentas, con 30 días de soporte.'
                  : 'We sign the agreement, you pay, and we hand over the code, domain and accounts, with 30 days of support.',
              },
            ].map((s) => (
              <View key={s.icon} style={[styles.how, shadow]}>
                <Ionicons name={s.icon as any} size={26} color={colors.primary} />
                <Text style={styles.howTitle}>{s.t}</Text>
                <Text style={styles.howText}>{s.d}</Text>
              </View>
            ))}
          </View>
        </View>
        <Footer />
      </ScrollView>
    </View>
  );
}

function Chip({ on, label, onPress, light }: { on: boolean; label: string; onPress: () => void; light?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, light && styles.chipLight, on && styles.chipOn]} accessibilityRole="button" accessibilityState={{ selected: on }}>
      <Text style={[styles.chipText, on && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 1180, alignSelf: 'center', paddingHorizontal: 16 },
  hero: { paddingTop: 44, paddingBottom: 32, overflow: 'hidden', position: 'relative' },
  sphere: { position: 'absolute', borderRadius: 999, backgroundColor: colors.primary, opacity: 0.08 },
  kicker: { fontSize: 12, fontWeight: '800', color: colors.primary, letterSpacing: 1.2 },
  h1: { fontSize: 40, lineHeight: 46, fontWeight: '800', color: colors.text, letterSpacing: -1, marginTop: 8, maxWidth: 760 },
  crossLink: { fontSize: 14, fontWeight: '700', color: colors.primary, marginTop: 10 },
  sub: { fontSize: 17, lineHeight: 25, color: colors.muted, marginTop: 12, maxWidth: 680 },
  heroBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginTop: 22 },
  primary: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14, minHeight: 48, alignSelf: 'flex-start' },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  feeNote: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  feeText: { fontSize: 13, color: colors.text, fontWeight: '600' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, minWidth: 0, paddingVertical: 13, fontSize: 16, color: colors.text, outlineStyle: 'none' } as any,
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipLight: { backgroundColor: 'transparent' },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 },
  empty: { backgroundColor: colors.surface, borderRadius: 20, padding: 28, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.border },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center' },
  emptyText: { fontSize: 15, lineHeight: 22, color: colors.muted, textAlign: 'center', maxWidth: 520 },
  h2: { fontSize: 24, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  howGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  how: { flexGrow: 1, flexBasis: 260, backgroundColor: colors.surface, borderRadius: 16, padding: 18, gap: 6, borderWidth: 1, borderColor: colors.border },
  howTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  howText: { fontSize: 14, lineHeight: 20, color: colors.muted },
});
