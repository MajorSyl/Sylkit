import { StyleSheet, Text, View } from 'react-native';
import type { Lang } from '../i18n';
import { money } from '../lib/pricing';
import { colors } from '../theme';
import { planName, tx } from '../i18n';
import { addonName } from '../lib/names';

// Shows the price breakdown calculated by the database (orders.estimate).
export type ServerEstimate = {
  plan: string;
  plan_name: { es: string; en: string; pt?: string };
  billing: 'yearly' | 'monthly' | 'once';
  license?: number;
  care?: number;
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
  const mo = tx('/mo', '/mes', "/mês");
  if (est.billing === 'once') {
    return (
      <View style={{ gap: 6 }}>
        <Row label={`${tx('Plan', 'Plan', 'Plano')} ${planName(est.plan_name)} · ${tx('buy once', 'pago único', "pagamento único")}`} value={money(Number(est.plan_monthly) * 30)} />
        <Row label={tx('Plan setup', 'Instalación del plan', "Instalação do plano")} value={money(Number(est.plan_setup))} muted />
        {est.lines.map((l) => (
          <Row
            key={l.id}
            label={`${addonName(l)}${l.qty > 1 ? ` ×${l.qty}` : ''}`}
            value={money(Number(l.total) * (l.kind === 'monthly' ? 30 : 1))}
            muted
          />
        ))}
        <View style={styles.divider} />
        <Row label={tx('Setup and extras', 'Instalación y extras', "Instalação e extras")} value={money(Number(est.one_time))} />
        <Row label={tx(`Lifetime license (${money(Number(est.monthly))} × 30)`, `Licencia de por vida (${money(Number(est.monthly))} × 30)`, `Licença vitalícia (${money(Number(est.monthly))} × 30)`)} value={money(Number(est.license ?? 0))} />
        <View style={styles.divider} />
        <Row label={tx('Estimated total (one time)', 'Total estimado (una sola vez)', "Total estimado (pagamento único)")} value={money(Number(est.due_today))} strong />
        <Text style={{ fontSize: 13, color: colors.muted }}>
          {tx(`Includes 12 months of support and updates. Then optional care plan ${money(Number(est.care ?? 0))}/year.`, `Incluye 12 meses de soporte y actualizaciones. Luego, mantenimiento opcional ${money(Number(est.care ?? 0))}/año.`, `Inclui 12 meses de suporte e atualizações. Depois, plano de manutenção opcional por ${money(Number(est.care ?? 0))}/ano.`)}
        </Text>
      </View>
    );
  }
  return (
    <View style={{ gap: 6 }}>
      <Row label={`${tx('Plan', 'Plan', "Plano")} ${planName(est.plan_name)} · ${est.billing === 'yearly' ? (tx('yearly', 'anual', "anual")) : tx('monthly', 'mensual', "mensal")}`} value={`${money(Number(est.plan_monthly))}${mo}`} />
      <Row label={tx('Plan setup', 'Instalación del plan', "Instalação do plano")} value={money(Number(est.plan_setup))} muted />
      {est.lines.map((l) => (
        <Row
          key={l.id}
          label={`${addonName(l)}${l.qty > 1 ? ` ×${l.qty}` : ''}`}
          value={l.kind === 'monthly' ? `${money(Number(l.total))}${mo}` : money(Number(l.total))}
          muted
        />
      ))}
      <View style={styles.divider} />
      <Row label={tx('One-time (setup and extras)', 'Pago único (instalación y extras)', "Pagamento único (instalação e extras)")} value={money(Number(est.one_time))} />
      <Row
        label={est.billing === 'yearly' ? (tx(`Yearly subscription (${money(Number(est.monthly))} × 10)`, `Suscripción anual (${money(Number(est.monthly))} × 10)`, `Assinatura anual (${money(Number(est.monthly))} × 10)`)) : tx('Monthly subscription', 'Suscripción mensual', "Assinatura mensal")}
        value={money(Number(est.recurring))}
      />
      <View style={styles.divider} />
      <Row label={tx('Estimated total today', 'Total estimado hoy', "Total estimado hoje")} value={money(Number(est.due_today))} strong />
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
