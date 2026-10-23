import { ReactNode, useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { AdminGate, adminStyles } from '../../src/components/AdminGate';
import { Button } from '../../src/components/Button';
import { formStyles } from '../../src/components/Field';
import type { Pricing } from '../../src/data/pricing';
import { supabase } from '../../src/lib/supabase';
import { colors, shadow } from '../../src/theme';

export default function AdminProducts() {
  return <AdminGate title="Products">{() => <Products />}</AdminGate>;
}

type P = { slug: string; name_en: string; price_from: number | null; active: boolean; sort: number; pricing: Pricing | null };
type A = { id: string; name_en: string; kind: 'monthly' | 'one_time'; price: number; per_unit: boolean; active: boolean };
type M = { id: string; name: string; details_es: string; details_en: string; active: boolean; kind: string };
type Draft = Record<string, { monthly: string; setup: string }>; // key: plan id

const num = (v: string) => {
  const n = Number(String(v).trim().replace(',', '.'));
  return isNaN(n) || n < 0 ? null : n;
};

function Products() {
  const [rows, setRows] = useState<P[] | null>(null);
  const [addons, setAddons] = useState<A[]>([]);
  const [methods, setMethods] = useState<M[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [addonPrices, setAddonPrices] = useState<Record<string, string>>({});
  const [open, setOpen] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    const [{ data: p }, { data: a }, { data: m }] = await Promise.all([
      supabase.from('products').select('slug,name_en,price_from,active,sort,pricing').order('sort'),
      supabase.from('addons').select('id,name_en,kind,price,per_unit,active').order('sort'),
      supabase.from('payment_methods').select('*').order('sort'),
    ]);
    const list = (p as P[]) ?? [];
    setRows(list);
    setAddons((a as A[]) ?? []);
    setMethods((m as M[]) ?? []);
    setDrafts(
      Object.fromEntries(
        list.map((r) => [r.slug, Object.fromEntries((r.pricing?.plans ?? []).map((pl) => [pl.id, { monthly: String(pl.monthly), setup: String(pl.setup) }]))]),
      ),
    );
    setAddonPrices(Object.fromEntries(((a as A[]) ?? []).map((x) => [x.id, String(Number(x.price))])));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const savePlans = async (r: P) => {
    setMsg(null);
    if (!r.pricing) return;
    const d = drafts[r.slug] ?? {};
    const plans = [];
    for (const pl of r.pricing.plans) {
      const mo = num(d[pl.id]?.monthly ?? '');
      const su = num(d[pl.id]?.setup ?? '');
      if (mo == null || su == null) return setMsg({ ok: false, text: `Invalid price in ${r.name_en} · ${pl.name.en}.` });
      plans.push({ ...pl, monthly: mo, setup: su });
    }
    setBusy(r.slug);
    const { error } = await supabase
      .from('products')
      .update({ pricing: { ...r.pricing, plans }, price_from: Math.min(...plans.map((x) => x.monthly)) })
      .eq('slug', r.slug);
    setBusy('');
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: `${r.name_en}: plans saved. Live on the site now.` });
    load();
  };

  const toggle = async (slug: string, active: boolean) => {
    await supabase.from('products').update({ active }).eq('slug', slug);
    load();
  };

  const saveAddon = async (a: A, patch: Partial<A>) => {
    setMsg(null);
    setBusy(a.id);
    const { error } = await supabase.from('addons').update(patch).eq('id', a.id);
    setBusy('');
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: `${a.name_en} saved.` });
    load();
  };

  const saveMethod = async (m: M) => {
    setBusy(m.id);
    const { error } = await supabase.from('payment_methods').update({ details_es: m.details_es, details_en: m.details_en, active: m.active }).eq('id', m.id);
    setBusy('');
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: `${m.name} saved.` });
  };

  if (!rows) return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />;

  return (
    <View style={{ gap: 18 }}>
      <Text style={adminStyles.h1}>Products, pricing and payments</Text>
      {msg ? <Text style={msg.ok ? formStyles.success : formStyles.error}>{msg.text}</Text> : null}

      <View style={[adminStyles.card, shadow]}>
        <Text style={adminStyles.h2}>Plans per product</Text>
        <Text style={adminStyles.muted}>
          USD. Monthly price and one-time setup per plan. Yearly billing charges 10 months (2 free). The "From" price on the catalog is the cheapest monthly
          price.
        </Text>
        {rows.map((r) => (
          <View key={r.slug} style={styles.product}>
            <View style={styles.row}>
              <Pressable style={{ flex: 1, minWidth: 180 }} onPress={() => setOpen(open === r.slug ? '' : r.slug)}>
                <Text style={styles.name}>
                  {open === r.slug ? '▾' : '▸'} {r.name_en}
                </Text>
                <Text style={adminStyles.muted}>
                  {r.active ? 'Visible' : 'Hidden'} · from ${Number(r.price_from ?? 0)}/mo
                </Text>
              </Pressable>
              <Switch value={r.active} onValueChange={(v) => toggle(r.slug, v)} />
            </View>
            {open === r.slug && r.pricing ? (
              <View style={{ gap: 10 }}>
                {r.pricing.plans.map((pl) => (
                  <View key={pl.id} style={styles.row}>
                    <Text style={[styles.name, { width: 90 }]}>{pl.name.en}</Text>
                    <Labeled label="Monthly $">
                      <TextInput
                        value={drafts[r.slug]?.[pl.id]?.monthly ?? ''}
                        onChangeText={(v) => setDrafts((s) => ({ ...s, [r.slug]: { ...s[r.slug], [pl.id]: { ...s[r.slug][pl.id], monthly: v } } }))}
                        keyboardType="decimal-pad"
                        style={styles.input}
                      />
                    </Labeled>
                    <Labeled label="Setup $">
                      <TextInput
                        value={drafts[r.slug]?.[pl.id]?.setup ?? ''}
                        onChangeText={(v) => setDrafts((s) => ({ ...s, [r.slug]: { ...s[r.slug], [pl.id]: { ...s[r.slug][pl.id], setup: v } } }))}
                        keyboardType="decimal-pad"
                        style={styles.input}
                      />
                    </Labeled>
                  </View>
                ))}
                <Text style={adminStyles.muted}>Add-ons offered: {r.pricing.addons.join(', ')}</Text>
                <Button label="Save plans" onPress={() => savePlans(r)} loading={busy === r.slug} />
              </View>
            ) : null}
          </View>
        ))}
      </View>

      <View style={[adminStyles.card, shadow]}>
        <Text style={adminStyles.h2}>Extra features (add-ons)</Text>
        <Text style={adminStyles.muted}>Prices apply to every product that offers the add-on. Per-unit add-ons are multiplied by the quantity the customer picks.</Text>
        {addons.map((a) => (
          <View key={a.id} style={styles.row}>
            <View style={{ flex: 1, minWidth: 180 }}>
              <Text style={styles.name}>{a.name_en}</Text>
              <Text style={adminStyles.muted}>
                {a.kind === 'monthly' ? 'Monthly' : 'One-time'}
                {a.per_unit ? ' · per unit' : ''}
              </Text>
            </View>
            <TextInput
              value={addonPrices[a.id] ?? ''}
              onChangeText={(v) => setAddonPrices((s) => ({ ...s, [a.id]: v }))}
              keyboardType="decimal-pad"
              style={styles.input}
            />
            <Button
              label="Save"
              variant="secondary"
              loading={busy === a.id}
              onPress={() => {
                const n = num(addonPrices[a.id] ?? '');
                if (n == null) return setMsg({ ok: false, text: 'Invalid price.' });
                saveAddon(a, { price: n });
              }}
            />
            <Switch value={a.active} onValueChange={(v) => saveAddon(a, { active: v })} />
          </View>
        ))}
      </View>

      <View style={[adminStyles.card, shadow]}>
        <Text style={adminStyles.h2}>Payment methods</Text>
        <Text style={adminStyles.muted}>
          Enter your real details here (Pago Móvil, USDT address and network, Binance Pay ID, Orange Money). Customers see them after accepting a quote.
        </Text>
        {methods.map((m, i) => (
          <View key={m.id} style={styles.method}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={[styles.name, { flex: 1 }]}>
                {m.name}
                {m.kind === 'card' ? ' (needs a card payment account)' : ''}
              </Text>
              <Switch
                value={m.active}
                disabled={m.kind === 'card'}
                onValueChange={(v) => setMethods((s) => s.map((x, j) => (j === i ? { ...x, active: v } : x)))}
              />
            </View>
            <TextInput
              value={m.details_es}
              multiline
              onChangeText={(v) => setMethods((s) => s.map((x, j) => (j === i ? { ...x, details_es: v } : x)))}
              style={[styles.input, styles.area]}
              placeholder="Details in Spanish (for Spanish-speaking customers)"
            />
            <TextInput
              value={m.details_en}
              multiline
              onChangeText={(v) => setMethods((s) => s.map((x, j) => (j === i ? { ...x, details_en: v } : x)))}
              style={[styles.input, styles.area]}
              placeholder="Details in English"
            />
            <Button label="Save" variant="secondary" onPress={() => saveMethod(m)} loading={busy === m.id} disabled={m.kind === 'card'} />
          </View>
        ))}
      </View>
    </View>
  );
}

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={adminStyles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  product: { gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, paddingVertical: 4 },
  name: { fontSize: 15, fontWeight: '800', color: colors.text },
  input: { borderWidth: 1, borderColor: '#D5DCEA', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: colors.text, width: 110, outlineStyle: 'none' } as any,
  area: { minHeight: 70, textAlignVertical: 'top', width: '100%' },
  method: { gap: 8, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border },
});
