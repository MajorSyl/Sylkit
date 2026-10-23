import { Link } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AdminGate, adminStyles } from '../../src/components/AdminGate';
import { formatDate, formatMoney, OrderStatus, statusColor, statusLabel } from '../../src/lib/status';
import { supabase } from '../../src/lib/supabase';
import { colors, shadow } from '../../src/theme';

type Row = {
  id: string;
  order_number: string;
  customer_name: string;
  business_name: string | null;
  email: string;
  status: OrderStatus;
  quote_amount: number | null;
  quote_currency: string;
  estimated_total: number | null;
  created_at: string;
  products: { name_en: string } | null;
};

const filters: (OrderStatus | 'all' | 'action')[] = ['action', 'all', 'new', 'quoted', 'accepted', 'payment_submitted', 'paid', 'in_progress', 'delivered', 'cancelled'];
const needsAction: OrderStatus[] = ['new', 'accepted', 'payment_submitted'];

export default function AdminOrders() {
  return <AdminGate title="Orders">{() => <Orders />}</AdminGate>;
}

function Orders() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [filter, setFilter] = useState<(typeof filters)[number]>('action');
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('orders')
      .select('id,order_number,customer_name,business_name,email,status,quote_amount,quote_currency,estimated_total,created_at,products(name_en)')
      .order('created_at', { ascending: false })
      .limit(500);
    setRows((data as any) ?? []);
  }, []);

  useEffect(() => {
    load();
    const ch = supabase
      .channel('orders-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [load]);

  const stats = useMemo(() => {
    const r = rows ?? [];
    const paidStatuses: OrderStatus[] = ['paid', 'in_progress', 'delivered'];
    const revenue = r.filter((x) => paidStatuses.includes(x.status)).reduce((s, x) => s + Number(x.quote_amount ?? 0), 0);
    const pipeline = r.filter((x) => ['quoted', 'accepted', 'payment_submitted'].includes(x.status)).reduce((s, x) => s + Number(x.quote_amount ?? 0), 0);
    return {
      action: r.filter((x) => needsAction.includes(x.status)).length,
      total: r.length,
      revenue,
      pipeline,
    };
  }, [rows]);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (rows ?? []).filter((r) => {
      if (filter === 'action' && !needsAction.includes(r.status)) return false;
      if (filter !== 'all' && filter !== 'action' && r.status !== filter) return false;
      if (!term) return true;
      return [r.order_number, r.customer_name, r.business_name, r.email].join(' ').toLowerCase().includes(term);
    });
  }, [rows, filter, q]);

  if (!rows) return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />;

  return (
    <View style={{ gap: 18 }}>
      <Text style={adminStyles.h1}>Orders</Text>

      <View style={styles.tiles}>
        <Tile label="Needs action" value={String(stats.action)} accent />
        <Tile label="Total orders" value={String(stats.total)} />
        <Tile label="In negotiation" value={formatMoney(stats.pipeline)} />
        <Tile label="Collected" value={formatMoney(stats.revenue)} />
      </View>

      <TextInput value={q} onChangeText={setQ} placeholder="Search by order, customer or email…" placeholderTextColor="#94A3B8" style={styles.search} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {filters.map((f) => {
          const on = filter === f;
          const label = f === 'all' ? 'All' : f === 'action' ? 'Needs action' : statusLabel[f].en;
          return (
            <Pressable key={f} onPress={() => setFilter(f)} style={[styles.chip, on && styles.chipOn]}>
              <Text style={[styles.chipText, on && { color: '#fff' }]}>{label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {shown.length === 0 ? (
        <View style={[adminStyles.card, shadow, { alignItems: 'center' }]}>
          <Text style={adminStyles.muted}>No orders here.</Text>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {shown.map((r) => {
            const sc = statusColor[r.status];
            return (
              <Link key={r.id} href={`/admin/order?id=${r.id}`} asChild>
                <Pressable style={[adminStyles.card, shadow, styles.row]}>
                  <View style={{ flex: 1, minWidth: 200, gap: 2 }}>
                    <Text style={styles.orderNo}>
                      {r.order_number} · {r.customer_name}
                    </Text>
                    <Text style={adminStyles.muted}>
                      {r.products?.name_en ?? 'Custom'}
                      {r.business_name ? ` · ${r.business_name}` : ''} · {formatDate(r.created_at, 'en')}
                    </Text>
                  </View>
                  {r.quote_amount != null ? (
                    <Text style={styles.amount}>{formatMoney(r.quote_amount, r.quote_currency)}</Text>
                  ) : r.estimated_total != null ? (
                    <Text style={[styles.amount, { color: colors.muted }]}>≈ {formatMoney(r.estimated_total)}</Text>
                  ) : null}
                  <View style={[styles.pill, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.pillText, { color: sc.fg }]}>{statusLabel[r.status].en}</Text>
                  </View>
                </Pressable>
              </Link>
            );
          })}
        </View>
      )}
    </View>
  );
}

function Tile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={[styles.tile, shadow, accent && { backgroundColor: colors.primary }]}>
      <Text style={[styles.tileLabel, accent && { color: 'rgba(255,255,255,0.85)' }]}>{label}</Text>
      <Text style={[styles.tileValue, accent && { color: '#fff' }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { flexGrow: 1, flexBasis: 180, backgroundColor: colors.surface, borderRadius: 16, padding: 16, gap: 6, borderWidth: 1, borderColor: colors.border },
  tileLabel: { fontSize: 13, fontWeight: '700', color: colors.muted },
  tileValue: { fontSize: 24, fontWeight: '800', color: colors.text },
  search: { borderWidth: 1, borderColor: '#D5DCEA', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: colors.text, outlineStyle: 'none' } as any,
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.text },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 },
  orderNo: { fontSize: 16, fontWeight: '800', color: colors.text },
  amount: { fontSize: 15, fontWeight: '800', color: colors.text },
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  pillText: { fontSize: 12, fontWeight: '800' },
});
