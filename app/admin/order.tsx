import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native';
import { AdminGate, adminStyles } from '../../src/components/AdminGate';
import { Button } from '../../src/components/Button';
import { Field, formStyles } from '../../src/components/Field';
import { formatDate, formatMoney, OrderStatus, statusColor, statusLabel } from '../../src/lib/status';
import { supabase } from '../../src/lib/supabase';
import { colors, shadow } from '../../src/theme';

export default function AdminOrder() {
  return <AdminGate title="Pedido">{() => <OrderDetail />}</AdminGate>;
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
      supabase.from('orders').select('*, products(name_es)').eq('id', id).single(),
      supabase.from('order_events').select('*').eq('order_id', id).order('created_at', { ascending: false }),
    ]);
    setO(order);
    setEvents(ev ?? []);
    if (order) {
      setAmount(order.quote_amount != null ? String(order.quote_amount) : '');
      setValidUntil(order.quote_valid_until ?? '');
      setNotes(order.quote_notes ?? '');
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
    if (!n || n <= 0) return setMsg({ ok: false, text: 'Escribe un monto válido.' });
    if (validUntil && !/^\d{4}-\d{2}-\d{2}$/.test(validUntil)) return setMsg({ ok: false, text: 'Fecha en formato AAAA-MM-DD.' });
    run(
      'quote',
      async () =>
        supabase
          .from('orders')
          .update({ quote_amount: n, quote_notes: notes || null, quote_valid_until: validUntil || null, status: 'quoted' })
          .eq('id', id),
      'Cotización enviada. El cliente la verá en su página y recibirá un correo.',
    );
  };

  const setStatus = (status: OrderStatus, okText: string) =>
    run(status, async () => supabase.from('orders').update({ status }).eq('id', id), okText);

  const saveNotes = () => run('notes', async () => supabase.from('orders').update({ admin_notes: adminNotes || null }).eq('id', id), 'Notas guardadas.');

  const postUpdate = () => {
    if (update.trim().length < 3) return;
    run(
      'update',
      async () => {
        const r = await supabase.from('order_events').insert({ order_id: id, kind: 'update', message: update.trim(), public: true });
        if (!r.error) setUpdate('');
        return r;
      },
      'Actualización publicada en la página del cliente.',
    );
  };

  if (loading) return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />;
  if (!o) return <Text style={adminStyles.muted}>Pedido no encontrado.</Text>;

  const sc = statusColor[o.status as OrderStatus];
  const trackUrl = `https://sylkit.com/track?t=${o.token}`;
  const wa = o.whatsapp ? o.whatsapp.replace(/[^\d]/g, '') : '';

  return (
    <View style={{ gap: 16 }}>
      <Link href="/admin" style={{ color: colors.primary, fontWeight: '700' }}>
        ← Todos los pedidos
      </Link>

      <View style={[adminStyles.card, shadow]}>
        <View style={styles.headRow}>
          <View style={{ flex: 1, gap: 4, minWidth: 220 }}>
            <Text style={adminStyles.h1}>{o.order_number}</Text>
            <Text style={adminStyles.muted}>
              {o.products?.name_es ?? 'Sistema a medida'} · {formatDate(o.created_at, 'es')} · idioma {o.lang.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.pill, { backgroundColor: sc.bg }]}>
            <Text style={[styles.pillText, { color: sc.fg }]}>{statusLabel[o.status as OrderStatus].es}</Text>
          </View>
        </View>
      </View>

      {msg ? <Text style={msg.ok ? formStyles.success : formStyles.error}>{msg.text}</Text> : null}

      <View style={styles.cols}>
        <View style={styles.col}>
          <View style={[adminStyles.card, shadow]}>
            <Text style={adminStyles.h2}>Cliente</Text>
            <Info label="Nombre" value={o.customer_name} />
            <Info label="Empresa" value={o.business_name} />
            <Info label="Correo" value={o.email} />
            <Info label="WhatsApp" value={o.whatsapp} />
            <Info label="País" value={o.country} />
            <Info label="Detalles" value={o.details} />
            <Info label="Origen" value={o.source} />
            <View style={styles.actions}>
              {wa ? <Button label="WhatsApp" icon="logo-whatsapp" variant="whatsapp" onPress={() => Linking.openURL(`https://wa.me/${wa}`)} /> : null}
              <Button label="Correo" icon="mail" variant="secondary" onPress={() => Linking.openURL(`mailto:${o.email}?subject=${encodeURIComponent(`Sylkit ${o.order_number}`)}`)} />
              <Button label="Página del cliente" icon="open" variant="secondary" onPress={() => Linking.openURL(trackUrl)} />
            </View>
          </View>

          {o.payment_reference ? (
            <View style={[adminStyles.card, shadow]}>
              <Text style={adminStyles.h2}>Pago reportado</Text>
              <Info label="Método" value={o.payment_method} />
              <Info label="Referencia" value={o.payment_reference} />
              {o.status === 'payment_submitted' ? (
                <Button label="Confirmar pago recibido" icon="checkmark-circle" onPress={() => setStatus('paid', 'Pago confirmado. Se notificó al cliente.')} loading={busy === 'paid'} />
              ) : null}
            </View>
          ) : null}

          <View style={[adminStyles.card, shadow]}>
            <Text style={adminStyles.h2}>Notas internas</Text>
            <Field label="Solo visibles para ti" value={adminNotes} onChangeText={setAdminNotes} multiline />
            <Button label="Guardar notas" variant="secondary" onPress={saveNotes} loading={busy === 'notes'} />
          </View>
        </View>

        <View style={styles.col}>
          <View style={[adminStyles.card, shadow]}>
            <Text style={adminStyles.h2}>{o.quote_amount != null ? 'Cotización' : 'Enviar cotización'}</Text>
            {o.quote_amount != null ? <Text style={styles.amount}>{formatMoney(o.quote_amount, o.quote_currency)}</Text> : null}
            <Field label="Monto (USD)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="350" />
            <Field label="Válida hasta (AAAA-MM-DD, opcional)" value={validUntil} onChangeText={setValidUntil} placeholder="2026-11-30" />
            <Field label="Detalles para el cliente" value={notes} onChangeText={setNotes} multiline placeholder="Incluye instalación, capacitación y soporte por 1 año…" />
            <Button
              label={o.quote_amount != null ? 'Actualizar y reenviar cotización' : 'Enviar cotización'}
              icon="send"
              onPress={sendQuote}
              loading={busy === 'quote'}
            />
          </View>

          <View style={[adminStyles.card, shadow]}>
            <Text style={adminStyles.h2}>Cambiar estado</Text>
            <View style={styles.actions}>
              <Button label="Pago confirmado" variant="secondary" onPress={() => setStatus('paid', 'Marcado como pagado.')} loading={busy === 'paid'} />
              <Button label="En desarrollo" variant="secondary" onPress={() => setStatus('in_progress', 'Marcado en desarrollo.')} loading={busy === 'in_progress'} />
              <Button label="Entregado" variant="secondary" onPress={() => setStatus('delivered', 'Marcado como entregado.')} loading={busy === 'delivered'} />
              <Button label="Cancelar" variant="danger" onPress={() => setStatus('cancelled', 'Pedido cancelado.')} loading={busy === 'cancelled'} />
            </View>
          </View>

          <View style={[adminStyles.card, shadow]}>
            <Text style={adminStyles.h2}>Publicar actualización</Text>
            <Field label="El cliente la verá en su historial" value={update} onChangeText={setUpdate} multiline placeholder="Ya tenemos el diseño listo, te lo mostramos el jueves." />
            <Button label="Publicar" variant="secondary" icon="megaphone" onPress={postUpdate} loading={busy === 'update'} />
          </View>

          <View style={[adminStyles.card, shadow]}>
            <Text style={adminStyles.h2}>Historial</Text>
            {events.map((e) => (
              <View key={e.id} style={{ flexDirection: 'row', gap: 10 }}>
                <Ionicons name="ellipse" size={10} color={colors.cyan} style={{ marginTop: 5 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: colors.text }}>
                    {statusLabel[e.kind as OrderStatus]?.es ?? (e.kind === 'update' ? 'Actualización' : e.kind)}
                  </Text>
                  {e.message ? <Text style={adminStyles.muted}>{e.message}</Text> : null}
                  <Text style={{ fontSize: 12, color: colors.muted }}>{new Date(e.created_at).toLocaleString('es-VE')}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
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
