// Customers: every account on Sylkit, with suspend/restore and admin access.
// Suspending signs the person out everywhere and blocks new sign-ins until restored.
import { Ionicons } from '@expo/vector-icons';
import type { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AdminGate, adminStyles } from '../../src/components/AdminGate';
import { formatDate, formatMoney } from '../../src/lib/status';
import { supabase } from '../../src/lib/supabase';
import { colors, shadow } from '../../src/theme';

type Customer = {
  id: string;
  email: string;
  name: string;
  provider: string;
  created_at: string;
  last_sign_in_at: string | null;
  suspended: boolean;
  is_admin: boolean;
  orders: number;
  paid: number;
};

type Filter = 'all' | 'active' | 'suspended' | 'admins';

const ERRORS: Record<string, string> = {
  cannot_suspend_self: 'You cannot suspend your own account.',
  remove_admin_first: 'This person is an admin. Remove their admin access first, then suspend.',
  cannot_remove_self: 'You cannot remove your own admin access.',
  restore_first: 'Restore this account before making it an admin.',
  not_admin: 'Your account no longer has admin access.',
};

export default function BackendCustomers() {
  return <AdminGate title="Customers">{(session) => <Customers session={session} />}</AdminGate>;
}

function Customers({ session }: { session: Session }) {
  const [rows, setRows] = useState<Customer[] | null>(null);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [confirm, setConfirm] = useState<{ id: string; action: 'suspend' | 'restore' | 'admin' | 'unadmin' } | null>(null);
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc('admin_list_customers', { p_search: '' });
    if (error) setMsg({ text: ERRORS[error.message] || 'Could not load customers. Tap Refresh.', ok: false });
    setRows((data as Customer[]) ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (c: Customer, action: 'suspend' | 'restore' | 'admin' | 'unadmin') => {
    setBusy(c.id);
    setMsg(null);
    const { error } =
      action === 'suspend' || action === 'restore'
        ? await supabase.rpc('admin_set_suspended', { p_user: c.id, p_suspend: action === 'suspend' })
        : await supabase.rpc('admin_set_admin', { p_user: c.id, p_admin: action === 'admin' });
    setBusy('');
    setConfirm(null);
    if (error) return setMsg({ text: ERRORS[error.message] || `Something went wrong (${error.message}).`, ok: false });
    const who = c.name || c.email;
    setMsg({
      ok: true,
      text:
        action === 'suspend'
          ? `${who} is suspended and signed out everywhere.`
          : action === 'restore'
            ? `${who} can sign in again.`
            : action === 'admin'
              ? `${who} is now an admin.`
              : `${who} is no longer an admin.`,
    });
    load();
  };

  if (!rows) return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />;

  const term = q.trim().toLowerCase();
  const shown = rows.filter((c) => {
    if (filter === 'active' && c.suspended) return false;
    if (filter === 'suspended' && !c.suspended) return false;
    if (filter === 'admins' && !c.is_admin) return false;
    return !term || `${c.email} ${c.name}`.toLowerCase().includes(term);
  });
  const count = (f: Filter) =>
    rows.filter((c) => (f === 'all' ? true : f === 'active' ? !c.suspended : f === 'suspended' ? c.suspended : c.is_admin)).length;

  return (
    <View style={{ gap: 16 }}>
      <View style={styles.head}>
        <View style={{ flex: 1, minWidth: 220 }}>
          <Text style={adminStyles.h1}>Customers</Text>
          <Text style={adminStyles.muted}>Everyone with a Sylkit account. Suspend anyone who misuses the site; you can restore them any time.</Text>
        </View>
        <Pressable onPress={load} style={styles.refresh} accessibilityRole="button">
          <Ionicons name="refresh" size={16} color={colors.primary} />
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </View>

      {msg ? (
        <View style={StyleSheet.flatten([styles.msg, { backgroundColor: msg.ok ? '#ECFDF3' : '#FEF3F2' }])}>
          <Ionicons name={msg.ok ? 'checkmark-circle' : 'alert-circle'} size={18} color={msg.ok ? '#067647' : '#B42318'} />
          <Text style={{ flex: 1, color: msg.ok ? '#054F31' : '#B42318', fontWeight: '600' }}>{msg.text}</Text>
        </View>
      ) : null}

      <TextInput value={q} onChangeText={setQ} placeholder="Search by name or email…" placeholderTextColor="#94A3B8" style={styles.search} autoCapitalize="none" />

      <View style={styles.chips}>
        {(['all', 'active', 'suspended', 'admins'] as Filter[]).map((f) => {
          const on = filter === f;
          return (
            <Pressable key={f} onPress={() => setFilter(f)} style={StyleSheet.flatten([styles.chip, on && styles.chipOn])}>
              <Text style={[styles.chipText, on && { color: '#fff' }]}>
                {f === 'all' ? 'All' : f === 'active' ? 'Active' : f === 'suspended' ? 'Suspended' : 'Admins'} ({count(f)})
              </Text>
            </Pressable>
          );
        })}
      </View>

      {shown.length === 0 ? (
        <View style={[adminStyles.card, shadow, { alignItems: 'center' }]}>
          <Text style={adminStyles.muted}>No customers here.</Text>
        </View>
      ) : (
        shown.map((c) => {
          const me = c.id === session.user.id;
          const asking = confirm?.id === c.id ? confirm.action : null;
          return (
            <View key={c.id} style={StyleSheet.flatten([adminStyles.card, shadow, c.suspended && styles.suspendedCard])}>
              <View style={styles.rowTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{(c.name || c.email).slice(0, 1).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 180, gap: 2 }}>
                  <Text style={styles.name}>
                    {c.name || c.email.split('@')[0]}
                    {me ? '  (you)' : ''}
                  </Text>
                  <Text style={adminStyles.muted}>{c.email}</Text>
                </View>
                <View style={styles.badges}>
                  {c.is_admin ? <Badge text="Admin" bg="#F4EBFF" fg="#6941C6" /> : null}
                  {c.suspended ? <Badge text="Suspended" bg="#FEF3F2" fg="#B42318" /> : <Badge text="Active" bg="#ECFDF3" fg="#067647" />}
                </View>
              </View>

              <Text style={styles.facts}>
                Joined {formatDate(c.created_at, 'en')} · Last sign-in {c.last_sign_in_at ? formatDate(c.last_sign_in_at, 'en') : 'never'} · via{' '}
                {c.provider === 'google' ? 'Google' : 'email'} · {c.orders} order{c.orders === 1 ? '' : 's'}
                {Number(c.paid) > 0 ? ` · paid ${formatMoney(c.paid)}` : ''}
              </Text>

              {me ? null : asking ? (
                <View style={styles.confirm}>
                  <Text style={styles.confirmText}>
                    {asking === 'suspend'
                      ? 'Suspend this account? They are signed out now and cannot sign in until you restore them.'
                      : asking === 'restore'
                        ? 'Restore this account so they can sign in again?'
                        : asking === 'admin'
                          ? 'Give this person FULL admin access to orders, customers and payments?'
                          : 'Remove admin access from this person?'}
                  </Text>
                  <View style={styles.actions}>
                    <Action label="Yes, do it" tone={asking === 'suspend' || asking === 'admin' ? 'danger' : 'primary'} busy={busy === c.id} onPress={() => act(c, asking)} />
                    <Action label="Cancel" tone="plain" onPress={() => setConfirm(null)} />
                  </View>
                </View>
              ) : (
                <View style={styles.actions}>
                  {c.suspended ? (
                    <Action label="Restore account" icon="lock-open-outline" tone="primary" onPress={() => setConfirm({ id: c.id, action: 'restore' })} />
                  ) : (
                    <Action label="Suspend" icon="ban-outline" tone="danger" onPress={() => setConfirm({ id: c.id, action: 'suspend' })} />
                  )}
                  {c.is_admin ? (
                    <Action label="Remove admin" icon="shield-outline" tone="plain" onPress={() => setConfirm({ id: c.id, action: 'unadmin' })} />
                  ) : !c.suspended ? (
                    <Action label="Make admin" icon="shield-checkmark-outline" tone="plain" onPress={() => setConfirm({ id: c.id, action: 'admin' })} />
                  ) : null}
                </View>
              )}
            </View>
          );
        })
      )}
    </View>
  );
}

function Badge({ text, bg, fg }: { text: string; bg: string; fg: string }) {
  return (
    <View style={StyleSheet.flatten([styles.badge, { backgroundColor: bg }])}>
      <Text style={[styles.badgeText, { color: fg }]}>{text}</Text>
    </View>
  );
}

function Action({ label, icon, tone, onPress, busy }: { label: string; icon?: any; tone: 'primary' | 'danger' | 'plain'; onPress: () => void; busy?: boolean }) {
  const t = tone === 'danger' ? { bg: '#FEF3F2', fg: '#B42318' } : tone === 'primary' ? { bg: colors.primary, fg: '#fff' } : { bg: colors.bg, fg: colors.text };
  return (
    <Pressable onPress={onPress} disabled={busy} style={StyleSheet.flatten([styles.action, { backgroundColor: t.bg }, busy && { opacity: 0.6 }])} accessibilityRole="button">
      {busy ? <ActivityIndicator size="small" color={t.fg} /> : icon ? <Ionicons name={icon} size={16} color={t.fg} /> : null}
      <Text style={[styles.actionText, { color: t.fg }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 },
  refresh: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: colors.softBlue },
  refreshText: { color: colors.primary, fontWeight: '700' },
  msg: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12 },
  search: { borderWidth: 1, borderColor: '#D5DCEA', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: colors.text, outlineStyle: 'none' } as any,
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.text },
  suspendedCard: { borderColor: '#FDA29B', backgroundColor: '#FFFBFA' },
  rowTop: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 },
  avatar: { width: 42, height: 42, borderRadius: 999, backgroundColor: colors.softBlue, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 17, fontWeight: '800', color: colors.primary },
  name: { fontSize: 16, fontWeight: '800', color: colors.text },
  badges: { flexDirection: 'row', gap: 6 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: '800' },
  facts: { fontSize: 13, color: colors.muted, lineHeight: 19 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  actionText: { fontSize: 14, fontWeight: '800' },
  confirm: { gap: 10, padding: 12, borderRadius: 12, backgroundColor: '#FFF8EC' },
  confirmText: { fontSize: 14, color: colors.text, fontWeight: '600', lineHeight: 20 },
});
