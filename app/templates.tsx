import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { useEffect, useState } from 'react';
import { Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Footer } from '../src/components/Footer';
import { Header } from '../src/components/Header';
import { getTemplate, storeTemplates, TemplateKind, templateKinds, templateSectors } from '../src/data/storeTemplates';
import { useLang } from '../src/i18n';
import { templatePreview, templateShot } from '../src/lib/templateShot';
import { useClientWidth } from '../src/lib/useClientWidth';
import { colors, shadow } from '../src/theme';
import { tx } from '../src/i18n';
import { tplText } from '../src/lib/names';

// Design templates gallery, organized like a theme store: online stores, websites and mobile apps,
// filtered by business type. "Live preview" opens the working template; "Use this design" carries
// the choice to that template's product (store, business website or mobile app).
// Arriving from checkout (?product=&plan=&billing=…) sends the visitor straight back with the design chosen.

type Inc = { icon: string; es: string; en: string; pt?: string };
const INCLUDED: Record<TemplateKind, Inc[]> = {
  store: [
    { icon: 'logo-whatsapp', es: 'Pedidos completos directo a tu WhatsApp', en: 'Complete orders straight to your WhatsApp', pt: "Pedidos completos direto no seu WhatsApp" },
    { icon: 'cart-outline', es: 'Carrito, tallas, colores y cantidades', en: 'Cart, sizes, colors and quantities', pt: "Carrinho, tamanhos, cores e quantidades" },
    { icon: 'card-outline', es: 'Pago Móvil, transferencia, USDT, efectivo o tarjeta', en: 'Pago Móvil, bank transfer, USDT, cash or card', pt: "Pix, cartão, USDT, dinheiro e outros métodos" },
    { icon: 'phone-portrait-outline', es: 'Hecha para el teléfono primero', en: 'Built for phones first', pt: "Feito primeiro para celular" },
    { icon: 'language-outline', es: 'Español e inglés automático', en: 'Automatic Spanish and English', pt: "Espanhol e inglês automáticos" },
    { icon: 'globe-outline', es: 'Tu propio dominio o tunegocio.sylkit.com', en: 'Your own domain or yourbusiness.sylkit.com', pt: "Seu próprio domínio ou seunegocio.sylkit.com" },
  ],
  website: [
    { icon: 'images-outline', es: 'Portafolio o listado de propiedades con filtros', en: 'Portfolio or property listings with filters', pt: "Portfólio ou anúncios de imóveis com filtros" },
    { icon: 'logo-whatsapp', es: 'Formularios y visitas que llegan a tu WhatsApp', en: 'Forms and visit requests sent to your WhatsApp', pt: "Formulários e pedidos de visita enviados ao seu WhatsApp" },
    { icon: 'search-outline', es: 'Optimizado para Google', en: 'Optimized for Google', pt: "Otimizado para o Google" },
    { icon: 'phone-portrait-outline', es: 'Se ve perfecto en teléfono y computadora', en: 'Looks great on phones and computers', pt: "Fica ótimo no celular e no computador" },
    { icon: 'language-outline', es: 'Español e inglés automático', en: 'Automatic Spanish and English', pt: "Espanhol e inglês automáticos" },
    { icon: 'globe-outline', es: 'Tu propio dominio y correo profesional', en: 'Your own domain and business email', pt: "Seu próprio domínio e e-mail profissional" },
  ],
  app: [
    { icon: 'logo-apple', es: 'Para iPhone y Android', en: 'For iPhone and Android', pt: "Para iPhone e Android" },
    { icon: 'notifications-outline', es: 'Avisos a tus clientes en el teléfono', en: 'Notifications on your clients’ phones', pt: "Notificações no celular dos seus clientes" },
    { icon: 'logo-whatsapp', es: 'Solicitudes y visitas directo a tu WhatsApp', en: 'Requests and visits straight to your WhatsApp', pt: "Pedidos e visitas direto no seu WhatsApp" },
    { icon: 'cloud-upload-outline', es: 'La publicamos en las tiendas de apps', en: 'We publish it on the app stores', pt: "Publicamos nas lojas de apps" },
    { icon: 'sync-outline', es: 'Combina con tu sitio web del mismo diseño', en: 'Matches your website in the same design', pt: "Combina com seu site no mesmo design" },
    { icon: 'language-outline', es: 'Español e inglés automático', en: 'Automatic Spanish and English', pt: "Espanhol e inglês automáticos" },
  ],
};

export default function TemplatesPage() {
  const { lang, t } = useLang();
  const es = lang === 'es';
  const L = tplText;
  const router = useRouter();
  const width = useClientWidth();
  const cols = width >= 1040 ? 3 : width >= 680 ? 2 : 1;
  // From checkout: keep everything already chosen there (product, plan, billing, extras, web address).
  const q = useLocalSearchParams<{ kind?: string; product?: string; plan?: string; billing?: string; add?: string; domain?: string }>();
  const fromKind = (storeTemplates.find((x) => x.product === q.product)?.kind ?? (templateKinds.some((k) => k.id === q.kind) ? q.kind : 'store')) as TemplateKind;
  const [kind, setKind] = useState<TemplateKind>(fromKind);
  const [sector, setSector] = useState('all');
  useEffect(() => setKind(fromKind), [fromKind]);
  const ofKind = storeTemplates.filter((x) => x.kind === kind);
  const sectors = templateSectors.filter((s) => ofKind.some((x) => x.sector === s.id));
  const list = ofKind.filter((x) => sector === 'all' || x.sector === sector);
  const switchKind = (k: TemplateKind) => {
    setKind(k);
    setSector('all');
  };

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
  const use = (slug: string) => {
    const tpl = getTemplate(slug)!;
    const back = q.plan && q.product === tpl.product;
    const keep = [q.add && `add=${encodeURIComponent(q.add)}`, q.domain && `domain=${encodeURIComponent(q.domain)}`].filter(Boolean).join('&');
    router.push(
      (back
        ? `/checkout?product=${tpl.product}&plan=${encodeURIComponent(q.plan!)}&billing=${encodeURIComponent(q.billing || 'yearly')}${keep ? `&${keep}` : ''}&template=${slug}`
        : `/product/${tpl.product}?template=${slug}`) as any,
    );
  };
  const pairLabel = (k: TemplateKind) => (k === 'app' ? (tx('Also as a website', 'También como sitio web', "Também como site")) : tx('Also as an app', 'También como app', "Também como app"));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Head>
        <title>{tx('Design templates: stores, websites and apps · Sylkit', 'Plantillas de diseño: tiendas, sitios web y apps · Sylkit', "Modelos de design: lojas, sites e apps · Sylkit")}</title>
        <meta
          name="description"
          content={
            tx('Designs ready for your business: online stores with WhatsApp, architecture and real estate websites, and mobile apps.', 'Diseños listos para tu negocio: tiendas en línea con WhatsApp, sitios web de arquitectura e inmobiliaria, y apps móviles.', "Designs prontos para o seu negócio: lojas online com WhatsApp, sites de arquitetura e imobiliárias, e apps para celular.")
          }
        />
      </Head>
      <Header />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <Text style={styles.kicker}>{tx('DESIGN TEMPLATES', 'PLANTILLAS DE DISEÑO', "MODELOS DE DESIGN")}</Text>
          <Text style={[styles.h1, width >= 860 && { fontSize: 44, lineHeight: 50 }]}>
            {tx('Pick a design and we adapt it to your business', 'Elige un diseño y lo adaptamos a tu negocio', "Escolha um design e nós o adaptamos ao seu negócio")}
          </Text>
          <Text style={styles.lead}>
            {tx('Online stores, websites and mobile apps with original designs. Included free with your plan: we set them up with your logo, colors and content.', 'Tiendas en línea, sitios web y apps móviles con diseños originales. Incluidos gratis en tu plan: los armamos con tu logo, tus colores y tu contenido.', "Lojas online, sites e apps para celular com designs originais. Incluído grátis no seu plano: configuramos com seu logo, cores e conteúdo.")}
          </Text>

          {q.plan ? (
            <View style={styles.notice}>
              <Ionicons name="information-circle" size={18} color={colors.primary} />
              <Text style={styles.noticeText}>{tx("Pick a design and you'll go back to your cart.", 'Elige un diseño y volverás a tu carrito.', "Escolha um design e você volta ao seu carrinho.")}</Text>
            </View>
          ) : null}

          {/* Kind: stores, websites, apps */}
          <View style={styles.kinds} accessibilityRole="tablist">
            {templateKinds.map((k) => {
              const on = kind === k.id;
              const n = storeTemplates.filter((x) => x.kind === k.id).length;
              return (
                <Pressable key={k.id} onPress={() => switchKind(k.id)} style={[styles.kind, on && styles.kindOn]} accessibilityRole="tab" accessibilityState={{ selected: on }}>
                  <Ionicons name={k.id === 'store' ? 'bag-handle-outline' : k.id === 'website' ? 'desktop-outline' : 'phone-portrait-outline'} size={17} color={on ? colors.primary : colors.muted} />
                  <Text style={[styles.kindText, on && { color: colors.text }]}>
                    {L(k.name)} <Text style={styles.kindCount}>{n}</Text>
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Filter by business type */}
          {sectors.length > 1 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {[{ id: 'all', name: ['Todos', 'All'] as [string, string] }, ...sectors].map((s) => {
                const on = sector === s.id;
                return (
                  <Pressable key={s.id} onPress={() => setSector(s.id)} style={[styles.chip, on && styles.chipOn]} accessibilityRole="button" accessibilityState={{ selected: on }}>
                    <Text style={[styles.chipText, on && { color: '#fff' }]}>{L(s.name)}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : null}

          <View style={styles.grid}>
            {list.map((x) => (
              <View key={x.slug} style={[styles.card, shadow, { width: cols === 1 ? '100%' : cols === 2 ? '48.6%' : '31.8%' }]}>
                <Pressable onPress={() => preview(x.slug)} style={[styles.shotWrap, { backgroundColor: x.colors.bg }]} accessibilityRole="link" accessibilityLabel={`${x.name}: ${tx('preview', 'vista previa', "visualizar")}`}>
                  <Image source={{ uri: templateShot(x.slug, 'desktop') }} style={styles.shot} resizeMode="cover" />
                  {x.kind !== 'app' ? (
                    <View style={styles.phone}>
                      <Image source={{ uri: templateShot(x.slug, 'phone') }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    </View>
                  ) : null}
                </Pressable>
                <View style={styles.body}>
                  <View style={styles.titleRow}>
                    <View style={[styles.dot, { backgroundColor: x.colors.accent }]} />
                    <Text style={styles.name}>{x.name}</Text>
                    <Text style={styles.tag}>{L(x.sectorName)}</Text>
                  </View>
                  <Text style={styles.sub}>{L(x.tagline)}</Text>
                  <Text style={styles.blurb}>{L(x.blurb)}</Text>
                  {x.credit ? (
                    <Text style={styles.credit}>
                      {tx('Design based on work by', 'Diseño basado en el trabajo de', 'Design baseado no trabalho de')}{' '}
                      <Text style={styles.creditLink} onPress={() => Linking.openURL(x.credit!.url)} accessibilityRole="link">
                        {x.credit.author}
                      </Text>{' '}
                      ({x.credit.source}, {x.credit.license})
                    </Text>
                  ) : null}
                  {x.pair ? (
                    <Pressable onPress={() => switchKind(getTemplate(x.pair)!.kind)} accessibilityRole="button">
                      <Text style={styles.pair}>↔ {pairLabel(x.kind)}</Text>
                    </Pressable>
                  ) : null}
                  <View style={styles.actions}>
                    <Pressable onPress={() => preview(x.slug)} style={[styles.btn, styles.btnGhost]} accessibilityRole="link">
                      <Ionicons name="eye-outline" size={17} color={colors.primary} />
                      <Text style={[styles.btnText, { color: colors.primary }]}>{tx('Live preview', 'Ver en vivo', "Visualização ao vivo")}</Text>
                    </Pressable>
                    <Pressable onPress={() => use(x.slug)} style={[styles.btn, styles.btnPrimary]} accessibilityRole="button">
                      <Text style={[styles.btnText, { color: '#fff' }]}>{tx('Use this design', 'Usar este diseño', "Usar este design")}</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* What every template of this kind includes */}
          <View style={[styles.included, shadow]}>
            <Text style={styles.h2}>{tx('Every one includes', 'Todas incluyen', "Todos incluem")}</Text>
            <View style={styles.incGrid}>
              {INCLUDED[kind].map((i) => (
                <View key={i.icon} style={[styles.incItem, { width: cols === 1 ? '100%' : '48%' }]}>
                  <View style={styles.incIcon}>
                    <Ionicons name={i.icon as any} size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.incText}>{t(i)}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.custom}>
            <Text style={[styles.h2, { textAlign: 'center' }]}>{tx('Want a one-of-a-kind design?', '¿Quieres un diseño único?', "Quer um design exclusivo?")}</Text>
            <Text style={[styles.lead, { textAlign: 'center', alignSelf: 'center' }]}>
              {tx('We design your store, website or app from scratch around your brand.', 'Diseñamos tu tienda, sitio web o app desde cero con tu marca.', "Criamos sua loja, site ou app do zero com a sua marca.")}
            </Text>
            <Pressable onPress={() => router.push('/quote' as any)} style={[styles.btn, styles.btnGhost, { alignSelf: 'center', paddingHorizontal: 22, flex: 0 }]} accessibilityRole="link">
              <Text style={[styles.btnText, { color: colors.primary }]}>{tx('Request a custom design', 'Pedir diseño a medida', "Pedir um design personalizado")}</Text>
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
  kinds: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 5, alignSelf: 'flex-start', marginTop: 6 },
  kind: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, minHeight: 42, borderRadius: 10 },
  kindOn: { backgroundColor: colors.softBlue },
  kindText: { fontSize: 14, fontWeight: '800', color: colors.muted },
  kindCount: { fontSize: 12, fontWeight: '700', color: colors.muted },
  chips: { gap: 8, paddingVertical: 8 },
  chip: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 999, paddingHorizontal: 16, minHeight: 40, justifyContent: 'center' },
  chipOn: { backgroundColor: colors.text, borderColor: colors.text },
  chipText: { fontSize: 14, fontWeight: '700', color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', marginTop: 4 },
  card: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  shotWrap: { aspectRatio: 4 / 3, position: 'relative', overflow: 'hidden', borderBottomWidth: 1, borderBottomColor: colors.border },
  shot: { width: '100%', height: '100%' },
  phone: { position: 'absolute', right: 14, bottom: -24, width: '24%', aspectRatio: 1 / 2, borderRadius: 14, borderWidth: 3, borderColor: '#0B1B3A', overflow: 'hidden', backgroundColor: '#fff' },
  body: { padding: 16, gap: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 12, height: 12, borderRadius: 999 },
  name: { fontSize: 19, fontWeight: '800', color: colors.text, flex: 1 },
  tag: { fontSize: 12, fontWeight: '800', color: colors.primary, backgroundColor: colors.softBlue, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
  sub: { fontSize: 13, fontWeight: '700', color: colors.text },
  blurb: { fontSize: 14, lineHeight: 20, color: colors.muted },
  credit: { fontSize: 12, lineHeight: 17, color: colors.muted },
  creditLink: { textDecorationLine: 'underline' },
  pair: { fontSize: 13, fontWeight: '800', color: '#0E7F98', paddingVertical: 4 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 6 },
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
