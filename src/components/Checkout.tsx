import { Ionicons } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { ANNUAL_MONTHS, ONCE_MONTHS } from '../data/pricing';
import type { Product } from '../data/products';
import { useLang } from '../i18n';
import { allowedBilling, billingName, isYearlyOnly, planQuote } from '../lib/planText';
import { Billing, Config, DomainChoice, domainLabel, estimate, MAX_QTY, money, useAddons } from '../lib/pricing';
import { colors, shadow } from '../theme';
import { DomainPicker } from './DomainPicker';
import { QuoteForm } from './QuoteForm';

// Checkout for fixed-price plans, laid out like a shopping cart:
// 1 plan  2 billing period  3 web address  4 extras (optional, folded)  → summary → your details.
// A bar fixed to the bottom always shows what is due today.

export function Checkout({ product, initial }: { product: Product; initial: Config | null }) {
  const { t, lang } = useLang();
  const es = lang === 'es';
  const { width } = useWindowDimensions();
  const wide = width >= 960;
  const catalog = useAddons();
  const pricing = product.pricing!;
  const allowed = allowedBilling(pricing);
  const yearlyOnly = isYearlyOnly(pricing);
  const isDomainProduct = pricing.group === 'domain';
  const defaultPlan = pricing.plans.find((p) => p.popular)?.id ?? pricing.plans[0].id;

  const [cfg, setCfg] = useState<Config>(() => ({
    plan: initial?.plan && pricing.plans.some((p) => p.id === initial.plan) ? initial.plan : defaultPlan,
    billing: initial?.billing && allowed.includes(initial.billing) ? initial.billing : allowed[0],
    addons: initial?.addons ?? {},
    domain: initial?.domain && (!isDomainProduct || initial.domain.mode !== 'sub') ? initial.domain : undefined,
  }));
  const [showExtras, setShowExtras] = useState(Object.keys(initial?.addons ?? {}).length > 0);
  const est = useMemo(() => estimate(pricing, catalog, cfg), [pricing, catalog, cfg]);
  const hasDomain = pricing.addons.includes('custom_domain') && !!catalog.custom_domain;
  const addons = pricing.addons.filter((id) => !(hasDomain && id === 'custom_domain')).map((id) => catalog[id]).filter(Boolean);
  const needsDomain = isDomainProduct && !cfg.domain;
  const extrasCount = Object.keys(cfg.addons).filter((id) => id !== 'custom_domain').length;

  const scroll = useRef<ScrollView | null>(null);
  const [formY, setFormY] = useState(0);

  const setDomain = (d?: DomainChoice) =>
    setCfg((c) => {
      const next = { ...c.addons };
      if (hasDomain && d?.mode === 'new') next.custom_domain = 1;
      else delete next.custom_domain;
      return { ...c, domain: d, addons: next };
    });
  const setQty = (id: string, qty: number) =>
    setCfg((c) => {
      const next = { ...c.addons };
      if (qty <= 0) delete next[id];
      else next[id] = Math.min(qty, MAX_QTY);
      return { ...c, addons: next };
    });

  const per = (b: Billing) => (b === 'monthly' ? (es ? '/mes' : '/mo') : es ? '/año' : '/year');
  const addonPrice = (n: number, kind: 'monthly' | 'one_time') =>
    kind === 'one_time'
      ? `+${money(n)} ${es ? 'pago único' : 'one-time'}`
      : cfg.billing === 'once'
        ? `+${money(n * ONCE_MONTHS)} ${es ? 'pago único' : 'one-time'}`
        : cfg.billing === 'yearly' || yearlyOnly
          ? `+${money(n * ANNUAL_MONTHS)}${per('yearly')}`
          : `+${money(n)}${per('monthly')}`;

  const renewDate = (() => {
    const d = new Date();
    if (cfg.billing === 'monthly') d.setMonth(d.getMonth() + 1);
    else d.setFullYear(d.getFullYear() + 1);
    return d.toLocaleDateString(es ? 'es' : 'en', { day: 'numeric', month: 'short', year: 'numeric' });
  })();

  const goToForm = () => {
    if (Platform.OS === 'web') {
      try {
        document.getElementById('checkout-details')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      } catch {}
    }
    scroll.current?.scrollTo({ y: formY, animated: true });
  };

  if (!est) return null;
  const plan = est.plan;

  const summary = (
    <View style={[styles.box, shadow]}>
      <Text style={styles.h3}>{es ? 'Resumen' : 'Summary'}</Text>
      <Row label={`${t(product.name)} · ${t(plan.name)}`} sub={billingName(cfg.billing, lang)} />
      {cfg.billing === 'once' ? (
        <Row label={es ? 'Licencia (sin suscripción)' : 'License (no subscription)'} value={money(est.license)} />
      ) : (
        <Row
          label={cfg.billing === 'monthly' ? (es ? 'Primer mes' : 'First month') : es ? 'Primeros 12 meses' : 'First 12 months'}
          value={money(est.recurring)}
        />
      )}
      {est.oneTime > 0 ? <Row label={es ? 'Instalación y extras (una vez)' : 'Setup and extras (one-time)'} value={money(est.oneTime)} /> : null}
      {est.lines.map((l) => (
        <Row key={l.id} label={`• ${t(l.name)}${l.qty > 1 ? ` ×${l.qty}` : ''}`} muted />
      ))}
      {cfg.domain ? <Row label={`• ${es ? 'Dirección web' : 'Web address'}: ${domainLabel(cfg.domain)}`} muted /> : null}
      {est.savings > 0 && !yearlyOnly ? (
        <Text style={styles.save}>{es ? `Ahorras ${money(est.savings)} pagando anual` : `You save ${money(est.savings)} by paying yearly`}</Text>
      ) : null}
      <View style={styles.divider} />
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>{es ? 'Hoy pagas' : 'Today you pay'}</Text>
        <Text style={styles.total} testID="due-today">
          {money(est.dueToday)}
        </Text>
      </View>
      <Text style={styles.renew}>
        {cfg.billing === 'once'
          ? es
            ? `Sin suscripción. Desde el segundo año, mantenimiento opcional ${money(est.care)}/año.`
            : `No subscription. From year 2, optional care at ${money(est.care)}/year.`
          : es
            ? `Se renueva el ${renewDate} a ${money(est.renewal)}${per(cfg.billing)}. Cancela cuando quieras.`
            : `Renews on ${renewDate} at ${money(est.renewal)}${per(cfg.billing)}. Cancel anytime.`}
      </Text>
    </View>
  );

  return (
    <View style={{ gap: 16, paddingBottom: 90 }}>
      <View style={[{ gap: 16 }, wide && { flexDirection: 'row', alignItems: 'flex-start' }]}>
        <View style={[{ gap: 16 }, wide && { flex: 1.5 }]}>
          {/* 1. Plan */}
          <View style={[styles.box, shadow]}>
            <Step n={1} title={es ? 'Tu plan' : 'Your plan'} />
            <View style={styles.planRow}>
              {pricing.plans.map((p) => {
                const on = cfg.plan === p.id;
                const q = planQuote(p, cfg.billing, pricing, lang);
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => setCfg((c) => ({ ...c, plan: p.id }))}
                    style={[styles.option, on && styles.optionOn]}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on }}
                  >
                    <Radio on={on} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.optTitle}>{t(p.name)}</Text>
                      {p.popular ? <Text style={styles.optTag}>{es ? 'Más elegido' : 'Most popular'}</Text> : null}
                    </View>
                    <Text style={styles.optPrice}>
                      {q.price}
                      <Text style={styles.optPer}>{q.per}</Text>
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 2. Billing period */}
          {allowed.length > 1 ? (
            <View style={[styles.box, shadow]}>
              <Step n={2} title={es ? 'Forma de pago' : 'Billing period'} />
              {allowed.map((b) => {
                const on = cfg.billing === b;
                const q = planQuote(plan, b, pricing, lang);
                return (
                  <Pressable
                    key={b}
                    onPress={() => setCfg((c) => ({ ...c, billing: b }))}
                    style={[styles.option, on && styles.optionOn]}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on }}
                  >
                    <Radio on={on} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <Text style={styles.optTitle}>{billingName(b, lang)}</Text>
                        {b === 'yearly' ? <Text style={styles.free}>{es ? '2 meses gratis' : '2 months free'}</Text> : null}
                      </View>
                      <Text style={styles.optSub}>{q.renewText}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.optPrice}>{money(q.today)}</Text>
                      <Text style={styles.optPer}>{es ? 'hoy' : 'today'}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          {/* 3. Web address */}
          {hasDomain || isDomainProduct ? (
            <View style={{ gap: 8 }}>
              <Step n={allowed.length > 1 ? 3 : 2} title={es ? 'Tu dirección web' : 'Your web address'} plain />
              <DomainPicker
                value={cfg.domain}
                onChange={setDomain}
                domainPrice={hasDomain ? catalog.custom_domain.price : 0}
                modes={isDomainProduct ? ['new', 'own'] : undefined}
              />
            </View>
          ) : null}

          {/* 4. Extras, folded so they don't overwhelm */}
          {addons.length ? (
            <View style={[styles.box, shadow]}>
              <Pressable style={styles.extrasHead} onPress={() => setShowExtras((v) => !v)} accessibilityRole="button" accessibilityState={{ expanded: showExtras }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.h3}>{es ? 'Funciones extra (opcional)' : 'Extras (optional)'}</Text>
                  <Text style={styles.optSub}>
                    {extrasCount > 0
                      ? es
                        ? `${extrasCount} agregada${extrasCount > 1 ? 's' : ''}`
                        : `${extrasCount} added`
                      : es
                        ? 'Puedes agregarlas ahora o más adelante.'
                        : 'Add them now or any time later.'}
                  </Text>
                </View>
                <Ionicons name={showExtras ? 'chevron-up' : 'chevron-down'} size={22} color={colors.primary} />
              </Pressable>
              {showExtras
                ? addons.map((a) => {
                    const qty = cfg.addons[a.id] ?? 0;
                    const on = qty > 0;
                    return (
                      <View key={a.id} style={styles.addonRow}>
                        <Pressable onPress={() => setQty(a.id, on ? 0 : 1)} style={styles.addonMain} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
                          <View style={[styles.check, on && styles.checkOn]}>{on ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}</View>
                          <View style={{ flex: 1, gap: 2 }}>
                            <Text style={styles.addonName}>{t(a.name)}</Text>
                            <Text style={styles.optSub}>{t(a.desc)}</Text>
                          </View>
                        </Pressable>
                        <View style={styles.addonRight}>
                          <Text style={styles.addonPrice}>{addonPrice(a.price, a.kind)}</Text>
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
                  })
                : null}
            </View>
          ) : null}
        </View>

        <View style={[{ gap: 16 }, wide && { flex: 1, position: 'sticky' as any, top: 90 }]}>{summary}</View>
      </View>

      {/* Details and payment */}
      <View nativeID="checkout-details" onLayout={(e) => setFormY(e.nativeEvent.layout.y)}>
        {needsDomain ? (
          <View style={[styles.box, { alignItems: 'center' }]}>
            <Ionicons name="globe-outline" size={26} color={colors.primary} />
            <Text style={[styles.h3, { textAlign: 'center' }]}>{es ? 'Primero elige tu dominio arriba' : 'Choose your domain above first'}</Text>
          </View>
        ) : (
          <QuoteForm productSlug={product.slug} productName={t(product.name)} config={cfg} />
        )}
      </View>

      {/* Fixed bottom bar */}
      <View style={[styles.bar, Platform.OS === 'web' ? ({ position: 'fixed' } as any) : { position: 'absolute' }]}>
        <View style={styles.barInner}>
          <View style={{ flexShrink: 1 }}>
            <Text style={styles.barLabel}>{es ? 'Hoy pagas' : 'Today you pay'}</Text>
            <Text style={styles.barTotal}>{money(est.dueToday)}</Text>
          </View>
          <Pressable style={[styles.barBtn, needsDomain && { opacity: 0.5 }]} onPress={goToForm} accessibilityRole="button">
            <Text style={styles.barBtnText}>{es ? 'Continuar' : 'Continue'}</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function Step({ n, title, plain }: { n: number; title: string; plain?: boolean }) {
  return (
    <View style={[styles.step, plain && { marginBottom: 0 }]}>
      <View style={styles.stepNum}>
        <Text style={styles.stepNumText}>{n}</Text>
      </View>
      <Text style={styles.h3}>{title}</Text>
    </View>
  );
}

function Radio({ on }: { on: boolean }) {
  return <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>;
}

function Row({ label, value, sub, muted }: { label: string; value?: string; sub?: string; muted?: boolean }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, muted && { color: colors.muted, fontWeight: '500' }]}>{label}</Text>
        {sub ? <Text style={styles.optSub}>{sub}</Text> : null}
      </View>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.surface, borderRadius: 18, padding: 18, gap: 10, borderWidth: 1, borderColor: colors.border },
  h3: { fontSize: 18, fontWeight: '800', color: colors.text },
  step: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 2 },
  stepNum: { width: 28, height: 28, borderRadius: 999, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  planRow: { gap: 10 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: colors.border, borderRadius: 14, padding: 14, minHeight: 56 },
  optionOn: { borderColor: colors.primary, backgroundColor: '#F7FAFF' },
  optTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  optTag: { fontSize: 12, fontWeight: '700', color: colors.primary, marginTop: 2 },
  optSub: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  optPrice: { fontSize: 18, fontWeight: '800', color: colors.text },
  optPer: { fontSize: 12, fontWeight: '600', color: colors.muted },
  free: { fontSize: 11, fontWeight: '800', color: '#0E7F98', backgroundColor: colors.softCyan, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999, overflow: 'hidden' },
  radio: { width: 22, height: 22, borderRadius: 999, borderWidth: 2, borderColor: '#C3CDE0', alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 999, backgroundColor: colors.primary },
  extrasHead: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  addonRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border },
  addonMain: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flexGrow: 1, flexBasis: 240, minWidth: 0 },
  check: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#C3CDE0', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  addonName: { fontSize: 15, fontWeight: '700', color: colors.text },
  addonRight: { flexDirection: 'row', alignItems: 'center', gap: 10, marginLeft: 'auto' },
  addonPrice: { fontSize: 14, fontWeight: '800', color: colors.text },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 10 },
  stepBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  qty: { minWidth: 24, textAlign: 'center', fontSize: 15, fontWeight: '800', color: colors.text },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  rowLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  rowValue: { fontSize: 14, fontWeight: '800', color: colors.text },
  save: { fontSize: 13, fontWeight: '700', color: '#0E7F98' },
  divider: { height: 1, backgroundColor: colors.border },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  totalLabel: { fontSize: 17, fontWeight: '800', color: colors.text },
  total: { fontSize: 30, fontWeight: '800', color: colors.primary, letterSpacing: -0.6 },
  renew: { fontSize: 13, color: colors.muted, lineHeight: 19 },
  bar: { left: 0, right: 0, bottom: 0, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, zIndex: 20, boxShadow: '0 -6px 20px rgba(15,40,90,0.08)' } as any,
  barInner: { width: '100%', maxWidth: 1180, alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  barLabel: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  barTotal: { fontSize: 22, fontWeight: '800', color: colors.text },
  barBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primary, paddingHorizontal: 22, minHeight: 48, borderRadius: 12 },
  barBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
