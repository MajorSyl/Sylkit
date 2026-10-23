import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Footer } from '../src/components/Footer';
import { Header } from '../src/components/Header';
import { QuoteForm } from '../src/components/QuoteForm';
import { useLang } from '../src/i18n';
import { useProducts } from '../src/lib/catalog';
import { colors } from '../src/theme';

export default function QuotePage() {
  const { product } = useLocalSearchParams<{ product?: string }>();
  const { t, lang } = useLang();
  const list = useProducts();
  const p = product ? list.find((x) => x.slug === product) : undefined;
  const es = lang === 'es';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Head>
        <title>{es ? 'Solicitar cotización · Sylkit' : 'Request a quote · Sylkit'}</title>
      </Head>
      <Header />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <Text style={styles.h1}>{p ? t(p.name) : es ? 'Sistema a medida' : 'Custom system'}</Text>
          <Text style={styles.sub}>
            {es
              ? 'Completa el formulario. Recibirás un número de pedido y un enlace para seguirlo.'
              : 'Fill in the form. You will get an order number and a link to track it.'}
          </Text>
          <QuoteForm productSlug={p?.slug} productName={p ? t(p.name) : undefined} />
        </View>
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 28, gap: 12 },
  h1: { fontSize: 32, fontWeight: '800', color: colors.text, letterSpacing: -0.6 },
  sub: { fontSize: 15, lineHeight: 22, color: colors.muted, marginBottom: 8 },
});
