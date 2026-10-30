import { ANNUAL_MONTHS, CARE_MONTHS, ONCE_MONTHS, Plan, Pricing } from '../data/pricing';
import type { Lang } from '../i18n';
import type { Billing } from './pricing';
import { money } from './pricing';

// One place that turns a plan + billing period into the words shown to people:
// the big price, and an honest "Today you pay … Renews at …" line.

export const isYearlyOnly = (pricing: Pricing) => pricing.billing?.length === 1 && pricing.billing[0] === 'yearly';
export const allowedBilling = (pricing: Pricing): Billing[] => (pricing.billing?.length ? pricing.billing : ['yearly', 'monthly', 'once']);

export type PlanQuote = { price: string; per: string; today: number; todayText: string; renewText: string };

export function planQuote(plan: Plan, billing: Billing, pricing: Pricing, lang: Lang): PlanQuote {
  const es = lang === 'es';
  const yr = plan.monthly * ANNUAL_MONTHS;
  const setupNote = (s: number) => (s > 0 ? (es ? ` (incluye ${money(s)} de instalación)` : ` (includes ${money(s)} setup)`) : '');

  if (billing === 'once') {
    const total = plan.monthly * ONCE_MONTHS + plan.setup;
    return {
      price: money(total),
      per: es ? ' pago único' : ' one-time',
      today: total,
      todayText: es ? `Hoy pagas ${money(total)}. Es tuyo, sin suscripción.` : `Today you pay ${money(total)}. Yours to keep, no subscription.`,
      renewText: es
        ? `Incluye 12 meses de soporte. Luego, mantenimiento opcional ${money(plan.monthly * CARE_MONTHS)}/año.`
        : `Includes 12 months of support. Then optional care at ${money(plan.monthly * CARE_MONTHS)}/year.`,
    };
  }
  if (isYearlyOnly(pricing)) {
    const today = yr + plan.setup;
    return {
      price: money(yr),
      per: es ? '/año' : '/yr',
      today,
      todayText: es ? `Hoy pagas ${money(today)}${setupNote(plan.setup)}.` : `Today you pay ${money(today)}${setupNote(plan.setup)}.`,
      renewText: es ? `Se renueva a ${money(yr)}/año. Cancela cuando quieras.` : `Renews at ${money(yr)}/year. Cancel anytime.`,
    };
  }
  if (billing === 'yearly') {
    const today = yr + plan.setup;
    return {
      price: money(plan.monthly),
      per: es ? '/mes' : '/mo',
      today,
      todayText: es
        ? `Hoy pagas ${money(today)} por 12 meses${setupNote(plan.setup)}.`
        : `Today you pay ${money(today)} for 12 months${setupNote(plan.setup)}.`,
      renewText: es
        ? `Se renueva a ${money(yr)}/año (2 meses gratis). Cancela cuando quieras.`
        : `Renews at ${money(yr)}/year (2 months free). Cancel anytime.`,
    };
  }
  const today = plan.monthly + plan.setup;
  return {
    price: money(plan.monthly),
    per: es ? '/mes' : '/mo',
    today,
    todayText: es ? `Hoy pagas ${money(today)}${setupNote(plan.setup)}.` : `Today you pay ${money(today)}${setupNote(plan.setup)}.`,
    renewText: es ? `Luego ${money(plan.monthly)}/mes. Cancela cuando quieras.` : `Then ${money(plan.monthly)}/month. Cancel anytime.`,
  };
}

export const billingName = (b: Billing, lang: Lang) =>
  lang === 'es' ? (b === 'yearly' ? 'Anual' : b === 'monthly' ? 'Mensual' : 'Pago único') : b === 'yearly' ? 'Yearly' : b === 'monthly' ? 'Monthly' : 'Buy once';
