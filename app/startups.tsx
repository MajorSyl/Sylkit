import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { Footer } from '../src/components/Footer';
import { Header } from '../src/components/Header';
import { ListingCard } from '../src/components/ListingCard';
import { useLang } from '../src/i18n';
import { budgets, feeTiers, listingCategories, ListingCategory, useListings } from '../src/lib/listings';
import { colors, shadow } from '../src/theme';

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
              ? 'Compra y vende apps, SaaS, tiendas online y sitios web con ingresos. Comisión solo si se vende.'
              : 'Buy and sell apps, SaaS, online stores and websites. Sellers pay only when the sale closes.'
          }
        />
      </Head>
      <Header />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.hero}>
          <View style={[styles.sphere, { width: 340, height: 340, top: -140, right: -90 }]} />
          <View style={[styles.sphere, { width: 220, height: 220, bottom: -110, left: -70, backgroundColor: colors.cyan }]} />
          <View style={styles.container}>
            <Text style={styles.kicker}>{es ? 'MERCADO DE NEGOCIOS DIGITALES' : 'DIGITAL BUSINESS MARKETPLACE'}</Text>
            <Text style={styles.h1}>{es ? 'Compra y vende negocios online' : 'Buy and sell online businesses'}</Text>
            <Text style={styles.sub}>
              {es
                ? 'Apps, SaaS, tiendas online y sitios web listos para tener nuevo dueño. Paga con USDT, Pago Móvil u Orange Money.'
                : 'Apps, SaaS, online stores and websites ready for a new owner. Pay with USDT, Pago Móvil or Orange Money.'}
            </Text>
            <View style={styles.heroBtns}>
              <Pressable style={styles.primary} onPress={() => router.push('/sell')} accessibilityRole="link">
                <Ionicons name="pricetag" size={18} color="#fff" />
                <Text style={styles.primaryText}>{es ? 'Vender mi negocio' : 'Sell my business'}</Text>
              </Pressable>
              <View style={styles.feeNote}>
                <Text style={styles.feeText}>
                  {es ? 'Publicar es gratis. Comisión solo al vender: ' : 'Listing is free. Fee only when it sells: '}
                  {feeTiers.map((f) => `${f.rate}%`).join(' → ')}
                </Text>
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
                    ? 'Sé el primero en publicar'
                    : 'Be the first to list'}
              </Text>
              <Text style={styles.emptyText}>
                {es
                  ? '¿Tienes una app, web o tienda online que ya no puedes atender? Publícala gratis y te conectamos con compradores.'
                  : 'Have an app, website or store you no longer have time for? List it free and we connect you with buyers.'}
              </Text>
              <Pressable style={styles.primary} onPress={() => router.push('/sell')} accessibilityRole="link">
                <Text style={styles.primaryText}>{es ? 'Publicar mi negocio' : 'List my business'}</Text>
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
                icon: 'create',
                t: es ? '1. Publica gratis' : '1. List for free',
                d: es ? 'Cuéntanos de tu negocio, ingresos y precio. Revisamos y publicamos en 48 horas.' : 'Tell us about your business, revenue and price. We review and publish within 48 hours.',
              },
              {
                icon: 'chatbubbles',
                t: es ? '2. Recibe compradores' : '2. Meet buyers',
                d: es ? 'Los compradores piden detalles o hacen ofertas. Te presentamos a los serios.' : 'Buyers ask for details or make offers. We introduce you to the serious ones.',
              },
              {
                icon: 'shield-checkmark',
                t: es ? '3. Cierra la venta' : '3. Close the deal',
                d: es
                  ? 'Te ayudamos con el acuerdo y la entrega del código, dominio y cuentas. Pagas la comisión solo al vender.'
                  : 'We help with the agreement and the handover of code, domain and accounts. You pay the fee only when it sells.',
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
