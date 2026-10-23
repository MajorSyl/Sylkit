import { useEffect, useState } from 'react';
import { Addon, addonCatalog, ANNUAL_MONTHS, CARE_MONTHS, ONCE_MONTHS, Plan, Pricing } from '../data/pricing';
import type { Text } from '../i18n';
import { supabase } from './supabase';

// One pricing rule for the whole site (the database function price_estimate uses the same rule):
//   monthly  = plan monthly + monthly add-ons × qty
//   one-time = plan setup   + one-time add-ons × qty
//   recurring = monthly × 10 when billed yearly (2 months free), or monthly when billed monthly
//   due today = one-time + first recurring payment
// Buy once (no subscription):
//   license  = monthly × 30, paid once on top of the one-time items; first 12 months of hosting, support and updates included
//   care plan from year 2 (optional) = monthly × 3 per year

export type Billing = 'yearly' | 'monthly' | 'once';
export type DomainMode = 'sub' | 'new' | 'own';
export type DomainChoice = { mode: DomainMode; name: string };
export type Config = { plan: string; billing: Billing; addons: Record<string, number>; domain?: DomainChoice };
export type Line = { id: string; name: Text; kind: Addon['kind']; qty: number; unit: number; total: number };
export type Estimate = {
  plan: Plan;
  billing: Billing;
  monthly: number;
  oneTime: number;
  recurring: number; // subscription charged today (0 when buying once)
  license: number; // one-time license (buy once only)
  dueToday: number;
  renewal: number; // what is charged afterwards
  renewalPer: 'year' | 'month'; // period of the renewal
  care: number; // yearly care plan after year 1 (buy once only)
  savings: number;
  lines: Line[];
};

export const MAX_QTY = 50;

export function estimate(pricing: Pricing, catalog: Record<string, Addon>, cfg: Config): Estimate | null {
  const plan = pricing.plans.find((p) => p.id === cfg.plan);
  if (!plan) return null;
  let monthly = plan.monthly;
  let oneTime = plan.setup;
  const lines: Line[] = [];
  for (const id of pricing.addons) {
    const a = catalog[id];
    const raw = cfg.addons[id];
    if (!a || !raw) continue;
    const qty = a.perUnit ? Math.min(Math.max(Math.round(raw), 1), MAX_QTY) : 1;
    const total = a.price * qty;
    if (a.kind === 'monthly') monthly += total;
    else oneTime += total;
    lines.push({ id, name: a.name, kind: a.kind, qty, unit: a.price, total });
  }
  const once = cfg.billing === 'once';
  const recurring = once ? 0 : cfg.billing === 'yearly' ? monthly * ANNUAL_MONTHS : monthly;
  const license = once ? monthly * ONCE_MONTHS : 0;
  const care = once ? monthly * CARE_MONTHS : 0;
  const savings = cfg.billing === 'yearly' ? monthly * (12 - ANNUAL_MONTHS) : 0;
  return {
    plan,
    billing: cfg.billing,
    monthly,
    oneTime,
    recurring,
    license,
    dueToday: oneTime + recurring + license,
    renewal: once ? care : recurring,
    renewalPer: cfg.billing === 'monthly' ? 'month' : 'year',
    care,
    savings,
    lines,
  };
}

// URL format: ?plan=business&billing=yearly&add=extra_branch*2,fiscal_printer
export function configToQuery(cfg: Config) {
  const add = Object.entries(cfg.addons)
    .filter(([, q]) => q > 0)
    .map(([id, q]) => (q > 1 ? `${id}*${q}` : id))
    .join(',');
  const dom = cfg.domain?.name ? `&domain=${encodeURIComponent(`${cfg.domain.mode}:${cfg.domain.name}`)}` : '';
  return `plan=${encodeURIComponent(cfg.plan)}&billing=${cfg.billing}${add ? `&add=${encodeURIComponent(add)}` : ''}${dom}`;
}

export function configFromQuery(q: { plan?: string; billing?: string; add?: string; domain?: string }): Config | null {
  if (!q.plan) return null;
  const addons: Record<string, number> = {};
  for (const part of (q.add ?? '').split(',')) {
    const [id, n] = part.split('*');
    if (/^[a-z_]{2,40}$/.test(id ?? '')) addons[id] = Math.min(Math.max(parseInt(n ?? '1', 10) || 1, 1), MAX_QTY);
  }
  const [mode, ...rest] = String(q.domain ?? '').split(':');
  const name = rest.join(':').toLowerCase().replace(/[^a-z0-9.-]/g, '').slice(0, 80);
  const domain = (mode === 'sub' || mode === 'new' || mode === 'own') && name.length >= 2 ? { mode: mode as DomainMode, name } : undefined;
  return { plan: String(q.plan), billing: q.billing === 'monthly' || q.billing === 'once' ? q.billing : 'yearly', addons, domain };
}

// How a client's web address is written for people.
export const domainLabel = (d: DomainChoice) => (d.mode === 'sub' ? `${d.name}.sylkit.com` : d.name);

export type DomainResult = { domain: string; status: 'available' | 'taken' | 'unknown' };
export async function checkDomain(name: string): Promise<{ label: string; subdomain: string; results: DomainResult[] }> {
  const r = await fetch(`/api/domain?name=${encodeURIComponent(name)}`);
  if (!r.ok) throw new Error('invalid_name');
  return r.json();
}

export const money = (n: number) => `$${Number.isInteger(n) ? n.toLocaleString('en-US') : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Live add-on prices from the database, with the bundled list as a fallback.
let cache: Record<string, Addon> | null = null;
export const rowToAddon = (r: any): Addon => ({
  id: r.id,
  name: { es: r.name_es, en: r.name_en },
  desc: { es: r.desc_es, en: r.desc_en },
  kind: r.kind,
  price: Number(r.price),
  perUnit: !!r.per_unit,
});

export function useAddons() {
  const [list, setList] = useState<Record<string, Addon>>(cache ?? addonCatalog);
  useEffect(() => {
    let alive = true;
    supabase
      .from('addons')
      .select('*')
      .eq('active', true)
      .order('sort')
      .then(({ data }) => {
        if (!alive || !data || data.length === 0) return;
        cache = Object.fromEntries(data.map((r) => [r.id, rowToAddon(r)]));
        setList(cache);
      });
    return () => {
      alive = false;
    };
  }, []);
  return list;
}
