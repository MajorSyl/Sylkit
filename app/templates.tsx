import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { useState } from 'react';
import { Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Footer } from '../src/components/Footer';
import { Header } from '../src/components/Header';
import { STORE_PRODUCT, storeTemplates, templateSectors } from '../src/data/storeTemplates';
import { useLang } from '../src/i18n';
import { templatePreview, templateShot } from '../src/lib/templateShot';
import { useClientWidth } from '../src/lib/useClientWidth';
import { colors, shadow } from '../src/theme';

// Store templates gallery, organized like a theme store: filter by business type, preview the
// live store, then "Use this design" carries the choice into the online store checkout.
// Arriving from checkout (?plan=&billing=) sends the visitor straight back with the design chosen.

const INCLUDED: { icon: string; es: string; en: string }[] = [
  { icon: 'logo-whatsapp', es: 'Pedidos completos directo a tu WhatsApp', en: 'Complete orders straight to your WhatsApp' },
  { icon: 'cart-outline', es: 'Carrito, tallas, colores y cantidades', en: 'Cart, sizes, colors and quantities' },
  { icon: 'phone-portrait-outline', es: 'Hecha para el teléfono primero', en: 'Built for phones first' },
  { icon: 'language-outline', es: 'Español e inglés automático', en: 'Automatic Spanish and English' },
  { icon: 'card-outline', es: 'Pago Móvil, Zelle, USDT, efectivo o tarjeta', en: 'Pago Móvil, Zelle, USDT, cash or card' },
  { icon: 'globe-outline', es: 'Tu propio dominio o tunegocio.sylkit.com', en: 'Your own domain or yourbusiness.sylkit.com' },
];

export default function TemplatesPage() {
  const { lang, t } = useLang();
  const es = lang === 'es';
  const L = (v: [string, string]) => (es ? v[0] : v[1]);
  const router = useRouter();
  const width = useClientWidth();
  const cols = width >= 1040 ? 3 : width >= 680 ? 2 : 1;
  // Coming back from checkout: keep everything already chosen there (plan, billing, extras, web address).
  const { plan, billing, add, domain } = useLocalSearchParams<{ plan?: string; billing?: string; add?: string; domain?: string }>();
  const [sector, setSector] = useState('all');
  const list = storeTemplates.filter((x) => sector === 'all' || x.sector === sector);

  const preview = (slug: string) => {
    const url = templatePreview(slug);
    if (Platform.OS === 'web') {
      try {
        window.open(url, '_blank', 'noopener');
        return;
      } catch {}
    }
    Linking.openURL(url);
  };
  const use = (slug: string) =>
    router.push(
      (plan
        ? `/checkout?product=${STORE_PRODUCT}&plan=${encodeURIComponent(plan)}&billing=${encodeURIComponent(billing || 'yearly')}${add ? `&add=${encodeURIComponent(add)}` : ''}${domain ? `&domain=${encodeURIComponent(domain)}` : ''}&template=${slug}`
        : `/product/${STORE_PRODUCT}?template=${slug}`) as any,
    );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Head>
        <title>{es ? 'Plantillas de tienda en línea · Sylkit' : 'Online store templates · Sylkit'}</title>
        <meta
          name="description"
          content={
            es
              ? 'Diseños originales para tu tienda en línea con pedidos por WhatsApp: moda, belleza, tecnología, comida, víveres, joyería, hogar y mascotas.'
              : 'Original designs for your online store with WhatsApp orders: fashion, beauty, electronics, food, grocery, jewelry, home and pets.'
          }
        />
      </Head>
      <Header />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <Text style={styles.kicker}>{es ? 'PLANTILLAS · TIENDA EN LÍNEA' : 'TEMPLATES · ONLINE STORE'}</Text>
          <Text style={[styles.h1, width >= 860 && { fontSize: 44, lineHeight: 50 }]}>
            {es ? 'Elige el diseño de tu tienda en línea' : 'Pick the design for your online store'}
          </Text>
          <Text style={styles.lead}>
            {es
              ? 'Diseños originales para negocios que venden por WhatsApp. Gratis con cualquier plan de tienda: la armamos con tu logo, tus productos y tus colores.'
              : 'Original designs for businesses that sell on WhatsApp. Free with any store plan: we set it up with your logo, products and colors.'}
          </Text>

          {plan ? (
            <View style={styles.notice}>
              <Ionicons name="information-circle" size={18} color={colors.primary} />
              <Text style={styles.noticeText}>{es ? 'Elige un diseño y volverás a tu carrito.' : "Pick a design and you'll go back to your cart."}</Text>
            </View>
          ) : null}

          {/* Filter by business type */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {[{ id: 'all', name: ['Todos', 'All'] as [string, string] }, ...templateSectors].map((s) => {
              const on = sector === s.id;
              return (
                <Pressable key={s.id} onPress={() => setSector(s.id)} style={[styles.chip, on && styles.chipOn]} accessibilityRole="button" accessibilityState={{ selected: on }}>
                  <Text style={[styles.chipText, on && { color: '#fff' }]}>{L(s.name)}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.grid}>
            {list.map((x) => (
              <View key={x.slug} style={[styles.card, shadow, { width: cols === 1 ? '100%' : cols === 2 ? '48.6%' : '31.8%' }]}>
                <Pressable onPress={() => preview(x.slug)} style={[styles.shotWrap, { backgroundColor: x.colors.bg }]} accessibilityRole="link" accessibilityLabel={`${x.name}: ${es ? 'vista previa' : 'preview'}`}>
                  <Image source={{ uri: templateShot(x.slug, 'desktop') }} style={styles.shot} resizeMode="cover" />
                  <View style={styles.phone}>
                    <Image source={{ uri: templateShot(x.slug, 'phone') }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  </View>
                </Pressable>
                <View style={styles.body}>
                  <View style={styles.titleRow}>
                    <View style={[styles.dot, { backgroundColor: x.colors.accent }]} />
                    <Text style={styles.name}>{x.name}</Text>
                    <Text style={styles.tag}>{L(x.sectorName)}</Text>
                  </View>
                  <Text style={styles.blurb}>{L(x.blurb)}</Text>
                  <Text style={styles.free}>{es ? 'Incluida gratis con tu tienda' : 'Included free with your store'}</Text>
                  <View style={styles.actions}>
                    <Pressable onPress={() => preview(x.slug)} style={[styles.btn, styles.btnGhost]} accessibilityRole="link">
                      <Ionicons name="eye-outline" size={17} color={colors.primary} />
                      <Text style={[styles.btnText, { color: colors.primary }]}>{es ? 'Ver en vivo' : 'Live preview'}</Text>
                    </Pressable>
                    <Pressable onPress={() => use(x.slug)} style={[styles.btn, styles.btnPrimary]} accessibilityRole="button">
                      <Text style={[styles.btnText, { color: '#fff' }]}>{es ? 'Usar este diseño' : 'Use this design'}</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* What every template includes */}
          <View style={[styles.included, shadow]}>
            <Text style={styles.h2}>{es ? 'Todas las plantillas incluyen' : 'Every template includes'}</Text>
            <View style={styles.incGrid}>
              {INCLUDED.map((i) => (
                <View key={i.icon} style={[styles.incItem, { width: cols === 1 ? '100%' : '48%' }]}>
                  <View style={styles.incIcon}>
                    <Ionicons name={i.icon as any} size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.incText}>{es ? i.es : i.en}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.custom}>
            <Text style={[styles.h2, { textAlign: 'center' }]}>{es ? '¿Quieres un diseño único?' : 'Want a one-of-a-kind design?'}</Text>
            <Text style={[styles.lead, { textAlign: 'center', alignSelf: 'center' }]}>
              {es ? 'Diseñamos tu tienda desde cero con tu marca.' : 'We design your store from scratch around your brand.'}
            </Text>
            <Pressable onPress={() => router.push("/quote" as any)} style={[styles.btn, styles.btnGhost, { alignSelf: 'center', paddingHorizontal: 22 }]} accessibilityRole="link">
              <Text style={[styles.btnText, { color: colors.primary }]}>{es ? 'Pedir diseño a medida' : 'Request a custom design'}</Text>
            </Pressable>
          </View>
        </View>
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 1180, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 28, paddingBottom: 40, gap: 12 },
  kicker: { fontSize: 12, fontWeight: '800', color: colors.primary, letterSpacing: 1 },
  h1: { fontSize: 32, lineHeight: 38, fontWeight: '800', color: colors.text, letterSpacing: -0.6 },
  h2: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  lead: { fontSize: 16, lineHeight: 24, color: colors.muted, maxWidth: 720 },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.softBlue, borderRadius: 12, padding: 12 },
  noticeText: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text },
  chips: { gap: 8, paddingVertical: 8 },
  chip: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 999, paddingHorizontal: 16, minHeight: 40, justifyContent: 'center' },
  chipOn: { backgroundColor: colors.text, borderColor: colors.text },
  chipText: { fontSize: 14, fontWeight: '700', color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 18, justifyContent: 'space-between' },
  card: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  shotWrap: { aspectRatio: 4 / 3, position: 'relative', overflow: 'hidden', borderBottomWidth: 1, borderBottomColor: colors.border },
  shot: { width: '100%', height: '100%' },
  phone: { position: 'absolute', right: 14, bottom: -24, width: '24%', aspectRatio: 1 / 2, borderRadius: 14, borderWidth: 3, borderColor: '#0B1B3A', overflow: 'hidden', backgroundColor: '#fff' },
  body: { padding: 16, gap: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 12, height: 12, borderRadius: 999 },
  name: { fontSize: 19, fontWeight: '800', color: colors.text, flex: 1 },
  tag: { fontSize: 12, fontWeight: '800', color: colors.primary, backgroundColor: colors.softBlue, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
  blurb: { fontSize: 14, lineHeight: 20, color: colors.muted },
  free: { fontSize: 13, fontWeight: '700', color: '#0E7F98' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 44, borderRadius: 12, paddingHorizontal: 10 },
  btnGhost: { borderWidth: 1.5, borderColor: colors.primary },
  btnPrimary: { backgroundColor: colors.primary },
  btnText: { fontSize: 14, fontWeight: '800' },
  included: { marginTop: 28, backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 20, gap: 14 },
  incGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  incItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  incIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.softBlue, alignItems: 'center', justifyContent: 'center' },
  incText: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  custom: { marginTop: 24, gap: 10, alignItems: 'stretch' },
});
