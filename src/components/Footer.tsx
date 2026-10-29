import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLang, ui } from '../i18n';
import { colors, waLink } from '../theme';

export function Footer() {
  const { t, lang } = useLang();
  return (
    <View style={styles.wrap}>
      <View style={styles.inner}>
        <View style={{ gap: 4, flexShrink: 1 }}>
          <Text style={styles.brand}>Sylkit</Text>
          <Text style={styles.text}>{t(ui.footer)}</Text>
        </View>
        <Pressable
          style={styles.link}
          onPress={() => Linking.openURL(waLink(lang === 'es' ? 'Hola, vi Sylkit y quiero información.' : 'Hi, I saw Sylkit and want more info.'))}
          accessibilityRole="link"
        >
          <Ionicons name="logo-whatsapp" size={18} color={colors.whatsapp} />
          <Text style={styles.linkText}>+1 (646) 934-8752</Text>
        </Pressable>
      </View>
      <View style={styles.legal}>
        <Link href="/terms" style={styles.legalLink}>{lang === 'es' ? 'Términos' : 'Terms'}</Link>
        <Link href="/privacy" style={styles.legalLink}>{lang === 'es' ? 'Privacidad' : 'Privacy'}</Link>
        <Link href="/refunds" style={styles.legalLink}>{lang === 'es' ? 'Reembolsos y cancelación' : 'Refunds and cancellation'}</Link>
      </View>
      <Text style={styles.copy}>© {new Date().getFullYear()} Sylkit</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, marginTop: 48 },
  inner: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  brand: { fontSize: 18, fontWeight: '800', color: colors.text },
  text: { fontSize: 14, color: colors.muted },
  link: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 },
  linkText: { fontSize: 14, fontWeight: '600', color: colors.text },
  legal: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 18, paddingHorizontal: 16, paddingTop: 4 },
  legalLink: { fontSize: 13, color: colors.muted, textDecorationLine: 'underline', paddingVertical: 6 },
  copy: { textAlign: 'center', fontSize: 12, color: colors.muted, paddingBottom: 24, paddingTop: 8 },
});
