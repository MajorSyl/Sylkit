import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

// The Sylkit logo: the kit (a cube with its blue lid lifting) + the lowercase wordmark.
// The cube is the symbol, so it never collides with the S of the name.
export function Logo({ size = 30, dark = false, wordmark = true }: { size?: number; dark?: boolean; wordmark?: boolean }) {
  return (
    <View style={styles.row} accessibilityLabel="Sylkit">
      <Image source={{ uri: dark ? '/brand/sylkit-mark-dark.svg' : '/brand/sylkit-mark.svg' }} style={{ width: size, height: size }} accessibilityIgnoresInvertColors />
      {wordmark ? <Text style={[styles.word, { fontSize: size * 0.72, color: dark ? '#f5f5f7' : colors.text }]}>sylkit</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  word: { fontWeight: '700', letterSpacing: -0.8 },
});
