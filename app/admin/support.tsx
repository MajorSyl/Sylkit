import { Ionicons } from '@expo/vector-icons';
import type { Session } from '@supabase/supabase-js';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AdminGate, adminStyles } from '../../src/components/AdminGate';
import { useClientWidth } from '../../src/lib/useClientWidth';
import { colors, shadow } from '../../src/theme';

// Support inbox: messages from the help widget. Customers' conversations are stored in the worker's
// D1 database; every call here sends the admin's Supabase session token so the worker can check access.

type Ticket = {
  id: number; number: string; name: string; email: string | null; whatsapp: string | null; lang: string; page: string | null;
  status: 'new' | 'answered' | 'closed'; unread: number; created_at: string; updated_at: string; last_body?: string; last_sender?: string;
};
type Msg = { id: number; sender: 'customer' | 'admin' | 'ai'; body: string; created_at: string };
type Channels = { email: boolean; push: boolean; ai: boolean };

const STATUS: Record<Ticket['status'], { label: string; bg: string; fg: string }> = {
  new: { label: 'Needs reply', bg: '#FEE4E2', fg: '#B42318' },
  answered: { label: 'Answered', bg: '#DCFCE7', fg: '#166534' },
  closed: { label: 'Closed', bg: '#EEF2F8', fg: '#5B6B88' },
};
// Ready-made replies, adjusted per customer language.
const CANNED: { label: string; en: string; es: string; pt: string }[] = [
  { label: 'Checking', en: "Thanks for writing! I'm checking this now and will get back to you shortly.", es: '¡Gracias por escribir! Lo estoy revisando y te respondo en breve.', pt: 'Obrigado por escrever! Estou verificando e já te respondo.' },
  { label: 'Order number', en: 'Could you share your order number (it starts with SK-) so I can look it up?', es: '¿Me compartes tu número de pedido (empieza con SK-) para revisarlo?', pt: 'Pode me passar o número do seu pedido (começa com SK-) para eu verificar?' },
  { label: 'In progress', en: 'Your order is in progress. You can follow every step on your order page, and I will let you know as soon as it is ready.', es: 'Tu pedido está en proceso. Puedes seguir cada paso en la página de tu pedido y te aviso apenas esté listo.', pt: 'Seu pedido está em andamento. Você acompanha cada etapa na página do pedido e eu aviso assim que estiver pronto.' },
  { label: 'Call?', en: 'Would a quick call or WhatsApp chat help? Tell me a good time for you.', es: '¿Te ayuda una llamada rápida o un chat por WhatsApp? Dime una hora que te quede bien.', pt: 'Uma ligação rápida ou conversa no WhatsApp ajudaria? Me diga um bom horário.' },
];

const when = (s: string) => {
  try {
    return new Date(s.replace(' ', 'T') + 'Z').toLocaleString('en', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
  } catch {
    return s;
  }
};

export default function AdminSupport() {
  return <AdminGate title="Support">{(session) => <Inbox session={session} />}</AdminGate>;
}

function Inbox({ session }: { session: Session }) {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const width = useClientWidth();
  const wide = width >= 900;
  const [scope, setScope] = useState<'open' | 'all'>('open');
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [channels, setChannels] = useState<Channels | null>(null);
  const [selected, setSelected] = useState<number | null>(id ? Number(id) : null);
  const [thread, setThread] = useState<{ ticket: Ticket; messages: Msg[] } | null>(null);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const call = useCallback(
    async (path: string, body?: object) => {
      const r = await fetch(`/api/support/admin/${path}`, {
        method: body ? 'POST' : 'GET',
        headers: { authorization: `Bearer ${session.access_token}`, 'content-type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `HTTP ${r.status}`);
      return r.json();
    },
    [session.access_token],
  );

  const loadList = useCallback(async () => {
    try {
      const j = await call(`tickets?status=${scope}`);
      setTickets(j.tickets);
      setCounts(j.counts || {});
      setChannels(j.channels);
      setError('');
    } catch (e: any) {
      setError(e.message === 'support_not_configured' ? 'The support database is not connected to the site yet.' : `Could not load messages (${e.message}).`);
      setTickets([]);
    }
  }, [call, scope]);

  const loadThread = useCallback(
    async (tid: number) => {
      try {
        setThread(await call(`thread?id=${tid}`));
      } catch {
        setThread(null);
      }
    },
    [call],
  );

  useEffect(() => {
    loadList();
    const t = setInterval(loadList, 30000);
    return () => clearInterval(t);
  }, [loadList]);
  useEffect(() => {
    if (selected == null) return setThread(null);
    setNote('');
    loadThread(selected);
    const t = setInterval(() => loadThread(selected), 20000);
    return () => clearInterval(t);
  }, [selected, loadThread]);

  const open = (tid: number | null) => {
    setSelected(tid);
    router.setParams({ id: tid == null ? undefined : String(tid) } as any);
  };

  const send = async () => {
    if (!reply.trim() || !thread) return;
    setBusy(true);
    try {
      const j = await call('reply', { id: thread.ticket.id, body: reply.trim() });
      setReply('');
      setNote(j.emailed ? `Sent. ${thread.ticket.name} also got it by email.` : 'Sent. The customer sees it in the chat on the site.');
      await Promise.all([loadThread(thread.ticket.id), loadList()]);
    } catch (e: any) {
      setNote(`Could not send (${e.message}).`);
    }
    setBusy(false);
  };
  const setStatus = async (status: Ticket['status']) => {
    if (!thread) return;
    await call('status', { id: thread.ticket.id, status }).catch(() => null);
    await Promise.all([loadThread(thread.ticket.id), loadList()]);
  };

  const list = (
    <View style={[adminStyles.card, shadow, { padding: 0, overflow: 'hidden', gap: 0 }, wide && { width: 380 }]}>
      <View style={styles.listHead}>
        {(['open', 'all'] as const).map((s) => (
          <Pressable key={s} onPress={() => setScope(s)} style={[styles.tab, scope === s && styles.tabOn]} accessibilityRole="tab" accessibilityState={{ selected: scope === s }}>
            <Text style={[styles.tabText, scope === s && { color: colors.text }]}>
              {s === 'open' ? `Open (${(counts.new ?? 0) + (counts.answered ?? 0)})` : 'All'}
            </Text>
          </Pressable>
        ))}
        <Pressable onPress={loadList} style={styles.refresh} accessibilityLabel="Refresh">
          <Ionicons name="refresh" size={18} color={colors.primary} />
        </Pressable>
      </View>
      {tickets == null ? (
        <ActivityIndicator color={colors.primary} style={{ margin: 30 }} />
      ) : tickets.length === 0 ? (
        <View style={{ padding: 24, alignItems: 'center', gap: 6 }}>
          <Ionicons name="checkmark-done-circle-outline" size={30} color={colors.muted} />
          <Text style={adminStyles.muted}>{error || 'No messages here. Nice work.'}</Text>
        </View>
      ) : (
        tickets.map((t) => (
          <Pressable key={t.id} onPress={() => open(t.id)} style={[styles.row, selected === t.id && styles.rowOn]} accessibilityRole="button">
            <View style={styles.rowTop}>
              {t.unread ? <View style={styles.unread} /> : null}
              <Text style={[styles.rowName, t.unread ? { fontWeight: '800' } : null]} numberOfLines={1}>
                {t.name}
              </Text>
              <Text style={styles.rowTime}>{when(t.updated_at)}</Text>
            </View>
            <Text style={styles.rowBody} numberOfLines={2}>
              {t.last_sender === 'admin' ? 'You: ' : ''}
              {t.last_body}
            </Text>
            <View style={styles.rowTop}>
              <Text style={styles.rowNum}>{t.number}</Text>
              <Text style={[styles.pill, { backgroundColor: STATUS[t.status].bg, color: STATUS[t.status].fg }]}>{STATUS[t.status].label}</Text>
            </View>
          </Pressable>
        ))
      )}
    </View>
  );

  const t = thread?.ticket;
  const wa = t?.whatsapp?.replace(/\D/g, '');
  const detail = !t ? (
    wide ? (
      <View style={[adminStyles.card, shadow, { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 300 }]}>
        <Ionicons name="chatbubbles-outline" size={34} color={colors.muted} />
        <Text style={adminStyles.muted}>Pick a conversation to read and reply.</Text>
      </View>
    ) : null
  ) : (
    <View style={[adminStyles.card, shadow, { flex: 1, gap: 14 }]}>
      {!wide ? (
        <Pressable onPress={() => open(null)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }} accessibilityRole="button">
          <Ionicons name="chevron-back" size={18} color={colors.primary} />
          <Text style={{ color: colors.primary, fontWeight: '700' }}>All messages</Text>
        </Pressable>
      ) : null}
      <View style={styles.detailHead}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={adminStyles.h2}>
            {t.name} <Text style={{ color: colors.muted, fontWeight: '600' }}>· {t.number}</Text>
          </Text>
          <Text style={adminStyles.muted}>
            {[t.email, t.whatsapp && `WhatsApp ${t.whatsapp}`, `Language ${t.lang.toUpperCase()}`, t.page && `from ${t.page}`, `since ${when(t.created_at)}`].filter(Boolean).join(' · ')}
          </Text>
        </View>
        <Text style={[styles.pill, { backgroundColor: STATUS[t.status].bg, color: STATUS[t.status].fg }]}>{STATUS[t.status].label}</Text>
      </View>
      <View style={styles.actions}>
        {t.email ? <Action icon="mail-outline" label="Email" onPress={() => Linking.openURL(`mailto:${t.email}?subject=${encodeURIComponent(`Sylkit ${t.number}`)}`)} /> : null}
        {wa ? <Action icon="logo-whatsapp" label="WhatsApp" onPress={() => Linking.openURL(`https://wa.me/${wa}`)} /> : null}
        {t.status !== 'closed' ? <Action icon="checkmark-done-outline" label="Close" onPress={() => setStatus('closed')} /> : <Action icon="refresh-outline" label="Reopen" onPress={() => setStatus('new')} />}
        {t.status === 'new' ? <Action icon="checkmark-outline" label="Mark answered" onPress={() => setStatus('answered')} /> : null}
      </View>

      <View style={styles.msgs}>
        {thread!.messages.map((m) =>
          m.sender === 'ai' ? (
            <View key={m.id} style={styles.aiBox}>
              <Text style={adminStyles.label}>Chat with the AI assistant before asking for a person</Text>
              <Text style={styles.aiText}>{m.body}</Text>
            </View>
          ) : (
            <View key={m.id} style={[styles.msgRow, m.sender === 'admin' && { alignItems: 'flex-end' }]}>
              <View style={[styles.msg, m.sender === 'admin' ? styles.msgMe : styles.msgThem]}>
                <Text style={[styles.msgText, m.sender === 'admin' && { color: '#fff' }]} selectable>
                  {m.body}
                </Text>
              </View>
              <Text style={styles.msgTime}>
                {m.sender === 'admin' ? 'You' : t.name} · {when(m.created_at)}
              </Text>
            </View>
          ),
        )}
      </View>

      <View style={styles.canned}>
        {CANNED.map((c) => (
          <Pressable key={c.label} onPress={() => setReply((r) => (r ? r + '\n\n' : '') + (t.lang === 'es' ? c.es : t.lang === 'pt' ? c.pt : c.en))} style={styles.cannedChip} accessibilityRole="button">
            <Text style={styles.cannedText}>+ {c.label}</Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        value={reply}
        onChangeText={setReply}
        multiline
        placeholder={`Reply to ${t.name} in ${t.lang === 'es' ? 'Spanish' : t.lang === 'pt' ? 'Portuguese' : 'English'}…`}
        placeholderTextColor="#94A3B8"
        style={styles.replyBox}
        accessibilityLabel="Reply"
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Pressable onPress={send} disabled={busy || !reply.trim()} style={[styles.sendBtn, (busy || !reply.trim()) && { opacity: 0.5 }]} accessibilityRole="button">
          {busy ? <ActivityIndicator color="#fff" /> : <Ionicons name="send" size={16} color="#fff" />}
          <Text style={styles.sendText}>Send reply</Text>
        </Pressable>
        {note ? <Text style={adminStyles.muted}>{note}</Text> : null}
      </View>
    </View>
  );

  return (
    <View style={{ gap: 16 }}>
      <Text style={adminStyles.h1}>Support</Text>
      {channels ? <Setup channels={channels} /> : null}
      {wide ? (
        <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
          {list}
          {detail}
        </View>
      ) : selected != null ? (
        detail
      ) : (
        list
      )}
    </View>
  );
}

function Action({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.action} accessibilityRole="button">
      <Ionicons name={icon as any} size={16} color={colors.primary} />
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

// What still needs a key in Cloudflare (Workers > sylkit > Settings > Variables and secrets).
function Setup({ channels }: { channels: Channels }) {
  const missing = [
    !channels.ai && { key: 'ANTHROPIC_API_KEY', text: 'turns on the AI assistant in the help widget (until then it answers common questions itself).' },
    !channels.email && { key: 'RESEND_API_KEY', text: 'emails you when a message arrives and emails customers your replies (until then replies show in the chat on the site).' },
    !channels.push && { key: 'NTFY_TOPIC', text: 'sends an instant notification to your phone through the free ntfy app. Use a long, secret topic name.' },
  ].filter(Boolean) as { key: string; text: string }[];
  if (!missing.length) return null;
  return (
    <View style={[adminStyles.card, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A', gap: 8 }]}>
      <Text style={adminStyles.h2}>Finish setting up support</Text>
      {missing.map((m) => (
        <Text key={m.key} style={adminStyles.muted}>
          <Text style={{ fontWeight: '800', color: colors.text }}>{m.key}</Text> {m.text}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  listHead: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  tabOn: { backgroundColor: colors.softBlue },
  tabText: { fontSize: 14, fontWeight: '800', color: colors.muted },
  refresh: { marginLeft: 'auto', width: 36, height: 36, alignItems: 'center', justifyContent: 'center' } as any,
  row: { padding: 14, gap: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowOn: { backgroundColor: '#F3F7FF' },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  unread: { width: 9, height: 9, borderRadius: 999, backgroundColor: colors.primary },
  rowName: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  rowTime: { fontSize: 12, color: colors.muted },
  rowBody: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  rowNum: { flex: 1, fontSize: 12, fontWeight: '700', color: colors.muted },
  pill: { fontSize: 11, fontWeight: '800', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
  detailHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, minHeight: 38 },
  actionText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  msgs: { gap: 12, backgroundColor: colors.bg, borderRadius: 14, padding: 14 },
  msgRow: { alignItems: 'flex-start', gap: 4 },
  msg: { maxWidth: '85%', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  msgThem: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  msgMe: { backgroundColor: colors.primary },
  msgText: { fontSize: 15, lineHeight: 21, color: colors.text },
  msgTime: { fontSize: 11, color: colors.muted },
  aiBox: { backgroundColor: '#EEF2F8', borderRadius: 12, padding: 12, gap: 6 },
  aiText: { fontSize: 13, color: colors.muted, lineHeight: 19 },
  canned: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cannedChip: { borderWidth: 1, borderColor: '#C9D7F8', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  cannedText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  replyBox: { minHeight: 110, borderWidth: 1, borderColor: '#D5DCEA', borderRadius: 12, padding: 12, fontSize: 15, color: colors.text, textAlignVertical: 'top', outlineStyle: 'none' } as any,
  sendBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 18, minHeight: 46 },
  sendText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
