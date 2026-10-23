import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native';
import { AdminGate, adminStyles } from '../../src/components/AdminGate';
import { Button } from '../../src/components/Button';
import { EstimateBreakdown, ServerEstimate } from '../../src/components/EstimateBreakdown';
import { money } from '../../src/lib/pricing';
import { Field, formStyles } from '../../src/components/Field';
import { formatDate, formatMoney, OrderStatus, statusColor, statusLabel } from '../../src/lib/status';
import { supabase } from '../../src/lib/supabase';
import { colors, shadow } from '../../src/theme';

export default function AdminOrder() {
  return <AdminGate title="Order">{() => <OrderDetail />}</AdminGate>;
}

function OrderDetail() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [o, setO] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [update, setUpdate] = useState('');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    if (!id) return setLoading(false);
    const [{ data: order }, { data: ev }] = await Promise.all([
      supabase.from('orders').select('*, products(name_en)').eq('id', id).single(),
      supabase.from('order_events').select('*').eq('order_id', id).order('created_at', { ascending: false }),
    ]);
    setO(order);
    setEvents(ev ?? []);
    if (order) {
      const est = order.estimate as ServerEstimate | null;
      setAmount(order.quote_amount != null ? String(order.quote_amount) : est ? String(Number(est.due_today)) : '');
      setValidUntil(order.quote_valid_until ?? (est ? new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10) : ''));
      setNotes(order.quote_notes ?? (est ? quoteText(est, order.lang) : ''));
      setAdminNotes(order.admin_notes ?? '');
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (key: string, fn: () => Promise<{ error: any }>, okText: string) => {
    setMsg(null);
    setBusy(key);
    const { error } = await fn();
    setBusy('');
    if (error) return setMsg({ ok: false, text: error.message ?? 'Error' });
    setMsg({ ok: true, text: okText });
    load();
  };

  const sendQuote = () => {
    const n = Number(amount.replace(',', '.'));
    if (!n || n <= 0) return setMsg({ ok: false, text: 'Enter a valid amount.' });
    if (validUntil && !/^\d{4}-\d{2}-\d{2}$/.test(validUntil)) return setMsg({ ok: false, text: 'Use the date format YYYY-MM-DD.' });
    run(
      'quote',
      async () =>
        supabase
          .from('orders')
          .update({ quote_amount: n, quote_notes: notes || null, quote_valid_until: validUntil || null, status: 'quoted' })
          .eq('id', id),
      'Quote sent. The customer will see it on their page and get an email.',
    );
  };

  const setStatus = (status: OrderStatus, okText: string) =>
    run(status, async () => supabase.from('orders').update({ status }).eq('id', id), okText);

  const saveNotes = () => run('notes', async () => supabase.from('orders').update({ admin_notes: adminNotes || null }).eq('id', id), 'Notes saved.');

  const postUpdate = () => {
    if (update.trim().length < 3) return;
    run(
      'update',
      async () => {
        const r = await supabase.from('order_events').insert({ order_id: id, kind: 'update', message: update.trim(), public: true });
        if (!r.error) setUpdate('');
        return r;
      },
      'Update posted to the customer page.',
    );
  };

  if (loading) return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />;
  if (!o) return <Text style={adminStyles.muted}>Order not found.</Text>;

  const sc = statusColor[o.status as OrderStatus];
  const trackUrl = `https://sylkit.com/track?t=${o.token}`;
  const wa = o.whatsapp ? o.whatsapp.replace(/[^\d]/g, '') : '';

  return (
    <View style={{ gap: 16 }}>
      <Link href="/admin" style={{ color: colors.primary, fontWeight: '700' }}>
        ← All orders
      </Link>

      <View style={[adminStyles.card, shadow]}>
        <View style={styles.headRow}>
          <View style={{ flex: 1, gap: 4, minWidth: 220 }}>
            <Text style={adminStyles.h1}>{o.order_number}</Text>
            <Text style={adminStyles.muted}>
              {o.products?.name_en ?? 'Custom system'} · {formatDate(o.created_at, 'en')} · customer language {o.lang.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.pill, { backgroundColor: sc.bg }]}>
            <Text style={[styles.pillText, { color: sc.fg }]}>{statusLabel[o.status as OrderStatus].en}</Text>
          </View>
        </View>
      </View>

      {msg ? <Text style={msg.ok ? formStyles.success : formStyles.error}>{msg.text}</Text> : null}

      <View style={styles.cols}>
        <View style={styles.col}>
          <View style={[adminStyles.card, shadow]}>
            <Text style={adminStyles.h2}>Customer</Text>
            <Info label="Name" value={o.customer_name} />
            <Info label="Company" value={o.business_name} />
            <Info label="Email" value={o.email} />
            <Info label="WhatsApp" value={o.whatsapp} />
            <Info label="Country" value={o.country} />
            <Info label="Details" value={o.details} />
            <Info label="Source" value={o.source} />
            <View style={styles.actions}>
              {wa ? <Button label="WhatsApp" icon="logo-whatsapp" variant="whatsapp" onPress={() => Linking.openURL(`https://wa.me/${wa}`)} /> : null}
              <Button label="Email" icon="mail" variant="secondary" onPress={() => Linking.openURL(`mailto:${o.email}?subject=${encodeURIComponent(`Sylkit ${o.order_number}`)}`)} />
              <Button label="Customer page" icon="open" variant="secondary" onPress={() => Linking.openURL(trackUrl)} />
            </View>
          </View>

          {o.payment_reference ? (
            <View style={[adminStyles.card, shadow]}>
              <Text style={adminStyles.h2}>Payment reported</Text>
              <Info label="Method" value={o.payment_method} />
              <Info label="Reference" value={o.payment_reference} />
              {o.status === 'payment_submitted' ? (
                <Button label="Confirm payment received" icon="checkmark-circle" onPress={() => setStatus('paid', 'Payment confirmed. Customer notified.')} loading={busy === 'paid'} />
              ) : null}
            </View>
          ) : null}

          <View style={[adminStyles.card, shadow]}>
            <Text style={adminStyles.h2}>Internal notes</Text>
            <Field label="Only visible to you" value={adminNotes} onChangeText={setAdminNotes} multiline />
            <Button label="Save notes" variant="secondary" onPress={saveNotes} loading={busy === 'notes'} />
          </View>
        </View>

        <View style={styles.col}>
          {o.estimate ? (
            <View style={[adminStyles.card, shadow]}>
              <Text style={adminStyles.h2}>Plan chosen by the customer</Text>
              <EstimateBreakdown est={o.estimate} lang="en" />
              <Text style={adminStyles.muted}>Calculated automatically by the database. The quote below is prefilled with it; adjust if needed.</Text>
            </View>
          ) : null}

          <View style={[adminStyles.card, shadow]}>
            <Text style={adminStyles.h2}>{o.quote_amount != null ? 'Quote' : 'Send quote'}</Text>
            {o.quote_amount != null ? <Text style={styles.amount}>{formatMoney(o.quote_amount, o.quote_currency)}</Text> : null}
            <Field label="Amount (USD)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="350" />
            <Field label="Valid until (YYYY-MM-DD, optional)" value={validUntil} onChangeText={setValidUntil} placeholder="2026-11-30" />
            <Field label="Details for the customer" value={notes} onChangeText={setNotes} multiline placeholder="Includes setup, training and 1 year of support…" />
            <Button
              label={o.quote_amount != null ? 'Update and resend quote' : 'Send quote'}
              icon="send"
              onPress={sendQuote}
              loading={busy === 'quote'}
            />
          </View>

          <View style={[adminStyles.card, shadow]}>
            <Text style={adminStyles.h2}>Change status</Text>
            <View style={styles.actions}>
              <Button label="Payment confirmed" variant="secondary" onPress={() => setStatus('paid', 'Marked as paid.')} loading={busy === 'paid'} />
              <Button label="In progress" variant="secondary" onPress={() => setStatus('in_progress', 'Marked in progress.')} loading={busy === 'in_progress'} />
              <Button label="Delivered" variant="secondary" onPress={() => setStatus('delivered', 'Marked as delivered.')} loading={busy === 'delivered'} />
              <Button label="Cancel order" variant="danger" onPress={() => setStatus('cancelled', 'Order cancelled.')} loading={busy === 'cancelled'} />
            </View>
          </View>

          <View style={[adminStyles.card, shadow]}>
            <Text style={adminStyles.h2}>Post an update</Text>
            <Field label="The customer sees it in their order history" value={update} onChangeText={setUpdate} multiline placeholder="The design is ready; we'll show it to you on Thursday." />
            <Button label="Post" variant="secondary" icon="megaphone" onPress={postUpdate} loading={busy === 'update'} />
          </View>

          <View style={[adminStyles.card, shadow]}>
            <Text style={adminStyles.h2}>History</Text>
            {events.map((e) => (
              <View key={e.id} style={{ flexDirection: 'row', gap: 10 }}>
                <Ionicons name="ellipse" size={10} color={colors.cyan} style={{ marginTop: 5 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: colors.text }}>
                    {statusLabel[e.kind as OrderStatus]?.en ?? (e.kind === 'update' ? 'Update' : e.kind)}
                  </Text>
                  {e.message ? <Text style={adminStyles.muted}>{e.message}</Text> : null}
                  <Text style={{ fontSize: 12, color: colors.muted }}>{new Date(e.created_at).toLocaleString('en-US')}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

// Plain-text quote details in the customer's language, built from the estimate.
function quoteText(e: ServerEstimate, lang: string) {
  const es = lang === 'es';
  const mo = es ? '/mes' : '/mo';
  if (e.billing === 'once') {
    return [
      `${es ? 'Plan' : 'Plan'} ${es ? e.plan_name.es : e.plan_name.en} (${es ? 'pago único, sin suscripción' : 'buy once, no subscription'})`,
      `${es ? 'Licencia de por vida' : 'Lifetime license'}: ${money(Number(e.license ?? 0))}`,
      `${es ? 'Instalación' : 'Setup'}: ${money(Number(e.plan_setup))}`,
      ...e.lines.map((l) => `+ ${es ? l.name_es : l.name_en}${l.qty > 1 ? ` ×${l.qty}` : ''}: ${money(Number(l.total) * (l.kind === 'monthly' ? 30 : 1))}`),
      `${es ? 'Total' : 'Total'}: ${money(Number(e.due_today))}`,
      es ? 'Incluye 12 meses de soporte, hosting y actualizaciones.' : 'Includes 12 months of support, hosting and updates.',
      `${es ? 'Desde el año 2, mantenimiento opcional' : 'From year 2, optional care plan'}: ${money(Number(e.care ?? 0))}${es ? '/año' : '/year'}`,
    ].join('\n');
  }
  const lines = [
    `${es ? 'Plan' : 'Plan'} ${es ? e.plan_name.es : e.plan_name.en} (${e.billing === 'yearly' ? (es ? 'anual, 2 meses gratis' : 'yearly, 2 months free') : es ? 'mensual' : 'monthly'}): ${money(Number(e.plan_monthly))}${mo}`,
    `${es ? 'Instalación' : 'Setup'}: ${money(Number(e.plan_setup))}`,
    ...e.lines.map((l) => `+ ${es ? l.name_es : l.name_en}${l.qty > 1 ? ` ×${l.qty}` : ''}: ${l.kind === 'monthly' ? `${money(Number(l.total))}${mo}` : money(Number(l.total))}`),
    `${es ? 'Pago único' : 'One-time'}: ${money(Number(e.one_time))}`,
    `${e.billing === 'yearly' ? (es ? 'Primer año' : 'First year') : es ? 'Primer mes' : 'First month'}: ${money(Number(e.recurring))}`,
    `${es ? 'Renovación' : 'Renewal'}: ${money(Number(e.recurring))}${e.billing === 'yearly' ? (es ? '/año' : '/year') : mo}`,
  ];
  return lines.join('\n');
}

function Info({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={{ gap: 2 }}>
      <Text style={adminStyles.label}>{label}</Text>
      <Text style={adminStyles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start' },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  pillText: { fontSize: 13, fontWeight: '800' },
  cols: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' },
  col: { flexGrow: 1, flexBasis: 360, gap: 16 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amount: { fontSize: 28, fontWeight: '800', color: colors.primary },
});
