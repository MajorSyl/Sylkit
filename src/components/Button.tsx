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
      style={({ pressed, hovered }: any) => [styles.btn, { backgroundColor: v.bg }, variant === 'primary' && styles.sheen, hovered && !disabled && styles.hover, pressed && { transform: [{ scale: 0.97 }] }, disabled && { opacity: 0.75 }, style]}
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
  // Smooth press and hover on the web (a short transition); on phones the press scale is instant.
  sheen: { backgroundImage: 'linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0))', boxShadow: '0 6px 18px rgba(37,88,232,0.25), inset 0 1px 0 rgba(255,255,255,0.25)' } as any,
  hover: { transform: [{ translateY: -1 }], boxShadow: '0 10px 24px rgba(15,23,42,0.16)' } as any,
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 14,
    minHeight: 48,
    transitionProperty: 'transform, box-shadow, opacity',
    transitionDuration: '160ms',
    transitionTimingFunction: 'ease-out',
  } as any,
  text: { fontWeight: '800', fontSize: 15 },
});
