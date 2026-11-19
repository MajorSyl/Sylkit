import { Ionicons } from '@expo/vector-icons';
import type { Session } from '@supabase/supabase-js';
import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Footer } from '../src/components/Footer';
import { Header } from '../src/components/Header';
import { SignInGate } from '../src/components/SignInGate';
import { CancelOrder } from '../src/components/CancelOrder';
import { tx, useLang } from '../src/i18n';
import { accountApi, signOut } from '../src/lib/auth';
import { formatDate, formatMoney, statusColor, statusLabel, type OrderStatus } from '../src/lib/status';
import { colors } from '../src/theme';

// "My orders": every order of the signed-in customer with its status, invoice and messages.
// Data comes from /api/account/orders (worker/account.js), which checks the session first.

type Order = {
  token: string;
  order_number: string;
  status: OrderStatus;
  created_at: string;
  product: { slug: string; en: string; es: string } | null;
  amount: number | null;
  currency: string;
  updates: { message: string; at: string }[];
};
type Conversation = { token: string; number: string; status: string; updated_at: string; messages: { sender: string; body: string; created_at: string }[] };

export default function AccountPage() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Head>
        <title>{tx('My orders · Sylkit', 'Mis pedidos · Sylkit', 'Meus pedidos · Sylkit')}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Header />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <SignInGate
            title={tx('Sign in to see your orders', 'Inicia sesión para ver tus pedidos', 'Entre para ver seus pedidos')}
            sub={tx('Use the same email you ordered with and your orders appear here.', 'Usa el mismo correo con el que hiciste tu pedido y lo verás aquí.', 'Use o mesmo e-mail do seu pedido e ele aparece aqui.')}
          >
            {(session) => <MyOrders session={session} />}
          </SignInGate>
        </View>
        <Footer />
      </ScrollView>
    </View>
  );
}

function MyOrders({ session }: { session: Session }) {
  const { lang } = useLang();
  const router = useRouter();
  const [data, setData] = useState<{ orders: Order[]; conversations: Conversation[] } | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    const r = await accountApi<{ orders: Order[]; conversations: Conversation[] }>('orders').catch(() => null);
    if (!r || r.error) return setError(true);
    setData({ orders: r.orders || [], conversations: r.conversations || [] });
  }, []);
  useEffect(() => {
    load();
  }, [load, session.access_token]);

  const productName = (o: Order) => (o.product ? (lang === 'en' ? o.product.en : o.product.es || o.product.en) : tx('Custom system', 'Sistema a medida', 'Sistema sob medida'));

  return (
    <View style={{ gap: 18, paddingTop: 28 }}>
      <View style={styles.head}>
        <View style={{ flex: 1, minWidth: 220 }}>
          <Text style={styles.h1} accessibilityRole="header">{tx('My orders', 'Mis pedidos', 'Meus pedidos')}</Text>
          <Text style={styles.muted}>{session.user.email}</Text>
        </View>
        <Pressable onPress={() => signOut()} style={styles.ghost} accessibilityRole="button">
          <Ionicons name="log-out-outline" size={16} color={colors.text} />
          <Text style={styles.ghostText}>{tx('Sign out', 'Cerrar sesión', 'Sair')}</Text>
        </Pressable>
      </View>

      {error ? (
        <View style={styles.card}>
          <Text style={styles.muted}>{tx('We could not load your orders. Please try again.', 'No pudimos cargar tus pedidos. Intenta de nuevo.', 'Não conseguimos carregar seus pedidos. Tente de novo.')}</Text>
          <Pressable onPress={load} style={[styles.btn, { alignSelf: 'flex-start' }]} accessibilityRole="button">
            <Text style={styles.btnText}>{tx('Try again', 'Reintentar', 'Tentar de novo')}</Text>
          </Pressable>
        </View>
      ) : !data ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 40 }} />
      ) : (
        <>
          {data.orders.length === 0 ? (
            <View style={[styles.card, { alignItems: 'flex-start' }]}>
              <Text style={styles.h2}>{tx('No orders yet', 'Aún no tienes pedidos', 'Você ainda não tem pedidos')}</Text>
              <Text style={styles.muted}>{tx('When you order a system or ask for a quote, it shows up here with its status, invoice and messages.', 'Cuando pidas un sistema o una cotización, aparecerá aquí con su estado, factura y mensajes.', 'Quando você pedir um sistema ou orçamento, ele aparece aqui com status, fatura e mensagens.')}</Text>
              <Pressable onPress={() => router.push('/')} style={styles.btn} accessibilityRole="link">
                <Text style={styles.btnText}>{tx('Browse systems', 'Ver sistemas', 'Ver sistemas')}</Text>
              </Pressable>
            </View>
          ) : (
            data.orders.map((o) => {
              const sc = statusColor[o.status] ?? statusColor.new;
              return (
                <View key={o.token} style={styles.card}>
                  <View style={styles.row}>
                    <View style={{ flex: 1, minWidth: 200, gap: 2 }}>
                      <Text style={styles.h2}>{productName(o)}</Text>
                      <Text style={styles.muted}>
                        {o.order_number} · {formatDate(o.created_at, lang)}
                        {o.amount != null ? ` · ${formatMoney(o.amount, o.currency)}` : ''}
                      </Text>
                    </View>
                    <View style={[styles.pill, { backgroundColor: sc.bg }]}>
                      <Text style={[styles.pillText, { color: sc.fg }]}>{tx(statusLabel[o.status]?.en ?? o.status, statusLabel[o.status]?.es ?? o.status, statusLabel[o.status]?.pt ?? statusLabel[o.status]?.es ?? o.status)}</Text>
                    </View>
                  </View>

                  {o.updates.length ? (
                    <View style={styles.updates}>
                      <Text style={styles.label}>{tx('Messages from Sylkit', 'Mensajes de Sylkit', 'Mensagens da Sylkit')}</Text>
                      {o.updates.slice(-4).map((u, i) => (
                        <View key={i} style={styles.update}>
                          <View style={styles.dot} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.updateText}>{u.message}</Text>
                            <Text style={styles.small}>{formatDate(u.at, lang)}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  <View style={[styles.row, { gap: 8 }]}>
                    <Pressable onPress={() => router.push(`/order?t=${o.token}` as any)} style={styles.btn} accessibilityRole="link">
                      <Text style={styles.btnText}>{o.status === 'quoted' || o.status === 'accepted' ? tx('View and pay', 'Ver y pagar', 'Ver e pagar') : tx('Open order', 'Abrir pedido', 'Abrir pedido')}</Text>
                    </Pressable>
                    <Pressable onPress={() => router.push(`/invoice?t=${o.token}` as any)} style={styles.ghost} accessibilityRole="link">
                      <Ionicons name="document-text-outline" size={16} color={colors.text} />
                      <Text style={styles.ghostText}>{tx('Invoice', 'Factura', 'Fatura')}</Text>
                    </Pressable>
                  </View>
                  <CancelOrder token={o.token} status={o.status} onDone={load} compact />
                </View>
              );
            })
          )}

          {data.conversations.length ? (
            <View style={{ gap: 12, marginTop: 8 }}>
              <Text style={styles.h2}>{tx('Your conversations', 'Tus conversaciones', 'Suas conversas')}</Text>
              {data.conversations.map((c) => (
                <ConversationCard key={c.token} c={c} onSent={load} />
              ))}
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}

function ConversationCard({ c, onSent }: { c: Conversation; onSent: () => void }) {
  const { lang } = useLang();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const send = async () => {
    if (!text.trim()) return;
    setBusy(true);
    const r = await fetch('/api/support/message', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ t: c.token, body: text.trim() }) }).catch(() => null);
    setBusy(false);
    if (r?.ok) {
      setText('');
      onSent();
    }
  };
  return (
    <View style={styles.card}>
      <Text style={styles.muted}>
        {tx('Chat', 'Chat', 'Chat')} {c.number} · {formatDate(c.updated_at, lang)}
      </Text>
      {c.messages.slice(-6).map((m, i) => (
        <View key={i} style={[styles.bubble, m.sender === 'customer' ? styles.mine : styles.theirs]}>
          <Text style={[styles.bubbleText, m.sender === 'customer' && { color: '#fff' }]}>{m.body}</Text>
        </View>
      ))}
      <View style={[styles.row, { gap: 8, alignItems: 'flex-end' }]}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={tx('Write a reply…', 'Escribe una respuesta…', 'Escreva uma resposta…')}
          placeholderTextColor="#98A2B3"
          multiline
          style={[styles.input, { flex: 1, minWidth: 200 }]}
          accessibilityLabel={tx('Reply', 'Respuesta', 'Resposta')}
        />
        <Pressable onPress={send} disabled={busy || !text.trim()} style={[styles.btn, (busy || !text.trim()) && { opacity: 0.5 }]} accessibilityRole="button">
          <Text style={styles.btnText}>{tx('Send', 'Enviar', 'Enviar')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 860, alignSelf: 'center', paddingHorizontal: 16, paddingBottom: 48 },
  head: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
  h1: { fontSize: 30, fontWeight: '800', color: colors.text, letterSpacing: -0.8 },
  h2: { fontSize: 18, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  muted: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  small: { fontSize: 12, color: colors.muted },
  label: { fontSize: 12.5, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.4 },
  card: { backgroundColor: colors.surface, borderRadius: 18, padding: 18, gap: 12, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
  pill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  pillText: { fontSize: 12.5, fontWeight: '800' },
  updates: { gap: 8, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12 },
  update: { flexDirection: 'row', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 999, backgroundColor: colors.primary, marginTop: 6 },
  updateText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  btn: { backgroundColor: colors.text, borderRadius: 999, paddingHorizontal: 18, minHeight: 42, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  ghost: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 16, minHeight: 42, borderWidth: 1, borderColor: 'rgba(11,27,58,0.16)' },
  ghostText: { color: colors.text, fontWeight: '700', fontSize: 14 },
  bubble: { maxWidth: '85%', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  theirs: { alignSelf: 'flex-start', backgroundColor: '#F2F4F7' },
  bubbleText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  input: { borderWidth: 1, borderColor: 'rgba(11,27,58,0.16)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, minHeight: 44, fontSize: 15, color: colors.text, backgroundColor: '#fff' },
});
