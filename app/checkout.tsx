import { Link, useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CheckoutFooter, CheckoutHeader } from '../src/components/CheckoutHeader';
import { CheckoutFlow } from '../src/components/CheckoutFlow';
import { useLang } from '../src/i18n';
import { useProducts } from '../src/lib/catalog';
import { configFromQuery } from '../src/lib/pricing';
import { colors } from '../src/theme';
import { tx } from '../src/i18n';

// Step 2 of buying: one page with contact details, payment choice and the order summary.
// Reached from a product page's "Choose plan" (?product=…&plan=…&billing=…).

export default function CheckoutPage() {
  const { product, plan, billing, add, domain, template } = useLocalSearchParams<{ product?: string; plan?: string; billing?: string; add?: string; domain?: string; template?: string }>();
  const { lang } = useLang();
  const es = lang === 'es';
  const list = useProducts();
  const p = product ? list.find((x) => x.slug === product) : undefined;
  const cfg = p?.pricing ? configFromQuery({ plan: plan ?? p.pricing.plans.find((x) => x.popular)?.id ?? p.pricing.plans[0].id, billing, add, domain, template }) : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Head>
        <title>{tx('Checkout · Sylkit', 'Pagar · Sylkit', "Finalizar compra · Sylkit")}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <CheckoutHeader step={1} />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          {p?.pricing ? (
            <CheckoutFlow product={p} initial={cfg} />
          ) : (
            <View style={styles.empty}>
              <Text style={styles.h1}>{tx('Your cart is empty', 'Tu carrito está vacío', "Seu carrinho está vazio")}</Text>
              <Text style={styles.sub}>{tx('Choose a system and a plan to continue.', 'Elige un sistema y un plan para continuar.', "Escolha um sistema e um plano para continuar.")}</Text>
              <Link href="/" style={styles.link}>
                {tx('Browse systems', 'Ver sistemas', "Ver sistemas")}
              </Link>
            </View>
          )}
        </View>
        <CheckoutFooter />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 1080, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 24 },
  empty: { alignItems: 'center', gap: 10, paddingVertical: 60 },
  h1: { fontSize: 26, fontWeight: '800', color: colors.text },
  sub: { fontSize: 15, color: colors.muted },
  link: { fontSize: 15, fontWeight: '800', color: colors.primary, marginTop: 6 },
});
