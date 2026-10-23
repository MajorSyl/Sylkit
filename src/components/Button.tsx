import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors } from '../theme';

type Variant = 'primary' | 'secondary' | 'whatsapp' | 'danger' | 'ghost';

export function Button({
  label,
  onPress,
  icon,
  variant = 'primary',
  loading,
  disabled,
  style,
}: {
  label: string;
  onPress?: () => void;
  icon?: string;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const v = variants[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={({ pressed }) => [styles.btn, { backgroundColor: v.bg }, (pressed || disabled) && { opacity: 0.75 }, style]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon as any} size={18} color={v.fg} /> : null}
          <Text style={[styles.text, { color: v.fg }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const variants: Record<Variant, { bg: string; fg: string }> = {
  primary: { bg: colors.primary, fg: '#fff' },
  secondary: { bg: colors.softBlue, fg: colors.primary },
  whatsapp: { bg: colors.whatsapp, fg: '#fff' },
  danger: { bg: '#FEF3F2', fg: '#B42318' },
  ghost: { bg: 'transparent', fg: colors.primary },
};

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 14,
    minHeight: 48,
  },
  text: { fontWeight: '800', fontSize: 15 },
});
