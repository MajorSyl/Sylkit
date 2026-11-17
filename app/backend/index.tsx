// Backend home: the whole business on one screen, in plain words, with what to do next.
import { Ionicons } from '@expo/vector-icons';
import type { Session } from '@supabase/supabase-js';
import { Link } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { AdminGate, adminStyles } from '../../src/components/AdminGate';
import { formatMoney } from '../../src/lib/status';
import { supabase } from '../../src/lib/supabase';
import { colors, shadow } from '../../src/theme';

type Overview = {
  orders_total: number;
  orders_week: number;
  needs_action: number;
  payments_to_check: number;
  new_requests: number;
  in_progress: number;
  collected: number;
  pipeline: number;
  customers_total: number;
  customers_week: number;
  suspended: number;
  admins: number;
};

export default function BackendHome() {
  return <AdminGate title="Home">{(session) => <Home session={session} />}</AdminGate>;
}

function Home({ session }: { session: Session }) {
  const [o, setO] = useState<Overview | null>(null);
  const [openChats, setOpenChats] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const { data, error: err } = await supabase.rpc('admin_overview');
    if (err) setError('Could not load the numbers. Pull down or tap Refresh to try again.');
    else {
      setO(data as Overview);
      setError('');
    }
    try {
      const r = await fetch('/api/support/admin/tickets?status=open', { headers: { authorization: `Bearer ${session.access_token}` } });
      const j = await r.json();
      setOpenChats(typeof j?.counts?.open === 'number' ? j.counts.open : Array.isArray(j?.tickets) ? j.tickets.length : null);
    } catch {
      setOpenChats(null);
    }
  }, [session.access_token]);

  useEffect(() => {
    load();
  }, [load]);

  if (!o && !error) return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />;

  const name = String(session.user.user_metadata?.full_name || session.user.user_metadata?.name || '').split(' ')[0];
  const todo: { icon: any; text: string; href: string; urgent?: boolean }[] = [];
  if (o) {
    if (o.payments_to_check) todo.push({ icon: 'cash-outline', text: `${o.payments_to_check} payment${o.payments_to_check > 1 ? 's' : ''} to confirm. Clients say they paid.`, href: '/backend/orders', urgent: true });
    if (o.new_requests) todo.push({ icon: 'mail-unread-outline', text: `${o.new_requests} new request${o.new_requests > 1 ? 's' : ''} waiting for your reply or quote.`, href: '/backend/orders', urgent: true });
    if (openChats) todo.push({ icon: 'chatbubbles-outline', text: `${openChats} open chat${openChats > 1 ? 's' : ''} from visitors.`, href: '/backend/support', urgent: true });
    if (o.in_progress) todo.push({ icon: 'construct-outline', text: `${o.in_progress} paid project${o.in_progress > 1 ? 's' : ''} in progress. Keep clients updated.`, href: '/backend/orders' });
  }

  return (
    <View style={{ gap: 20 }}>
      <View style={styles.head}>
        <View style={{ flex: 1, minWidth: 220 }}>
          <Text style={adminStyles.h1}>{name ? `Hi ${name}` : 'Welcome back'}</Text>
          <Text style={adminStyles.muted}>Here is how Sylkit is doing right now.</Text>
        </View>
        <Pressable onPress={load} style={styles.refresh} accessibilityRole="button">
          <Ionicons name="refresh" size={16} color={colors.primary} />
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {o ? (
        <>
          <View style={styles.grid}>
            <Big label="Money collected" value={formatMoney(o.collected)} hint="Orders paid, in progress or delivered" tone="green" />
            <Big label="Money on the table" value={formatMoney(o.pipeline)} hint="Quotes sent, accepted or waiting for payment check" tone="blue" />
            <Big label="Needs your action" value={String(o.needs_action)} hint="New requests, accepted quotes, payments to check" tone={o.needs_action ? 'orange' : 'grey'} href="/backend/orders" />
            <Big label="Customers" value={String(o.customers_total)} hint={`${o.customers_week} new this week${o.suspended ? ` · ${o.suspended} suspended` : ''}`} tone="grey" href="/backend/customers" />
          </View>

          <View style={[adminStyles.card, shadow]}>
            <Text style={adminStyles.h2}>What to do now</Text>
            {todo.length === 0 ? (
              <Text style={adminStyles.muted}>Nothing waiting. Good time to message new pharmacies.</Text>
            ) : (
              todo.map((t) => (
                <Link key={t.text} href={t.href as any} asChild>
                  <Pressable style={StyleSheet.flatten([styles.todo, t.urgent && styles.todoUrgent])} accessibilityRole="link">
                    <Ionicons name={t.icon} size={20} color={t.urgent ? '#B54708' : colors.primary} />
                    <Text style={styles.todoText}>{t.text}</Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                  </Pressable>
                </Link>
              ))
            )}
          </View>

          <View style={styles.grid}>
            <Small label="Orders this week" value={o.orders_week} />
            <Small label="All orders" value={o.orders_total} />
            <Small label="New customers this week" value={o.customers_week} />
            <Small label="Admins" value={o.admins} />
          </View>

          <View style={[adminStyles.card, shadow]}>
            <Text style={adminStyles.h2}>Shortcuts</Text>
            <View style={styles.shortcuts}>
              <Shortcut icon="receipt-outline" label="Orders and quotes" href="/backend/orders" />
              <Shortcut icon="people-outline" label="Customers (suspend, admins)" href="/backend/customers" />
              <Shortcut icon="chatbubbles-outline" label="Support chats" href="/backend/support" />
              <Shortcut icon="pricetags-outline" label="Products, prices, payments" href="/backend/products" />
              <Shortcut icon="globe-outline" label="Open sylkit.com" href="/" />
            </View>
          </View>
        </>
      ) : null}
    </View>
  );
}

const TONES = {
  green: { bg: '#ECFDF3', fg: '#067647' },
  blue: { bg: colors.softBlue, fg: colors.primary },
  orange: { bg: '#FFF4E5', fg: '#B54708' },
  grey: { bg: colors.surface, fg: colors.text },
};

function Big({ label, value, hint, tone, href }: { label: string; value: string; hint: string; tone: keyof typeof TONES; href?: string }) {
  const t = TONES[tone];
  const body = (
    <View style={StyleSheet.flatten([styles.big, shadow, { backgroundColor: t.bg }])}>
      <Text style={styles.bigLabel}>{label}</Text>
      <Text style={[styles.bigValue, { color: t.fg }]}>{value}</Text>
      <Text style={styles.bigHint}>{hint}</Text>
    </View>
  );
  if (!href) return body;
  return (
    <Link href={href as any} asChild>
      <Pressable style={styles.bigWrap} accessibilityRole="link">{body}</Pressable>
    </Link>
  );
}

function Small({ label, value }: { label: string; value: number }) {
  return (
    <View style={StyleSheet.flatten([styles.small, shadow])}>
      <Text style={styles.smallValue}>{value}</Text>
      <Text style={styles.bigHint}>{label}</Text>
    </View>
  );
}

function Shortcut({ icon, label, href }: { icon: any; label: string; href: string }) {
  return (
    <Link href={href as any} asChild>
      <Pressable style={styles.shortcut} accessibilityRole="link">
        <Ionicons name={icon} size={20} color={colors.primary} />
        <Text style={styles.shortcutText}>{label}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 },
  refresh: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: colors.softBlue },
  refreshText: { color: colors.primary, fontWeight: '700' },
  error: { color: '#B42318', fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  bigWrap: { flexGrow: 1, flexBasis: 240 },
  big: { flexGrow: 1, flexBasis: 240, borderRadius: 18, padding: 18, gap: 6, borderWidth: 1, borderColor: colors.border },
  bigLabel: { fontSize: 13, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.4 },
  bigValue: { fontSize: 30, fontWeight: '900', letterSpacing: -0.5 },
  bigHint: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  small: { flexGrow: 1, flexBasis: 150, backgroundColor: colors.surface, borderRadius: 16, padding: 14, gap: 2, borderWidth: 1, borderColor: colors.border },
  smallValue: { fontSize: 22, fontWeight: '800', color: colors.text },
  todo: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, backgroundColor: colors.bg },
  todoUrgent: { backgroundColor: '#FFF8EC' },
  todoText: { flex: 1, fontSize: 15, color: colors.text, fontWeight: '600' },
  shortcuts: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  shortcut: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border },
  shortcutText: { fontSize: 14, fontWeight: '700', color: colors.text },
});
