import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useLang } from '../i18n';
import { colors } from '../theme';

// The four steps of buying, shown at the top of the checkout and the order page:
// Plan › Details › Payment › Done. Finished steps get a check mark.

const STEPS = [
  { es: 'Plan', en: 'Plan' },
  { es: 'Tus datos', en: 'Details' },
  { es: 'Pago', en: 'Payment' },
  { es: 'Listo', en: 'Done' },
];

export function StepBar({ current }: { current: 0 | 1 | 2 | 3 }) {
  const { t } = useLang();
  return (
    <View style={styles.row} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: 4, now: current + 1 }}>
      {STEPS.map((s, i) => {
        const done = i < current || current === 3;
        const on = i === current && current !== 3;
        return (
          <View key={i} style={styles.item}>
            {i > 0 ? <View style={[styles.line, (done || on) && styles.lineOn]} /> : null}
            <View style={[styles.dot, done && styles.dotDone, on && styles.dotOn]}>
              {done ? <Ionicons name="checkmark" size={13} color="#fff" /> : <Text style={[styles.num, on && { color: '#fff' }]}>{i + 1}</Text>}
            </View>
            <Text style={[styles.label, (done || on) && styles.labelOn]} numberOfLines={1}>
              {t(s)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'nowrap', paddingVertical: 6 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  line: { width: 22, height: 2, borderRadius: 2, backgroundColor: '#D5DCEA', marginHorizontal: 4 },
  lineOn: { backgroundColor: colors.primary },
  dot: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: '#C3CDE0', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  dotOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  dotDone: { backgroundColor: '#12B76A', borderColor: '#12B76A' },
  num: { fontSize: 12, fontWeight: '800', color: colors.muted },
  label: { fontSize: 13, fontWeight: '600', color: colors.muted, flexShrink: 1 },
  labelOn: { color: colors.text, fontWeight: '800' },
});
