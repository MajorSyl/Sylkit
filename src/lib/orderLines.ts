import type { ServerEstimate } from '../components/EstimateBreakdown';

// Turns an order into plain invoice lines (used by the order page and the invoice).
// The lines always add up to the order total; if a price was adjusted by hand, one line shows the real total.

export type OrderLine = { label: string; sub?: string; amount: number };

export function orderLines(o: { estimate: ServerEstimate | null; amount: number | null; notes: string | null; product: { en: string; es: string } | null }, es: boolean): OrderLine[] {

  const product = o.product ? (es ? o.product.es : o.product.en) : es ? 'Proyecto a medida' : 'Custom project';
  const est = o.estimate;
  const total = Number(o.amount ?? 0);
  if (!est) return [{ label: product, sub: o.notes ?? undefined, amount: total }];
  const plan = est.plan_name?.[es ? 'es' : 'en'] ?? '';
  const name = (l: ServerEstimate['lines'][number]) => `${es ? l.name_es : l.name_en}${l.qty > 1 ? ` ×${l.qty}` : ''}`;
  const lines: OrderLine[] = [];
  if (est.billing === 'once') {
    const monthlyExtras = est.lines.filter((l) => l.kind === 'monthly').map(name);
    lines.push({
      label: `${product} · ${es ? 'Plan' : 'Plan'} ${plan}`,
      sub: `${es ? 'Licencia de pago único, incluye 12 meses de soporte' : 'One-time license, includes 12 months of support'}${monthlyExtras.length ? ` · ${es ? 'incluye' : 'includes'}: ${monthlyExtras.join(', ')}` : ''}`,
      amount: Number(est.license ?? 0),
    });
  } else {
    const months = est.billing === 'yearly' ? 10 : 1;
    const period = est.billing === 'yearly' ? (es ? 'Suscripción anual (12 meses, 2 gratis)' : 'Yearly subscription (12 months, 2 free)') : es ? 'Suscripción mensual' : 'Monthly subscription';
    lines.push({ label: `${product} · ${es ? 'Plan' : 'Plan'} ${plan}`, sub: period, amount: Number(est.plan_monthly) * months });
    for (const l of est.lines.filter((x) => x.kind === 'monthly')) lines.push({ label: name(l), sub: period, amount: Number(l.total) * months });
  }
  if (Number(est.plan_setup) > 0) lines.push({ label: es ? 'Instalación y configuración' : 'Setup and configuration', sub: es ? 'Pago único' : 'One-time', amount: Number(est.plan_setup) });
  for (const l of est.lines.filter((x) => x.kind === 'one_time')) lines.push({ label: name(l), sub: es ? 'Pago único' : 'One-time', amount: Number(l.total) });
  const sum = lines.reduce((a, l) => a + l.amount, 0);
  // If the final price was adjusted by hand, show one honest line with the real total.
  if (Math.abs(sum - total) > 0.01) return [{ label: `${product} · ${es ? 'Plan' : 'Plan'} ${plan}`, sub: o.notes ?? undefined, amount: total }];
  return lines;
}
