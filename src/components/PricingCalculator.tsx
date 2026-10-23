import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { ANNUAL_MONTHS, CARE_MONTHS, ONCE_MONTHS } from '../data/pricing';
import type { Product } from '../data/products';
import { useLang } from '../i18n';
import { Billing, Config, configToQuery, DomainChoice, domainLabel, estimate, MAX_QTY, money, useAddons } from '../lib/pricing';
import { colors, shadow } from '../theme';
import { DomainPicker } from './DomainPicker';

const L = {
  title: { es: 'Planes y precios', en: 'Plans and pricing' },
  sub: {
    es: 'Elige un plan y agrega lo que necesites. El total se calcula al instante.',
    en: 'Pick a plan and add what you need. The total updates instantly.',
  },
  yearly: { es: 'Anual', en: 'Yearly' },
  monthly: { es: 'Mensual', en: 'Monthly' },
  once: { es: 'Pago único', en: 'Buy once' },
  ownIt: { es: 'Sin suscripción', en: 'No subscription' },
  onceLabel: { es: 'una sola vez', en: 'once' },
  onceIncl: { es: 'Incluye instalación y 12 meses de soporte y actualizaciones', en: 'Includes setup and 12 months of support and updates' },
  license: { es: 'Licencia de por vida', en: 'Lifetime license' },
  yearlyFee: { es: 'Cuota anual', en: 'Yearly fee' },
  noSetup: { es: 'Sin costo de instalación', en: 'No setup fee' },
  pickDomain: { es: 'Primero elige tu dominio', en: 'Choose your domain first' },
  careAfter: {
    es: 'Desde el segundo año, plan de mantenimiento opcional (hosting, actualizaciones y soporte):',
    en: 'From year 2, optional care plan (hosting, updates and support):',
  },
  free2: { es: '2 meses gratis', en: '2 months free' },
  popular: { es: 'Más elegido', en: 'Most popular' },
  perMo: { es: '/mes', en: '/mo' },
  billedYearly: { es: 'facturado anual', en: 'billed yearly' },
  billedMonthly: { es: 'facturado mensual', en: 'billed monthly' },
  setup: { es: 'instalación única', en: 'one-time setup' },
  selected: { es: 'Seleccionado', en: 'Selected' },
  choose: { es: 'Elegir', en: 'Choose' },
  extras: { es: 'Funciones extra', en: 'Extra features' },
  extrasSub: { es: 'Opcionales. Se suman a tu total automáticamente.', en: 'Optional. They are added to your total automatically.' },
  oneTime: { es: 'pago único', en: 'one-time' },
  summary: { es: 'Tu cotización', en: 'Your quote' },
  plan: { es: 'Plan', en: 'Plan' },
  setupTotal: { es: 'Instalación y extras (pago único)', en: 'Setup and extras (one-time)' },
  subYear: { es: 'Suscripción del primer año', en: 'First-year subscription' },
  subMonth: { es: 'Suscripción del primer mes', en: 'First-month subscription' },
  dueToday: { es: 'Total a pagar hoy', en: 'Due today' },
  renews: { es: 'Luego', en: 'Then' },
  perYear: { es: '/año', en: '/year' },
  save: { es: 'Ahorras', en: 'You save' },
  cta: { es: 'Solicitar este plan', en: 'Request this plan' },
  fine: {
    es: 'Sin compromiso: confirmamos el precio final antes de que pagues.',
    en: 'No commitment: we confirm the final price before you pay.',
  },
};

export function PricingCalculator({ product, initial }: { product: Product; initial?: Partial<Config> | null }) {
  const { t, lang } = useLang();
  const router = useRouter();
  const catalog = useAddons();
  const { width } = useWindowDimensions();
  const wide = width >= 960;
  const pricing = product.pricing!;
  const defaultPlan = pricing.plans.find((p) => p.popular)?.id ?? pricing.plans[0].id;
  const allowed: Billing[] = pricing.billing?.length ? pricing.billing : ['yearly', 'monthly', 'once'];
  const yearlyOnly = allowed.length === 1 && allowed[0] === 'yearly';
  const isDomainProduct = pricing.group === 'domain';
  const [cfg, setCfg] = useState<Config>(() => ({
    plan: initial?.plan && pricing.plans.some((p) => p.id === initial.plan) ? initial.plan : defaultPlan,
    billing: initial?.billing && allowed.includes(initial.billing) ? initial.billing : allowed[0],
    addons: {},
    domain: initial?.domain && (!isDomainProduct || initial.domain.mode !== 'sub') ? initial.domain : undefined,
  }));
  // Yearly-only products (domains) show prices per year.
  const yr = (monthly: number) => monthly * ANNUAL_MONTHS;
  const needsDomain = isDomainProduct && !cfg.domain;
  const est = useMemo(() => estimate(pricing, catalog, cfg), [pricing, catalog, cfg]);
  const hasDomain = pricing.addons.includes('custom_domain') && !!catalog.custom_domain;
  // The domain extra is chosen in the web-address picker, not in the list.
  const addons = pricing.addons.filter((id) => !(hasDomain && id === 'custom_domain')).map((id) => catalog[id]).filter(Boolean);
  const setDomain = (d?: DomainChoice) =>
    setCfg((c) => {
      const next = { ...c.addons };
      if (hasDomain && d?.mode === 'new') next.custom_domain = 1;
      else delete next.custom_domain;
      return { ...c, domain: d, addons: next };
    });

  const setBilling = (billing: Billing) => setCfg((c) => ({ ...c, billing }));
  const setQty = (id: string, qty: number) =>
    setCfg((c) => {
      const next = { ...c.addons };
      if (qty <= 0) delete next[id];
      else next[id] = Math.min(qty, MAX_QTY);
      return { ...c, addons: next };
    });

  const unit = (n: number, kind: 'monthly' | 'one_time') =>
    kind === 'monthly' && yearlyOnly
      ? `+${money(yr(n))}${t(L.perYear)}`
      : kind === 'monthly' && cfg.billing === 'once'
      ? `+${money(n * ONCE_MONTHS)} ${t(L.oneTime)}`
      : `+${money(n)}${kind === 'monthly' ? t(L.perMo) : ` ${t(L.oneTime)}`}`;

  const summary = est ? (
    <View style={[styles.summary, shadow, wide && { position: 'sticky' as any, top: 90 }]}>
      <Text style={styles.sumTitle}>{t(L.summary)}</Text>
      <Row
        label={`${t(L.plan)} ${t(est.plan.name)}`}
        value={
          est.billing === 'once'
            ? money(est.plan.monthly * ONCE_MONTHS)
            : yearlyOnly
              ? `${money(yr(est.plan.monthly))}${t(L.perYear)}`
              : `${money(est.plan.monthly)}${t(L.perMo)}`
        }
      />
      {est.lines.map((l) => (
        <Row
          key={l.id}
          label={`${t(l.name)}${l.qty > 1 ? ` ×${l.qty}` : ''}`}
          value={
            l.kind === 'monthly'
              ? est.billing === 'once'
                ? money(l.total * ONCE_MONTHS)
                : yearlyOnly
                  ? `${money(yr(l.total))}${t(L.perYear)}`
                  : `${money(l.total)}${t(L.perMo)}`
              : money(l.total)
          }
          muted
        />
      ))}
      {cfg.domain ? <Row label={lang === 'es' ? 'Dirección web' : 'Web address'} value={domainLabel(cfg.domain)} muted /> : null}
      <View style={styles.divider} />
      <Row label={t(L.setupTotal)} value={money(est.oneTime)} />
      <Row
        label={
          est.billing === 'once'
            ? `${t(L.license)} (${money(est.monthly)} × ${ONCE_MONTHS})`
            : yearlyOnly
              ? t(L.yearlyFee)
              : est.billing === 'yearly'
              ? `${t(L.subYear)} (${money(est.monthly)} × ${ANNUAL_MONTHS})`
              : t(L.subMonth)
        }
        value={money(est.billing === 'once' ? est.license : est.recurring)}
      />
      {est.savings > 0 && !yearlyOnly ? <Text style={styles.save}>{`${t(L.save)} ${money(est.savings)} ${lang === 'es' ? 'al año' : 'per year'}`}</Text> : null}
      <View style={styles.divider} />
      <View style={styles.dueRow}>
        <Text style={styles.dueLabel}>{t(L.dueToday)}</Text>
        <Text style={styles.dueValue} testID="due-today">
          {money(est.dueToday)}
        </Text>
      </View>
      <Text style={styles.renew}>
        {est.billing === 'once'
          ? `${t(L.careAfter)} ${money(est.care)}${t(L.perYear)}`
          : `${t(L.renews)} ${money(est.renewal)}${est.renewalPer === 'year' ? t(L.perYear) : t(L.perMo)}`}
      </Text>
      <Pressable
        style={[styles.cta, needsDomain && { opacity: 0.5 }]}
        accessibilityRole="link"
        disabled={needsDomain}
        onPress={() => router.push(`/quote?product=${product.slug}&${configToQuery(cfg)}`)}
      >
        <Ionicons name={needsDomain ? 'globe-outline' : 'document-text'} size={18} color="#fff" />
        <Text style={styles.ctaText}>{needsDomain ? t(L.pickDomain) : t(L.cta)}</Text>
      </Pressable>
      <Text style={styles.fine}>{t(L.fine)}</Text>
    </View>
  ) : null;

  return (
    <View style={{ gap: 16 }} nativeID="pricing">
      <View style={styles.headRow}>
        <View style={{ flex: 1, minWidth: 240, gap: 4 }}>
          <Text style={styles.h2}>{t(L.title)}</Text>
          <Text style={styles.muted}>{t(L.sub)}</Text>
        </View>
        {allowed.length > 1 ? (
        <View style={styles.toggle} accessibilityRole="radiogroup">
          {allowed.map((b) => {
            const on = cfg.billing === b;
            return (
              <Pressable key={b} onPress={() => setBilling(b)} style={[styles.toggleBtn, on && styles.toggleOn]} accessibilityRole="radio" accessibilityState={{ checked: on }}>
                <Text style={[styles.toggleText, on && { color: '#fff' }]}>{t(b === 'yearly' ? L.yearly : b === 'monthly' ? L.monthly : L.once)}</Text>
                {b === 'yearly' ? (
                  <Text style={[styles.freeTag, on && { backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }]}>{t(L.free2)}</Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
        ) : null}
      </View>

      <View style={[{ gap: 16 }, wide && { flexDirection: 'row', alignItems: 'flex-start' }]}>
        <View style={[{ gap: 16 }, wide && { flex: 1.7 }]}>
          <View style={styles.plans}>
            {pricing.plans.map((p) => {
              const on = cfg.plan === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => setCfg((c) => ({ ...c, plan: p.id }))}
                  style={[styles.planCard, on && styles.planOn]}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                >
                  {p.popular ? <Text style={styles.popular}>{t(L.popular)}</Text> : null}
                  <Text style={styles.planName}>{t(p.name)}</Text>
                  {cfg.billing === 'once' ? (
                    <>
                      <Text style={styles.planPrice}>
                        {money(p.monthly * ONCE_MONTHS + p.setup)}
                        <Text style={styles.planPer}> {t(L.onceLabel)}</Text>
                      </Text>
                      <Text style={styles.planBilled}>{t(L.onceIncl)}</Text>
                      <Text style={styles.planSetup}>{`${lang === 'es' ? 'Luego opcional' : 'Then optional'} ${money(p.monthly * CARE_MONTHS)}${t(L.perYear)}`}</Text>
                    </>
                  ) : yearlyOnly ? (
                    <>
                      <Text style={styles.planPrice}>
                        {money(yr(p.monthly))}
                        <Text style={styles.planPer}>{t(L.perYear)}</Text>
                      </Text>
                      <Text style={styles.planBilled}>{t(L.billedYearly)}</Text>
                      <Text style={styles.planSetup}>{p.setup > 0 ? `+ ${money(p.setup)} ${t(L.setup)}` : t(L.noSetup)}</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.planPrice}>
                        {money(p.monthly)}
                        <Text style={styles.planPer}>{t(L.perMo)}</Text>
                      </Text>
                      <Text style={styles.planBilled}>
                        {cfg.billing === 'yearly'
                          ? `${money(p.monthly * ANNUAL_MONTHS)}${t(L.perYear)} ${t(L.billedYearly)} · ${lang === 'es' ? 'ahorras' : 'save'} ${money(p.monthly * (12 - ANNUAL_MONTHS))}`
                          : t(L.billedMonthly)}
                      </Text>
                      <Text style={styles.planSetup}>{`+ ${money(p.setup)} ${t(L.setup)}`}</Text>
                    </>
                  )}
                  <View style={{ gap: 6, marginTop: 6 }}>
                    {p.includes.map((inc, i) => (
                      <View key={i} style={styles.incRow}>
                        <Ionicons name="checkmark" size={16} color={colors.cyan} />
                        <Text style={styles.incText}>{t(inc)}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={[styles.pick, on && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                    <Text style={[styles.pickText, on && { color: '#fff' }]}>{on ? `✓ ${t(L.selected)}` : t(L.choose)}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {hasDomain || isDomainProduct ? (
            <DomainPicker
              value={cfg.domain}
              onChange={setDomain}
              domainPrice={hasDomain ? catalog.custom_domain.price : 0}
              modes={isDomainProduct ? ['new', 'own'] : undefined}
            />
          ) : null}

          {addons.length ? (
            <View style={[styles.addonsBox, shadow]}>
              <Text style={styles.h3}>{t(L.extras)}</Text>
              <Text style={styles.muted}>{t(L.extrasSub)}</Text>
              {addons.map((a) => {
                const qty = cfg.addons[a.id] ?? 0;
                const on = qty > 0;
                return (
                  <View key={a.id} style={styles.addonRow}>
                    <Pressable
                      onPress={() => setQty(a.id, on ? 0 : 1)}
                      style={styles.addonMain}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: on }}
                    >
                      <View style={[styles.check, on && styles.checkOn]}>{on ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}</View>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={styles.addonName}>{t(a.name)}</Text>
                        <Text style={styles.addonDesc}>{t(a.desc)}</Text>
                      </View>
                    </Pressable>
                    <View style={styles.addonRight}>
                      <Text style={styles.addonPrice}>{unit(a.price, a.kind)}</Text>
                      {on && a.perUnit ? (
                        <View style={styles.stepper}>
                          <Pressable onPress={() => setQty(a.id, qty - 1)} style={styles.stepBtn} accessibilityLabel="−">
                            <Ionicons name="remove" size={16} color={colors.primary} />
                          </Pressable>
                          <Text style={styles.qty}>{qty}</Text>
                          <Pressable onPress={() => setQty(a.id, qty + 1)} style={styles.stepBtn} accessibilityLabel="+">
                            <Ionicons name="add" size={16} color={colors.primary} />
                          </Pressable>
                        </View>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}
        </View>
        <View style={wide ? { flex: 1 } : undefined}>{summary}</View>
      </View>
    </View>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <View style={styles.sumRow}>
      <Text style={[styles.sumLabel, muted && { color: colors.muted, fontWeight: '500' }]}>{label}</Text>
      <Text style={[styles.sumValue, muted && { color: colors.muted }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', justifyContent: 'space-between' },
  h2: { fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: -0.4 },
  h3: { fontSize: 18, fontWeight: '800', color: colors.text },
  muted: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  toggle: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: colors.surface, borderRadius: 22, padding: 4, borderWidth: 1, borderColor: colors.border },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, minHeight: 40 },
  toggleOn: { backgroundColor: colors.primary },
  toggleText: { fontSize: 14, fontWeight: '800', color: colors.text },
  freeTag: { fontSize: 11, fontWeight: '800', color: '#0E7F98', backgroundColor: colors.softCyan, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999, overflow: 'hidden' },
  plans: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  planCard: {
    flexGrow: 1,
    flexBasis: 210,
    minWidth: 0,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    gap: 4,
    borderWidth: 2,
    borderColor: colors.border,
  },
  planOn: { borderColor: colors.primary, backgroundColor: '#F7FAFF' },
  popular: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
    backgroundColor: colors.cyan,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 4,
  },
  planName: { fontSize: 16, fontWeight: '800', color: colors.text },
  planPrice: { fontSize: 32, fontWeight: '800', color: colors.text, letterSpacing: -0.8 },
  planPer: { fontSize: 14, fontWeight: '600', color: colors.muted, letterSpacing: 0 },
  planBilled: { fontSize: 13, color: colors.muted },
  planSetup: { fontSize: 13, fontWeight: '700', color: colors.text },
  incRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  incText: { fontSize: 13, color: colors.text, flexShrink: 1, lineHeight: 18 },
  pick: { marginTop: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  pickText: { fontSize: 14, fontWeight: '800', color: colors.primary },
  addonsBox: { backgroundColor: colors.surface, borderRadius: 18, padding: 16, gap: 6, borderWidth: 1, borderColor: colors.border },
  addonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addonMain: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flexGrow: 1, flexBasis: 240, minWidth: 0 },
  check: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#C3CDE0', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  addonName: { fontSize: 15, fontWeight: '700', color: colors.text },
  addonDesc: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  addonRight: { flexDirection: 'row', alignItems: 'center', gap: 10, marginLeft: 'auto' },
  addonPrice: { fontSize: 14, fontWeight: '800', color: colors.text },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 10 },
  stepBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  qty: { minWidth: 24, textAlign: 'center', fontSize: 15, fontWeight: '800', color: colors.text },
  summary: { backgroundColor: colors.surface, borderRadius: 18, padding: 18, gap: 10, borderWidth: 1, borderColor: colors.border },
  sumTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  sumLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text },
  sumValue: { fontSize: 14, fontWeight: '800', color: colors.text },
  divider: { height: 1, backgroundColor: colors.border },
  save: { fontSize: 13, fontWeight: '700', color: '#0E7F98' },
  dueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 },
  dueLabel: { fontSize: 16, fontWeight: '800', color: colors.text },
  dueValue: { fontSize: 30, fontWeight: '800', color: colors.primary, letterSpacing: -0.6 },
  renew: { fontSize: 13, color: colors.muted, textAlign: 'right' },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    minHeight: 48,
    marginTop: 4,
  },
  ctaText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  fine: { fontSize: 12, color: colors.muted, textAlign: 'center' },
});
