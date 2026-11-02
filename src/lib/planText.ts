import { ANNUAL_MONTHS, CARE_MONTHS, ONCE_MONTHS, Plan, Pricing } from '../data/pricing';
import type { Lang } from '../i18n';
import type { Billing } from './pricing';
import { money } from './pricing';
import { tx } from '../i18n';

// One place that turns a plan + billing period into the words shown to people:
// the big price, and an honest "Today you pay … Renews at …" line.

export const isYearlyOnly = (pricing: Pricing) => pricing.billing?.length === 1 && pricing.billing[0] === 'yearly';
export const allowedBilling = (pricing: Pricing): Billing[] => (pricing.billing?.length ? pricing.billing : ['yearly', 'monthly', 'once']);

export type PlanQuote = { price: string; per: string; today: number; todayText: string; renewText: string };

export function planQuote(plan: Plan, billing: Billing, pricing: Pricing, lang: Lang): PlanQuote {
  const es = lang === 'es';
  const yr = plan.monthly * ANNUAL_MONTHS;
  const setupNote = (s: number) => (s > 0 ? (tx(` (includes ${money(s)} setup)`, ` (incluye ${money(s)} de instalación)`, ` (inclui ${money(s)} de instalação)`)) : '');

  if (billing === 'once') {
    const total = plan.monthly * ONCE_MONTHS + plan.setup;
    return {
      price: money(total),
      per: tx(' one-time', ' pago único', " pagamento único"),
      today: total,
      todayText: tx(`Today you pay ${money(total)}. Yours to keep, no subscription.`, `Hoy pagas ${money(total)}. Es tuyo, sin suscripción.`, `Hoje você paga ${money(total)}. É seu, sem assinatura.`),
      renewText: tx(`Includes 12 months of support. Then optional care at ${money(plan.monthly * CARE_MONTHS)}/year.`, `Incluye 12 meses de soporte. Luego, mantenimiento opcional ${money(plan.monthly * CARE_MONTHS)}/año.`, `Inclui 12 meses de suporte. Depois, manutenção opcional por ${money(plan.monthly * CARE_MONTHS)}/ano.`),
    };
  }
  if (isYearlyOnly(pricing)) {
    const today = yr + plan.setup;
    return {
      price: money(yr),
      per: tx('/yr', '/año', "/ano"),
      today,
      todayText: tx(`Today you pay ${money(today)}${setupNote(plan.setup)}.`, `Hoy pagas ${money(today)}${setupNote(plan.setup)}.`, `Hoje você paga ${money(today)}${setupNote(plan.setup)}.`),
      renewText: tx(`Renews at ${money(yr)}/year. Cancel anytime.`, `Se renueva a ${money(yr)}/año. Cancela cuando quieras.`, `Renova por ${money(yr)}/ano. Cancele quando quiser.`),
    };
  }
  if (billing === 'yearly') {
    const today = yr + plan.setup;
    return {
      price: money(plan.monthly),
      per: tx('/mo', '/mes', "/mês"),
      today,
      todayText: tx(`Today you pay ${money(today)} for 12 months${setupNote(plan.setup)}.`, `Hoy pagas ${money(today)} por 12 meses${setupNote(plan.setup)}.`, `Hoje você paga ${money(today)} por 12 meses${setupNote(plan.setup)}.`),
      renewText: tx(`Renews at ${money(yr)}/year (2 months free). Cancel anytime.`, `Se renueva a ${money(yr)}/año (2 meses gratis). Cancela cuando quieras.`, `Renova por ${money(yr)}/ano (2 meses grátis). Cancele quando quiser.`),
    };
  }
  const today = plan.monthly + plan.setup;
  return {
    price: money(plan.monthly),
    per: tx('/mo', '/mes', "/mês"),
    today,
    todayText: tx(`Today you pay ${money(today)}${setupNote(plan.setup)}.`, `Hoy pagas ${money(today)}${setupNote(plan.setup)}.`, `Hoje você paga ${money(today)}${setupNote(plan.setup)}.`),
    renewText: tx(`Then ${money(plan.monthly)}/month. Cancel anytime.`, `Luego ${money(plan.monthly)}/mes. Cancela cuando quieras.`, `Depois ${money(plan.monthly)}/mês. Cancele quando quiser.`),
  };
}

export const billingName = (b: Billing, lang: Lang) =>
  lang === 'es'
    ? b === 'yearly' ? 'Anual' : b === 'monthly' ? 'Mensual' : 'Pago único'
    : lang === 'pt'
      ? b === 'yearly' ? 'Anual' : b === 'monthly' ? 'Mensal' : 'Pagamento único'
      : b === 'yearly' ? 'Yearly' : b === 'monthly' ? 'Monthly' : 'Buy once';
