import { StyleSheet, Text, View } from 'react-native';
import type { Lang } from '../i18n';
import { money } from '../lib/pricing';
import { colors } from '../theme';

// Shows the price breakdown calculated by the database (orders.estimate).
export type ServerEstimate = {
  plan: string;
  plan_name: { es: string; en: string };
  billing: 'yearly' | 'monthly';
  plan_monthly: number;
  plan_setup: number;
  monthly: number;
  one_time: number;
  recurring: number;
  due_today: number;
  lines: { id: string; name_en: string; name_es: string; kind: 'monthly' | 'one_time'; qty: number; unit: number; total: number }[];
};

export function EstimateBreakdown({ est, lang }: { est: ServerEstimate; lang: Lang }) {
  const es = lang === 'es';
  const mo = es ? '/mes' : '/mo';
  return (
    <View style={{ gap: 6 }}>
      <Row label={`${es ? 'Plan' : 'Plan'} ${est.plan_name[lang]} · ${est.billing === 'yearly' ? (es ? 'anual' : 'yearly') : es ? 'mensual' : 'monthly'}`} value={`${money(Number(est.plan_monthly))}${mo}`} />
      <Row label={es ? 'Instalación del plan' : 'Plan setup'} value={money(Number(est.plan_setup))} muted />
      {est.lines.map((l) => (
        <Row
          key={l.id}
          label={`${es ? l.name_es : l.name_en}${l.qty > 1 ? ` ×${l.qty}` : ''}`}
          value={l.kind === 'monthly' ? `${money(Number(l.total))}${mo}` : money(Number(l.total))}
          muted
        />
      ))}
      <View style={styles.divider} />
      <Row label={es ? 'Pago único (instalación y extras)' : 'One-time (setup and extras)'} value={money(Number(est.one_time))} />
      <Row
        label={est.billing === 'yearly' ? (es ? `Suscripción anual (${money(Number(est.monthly))} × 10)` : `Yearly subscription (${money(Number(est.monthly))} × 10)`) : es ? 'Suscripción mensual' : 'Monthly subscription'}
        value={money(Number(est.recurring))}
      />
      <View style={styles.divider} />
      <Row label={es ? 'Total estimado hoy' : 'Estimated total today'} value={money(Number(est.due_today))} strong />
    </View>
  );
}

function Row({ label, value, muted, strong }: { label: string; value: string; muted?: boolean; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, muted && { color: colors.muted, fontWeight: '500' }, strong && { fontSize: 16, fontWeight: '800' }]}>{label}</Text>
      <Text style={[styles.value, muted && { color: colors.muted }, strong && { fontSize: 20, color: colors.primary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 },
  label: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text },
  value: { fontSize: 14, fontWeight: '800', color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 2 },
});
