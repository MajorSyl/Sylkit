import type { ServerEstimate } from '../components/EstimateBreakdown';
import { planName, tx } from '../i18n';
import { addonName, textIn } from './names';

// Turns an order into plain invoice lines (used by the order page and the invoice).
// The lines always add up to the order total; if a price was adjusted by hand, one line shows the real total.

export type OrderLine = { label: string; sub?: string; amount: number };

export function orderLines(o: { estimate: ServerEstimate | null; amount: number | null; notes: string | null; product: { en: string; es: string; pt?: string } | null }, es: boolean): OrderLine[] {

  const product = o.product ? (textIn(o.product)) : tx('Custom project', 'Proyecto a medida', "Projeto sob medida");
  const est = o.estimate;
  const total = Number(o.amount ?? 0);
  if (!est) return [{ label: product, sub: o.notes ?? undefined, amount: total }];
  const plan = planName(est.plan_name);
  const name = (l: ServerEstimate['lines'][number]) => `${addonName(l)}${l.qty > 1 ? ` ×${l.qty}` : ''}`;
  const lines: OrderLine[] = [];
  if (est.billing === 'once') {
    const monthlyExtras = est.lines.filter((l) => l.kind === 'monthly').map(name);
    lines.push({
      label: `${product} · ${tx('Plan', 'Plan', "Plano")} ${plan}`,
      sub: `${tx('One-time license, includes 12 months of support', 'Licencia de pago único, incluye 12 meses de soporte', "Licença de pagamento único, inclui 12 meses de suporte")}${monthlyExtras.length ? ` · ${tx('includes', 'incluye', "inclui")}: ${monthlyExtras.join(', ')}` : ''}`,
      amount: Number(est.license ?? 0),
    });
  } else {
    const months = est.billing === 'yearly' ? 10 : 1;
    const period = est.billing === 'yearly' ? (tx('Yearly subscription (12 months, 2 free)', 'Suscripción anual (12 meses, 2 gratis)', "Assinatura anual (12 meses, 2 grátis)")) : tx('Monthly subscription', 'Suscripción mensual', "Assinatura mensal");
    lines.push({ label: `${product} · ${tx('Plan', 'Plan', "Plano")} ${plan}`, sub: period, amount: Number(est.plan_monthly) * months });
    for (const l of est.lines.filter((x) => x.kind === 'monthly')) lines.push({ label: name(l), sub: period, amount: Number(l.total) * months });
  }
  if (Number(est.plan_setup) > 0) lines.push({ label: tx('Setup and configuration', 'Instalación y configuración', "Instalação e configuração"), sub: tx('One-time', 'Pago único', "Pagamento único"), amount: Number(est.plan_setup) });
  for (const l of est.lines.filter((x) => x.kind === 'one_time')) lines.push({ label: name(l), sub: tx('One-time', 'Pago único', "Pagamento único"), amount: Number(l.total) });
  const sum = lines.reduce((a, l) => a + l.amount, 0);
  // If the final price was adjusted by hand, show one honest line with the real total.
  if (Math.abs(sum - total) > 0.01) return [{ label: `${product} · ${tx('Plan', 'Plan', "Plano")} ${plan}`, sub: o.notes ?? undefined, amount: total }];
  return lines;
}
