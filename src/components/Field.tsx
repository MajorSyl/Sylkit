import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors } from '../theme';

export function Field({ label, hint, style, ...props }: TextInputProps & { label: string; hint?: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#94A3B8"
        style={[styles.input, props.multiline && { minHeight: 110, textAlignVertical: 'top' }, style]}
        {...props}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export const formStyles = StyleSheet.create({
  error: { color: '#B42318', fontSize: 14, backgroundColor: '#FEF3F2', padding: 12, borderRadius: 10 },
  success: { color: '#067647', fontSize: 14, backgroundColor: '#ECFDF3', padding: 12, borderRadius: 10 },
});

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '700', color: colors.text },
  hint: { fontSize: 12, color: colors.muted },
  input: {
    borderWidth: 1,
    borderColor: '#D5DCEA',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    outlineStyle: 'none',
  } as any,
});
