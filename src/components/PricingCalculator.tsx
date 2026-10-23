import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { ANNUAL_MONTHS } from '../data/pricing';
import type { Product } from '../data/products';
import { useLang } from '../i18n';
import { Billing, Config, configToQuery, estimate, MAX_QTY, money, useAddons } from '../lib/pricing';
import { colors, shadow } from '../theme';

const L = {
  title: { es: 'Planes y precios', en: 'Plans and pricing' },
  sub: {
    es: 'Elige un plan y agrega lo que necesites. El total se calcula al instante.',
    en: 'Pick a plan and add what you need. The total updates instantly.',
  },
  yearly: { es: 'Anual', en: 'Yearly' },
  monthly: { es: 'Mensual', en: 'Monthly' },
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

export function PricingCalculator({ product }: { product: Product }) {
  const { t, lang } = useLang();
  const router = useRouter();
  const catalog = useAddons();
  const { width } = useWindowDimensions();
  const wide = width >= 960;
  const pricing = product.pricing!;
  const defaultPlan = pricing.plans.find((p) => p.popular)?.id ?? pricing.plans[0].id;
  const [cfg, setCfg] = useState<Config>({ plan: defaultPlan, billing: 'yearly', addons: {} });
  const est = useMemo(() => estimate(pricing, catalog, cfg), [pricing, catalog, cfg]);
  const addons = pricing.addons.map((id) => catalog[id]).filter(Boolean);

  const setBilling = (billing: Billing) => setCfg((c) => ({ ...c, billing }));
  const setQty = (id: string, qty: number) =>
    setCfg((c) => {
      const next = { ...c.addons };
      if (qty <= 0) delete next[id];
      else next[id] = Math.min(qty, MAX_QTY);
      return { ...c, addons: next };
    });

  const unit = (n: number, kind: 'monthly' | 'one_time') => `+${money(n)}${kind === 'monthly' ? t(L.perMo) : ` ${t(L.oneTime)}`}`;

  const summary = est ? (
    <View style={[styles.summary, shadow, wide && { position: 'sticky' as any, top: 90 }]}>
      <Text style={styles.sumTitle}>{t(L.summary)}</Text>
      <Row label={`${t(L.plan)} ${t(est.plan.name)}`} value={`${money(est.plan.monthly)}${t(L.perMo)}`} />
      {est.lines.map((l) => (
        <Row
          key={l.id}
          label={`${t(l.name)}${l.qty > 1 ? ` ×${l.qty}` : ''}`}
          value={l.kind === 'monthly' ? `${money(l.total)}${t(L.perMo)}` : money(l.total)}
          muted
        />
      ))}
      <View style={styles.divider} />
      <Row label={t(L.setupTotal)} value={money(est.oneTime)} />
      <Row
        label={est.billing === 'yearly' ? `${t(L.subYear)} (${money(est.monthly)} × ${ANNUAL_MONTHS})` : t(L.subMonth)}
        value={money(est.recurring)}
      />
      {est.savings > 0 ? <Text style={styles.save}>{`${t(L.save)} ${money(est.savings)} ${lang === 'es' ? 'al año' : 'per year'}`}</Text> : null}
      <View style={styles.divider} />
      <View style={styles.dueRow}>
        <Text style={styles.dueLabel}>{t(L.dueToday)}</Text>
        <Text style={styles.dueValue} testID="due-today">
          {money(est.dueToday)}
        </Text>
      </View>
      <Text style={styles.renew}>
        {`${t(L.renews)} ${money(est.recurring)}${est.billing === 'yearly' ? t(L.perYear) : t(L.perMo)}`}
      </Text>
      <Pressable
        style={styles.cta}
        accessibilityRole="link"
        onPress={() => router.push(`/quote?product=${product.slug}&${configToQuery(cfg)}`)}
      >
        <Ionicons name="document-text" size={18} color="#fff" />
        <Text style={styles.ctaText}>{t(L.cta)}</Text>
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
        <View style={styles.toggle} accessibilityRole="radiogroup">
          {(['yearly', 'monthly'] as Billing[]).map((b) => {
            const on = cfg.billing === b;
            return (
              <Pressable key={b} onPress={() => setBilling(b)} style={[styles.toggleBtn, on && styles.toggleOn]} accessibilityRole="radio" accessibilityState={{ checked: on }}>
                <Text style={[styles.toggleText, on && { color: '#fff' }]}>{t(b === 'yearly' ? L.yearly : L.monthly)}</Text>
                {b === 'yearly' ? (
                  <Text style={[styles.freeTag, on && { backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }]}>{t(L.free2)}</Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={[{ gap: 16 }, wide && { flexDirection: 'row', alignItems: 'flex-start' }]}>
        <View style={[{ gap: 16 }, wide && { flex: 1.7 }]}>
          <View style={styles.plans}>
            {pricing.plans.map((p) => {
              const on = cfg.plan === p.id;
              const shown = cfg.billing === 'yearly' ? (p.monthly * ANNUAL_MONTHS) / 12 : p.monthly;
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
                  <Text style={styles.planPrice}>
                    {money(Math.round(shown * 100) / 100)}
                    <Text style={styles.planPer}>{t(L.perMo)}</Text>
                  </Text>
                  <Text style={styles.planBilled}>
                    {cfg.billing === 'yearly' ? `${money(p.monthly * ANNUAL_MONTHS)} ${t(L.billedYearly)}` : t(L.billedMonthly)}
                  </Text>
                  <Text style={styles.planSetup}>{`+ ${money(p.setup)} ${t(L.setup)}`}</Text>
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
  toggle: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 999, padding: 4, borderWidth: 1, borderColor: colors.border },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, minHeight: 40 },
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
