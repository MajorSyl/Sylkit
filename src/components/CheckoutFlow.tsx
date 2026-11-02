import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { ANNUAL_MONTHS, ONCE_MONTHS } from '../data/pricing';
import type { Product } from '../data/products';
import { getTemplate, STORE_PRODUCT } from '../data/storeTemplates';
import { templateShot } from '../lib/templateShot';
import { useLang } from '../i18n';
import { payIcon, PayOption, paySub, payTitle, usePayOptions } from '../lib/payOptions';
import { allowedBilling, billingName, isYearlyOnly } from '../lib/planText';
import { Billing, Config, configToQuery, DomainChoice, domainLabel, estimate, MAX_QTY, money, useAddons } from '../lib/pricing';
import { friendlyError, supabase } from '../lib/supabase';
import { useClientWidth } from '../lib/useClientWidth';
import { colors } from '../theme';
import { DomainPicker } from './DomainPicker';
import { Field, formStyles } from './Field';

// One-page checkout in the style of Shopify:
//   left  = Contact · Web address · Extras (optional) · Payment · one big Pay button
//   right = order summary with what is due today (on phones it folds into a bar at the top)
// Paying creates the order, confirms it at the server-calculated total and then:
//   card   -> straight to Stripe's secure page, back to /order when paid
//   crypto -> /order with the USDT payment box open
//   manual -> /order with that method's instructions and a reference field

type Contact = { email: string; name: string; whatsapp: string; business: string; country: string };

export function CheckoutFlow({ product, initial }: { product: Product; initial: Config | null }) {
  const { t, lang } = useLang();
  const es = lang === 'es';
  const router = useRouter();
  const width = useClientWidth();
  const wide = width >= 960;
  const catalog = useAddons();
  const payOptions = usePayOptions();
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
    // Online store only: the design picked on the product page or in the templates gallery.
    template: product.slug === STORE_PRODUCT ? getTemplate(initial?.template)?.slug : undefined,
  }));
  const isStore = product.slug === STORE_PRODUCT;
  const tpl = getTemplate(cfg.template);
  const [contact, setContact] = useState<Contact>({ email: '', name: '', whatsapp: '', business: '', country: '' });
  const [pay, setPay] = useState('');
  const [showExtras, setShowExtras] = useState(Object.keys(initial?.addons ?? {}).length > 0);
  const [showSummary, setShowSummary] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!pay && payOptions?.length) setPay(payOptions[0].id);
  }, [payOptions, pay]);

  const est = useMemo(() => estimate(pricing, catalog, cfg), [pricing, catalog, cfg]);
  const hasDomain = pricing.addons.includes('custom_domain') && !!catalog.custom_domain;
  const addons = pricing.addons.filter((id) => !(hasDomain && id === 'custom_domain')).map((id) => catalog[id]).filter(Boolean);
  const chosen = payOptions?.find((o) => o.id === pay);
  const set = (k: keyof Contact) => (v: string) => setContact((c) => ({ ...c, [k]: v }));

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

  if (!est) return null;
  const plan = est.plan;
  const per = (b: Billing) => (b === 'monthly' ? (es ? '/mes' : '/mo') : es ? '/año' : '/year');
  const addonPrice = (n: number, kind: 'monthly' | 'one_time') =>
    kind === 'one_time'
      ? `+${money(n)}`
      : cfg.billing === 'once'
        ? `+${money(n * ONCE_MONTHS)}`
        : cfg.billing === 'yearly' || yearlyOnly
          ? `+${money(n * ANNUAL_MONTHS)}${per('yearly')}`
          : `+${money(n)}${per('monthly')}`;
  const renewDate = (() => {
    const d = new Date();
    if (cfg.billing === 'monthly') d.setMonth(d.getMonth() + 1);
    else d.setFullYear(d.getFullYear() + 1);
    return d.toLocaleDateString(es ? 'es' : 'en', { day: 'numeric', month: 'short', year: 'numeric' });
  })();
  const total = money(est.dueToday);
  const payLabel = !chosen
    ? es
      ? 'Continuar'
      : 'Continue'
    : chosen.kind === 'card'
      ? es
        ? `Pagar ${total}`
        : `Pay ${total}`
      : chosen.kind === 'crypto'
        ? es
          ? `Continuar al pago · ${total}`
          : `Continue to payment · ${total}`
        : es
          ? `Hacer pedido · ${total}`
          : `Place order · ${total}`;

  const submit = async () => {
    setError('');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact.email.trim())) return setError(es ? 'Revisa tu correo electrónico.' : 'Please check your email.');
    if (contact.name.trim().length < 2) return setError(es ? 'Escribe tu nombre.' : 'Please enter your name.');
    if (isDomainProduct && !cfg.domain) return setError(es ? 'Elige tu dominio.' : 'Choose your domain.');
    if (!chosen) return setError(es ? 'Elige cómo quieres pagar.' : 'Choose how you want to pay.');
    setBusy(true);
    try {
      const source = typeof window !== 'undefined' ? window.location.search.slice(0, 200) || 'direct' : 'app';
      const { data, error: err } = await supabase.rpc('create_order', {
        p_customer_name: contact.name.trim(),
        p_email: contact.email.trim(),
        p_whatsapp: contact.whatsapp.trim() || null,
        p_business_name: contact.business.trim() || null,
        p_country: contact.country.trim() || null,
        p_details: null,
        p_product_slug: product.slug,
        p_lang: lang,
        p_source: source,
        p_config: cfg,
      });
      if (err || !data) {
        setBusy(false);
        return setError(friendlyError(err, lang));
      }
      const token = (data as any).token as string;
      try {
        localStorage.setItem('sylkit_last_order', token);
      } catch {
        /* optional */
      }
      // Confirm the order at the server-calculated total so it can be paid right away.
      await fetch('/api/pay/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token }) }).catch(() => null);
      if (chosen.kind === 'card') {
        const r = await fetch('/api/stripe/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token }) }).catch(() => null);
        const j = r ? await r.json().catch(() => ({})) : {};
        if (r?.ok && j.url) {
          if (Platform.OS === 'web' && typeof window !== 'undefined') return window.location.assign(j.url);
        }
      }
      setBusy(false);
      router.push(`/order?t=${token}&new=1&pay=${encodeURIComponent(chosen.id)}`);
    } catch (e) {
      setBusy(false);
      setError(friendlyError(e as any, lang));
    }
  };

  // ---------- order summary (right column, or folded bar on phones) ----------
  const summary = (
    <View style={{ gap: 14 }}>
      <View style={styles.itemRow}>
        <View style={styles.thumb}>
          <Ionicons name={(product.icon as any) ?? 'cube'} size={24} color={colors.primary} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.itemName}>{t(product.name)}</Text>
          <Text style={styles.itemSub}>
            {es ? 'Plan' : 'Plan'} {t(plan.name)} · {billingName(cfg.billing, lang)}
          </Text>
          <Link href={`/product/${product.slug}?billing=${cfg.billing}`} style={styles.change}>
            {es ? 'Cambiar plan' : 'Change plan'}
          </Link>
        </View>
        <Text style={styles.itemPrice}>{money(cfg.billing === 'once' ? est.license : est.recurring)}</Text>
      </View>

      {allowed.length > 1 ? (
        <View style={styles.seg} accessibilityRole="radiogroup">
          {allowed.map((b) => {
            const on = cfg.billing === b;
            return (
              <Pressable key={b} onPress={() => setCfg((c) => ({ ...c, billing: b }))} style={[styles.segBtn, on && styles.segOn]} accessibilityRole="radio" accessibilityState={{ checked: on }}>
                <Text style={[styles.segText, on && { color: colors.text }]}>{billingName(b, lang)}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <View style={{ gap: 8 }}>
        <Line label={cfg.billing === 'once' ? (es ? 'Licencia (sin suscripción)' : 'License (no subscription)') : cfg.billing === 'monthly' ? (es ? 'Primer mes' : 'First month') : es ? 'Primeros 12 meses' : 'First 12 months'} value={money(cfg.billing === 'once' ? est.license : est.recurring)} />
        {est.oneTime > 0 ? <Line label={es ? 'Instalación y extras (una vez)' : 'Setup and extras (one-time)'} value={money(est.oneTime)} /> : null}
        {est.lines.map((l) => (
          <Line key={l.id} label={`${t(l.name)}${l.qty > 1 ? ` ×${l.qty}` : ''}`} muted />
        ))}
        {cfg.domain ? <Line label={`${es ? 'Dirección web' : 'Web address'}: ${domainLabel(cfg.domain)}`} muted /> : null}
        {tpl ? <Line label={`${es ? 'Diseño' : 'Design'}: ${tpl.name}`} muted /> : null}
        {est.savings > 0 && !yearlyOnly ? <Text style={styles.save}>{es ? `Ahorras ${money(est.savings)} pagando anual` : `You save ${money(est.savings)} by paying yearly`}</Text> : null}
      </View>

      <View style={styles.divider} />
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>{es ? 'Total hoy' : 'Total today'}</Text>
        <Text style={styles.total}>
          <Text style={styles.cur}>USD </Text>
          {total}
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

  // ---------- left column ----------
  const form = (
    <View style={{ gap: 28 }}>
      <Section title={es ? 'Contacto' : 'Contact'} note={es ? 'Te enviamos el recibo y el acceso a tu sistema aquí.' : 'We send your receipt and system access here.'}>
        <Field label={es ? 'Correo electrónico' : 'Email'} value={contact.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholder="you@business.com" />
        <View style={styles.pair}>
          <View style={styles.half}>
            <Field label={es ? 'Nombre completo' : 'Full name'} value={contact.name} onChangeText={set('name')} autoComplete="name" />
          </View>
          <View style={styles.half}>
            <Field label="WhatsApp" value={contact.whatsapp} onChangeText={set('whatsapp')} keyboardType="phone-pad" placeholder="+58 412 …" autoComplete="tel" />
          </View>
        </View>
        <View style={styles.pair}>
          <View style={styles.half}>
            <Field label={es ? 'Negocio (opcional)' : 'Business (optional)'} value={contact.business} onChangeText={set('business')} autoComplete="organization" />
          </View>
          <View style={styles.half}>
            <Field label={es ? 'País (opcional)' : 'Country (optional)'} value={contact.country} onChangeText={set('country')} autoComplete="country-name" />
          </View>
        </View>
      </Section>

      {isStore ? (
        <Section title={es ? 'Diseño de tu tienda' : 'Store design'} note={es ? 'Incluido gratis. Lo adaptamos a tu marca.' : 'Included free. We adapt it to your brand.'}>
          <View style={styles.tplBox}>
            {tpl ? (
              <Image source={{ uri: templateShot(tpl.slug, 'phone') }} style={styles.tplThumb} resizeMode="cover" accessibilityLabel={tpl.name} />
            ) : (
              <View style={[styles.tplThumb, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.softBlue }]}>
                <Ionicons name="color-palette-outline" size={24} color={colors.primary} />
              </View>
            )}
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.tplName}>{tpl ? tpl.name : es ? 'Aún no elegido' : 'Not chosen yet'}</Text>
              <Text style={styles.note}>{tpl ? t({ es: tpl.tagline[0], en: tpl.tagline[1] }) : es ? 'Opcional. Puedes elegirlo después.' : 'Optional. You can pick it later.'}</Text>
            </View>
            <Pressable onPress={() => router.push(`/templates?${configToQuery({ ...cfg, template: undefined })}` as any)} style={styles.tplBtn} accessibilityRole="link">
              <Text style={styles.tplBtnText}>{tpl ? (es ? 'Cambiar' : 'Change') : es ? 'Elegir' : 'Choose'}</Text>
            </Pressable>
          </View>
        </Section>
      ) : null}

      {hasDomain || isDomainProduct ? (
        <Section title={es ? 'Dirección web' : 'Web address'}>
          <DomainPicker value={cfg.domain} onChange={setDomain} domainPrice={hasDomain ? catalog.custom_domain.price : 0} modes={isDomainProduct ? ['new', 'own'] : undefined} />
        </Section>
      ) : null}

      {addons.length ? (
        <View style={styles.extras}>
          <Pressable style={styles.extrasHead} onPress={() => setShowExtras((v) => !v)} accessibilityRole="button" accessibilityState={{ expanded: showExtras }}>
            <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.extrasTitle}>{es ? 'Agregar funciones extra (opcional)' : 'Add extras (optional)'}</Text>
              <Text style={styles.note}>
                {Object.keys(cfg.addons).filter((id) => id !== 'custom_domain').length > 0
                  ? es
                    ? `${Object.keys(cfg.addons).filter((id) => id !== 'custom_domain').length} agregada(s)`
                    : `${Object.keys(cfg.addons).filter((id) => id !== 'custom_domain').length} added`
                  : es
                    ? 'También puedes agregarlas más adelante.'
                    : 'You can also add them later.'}
              </Text>
            </View>
            <Ionicons name={showExtras ? 'chevron-up' : 'chevron-down'} size={20} color={colors.muted} />
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
                        <Text style={styles.note}>{t(a.desc)}</Text>
                      </View>
                    </Pressable>
                    <View style={styles.addonRight}>
                      <Text style={styles.addonPrice}>{addonPrice(a.price, a.kind)}</Text>
                      {on && a.perUnit ? (
                        <View style={styles.stepper}>
                          <Pressable onPress={() => setQty(a.id, qty - 1)} style={styles.stepBtn} accessibilityLabel={es ? 'Menos' : 'Less'}>
                            <Ionicons name="remove" size={16} color={colors.primary} />
                          </Pressable>
                          <Text style={styles.qty}>{qty}</Text>
                          <Pressable onPress={() => setQty(a.id, qty + 1)} style={styles.stepBtn} accessibilityLabel={es ? 'Más' : 'More'}>
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

      <Section title={es ? 'Pago' : 'Payment'} note={es ? 'Todas las transacciones son seguras.' : 'All transactions are secure.'}>
        {payOptions === null ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 12 }} />
        ) : (
          <View style={styles.payList} accessibilityRole="radiogroup">
            {payOptions.map((o, i) => (
              <PayRow key={o.id} option={o} on={pay === o.id} first={i === 0} last={i === payOptions.length - 1} onPress={() => setPay(o.id)} />
            ))}
          </View>
        )}
      </Section>

      {error ? <Text style={formStyles.error}>{error}</Text> : null}

      <Pressable style={[styles.payBtn, busy && { opacity: 0.8 }]} onPress={submit} disabled={busy} accessibilityRole="button">
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="lock-closed" size={17} color="#fff" />
            <Text style={styles.payBtnText}>{payLabel}</Text>
          </>
        )}
      </Pressable>
      <View style={styles.trust}>
        <Trust icon="shield-checkmark-outline" text={es ? 'Garantía de 14 días' : '14-day money-back guarantee'} />
        <Trust icon="refresh-outline" text={es ? 'Cancela cuando quieras' : 'Cancel anytime'} />
        <Trust icon="logo-whatsapp" text={es ? 'Soporte por WhatsApp' : 'WhatsApp support'} />
      </View>
      <Text style={styles.legal}>
        {es ? 'Al pagar aceptas los ' : 'By paying you agree to the '}
        <Link href="/terms" style={styles.legalLink}>
          {es ? 'Términos' : 'Terms'}
        </Link>
        {es ? ' y la ' : ' and the '}
        <Link href="/refunds" style={styles.legalLink}>
          {es ? 'política de reembolsos' : 'Refund policy'}
        </Link>
        .
      </Text>
    </View>
  );

  if (wide) {
    return (
      <View style={styles.wideWrap}>
        <View style={styles.leftCol}>{form}</View>
        <View style={styles.rightCol}>
          <View style={{ position: 'sticky' as any, top: 24 }}>{summary}</View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ gap: 20 }}>
      <View style={styles.foldBox}>
        <Pressable style={styles.foldHead} onPress={() => setShowSummary((v) => !v)} accessibilityRole="button" accessibilityState={{ expanded: showSummary }}>
          <Ionicons name="cart-outline" size={18} color={colors.primary} />
          <Text style={styles.foldText}>{showSummary ? (es ? 'Ocultar resumen' : 'Hide order summary') : es ? 'Ver resumen del pedido' : 'Show order summary'}</Text>
          <Ionicons name={showSummary ? 'chevron-up' : 'chevron-down'} size={16} color={colors.primary} />
          <Text style={styles.foldTotal}>{total}</Text>
        </Pressable>
        {showSummary ? <View style={{ paddingTop: 14 }}>{summary}</View> : null}
      </View>
      {form}
    </View>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <View style={{ gap: 12 }}>
      <View style={{ gap: 2 }}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          {title}
        </Text>
        {note ? <Text style={styles.note}>{note}</Text> : null}
      </View>
      {children}
    </View>
  );
}

export function PayRow({ option, on, first, last, onPress }: { option: PayOption; on: boolean; first?: boolean; last?: boolean; onPress: () => void }) {
  const { t, lang } = useLang();
  return (
    <View style={[styles.payRow, first && styles.payFirst, last && styles.payLast, on && styles.payOn, !last && { borderBottomWidth: 0 }, on && !last && { borderBottomWidth: 1 }]}>
      <Pressable onPress={onPress} style={styles.payHead} accessibilityRole="radio" accessibilityState={{ checked: on }}>
        <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.payName}>{payTitle(option, lang)}</Text>
          <Text style={styles.note}>{paySub(option, lang)}</Text>
        </View>
        <Ionicons name={payIcon(option) as any} size={22} color={on ? colors.primary : colors.muted} />
      </Pressable>
      {on && option.kind === 'manual' && option.details ? (
        <View style={styles.payDetail}>
          <Text style={styles.payDetailText}>{t(option.details)}</Text>
        </View>
      ) : null}
      {on && option.kind === 'card' ? (
        <View style={styles.payDetail}>
          <Text style={styles.payDetailText}>
            {lang === 'es' ? 'Te llevamos a la página segura de Stripe para escribir tu tarjeta y luego vuelves aquí.' : "We take you to Stripe's secure page to enter your card, then bring you back here."}
          </Text>
        </View>
      ) : null}
      {on && option.kind === 'crypto' ? (
        <View style={styles.payDetail}>
          <Text style={styles.payDetailText}>
            {lang === 'es' ? 'En el siguiente paso te mostramos el monto exacto y la dirección para enviar USDT.' : 'Next we show you the exact amount and the address to send USDT to.'}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function Line({ label, value, muted }: { label: string; value?: string; muted?: boolean }) {
  return (
    <View style={styles.line}>
      <Text style={[styles.lineLabel, muted && { color: colors.muted, fontWeight: '500' }]}>{label}</Text>
      {value ? <Text style={styles.lineValue}>{value}</Text> : null}
    </View>
  );
}

function Trust({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.trustItem}>
      <Ionicons name={icon as any} size={15} color={colors.muted} />
      <Text style={styles.trustText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tplBox: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12 },
  tplThumb: { width: 48, height: 86, borderRadius: 8, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  tplName: { fontSize: 16, fontWeight: '800', color: colors.text },
  tplBtn: { borderWidth: 1.5, borderColor: colors.primary, borderRadius: 10, paddingHorizontal: 14, minHeight: 40, justifyContent: 'center' },
  tplBtnText: { color: colors.primary, fontWeight: '800', fontSize: 14 },
  wideWrap: { flexDirection: 'row', alignItems: 'stretch', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  leftCol: { flex: 1.3, padding: 32, paddingRight: 40 },
  rightCol: { flex: 1, padding: 32, backgroundColor: '#F4F6FA', borderLeftWidth: 1, borderLeftColor: colors.border },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  note: { fontSize: 13, color: colors.muted, lineHeight: 19 },
  pair: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  half: { flexGrow: 1, flexBasis: 220 },
  extras: { borderWidth: 1, borderColor: '#D5DCEA', borderRadius: 14, paddingHorizontal: 14 },
  extrasHead: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 60 },
  extrasTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  addonRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border },
  addonMain: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flexGrow: 1, flexBasis: 220, minWidth: 0 },
  check: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#C3CDE0', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  addonName: { fontSize: 15, fontWeight: '700', color: colors.text },
  addonRight: { flexDirection: 'row', alignItems: 'center', gap: 10, marginLeft: 'auto' },
  addonPrice: { fontSize: 14, fontWeight: '800', color: colors.text },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 10 },
  stepBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  qty: { minWidth: 24, textAlign: 'center', fontSize: 15, fontWeight: '800', color: colors.text },
  payList: {},
  payRow: { borderWidth: 1, borderColor: '#D5DCEA', backgroundColor: colors.surface },
  payFirst: { borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  payLast: { borderBottomLeftRadius: 14, borderBottomRightRadius: 14 },
  payOn: { borderColor: colors.primary, backgroundColor: '#F7FAFF' },
  payHead: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, minHeight: 64 },
  payName: { fontSize: 15, fontWeight: '800', color: colors.text },
  payDetail: { paddingHorizontal: 16, paddingBottom: 16, paddingLeft: 50 },
  payDetailText: { fontSize: 13.5, lineHeight: 20, color: colors.text },
  radio: { width: 22, height: 22, borderRadius: 999, borderWidth: 2, borderColor: '#C3CDE0', alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 999, backgroundColor: colors.primary },
  payBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: colors.primary, minHeight: 56, borderRadius: 14, paddingHorizontal: 20 },
  payBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  trust: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginTop: -12 },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  trustText: { fontSize: 12.5, color: colors.muted, fontWeight: '600' },
  legal: { fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: -16 },
  legalLink: { color: colors.muted, textDecorationLine: 'underline' },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  thumb: { width: 52, height: 52, borderRadius: 12, backgroundColor: colors.softBlue, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  itemName: { fontSize: 15, fontWeight: '800', color: colors.text },
  itemSub: { fontSize: 13, color: colors.muted },
  change: { fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: 2 },
  itemPrice: { fontSize: 15, fontWeight: '800', color: colors.text },
  seg: { flexDirection: 'row', backgroundColor: '#E6EBF4', borderRadius: 999, padding: 3, alignSelf: 'flex-start' },
  segBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, minHeight: 34, justifyContent: 'center' },
  segOn: { backgroundColor: colors.surface },
  segText: { fontSize: 13, fontWeight: '700', color: colors.muted },
  line: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  lineLabel: { flex: 1, fontSize: 14, color: colors.text, fontWeight: '600' },
  lineValue: { fontSize: 14, color: colors.text, fontWeight: '700' },
  save: { fontSize: 13, fontWeight: '700', color: '#0E7F98' },
  divider: { height: 1, backgroundColor: '#DCE2EE' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  totalLabel: { fontSize: 17, fontWeight: '800', color: colors.text },
  total: { fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  cur: { fontSize: 12, fontWeight: '600', color: colors.muted },
  renew: { fontSize: 13, color: colors.muted, lineHeight: 19 },
  foldBox: { backgroundColor: '#F4F6FA', borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14 },
  foldHead: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 32 },
  foldText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  foldTotal: { marginLeft: 'auto', fontSize: 17, fontWeight: '800', color: colors.text },
});
