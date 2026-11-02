import { Link } from 'expo-router';
import Head from 'expo-router/head';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLang } from '../i18n';
import { colors, shadow } from '../theme';
import { Footer } from './Footer';
import { Header } from './Header';
import { tx } from '../i18n';

// Shared layout for the Terms, Privacy and Refund pages. Content lives in src/data/legal.ts.

type T = { es: string; en: string; pt?: string };
export type LegalSection = { h: T; p: T[] };
export type LegalDoc = { title: T; intro: T; updated: string; sections: LegalSection[] };

const others = [
  { href: '/terms', label: { es: 'Términos', en: 'Terms', pt: "Termos" } },
  { href: '/privacy', label: { es: 'Privacidad', en: 'Privacy', pt: "Privacidade" } },
  { href: '/refunds', label: { es: 'Reembolsos y cancelación', en: 'Refunds and cancellation', pt: "Reembolsos e cancelamento" } },
] as const;

export function LegalPage({ doc }: { doc: LegalDoc }) {
  const { t, lang } = useLang();
  const es = lang === 'es';
  const date = new Date(`${doc.updated}T12:00:00Z`).toLocaleDateString(tx('en', 'es', "pt-BR"), { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Head>
        <title>{`${t(doc.title)} · Sylkit`}</title>
        <meta name="description" content={t(doc.intro)} />
      </Head>
      <Header />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <View style={[styles.card, shadow]}>
            <Text style={styles.h1} accessibilityRole="header">
              {t(doc.title)}
            </Text>
            <Text style={styles.updated}>{tx(`Last updated: ${date}`, `Última actualización: ${date}`, `Última atualização: ${date}`)}</Text>
            <Text style={styles.p}>{t(doc.intro)}</Text>
            {doc.sections.map((s, i) => (
              <View key={i} style={{ gap: 8 }}>
                <Text style={styles.h2} accessibilityRole="header">
                  {`${i + 1}. ${t(s.h)}`}
                </Text>
                {s.p.map((para, j) => (
                  <Text key={j} style={styles.p}>
                    {t(para)}
                  </Text>
                ))}
              </View>
            ))}
            <View style={styles.links}>
              {others.map((o) => (
                <Link key={o.href} href={o.href} style={styles.link}>
                  {t(o.label)}
                </Link>
              ))}
            </View>
          </View>
        </View>
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 820, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 28 },
  card: { backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 24, gap: 18 },
  h1: { fontSize: 30, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  updated: { fontSize: 13, color: colors.muted, marginTop: -10 },
  h2: { fontSize: 18, fontWeight: '700', color: colors.text },
  p: { fontSize: 15, lineHeight: 24, color: colors.text },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 },
  link: { fontSize: 14, fontWeight: '600', color: colors.primary },
});
