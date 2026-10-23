import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Header } from '../src/components/Header';
import { ui, useLang } from '../src/i18n';
import { colors } from '../src/theme';

export default function NotFound() {
  const { t } = useLang();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header />
      <View style={styles.box}>
        <Text style={styles.code}>404</Text>
        <Text style={styles.text}>{t(ui.notFound)}</Text>
        <Link href="/" style={styles.link}>
          {t(ui.home)}
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  code: { fontSize: 56, fontWeight: '800', color: colors.primary },
  text: { fontSize: 16, color: colors.muted },
  link: { fontSize: 16, fontWeight: '700', color: colors.primary },
});
