import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useLang, ui } from '../i18n';
import { colors, glass, waLink } from '../theme';

export function Header() {
  const { lang, setLang, t } = useLang();
  const { width } = useWindowDimensions();
  const compact = width < 560;

  return (
    <View style={[styles.wrap, glass]}>
      <View style={styles.inner}>
        <Link href="/" asChild>
          <Pressable style={styles.brand} accessibilityRole="link">
            <View style={styles.logo}>
              <Text style={styles.logoText}>S</Text>
            </View>
            <Text style={styles.brandText}>Sylkit</Text>
          </Pressable>
        </Link>

        <View style={styles.right}>
          <View style={styles.toggle}>
            {(['es', 'en'] as const).map((l) => (
              <Pressable
                key={l}
                onPress={() => setLang(l)}
                style={[styles.toggleBtn, lang === l && styles.toggleActive]}
                accessibilityRole="button"
                accessibilityLabel={l === 'es' ? 'Español' : 'English'}
              >
                <Text style={[styles.toggleText, lang === l && styles.toggleTextActive]}>
                  {l.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            style={styles.wa}
            onPress={() => Linking.openURL(waLink(lang === 'es' ? 'Hola, vi Sylkit y quiero información.' : 'Hi, I saw Sylkit and want more info.'))}
            accessibilityRole="link"
            accessibilityLabel={t(ui.talk)}
          >
            <Ionicons name="logo-whatsapp" size={18} color="#fff" />
            {!compact && <Text style={styles.waText}>WhatsApp</Text>}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.glass,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    position: 'relative',
    zIndex: 10,
  },
  inner: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  brandText: { fontSize: 20, fontWeight: '800', color: colors.text, letterSpacing: -0.4 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.softBlue,
    borderRadius: 999,
    padding: 3,
  },
  toggleBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  toggleActive: { backgroundColor: '#fff' },
  toggleText: { fontSize: 12, fontWeight: '700', color: colors.muted },
  toggleTextActive: { color: colors.primary },
  wa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.whatsapp,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    minHeight: 40,
  },
  waText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
