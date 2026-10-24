import { Link } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { AdminGate, adminStyles } from '../../src/components/AdminGate';
import { Button } from '../../src/components/Button';
import { formStyles } from '../../src/components/Field';
import { categoryOf, feeFor, ListingStatus, usd } from '../../src/lib/listings';
import { supabase } from '../../src/lib/supabase';
import { colors, shadow } from '../../src/theme';

export default function AdminListings() {
  return <AdminGate title="Marketplace">{() => <Listings />}</AdminGate>;
}

type Row = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  category: any;
  status: ListingStatus;
  asking_price: number;
  annual_revenue: number;
  monthly_profit: number;
  image_url: string | null;
  demo_url: string | null;
  website_url: string | null;
  featured: boolean;
  sold_price: number | null;
  seller_name: string;
  seller_email: string;
  seller_whatsapp: string | null;
  admin_notes: string | null;
  created_at: string;
};
type Inquiry = {
  id: string;
  listing_id: string;
  kind: 'info' | 'offer';
  name: string;
  email: string;
  whatsapp: string | null;
  offer_amount: number | null;
  message: string | null;
  status: string;
  created_at: string;
};

const STATUSES: ListingStatus[] = ['pending', 'active', 'under_offer', 'sold', 'rejected'];
const statusName: Record<ListingStatus, string> = { pending: 'Pending review', active: 'Live', under_offer: 'Under offer', sold: 'Sold', rejected: 'Rejected' };
const statusTint: Record<ListingStatus, string> = { pending: '#F59E0B', active: '#16A34A', under_offer: '#2563EB', sold: '#0E7F98', rejected: '#94A3B8' };

function Listings() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [inq, setInq] = useState<Inquiry[]>([]);
  const [filter, setFilter] = useState<ListingStatus | 'all'>('all');
  const [open, setOpen] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    const [{ data: l, error }, { data: i }] = await Promise.all([
      supabase.rpc('admin_listings'),
      supabase.from('listing_inquiries').select('*').order('created_at', { ascending: false }).limit(500),
    ]);
    if (error) setMsg({ ok: false, text: error.message });
    setRows((l as Row[]) ?? []);
    setInq((i as Inquiry[]) ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!rows) return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />;
  const shown = rows.filter((r) => filter === 'all' || r.status === filter);
  const newInq = inq.filter((x) => x.status === 'new').length;

  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
        <Text style={adminStyles.h1}>Marketplace</Text>
        <Link href="/startups" style={{ color: colors.primary, fontWeight: '700' }}>
          View public page →
        </Link>
      </View>
      <View style={styles.tiles}>
        <Tile label="Pending review" value={rows.filter((r) => r.status === 'pending').length} accent />
        <Tile label="Live" value={rows.filter((r) => r.status === 'active' || r.status === 'under_offer').length} />
        <Tile label="New inquiries" value={newInq} />
        <Tile label="Sold" value={rows.filter((r) => r.status === 'sold').length} />
      </View>
      {msg ? <Text style={msg.ok ? formStyles.success : formStyles.error}>{msg.text}</Text> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {(['all', ...STATUSES] as const).map((s) => (
          <Pressable key={s} onPress={() => setFilter(s)} style={[styles.chip, filter === s && styles.chipOn]}>
            <Text style={[styles.chipText, filter === s && { color: '#fff' }]}>{s === 'all' ? 'All' : statusName[s]}</Text>
          </Pressable>
        ))}
      </View>
      {shown.length === 0 ? (
        <View style={[adminStyles.card, shadow, { alignItems: 'center' }]}>
          <Text style={adminStyles.muted}>No listings here yet. Sellers submit them at sylkit.com/sell.</Text>
        </View>
      ) : (
        shown.map((r) => (
          <ListingRow
            key={r.id}
            row={r}
            inquiries={inq.filter((x) => x.listing_id === r.id)}
            open={open === r.id}
            onToggle={() => setOpen(open === r.id ? '' : r.id)}
            onSaved={(text, ok = true) => {
              setMsg({ ok, text });
              load();
            }}
          />
        ))
      )}
    </View>
  );
}

function ListingRow({
  row,
  inquiries,
  open,
  onToggle,
  onSaved,
}: {
  row: Row;
  inquiries: Inquiry[];
  open: boolean;
  onToggle: () => void;
  onSaved: (text: string, ok?: boolean) => void;
}) {
  const [d, setD] = useState({
    status: row.status,
    asking_price: String(row.asking_price),
    sold_price: row.sold_price != null ? String(row.sold_price) : '',
    image_url: row.image_url ?? '',
    demo_url: row.demo_url ?? '',
    featured: row.featured,
    admin_notes: row.admin_notes ?? '',
  });
  const [busy, setBusy] = useState(false);
  const cat = categoryOf(row.category);
  const fee = feeFor(Number(d.sold_price || d.asking_price) || 0);

  const save = async (patch?: Partial<typeof d>) => {
    const v = { ...d, ...patch };
    const price = Number(v.asking_price);
    if (!price || price < 0) return onSaved('Invalid asking price.', false);
    setBusy(true);
    const { error } = await supabase
      .from('listings')
      .update({
        status: v.status,
        asking_price: price,
        sold_price: v.sold_price ? Number(v.sold_price) : null,
        sold_at: v.status === 'sold' ? new Date().toISOString() : null,
        image_url: v.image_url || null,
        demo_url: v.demo_url || null,
        featured: v.featured,
        admin_notes: v.admin_notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id);
    setBusy(false);
    onSaved(error ? error.message : `${row.title} saved.`, !error);
  };

  const markInquiry = async (id: string, status: string) => {
    await supabase.from('listing_inquiries').update({ status }).eq('id', id);
    onSaved('Inquiry updated.');
  };

  return (
    <View style={[adminStyles.card, shadow]}>
      <Pressable onPress={onToggle} style={styles.head}>
        <View style={{ flex: 1, minWidth: 220, gap: 2 }}>
          <Text style={styles.title}>
            {open ? '▾' : '▸'} {row.title}
          </Text>
          <Text style={adminStyles.muted}>
            {cat.name.en} · asking {usd(row.asking_price)} · revenue {usd(row.annual_revenue)}/yr · {row.seller_name}
          </Text>
        </View>
        {inquiries.length ? <Text style={styles.count}>{inquiries.length} inquiries</Text> : null}
        <Text style={[styles.status, { backgroundColor: statusTint[row.status] }]}>{statusName[row.status]}</Text>
      </Pressable>

      {open ? (
        <View style={{ gap: 12 }}>
          <Text style={adminStyles.value}>{row.tagline}</Text>
          <View style={styles.contact}>
            <Text style={adminStyles.label}>Seller (private)</Text>
            <Text style={adminStyles.value}>
              {row.seller_name} · {row.seller_email}
              {row.seller_whatsapp ? ` · ${row.seller_whatsapp}` : ''}
            </Text>
            {row.website_url ? (
              <Text style={styles.link} onPress={() => Linking.openURL(row.website_url!)}>
                {row.website_url}
              </Text>
            ) : null}
          </View>

          <Text style={adminStyles.label}>Status</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {STATUSES.map((s) => (
              <Pressable key={s} onPress={() => setD((x) => ({ ...x, status: s }))} style={[styles.chip, d.status === s && { backgroundColor: statusTint[s], borderColor: statusTint[s] }]}>
                <Text style={[styles.chipText, d.status === s && { color: '#fff' }]}>{statusName[s]}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.grid}>
            <Input label="Asking price (USD)" value={d.asking_price} onChange={(v) => setD((x) => ({ ...x, asking_price: v }))} />
            <Input label="Sold price (USD)" value={d.sold_price} onChange={(v) => setD((x) => ({ ...x, sold_price: v }))} />
          </View>
          <Input label="Image URL (screenshot)" value={d.image_url} onChange={(v) => setD((x) => ({ ...x, image_url: v }))} wide />
          <Input label="Demo URL (public)" value={d.demo_url} onChange={(v) => setD((x) => ({ ...x, demo_url: v }))} wide />
          <Input label="Internal notes" value={d.admin_notes} onChange={(v) => setD((x) => ({ ...x, admin_notes: v }))} wide multiline />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Switch value={d.featured} onValueChange={(v) => setD((x) => ({ ...x, featured: v }))} />
            <Text style={adminStyles.value}>Featured (shown first)</Text>
          </View>
          <Text style={adminStyles.muted}>
            Your success fee at this price: {fee.rate}% = {usd(fee.amount)}.
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Button label="Save" onPress={() => save()} loading={busy} />
            {row.status === 'pending' ? <Button label="Approve and publish" variant="secondary" onPress={() => save({ status: 'active' })} /> : null}
            <Button label="Open public page" variant="secondary" onPress={() => Linking.openURL(`/startup?s=${row.slug}`)} />
          </View>

          <Text style={[adminStyles.h2, { marginTop: 8 }]}>Buyer inquiries</Text>
          {inquiries.length === 0 ? <Text style={adminStyles.muted}>No inquiries yet.</Text> : null}
          {inquiries.map((q) => (
            <View key={q.id} style={styles.inq}>
              <Text style={styles.title}>
                {q.kind === 'offer' ? `Offer ${usd(q.offer_amount)}` : 'Details request'} · {q.name}
              </Text>
              <Text style={adminStyles.muted}>
                {q.email}
                {q.whatsapp ? ` · ${q.whatsapp}` : ''} · {new Date(q.created_at).toLocaleString('en-US')} · {q.status}
              </Text>
              {q.message ? <Text style={adminStyles.value}>{q.message}</Text> : null}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {q.whatsapp ? <Button label="WhatsApp" icon="logo-whatsapp" variant="whatsapp" onPress={() => Linking.openURL(`https://wa.me/${q.whatsapp!.replace(/[^\d]/g, '')}`)} /> : null}
                <Button label="Email" icon="mail" variant="secondary" onPress={() => Linking.openURL(`mailto:${q.email}?subject=${encodeURIComponent(`Sylkit · ${row.title}`)}`)} />
                {q.status !== 'contacted' ? <Button label="Mark contacted" variant="secondary" onPress={() => markInquiry(q.id, 'contacted')} /> : null}
                {q.status !== 'closed' ? <Button label="Close" variant="secondary" onPress={() => markInquiry(q.id, 'closed')} /> : null}
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function Input({ label, value, onChange, wide, multiline }: { label: string; value: string; onChange: (v: string) => void; wide?: boolean; multiline?: boolean }) {
  return (
    <View style={{ gap: 4, flexGrow: 1, flexBasis: wide ? '100%' : 180 }}>
      <Text style={adminStyles.label}>{label}</Text>
      <TextInput value={value} onChangeText={onChange} multiline={multiline} autoCapitalize="none" style={[styles.input, multiline && { minHeight: 70, textAlignVertical: 'top' }]} />
    </View>
  );
}

function Tile({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <View style={[styles.tile, shadow, accent && { backgroundColor: colors.primary }]}>
      <Text style={[styles.tileLabel, accent && { color: 'rgba(255,255,255,0.85)' }]}>{label}</Text>
      <Text style={[styles.tileValue, accent && { color: '#fff' }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { flexGrow: 1, flexBasis: 160, backgroundColor: colors.surface, borderRadius: 16, padding: 16, gap: 6, borderWidth: 1, borderColor: colors.border },
  tileLabel: { fontSize: 13, fontWeight: '700', color: colors.muted },
  tileValue: { fontSize: 24, fontWeight: '800', color: colors.text },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.text },
  head: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  title: { fontSize: 15, fontWeight: '800', color: colors.text },
  count: { fontSize: 12, fontWeight: '800', color: colors.primary, backgroundColor: colors.softBlue, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, overflow: 'hidden' },
  status: { fontSize: 12, fontWeight: '800', color: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, overflow: 'hidden' },
  contact: { backgroundColor: colors.bg, borderRadius: 12, padding: 12, gap: 4 },
  link: { color: colors.primary, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  input: { borderWidth: 1, borderColor: '#D5DCEA', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: colors.text, outlineStyle: 'none' } as any,
  inq: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, gap: 6 },
});
