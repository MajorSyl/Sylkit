import { Redirect, useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Footer } from '../src/components/Footer';
import { Header } from '../src/components/Header';
import { QuoteForm } from '../src/components/QuoteForm';
import { useLang } from '../src/i18n';
import { useProducts } from '../src/lib/catalog';
import { configFromQuery, estimate, useAddons } from '../src/lib/pricing';
import { colors, waLink } from '../src/theme';
import { tx } from '../src/i18n';

export default function QuotePage() {
  const { product, plan, billing, add, domain, template } = useLocalSearchParams<{ product?: string; plan?: string; billing?: string; add?: string; domain?: string; template?: string }>();
  const { t, lang } = useLang();
  const list = useProducts();
  const catalog = useAddons();
  const p = product ? list.find((x) => x.slug === product) : undefined;
  const es = lang === 'es';
  const cfg = p?.pricing ? configFromQuery({ plan, billing, add, domain, template }) : null;
  const est = cfg && p?.pricing ? estimate(p.pricing, catalog, cfg) : null;

  // Fixed-price plans are bought on the one-page checkout; this page is for custom requests.
  if (p?.pricing) {
    const qs = [`product=${encodeURIComponent(p.slug)}`, plan && `plan=${encodeURIComponent(plan)}`, billing && `billing=${encodeURIComponent(billing)}`, add && `add=${encodeURIComponent(add)}`, domain && `domain=${encodeURIComponent(domain)}`, template && `template=${encodeURIComponent(template)}`].filter(Boolean).join('&');
    return <Redirect href={`/checkout?${qs}`} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Head>
        <title>{est ? (tx('Checkout · Sylkit', 'Pagar · Sylkit', "Finalizar compra · Sylkit")) : tx('Request a quote · Sylkit', 'Solicitar cotización · Sylkit', "Pedir orçamento · Sylkit")}</title>
      </Head>
      <Header />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          {p?.pricing ? <Text style={styles.kicker}>{tx('YOUR CART · STEP 1 OF 2', 'TU CARRITO · PASO 1 DE 2', "SEU CARRINHO · PASSO 1 DE 2")}</Text> : null}
          <Text style={styles.h1}>{p ? t(p.name) : tx('Custom system', 'Sistema a medida', "Sistema sob medida")}</Text>
          <Text style={styles.sub}>
            {p?.pricing
              ? tx('Review your plan, add what you need and enter your details. You pay in the next step.', 'Revisa tu plan, agrega lo que necesites y escribe tus datos. Pagas en el siguiente paso.', "Revise seu plano, adicione o que precisar e preencha seus dados. Você paga no próximo passo.")
              : tx('No forms to fill in. Write to us like you would to a friend and we take it from there.', 'Sin formularios largos. Escríbenos como le escribirías a un amigo y nosotros nos encargamos.', "Sem formulários longos. Escreva como escreveria para um amigo e a gente cuida do resto.")}
          </Text>
          <View style={styles.chat}>
            <View style={styles.chatIcon}>
              <Ionicons name="logo-whatsapp" size={30} color="#fff" />
            </View>
            <View style={{ flex: 1, minWidth: 220, gap: 4 }}>
              <Text style={styles.chatTitle}>{tx('Talk to us directly on WhatsApp', 'Háblanos directo por WhatsApp', 'Fale direto com a gente no WhatsApp')}</Text>
              <Text style={styles.chatSub}>
                {tx('Tell us about your business in your own words, send voice notes or photos. We reply the same day with ideas and a price.', 'Cuéntanos de tu negocio con tus palabras, mándanos notas de voz o fotos. Te respondemos el mismo día con ideas y un precio.', 'Conte sobre seu negócio do seu jeito, mande áudios ou fotos. Respondemos no mesmo dia com ideias e um preço.')}
              </Text>
            </View>
            <Pressable
              style={styles.chatBtn}
              onPress={() => Linking.openURL(waLink(p ? tx(`Hi! I'd like a custom version of ${t(p.name)} for my business.`, `¡Hola! Quiero una versión a medida de ${t(p.name)} para mi negocio.`, `Olá! Quero uma versão sob medida de ${t(p.name)} para meu negócio.`) : tx("Hi! I'd like a custom system for my business.", '¡Hola! Quiero un sistema a medida para mi negocio.', 'Olá! Quero um sistema sob medida para meu negócio.')))}
              accessibilityRole="link"
            >
              <Text style={styles.chatBtnText}>{tx('Open WhatsApp', 'Abrir WhatsApp', 'Abrir WhatsApp')}</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </Pressable>
          </View>
          <QuoteForm productSlug={p?.slug} productName={p ? t(p.name) : undefined} config={null} />
        </View>
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  chat: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 16, backgroundColor: '#E9FBEF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#BDEFCD' },
  chatIcon: { width: 56, height: 56, borderRadius: 999, backgroundColor: colors.whatsapp, alignItems: 'center', justifyContent: 'center' },
  chatTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  chatSub: { fontSize: 14, lineHeight: 21, color: colors.muted },
  chatBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.whatsapp, borderRadius: 999, paddingHorizontal: 22, height: 48 },
  chatBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  container: { width: '100%', maxWidth: 1080, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 28, gap: 12 },
  kicker: { fontSize: 12, fontWeight: '800', color: colors.primary, letterSpacing: 1 },
  h1: { fontSize: 32, fontWeight: '800', color: colors.text, letterSpacing: -0.6 },
  sub: { fontSize: 15, lineHeight: 22, color: colors.muted, marginBottom: 8 },
  sum: { backgroundColor: colors.softBlue, borderRadius: 16, padding: 16, gap: 6 },
  sumTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  sumLine: { fontSize: 14, color: colors.text },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginTop: 4 },
  sumTotal: { fontSize: 24, fontWeight: '800', color: colors.primary },
  change: { fontSize: 14, fontWeight: '700', color: colors.primary, marginTop: 4 },
});
