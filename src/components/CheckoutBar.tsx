import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLang } from '../i18n';
import { money } from '../lib/pricing';
import { colors } from '../theme';
import { Portal } from './Portal';

// "Today you pay / Continue" bar pinned to the bottom of the screen.
// Render it at the ROOT of a screen (a sibling of the ScrollView, never inside it).
//  - Web: position fixed, moved into <body> through a portal so no parent can unpin it.
//  - Native: absolute at the bottom of the screen root, padded for the home indicator.
// Reports its height so the screen can pad its content and nothing hides behind it.

export function CheckoutBar({
  dueToday,
  dimmed,
  onContinue,
  onHeight,
}: {
  dueToday: number;
  dimmed?: boolean;
  onContinue: () => void;
  onHeight?: (h: number) => void;
}) {
  const { lang } = useLang();
  const es = lang === 'es';
  const insets = useSafeAreaInsets();

  return (
    <Portal>
      <View
        style={[styles.bar, Platform.OS === 'web' ? styles.web : styles.native, { paddingBottom: insets.bottom }]}
        onLayout={(e) => onHeight?.(Math.ceil(e.nativeEvent.layout.height))}
      >
        <View style={styles.inner}>
          <View style={{ flexShrink: 1 }}>
            <Text style={styles.label}>{es ? 'Hoy pagas' : 'Today you pay'}</Text>
            <Text style={styles.total} testID="bar-due-today">
              {money(dueToday)}
            </Text>
          </View>
          <Pressable style={[styles.btn, dimmed && { opacity: 0.5 }]} onPress={onContinue} accessibilityRole="button">
            <Text style={styles.btnText}>{es ? 'Continuar' : 'Continue'}</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </Pressable>
        </View>
      </View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  bar: {
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  web: { position: 'fixed', zIndex: 1000, boxShadow: '0 -6px 20px rgba(15,40,90,0.08)' } as any,
  native: {
    position: 'absolute',
    zIndex: 1000,
    elevation: 12,
    shadowColor: '#0F285A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
  },
  inner: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  total: { fontSize: 22, fontWeight: '800', color: colors.text },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primary, paddingHorizontal: 22, minHeight: 48, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
