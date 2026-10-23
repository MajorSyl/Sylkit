import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { AdminGate, adminStyles } from '../../src/components/AdminGate';
import { Button } from '../../src/components/Button';
import { formStyles } from '../../src/components/Field';
import { supabase } from '../../src/lib/supabase';
import { colors, shadow } from '../../src/theme';

export default function AdminProducts() {
  return <AdminGate title="Productos">{() => <Products />}</AdminGate>;
}

type P = { slug: string; name_es: string; price_from: number | null; active: boolean; sort: number };
type M = { id: string; name: string; details_es: string; details_en: string; active: boolean; kind: string };

function Products() {
  const [rows, setRows] = useState<P[] | null>(null);
  const [methods, setMethods] = useState<M[]>([]);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    const [{ data: p }, { data: m }] = await Promise.all([
      supabase.from('products').select('slug,name_es,price_from,active,sort').order('sort'),
      supabase.from('payment_methods').select('*').order('sort'),
    ]);
    setRows((p as P[]) ?? []);
    setMethods((m as M[]) ?? []);
    setPrices(Object.fromEntries(((p as P[]) ?? []).map((r) => [r.slug, r.price_from != null ? String(r.price_from) : ''])));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (slug: string) => {
    setMsg(null);
    const raw = (prices[slug] ?? '').trim();
    const price = raw === '' ? null : Number(raw.replace(',', '.'));
    if (price != null && (isNaN(price) || price < 0)) return setMsg({ ok: false, text: 'Precio inválido.' });
    setBusy(slug);
    const { error } = await supabase.from('products').update({ price_from: price }).eq('slug', slug);
    setBusy('');
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: 'Precio guardado. Ya se ve en el sitio.' });
    load();
  };

  const toggle = async (slug: string, active: boolean) => {
    await supabase.from('products').update({ active }).eq('slug', slug);
    load();
  };

  const saveMethod = async (m: M) => {
    setBusy(m.id);
    const { error } = await supabase.from('payment_methods').update({ details_es: m.details_es, details_en: m.details_en, active: m.active }).eq('id', m.id);
    setBusy('');
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: `${m.name} guardado.` });
  };

  if (!rows) return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />;

  return (
    <View style={{ gap: 18 }}>
      <Text style={adminStyles.h1}>Productos y pagos</Text>
      {msg ? <Text style={msg.ok ? formStyles.success : formStyles.error}>{msg.text}</Text> : null}

      <View style={[adminStyles.card, shadow]}>
        <Text style={adminStyles.h2}>Precios</Text>
        <Text style={adminStyles.muted}>Precio "desde", en USD por año. Déjalo vacío para mostrar "Precio a consultar".</Text>
        {rows.map((r) => (
          <View key={r.slug} style={styles.row}>
            <View style={{ flex: 1, minWidth: 180 }}>
              <Text style={styles.name}>{r.name_es}</Text>
              <Text style={adminStyles.muted}>{r.active ? 'Visible' : 'Oculto'}</Text>
            </View>
            <TextInput
              value={prices[r.slug] ?? ''}
              onChangeText={(v) => setPrices((s) => ({ ...s, [r.slug]: v }))}
              placeholder="A consultar"
              placeholderTextColor="#94A3B8"
              keyboardType="decimal-pad"
              style={styles.input}
            />
            <Button label="Guardar" variant="secondary" onPress={() => save(r.slug)} loading={busy === r.slug} />
            <Switch value={r.active} onValueChange={(v) => toggle(r.slug, v)} />
          </View>
        ))}
      </View>

      <View style={[adminStyles.card, shadow]}>
        <Text style={adminStyles.h2}>Métodos de pago</Text>
        <Text style={adminStyles.muted}>
          Escribe aquí tus datos reales (número de Zelle, Pago Móvil, cuenta bancaria). El cliente los ve después de aceptar la cotización.
        </Text>
        {methods.map((m, i) => (
          <View key={m.id} style={styles.method}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={[styles.name, { flex: 1 }]}>
                {m.name}
                {m.kind === 'card' ? ' (requiere cuenta de pagos con tarjeta)' : ''}
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
              placeholder="Datos en español"
            />
            <TextInput
              value={m.details_en}
              multiline
              onChangeText={(v) => setMethods((s) => s.map((x, j) => (j === i ? { ...x, details_en: v } : x)))}
              style={[styles.input, styles.area]}
              placeholder="Details in English"
            />
            <Button label="Guardar" variant="secondary" onPress={() => saveMethod(m)} loading={busy === m.id} disabled={m.kind === 'card'} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border },
  name: { fontSize: 15, fontWeight: '800', color: colors.text },
  input: { borderWidth: 1, borderColor: '#D5DCEA', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: colors.text, minWidth: 120, outlineStyle: 'none' } as any,
  area: { minHeight: 70, textAlignVertical: 'top', width: '100%' },
  method: { gap: 8, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border },
});
