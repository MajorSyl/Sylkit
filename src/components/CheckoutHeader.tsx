import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLang } from '../i18n';
import { colors } from '../theme';
import { Logo } from './Logo';
import { StepBar } from './StepBar';

// Calm header for checkout, order and invoice pages: logo, "Secure checkout" and the step bar.
// No menu, so nothing pulls the client away while paying.

export function CheckoutHeader({ step }: { step?: 0 | 1 | 2 | 3 }) {
  const { lang } = useLang();
  return (
    <View style={styles.wrap}>
      <View style={styles.inner}>
        <Link href="/" asChild>
          <Pressable accessibilityRole="link" accessibilityLabel="Sylkit">
            <Logo size={28} />
          </Pressable>
        </Link>
        <View style={styles.secure}>
          <Ionicons name="lock-closed" size={14} color={colors.muted} />
          <Text style={styles.secureText}>{lang === 'es' ? 'Pago seguro' : 'Secure checkout'}</Text>
        </View>
      </View>
      {step != null ? (
        <View style={styles.steps}>
          <StepBar current={step} />
        </View>
      ) : null}
    </View>
  );
}

export function CheckoutFooter() {
  const { lang } = useLang();
  const es = lang === 'es';
  return (
    <View style={styles.foot}>
      <Link href="/refunds" style={styles.footLink}>
        {es ? 'Reembolsos' : 'Refunds'}
      </Link>
      <Link href="/privacy" style={styles.footLink}>
        {es ? 'Privacidad' : 'Privacy'}
      </Link>
      <Link href="/terms" style={styles.footLink}>
        {es ? 'Términos' : 'Terms'}
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  inner: { width: '100%', maxWidth: 1080, alignSelf: 'center', paddingHorizontal: 16, minHeight: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  secure: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  secureText: { fontSize: 13, fontWeight: '700', color: colors.muted },
  steps: { width: '100%', maxWidth: 1080, alignSelf: 'center', paddingHorizontal: 16, paddingBottom: 10 },
  foot: { flexDirection: 'row', justifyContent: 'center', gap: 20, paddingVertical: 28, flexWrap: 'wrap' },
  footLink: { fontSize: 13, color: colors.muted, textDecorationLine: 'underline' },
});
