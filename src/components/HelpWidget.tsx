import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { tx, useLang } from '../i18n';
import { colors, waLink } from '../theme';

// Help widget: a chat bubble on every public page.
//   Home     -> quick questions, the AI assistant, "talk to a person", track an order, WhatsApp
//   Chat     -> AI assistant (worker /api/support/ai). Without an AI key it answers common questions itself.
//   Form     -> creates a support ticket (name + email or WhatsApp + message); the admin gets notified
//   Thread   -> the conversation with Sylkit; replies show here (and by email when email is set up)
// The ticket's secret token stays on this device; links in reply emails (?support=<token>) reopen it.
// Other parts of the site open the widget with window.dispatchEvent(new Event('sylkit:help')).

type View_ = 'home' | 'chat' | 'form' | 'thread';
type Msg = { role: 'user' | 'assistant'; content: string; handoff?: boolean };
type ThreadMsg = { sender: 'customer' | 'admin' | 'ai'; body: string; created_at: string };
type Thread = { number: string; status: string; name: string; messages: ThreadMsg[] };
type Status = { ai: boolean; open: boolean; hours: { en: string; es: string; pt: string } };

const KEY = 'sylkit_support';
const store = {
  get(): { token?: string; seen?: number; name?: string; email?: string; whatsapp?: string } {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '{}');
    } catch {
      return {};
    }
  },
  set(v: object) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...store.get(), ...v }));
    } catch {}
  },
};
const api = (path: string) => (Platform.OS === 'web' ? path : `https://sylkit.com${path}`);

// Common questions, answered instantly (and used when the AI assistant is off).
const FAQ: { q: [string, string, string]; a: [string, string, string]; keys: RegExp }[] = [
  {
    q: ['How much does it cost?', '¿Cuánto cuesta?', 'Quanto custa?'],
    keys: /price|cost|cuesta|precio|plan|cuánto|cuanto|quanto|preço/i,
    a: [
      'Each system has plans with a monthly price and a one-time setup fee, shown on its page. Paying yearly gives you 2 months free, and you can also buy a lifetime license. Browse prices in the catalog on the home page.',
      'Cada sistema tiene planes con un precio mensual y una instalación única, que ves en su página. Pagando anual tienes 2 meses gratis, y también puedes comprar una licencia de por vida. Mira los precios en el catálogo de la página principal.',
      'Cada sistema tem planos com preço mensal e uma taxa única de instalação, mostrados na página dele. Pagando anual você ganha 2 meses grátis, e também pode comprar uma licença vitalícia. Veja os preços no catálogo da página inicial.',
    ],
  },
  {
    q: ['How can I pay?', '¿Cómo puedo pagar?', 'Como posso pagar?'],
    keys: /pay|pago|pagar|card|tarjeta|usdt|zelle|pago móvil|cartão/i,
    a: [
      'You choose at checkout: card, USDT (crypto) or a manual method such as Pago Móvil. After paying you get an order page to follow your setup.',
      'Eliges al pagar: tarjeta, USDT (cripto) o un método manual como Pago Móvil. Después del pago recibes una página para seguir tu pedido.',
      'Você escolhe no pagamento: cartão, USDT (cripto) ou um método manual como Pago Móvil. Depois do pagamento você recebe uma página para acompanhar o pedido.',
    ],
  },
  {
    q: ['Can I try it first?', '¿Puedo probarlo antes?', 'Posso testar antes?'],
    keys: /demo|try|prob|test|ver /i,
    a: [
      'Yes. Most systems have a free live demo with sample data: open the product and tap "Try the live demo". Design templates have a live preview too.',
      'Sí. La mayoría de los sistemas tienen una demo en vivo gratis con datos de ejemplo: abre el producto y toca "Probar demo en vivo". Las plantillas también tienen vista previa en vivo.',
      'Sim. A maioria dos sistemas tem uma demo ao vivo grátis com dados de exemplo: abra o produto e toque em "Testar demo ao vivo". Os modelos também têm prévia ao vivo.',
    ],
  },
  {
    q: ['How long does setup take?', '¿Cuánto tarda la instalación?', 'Quanto tempo leva a instalação?'],
    keys: /long|tarda|tiempo|cuándo|cuando|setup|instal|demora|prazo/i,
    a: [
      'It depends on the system and the extras you choose. We confirm the exact date when your order is confirmed, and you can follow every step on your order page.',
      'Depende del sistema y de los extras que elijas. Te confirmamos la fecha exacta al confirmar tu pedido, y puedes seguir cada paso en la página de tu pedido.',
      'Depende do sistema e dos extras que você escolher. Confirmamos a data exata quando seu pedido for confirmado, e você acompanha cada etapa na página do pedido.',
    ],
  },
  {
    q: ['Do you build custom systems?', '¿Hacen sistemas a medida?', 'Vocês fazem sistemas sob medida?'],
    keys: /custom|medida|personaliz|special|especial|sob medida/i,
    a: [
      'Yes. Tell us what you need on the "Custom system" page and we send you a quote, usually within 24 hours.',
      'Sí. Cuéntanos qué necesitas en la página "Sistema a medida" y te enviamos una cotización, normalmente en menos de 24 horas.',
      'Sim. Conte o que você precisa na página "Sistema sob medida" e enviamos um orçamento, normalmente em até 24 horas.',
    ],
  },
];

export function HelpWidget() {
  const { lang } = useLang();
  const router = useRouter();
  const pathname = usePathname() || '/';
  const { width } = useWindowDimensions();
  const phone = width < 640;
  const L = (v: [string, string, string]) => (lang === 'es' ? v[1] : lang === 'pt' ? v[2] : v[0]);

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View_>('home');
  const [status, setStatus] = useState<Status | null>(null);
  const [chat, setChat] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [thread, setThread] = useState<Thread | null>(null);
  const [unread, setUnread] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', whatsapp: '', message: '' });
  const [error, setError] = useState('');
  const scroller = useRef<ScrollView | null>(null);
  const hidden = pathname.startsWith('/admin');

  const loadThread = useCallback(async (markSeen: boolean) => {
    const t = store.get().token;
    if (!t) return;
    const r = await fetch(api(`/api/support/thread?t=${t}`)).catch(() => null);
    if (!r || !r.ok) return;
    const th: Thread = await r.json();
    setThread(th);
    const replies = th.messages.filter((m) => m.sender === 'admin').length;
    if (markSeen) store.set({ seen: replies });
    setUnread(Math.max(0, replies - (markSeen ? replies : store.get().seen ?? 0)));
  }, []);

  // First load: support status, saved contact details, reply-email links (?support=<token>) and unread replies.
  useEffect(() => {
    if (hidden) return;
    fetch(api('/api/support/status')).then((r) => (r.ok ? r.json() : null)).then(setStatus).catch(() => {});
    const s = store.get();
    setForm((f) => ({ ...f, name: s.name ?? '', email: s.email ?? '', whatsapp: s.whatsapp ?? '' }));
    if (Platform.OS === 'web') {
      try {
        const t = new URLSearchParams(window.location.search).get('support');
        if (t && /^[a-f0-9]{20,64}$/.test(t)) {
          store.set({ token: t });
          setOpen(true);
          setView('thread');
        }
      } catch {}
      const onHelp = () => setOpen(true);
      window.addEventListener('sylkit:help', onHelp);
      loadThread(false);
      return () => window.removeEventListener('sylkit:help', onHelp);
    }
    loadThread(false);
  }, [hidden, loadThread]);

  // While a conversation is on screen, check for replies every 15 seconds.
  useEffect(() => {
    if (!open || view !== 'thread') return;
    loadThread(true);
    const id = setInterval(() => loadThread(true), 15000);
    return () => clearInterval(id);
  }, [open, view, loadThread]);

  useEffect(() => {
    setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 60);
  }, [chat, thread, view]);

  if (hidden) return null;

  const hours = status ? (lang === 'es' ? status.hours.es : lang === 'pt' ? status.hours.pt : status.hours.en) : '';
  const online = !!status?.open;

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || busy) return;
    setView('chat');
    setInput('');
    const next: Msg[] = [...chat, { role: 'user', content: q }];
    setChat(next);
    setBusy(true);
    let reply: string | null = null;
    let handoff = false;
    if (status?.ai) {
      const r = await fetch(api('/api/support/ai'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ lang, messages: next.map(({ role, content }) => ({ role, content })) }),
      }).catch(() => null);
      const j = r ? await r.json().catch(() => ({})) : {};
      reply = j.reply ?? null;
      handoff = !!j.handoff;
    }
    if (!reply) {
      const hit = FAQ.find((f) => f.keys.test(q));
      reply = hit
        ? L(hit.a)
        : tx(
            "I'll pass this to our team so a person can answer you properly.",
            'Le paso esto a nuestro equipo para que una persona te responda bien.',
            'Vou passar isso para nossa equipe para que uma pessoa responda direitinho.',
          );
      handoff = !hit;
    }
    setChat([...next, { role: 'assistant', content: reply, handoff }]);
    setBusy(false);
  };

  const toPerson = () => {
    const lastQ = [...chat].reverse().find((m) => m.role === 'user')?.content ?? '';
    setForm((f) => ({ ...f, message: f.message || lastQ }));
    setError('');
    setView('form');
  };

  const submit = async () => {
    setError('');
    const f = { name: form.name.trim(), email: form.email.trim(), whatsapp: form.whatsapp.trim(), message: form.message.trim() };
    if (f.name.length < 2) return setError(tx('Please enter your name.', 'Escribe tu nombre.', 'Escreva seu nome.'));
    if (!f.email && f.whatsapp.replace(/\D/g, '').length < 7)
      return setError(tx('Add an email or WhatsApp so we can reply.', 'Agrega un correo o WhatsApp para poder responderte.', 'Adicione um e-mail ou WhatsApp para podermos responder.'));
    if (f.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) return setError(tx('Please check your email.', 'Revisa tu correo.', 'Confira seu e-mail.'));
    if (f.message.length < 2) return setError(tx('Write your message.', 'Escribe tu mensaje.', 'Escreva sua mensagem.'));
    setBusy(true);
    const transcript = chat.length
      ? chat.map((m) => `${m.role === 'user' ? tx('Customer', 'Cliente', 'Cliente') : tx('Assistant', 'Asistente', 'Assistente')}: ${m.content}`).join('\n')
      : '';
    const r = await fetch(api('/api/support/ticket'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...f, lang, page: pathname, transcript }),
    }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    setBusy(false);
    if (!r || !r.ok || !j.token) {
      return setError(
        j.error === 'rate_limited'
          ? tx('Too many messages today. Please write to us on WhatsApp.', 'Demasiados mensajes hoy. Escríbenos por WhatsApp.', 'Muitas mensagens hoje. Fale conosco pelo WhatsApp.')
          : tx('Could not send. Check your connection and try again.', 'No se pudo enviar. Revisa tu conexión e intenta de nuevo.', 'Não foi possível enviar. Verifique sua conexão e tente de novo.'),
      );
    }
    store.set({ token: j.token, seen: 0, name: f.name, email: f.email, whatsapp: f.whatsapp });
    setForm((x) => ({ ...x, message: '' }));
    setView('thread');
    loadThread(true);
  };

  const reply = async () => {
    const body = input.trim();
    const t = store.get().token;
    if (!body || !t || busy) return;
    setBusy(true);
    setInput('');
    const r = await fetch(api('/api/support/message'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ t, body }) }).catch(() => null);
    if (r && r.ok) setThread(await r.json());
    setBusy(false);
  };

  const panelStyle = phone
    ? [styles.panel, styles.panelPhone]
    : [styles.panel, { width: 384, height: 'min(620px, calc(100vh - 110px))' as any }];
  const fixed = Platform.OS === 'web' ? ({ position: 'fixed' } as any) : { position: 'absolute' };

  // ---------- Pieces ----------
  const header = (
    <View style={styles.head}>
      {view !== 'home' ? (
        <Pressable onPress={() => setView('home')} style={styles.headBtn} accessibilityRole="button" accessibilityLabel={tx('Back', 'Atrás', 'Voltar')}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
      ) : (
        <View style={styles.avatar}>
          <Ionicons name="cube" size={20} color={colors.primary} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.headTitle}>{tx('Sylkit Support', 'Soporte Sylkit', 'Suporte Sylkit')}</Text>
        <View style={styles.headStatus}>
          <View style={[styles.dot, { backgroundColor: online ? '#4ADE80' : '#FBBF24' }]} />
          <Text style={styles.headSub} numberOfLines={1}>
            {online
              ? tx('Online · we usually reply within 2 hours', 'En línea · solemos responder en 2 horas', 'Online · costumamos responder em 2 horas')
              : tx('Away · we reply next business day', 'Fuera de horario · respondemos el siguiente día hábil', 'Fora do horário · respondemos no próximo dia útil')}
          </Text>
        </View>
      </View>
      <Pressable onPress={() => setOpen(false)} style={styles.headBtn} accessibilityRole="button" accessibilityLabel={tx('Close', 'Cerrar', 'Fechar')}>
        <Ionicons name="close" size={22} color="#fff" />
      </Pressable>
    </View>
  );

  const home = (
    <ScrollView contentContainerStyle={styles.body}>
      <Text style={styles.hello}>{tx('Hi 👋 How can we help?', 'Hola 👋 ¿En qué te ayudamos?', 'Olá 👋 Como podemos ajudar?')}</Text>
      {thread ? (
        <Pressable style={styles.convCard} onPress={() => setView('thread')} accessibilityRole="button">
          <Ionicons name="chatbubbles" size={20} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.convTitle}>
              {tx('Your conversation', 'Tu conversación', 'Sua conversa')} {thread.number}
            </Text>
            <Text style={styles.small} numberOfLines={1}>
              {thread.messages[thread.messages.length - 1]?.body}
            </Text>
          </View>
          {unread ? <Text style={styles.badge}>{unread}</Text> : <Ionicons name="chevron-forward" size={18} color={colors.muted} />}
        </Pressable>
      ) : null}
      <Text style={styles.label}>{tx('Quick answers', 'Respuestas rápidas', 'Respostas rápidas')}</Text>
      <View style={styles.chips}>
        {FAQ.map((f) => (
          <Pressable key={f.q[0]} style={styles.chip} onPress={() => ask(L(f.q))} accessibilityRole="button">
            <Text style={styles.chipText}>{L(f.q)}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.options}>
        <Option icon="sparkles" title={tx('Ask the assistant', 'Preguntar al asistente', 'Perguntar ao assistente')} sub={tx('Instant answers, any time', 'Respuestas al instante, a cualquier hora', 'Respostas na hora, a qualquer momento')} onPress={() => setView('chat')} />
        <Option icon="person" title={tx('Talk to a person', 'Hablar con una persona', 'Falar com uma pessoa')} sub={hours} onPress={toPerson} />
        <Option icon="receipt" title={tx('Track my order', 'Seguir mi pedido', 'Acompanhar meu pedido')} sub={tx('Status and payment of your order', 'Estado y pago de tu pedido', 'Status e pagamento do pedido')} onPress={() => { setOpen(false); router.push('/track' as any); }} />
        <Option
          icon="logo-whatsapp"
          color={colors.whatsapp}
          title="WhatsApp"
          sub={tx('Prefer WhatsApp? Write to us there', '¿Prefieres WhatsApp? Escríbenos ahí', 'Prefere WhatsApp? Fale com a gente lá')}
          onPress={() => Linking.openURL(waLink(tx('Hi, I need help with Sylkit.', 'Hola, necesito ayuda con Sylkit.', 'Olá, preciso de ajuda com a Sylkit.')))}
        />
      </View>
    </ScrollView>
  );

  const chatView = (
    <>
      <ScrollView ref={scroller} contentContainerStyle={styles.body}>
        <Bubble side="left" text={tx("Hi! I'm Sylkit's assistant. Ask me about systems, prices, demos or payments.", '¡Hola! Soy el asistente de Sylkit. Pregúntame por sistemas, precios, demos o pagos.', 'Olá! Sou o assistente da Sylkit. Pergunte sobre sistemas, preços, demos ou pagamentos.')} />
        {chat.map((m, i) => (
          <View key={i} style={{ gap: 6 }}>
            <Bubble side={m.role === 'user' ? 'right' : 'left'} text={m.content} />
            {m.role === 'assistant' && m.handoff ? (
              <Pressable style={styles.handoff} onPress={toPerson} accessibilityRole="button">
                <Ionicons name="person" size={16} color="#fff" />
                <Text style={styles.handoffText}>{tx('Talk to a person', 'Hablar con una persona', 'Falar com uma pessoa')}</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
        {busy ? <ActivityIndicator color={colors.primary} style={{ alignSelf: 'flex-start', marginLeft: 12 }} /> : null}
        {chat.length > 1 ? (
          <Pressable onPress={toPerson} style={{ alignSelf: 'center', padding: 8 }} accessibilityRole="button">
            <Text style={styles.link}>{tx('Prefer a person? Leave us a message', '¿Prefieres una persona? Déjanos un mensaje', 'Prefere uma pessoa? Deixe uma mensagem')}</Text>
          </Pressable>
        ) : null}
      </ScrollView>
      <Composer value={input} onChange={setInput} onSend={() => ask(input)} busy={busy} placeholder={tx('Type your question…', 'Escribe tu pregunta…', 'Escreva sua pergunta…')} />
    </>
  );

  const formView = (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      <Text style={styles.hello}>{tx('Leave us a message', 'Déjanos un mensaje', 'Deixe uma mensagem')}</Text>
      <Text style={styles.small}>
        {tx('A person from our team will reply here and by email.', 'Una persona de nuestro equipo te responderá aquí y por correo.', 'Uma pessoa da nossa equipe vai responder aqui e por e-mail.')} {hours}.
      </Text>
      <Input label={tx('Name', 'Nombre', 'Nome')} value={form.name} onChange={(v) => setForm({ ...form, name: v })} autoComplete="name" />
      <Input label={tx('Email', 'Correo', 'E-mail')} value={form.email} onChange={(v) => setForm({ ...form, email: v })} autoComplete="email" keyboard="email-address" />
      <Input label={tx('WhatsApp (optional)', 'WhatsApp (opcional)', 'WhatsApp (opcional)')} value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v })} autoComplete="tel" keyboard="phone-pad" />
      <Input label={tx('How can we help?', '¿En qué te ayudamos?', 'Como podemos ajudar?')} value={form.message} onChange={(v) => setForm({ ...form, message: v })} multiline />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={[styles.primary, busy && { opacity: 0.6 }]} onPress={submit} disabled={busy} accessibilityRole="button">
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>{tx('Send message', 'Enviar mensaje', 'Enviar mensagem')}</Text>}
      </Pressable>
    </ScrollView>
  );

  const threadView = (
    <>
      <ScrollView ref={scroller} contentContainerStyle={styles.body}>
        {thread ? (
          <>
            <Text style={[styles.small, { textAlign: 'center' }]}>
              {tx('Conversation', 'Conversación', 'Conversa')} {thread.number} ·{' '}
              {thread.status === 'answered' ? tx('Answered', 'Respondida', 'Respondida') : thread.status === 'closed' ? tx('Closed', 'Cerrada', 'Encerrada') : tx('Waiting for our reply', 'Esperando nuestra respuesta', 'Aguardando nossa resposta')}
            </Text>
            {thread.messages.map((m, i) =>
              m.sender === 'ai' ? (
                <Text key={i} style={styles.aiNote} numberOfLines={3}>
                  {tx('Chat with the assistant attached', 'Chat con el asistente adjunto', 'Conversa com o assistente anexada')}
                </Text>
              ) : (
                <Bubble key={i} side={m.sender === 'customer' ? 'right' : 'left'} text={m.body} label={m.sender === 'admin' ? 'Sylkit' : undefined} />
              ),
            )}
            {thread.status !== 'answered' ? (
              <View style={styles.waitCard}>
                <Ionicons name="time-outline" size={18} color={colors.primary} />
                <Text style={[styles.small, { flex: 1 }]}>
                  {tx("Thanks! We got your message. We'll reply here", '¡Gracias! Recibimos tu mensaje. Te responderemos aquí', 'Obrigado! Recebemos sua mensagem. Vamos responder aqui')}
                  {store.get().email ? tx(' and by email', ' y por correo', ' e por e-mail') : ''}. {hours}.
                </Text>
              </View>
            ) : null}
          </>
        ) : (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        )}
      </ScrollView>
      <Composer value={input} onChange={setInput} onSend={reply} busy={busy} placeholder={tx('Write a reply…', 'Escribe una respuesta…', 'Escreva uma resposta…')} />
    </>
  );

  return (
    <>
      {open ? (
        <View style={[fixed, phone ? styles.panelWrapPhone : styles.panelWrap]} pointerEvents="box-none">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={panelStyle as any}>
            {header}
            <View style={{ flex: 1, backgroundColor: colors.bg }}>{view === 'home' ? home : view === 'chat' ? chatView : view === 'form' ? formView : threadView}</View>
            <Text style={styles.powered}>Sylkit · {tx('Customer support', 'Atención al cliente', 'Atendimento')}</Text>
          </KeyboardAvoidingView>
        </View>
      ) : null}
      {!open || !phone ? (
        <Pressable
          onPress={() => setOpen((o) => !o)}
          style={({ pressed }) => [fixed, styles.launcher, pressed && { transform: [{ scale: 0.95 }] }]}
          accessibilityRole="button"
          accessibilityLabel={open ? tx('Close help', 'Cerrar ayuda', 'Fechar ajuda') : tx('Help and support', 'Ayuda y soporte', 'Ajuda e suporte')}
        >
          <Ionicons name={open ? 'close' : 'chatbubble-ellipses'} size={28} color="#fff" />
          {!open && unread ? <Text style={styles.launcherBadge}>{unread}</Text> : null}
        </Pressable>
      ) : null}
    </>
  );
}

function Option({ icon, title, sub, onPress, color }: { icon: string; title: string; sub: string; onPress: () => void; color?: string }) {
  return (
    <Pressable style={({ pressed }) => [styles.option, pressed && { backgroundColor: '#F3F7FF' }]} onPress={onPress} accessibilityRole="button">
      <View style={[styles.optIcon, color ? { backgroundColor: color } : null]}>
        <Ionicons name={icon as any} size={19} color={color ? '#fff' : colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.optTitle}>{title}</Text>
        {sub ? <Text style={styles.small}>{sub}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

function Bubble({ side, text, label }: { side: 'left' | 'right'; text: string; label?: string }) {
  const right = side === 'right';
  return (
    <View style={[styles.bubbleRow, right && { alignItems: 'flex-end' }]}>
      {label ? <Text style={styles.bubbleLabel}>{label}</Text> : null}
      <View style={[styles.bubble, right ? styles.bubbleRight : styles.bubbleLeft]}>
        <Text style={[styles.bubbleText, right && { color: '#fff' }]} selectable>
          {text}
        </Text>
      </View>
    </View>
  );
}

function Composer({ value, onChange, onSend, busy, placeholder }: { value: string; onChange: (v: string) => void; onSend: () => void; busy: boolean; placeholder: string }) {
  return (
    <View style={styles.composer}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        style={styles.composerInput}
        multiline
        onKeyPress={(e: any) => {
          if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        accessibilityLabel={placeholder}
      />
      <Pressable onPress={onSend} disabled={busy || !value.trim()} style={[styles.send, (busy || !value.trim()) && { opacity: 0.4 }]} accessibilityRole="button" accessibilityLabel={tx('Send', 'Enviar', 'Enviar')}>
        <Ionicons name="arrow-up" size={20} color="#fff" />
      </Pressable>
    </View>
  );
}

function Input({ label, value, onChange, multiline, autoComplete, keyboard }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; autoComplete?: any; keyboard?: any }) {
  return (
    <View style={{ gap: 5 }}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        autoComplete={autoComplete}
        keyboardType={keyboard}
        autoCapitalize={keyboard ? 'none' : 'sentences'}
        style={[styles.input, multiline && { minHeight: 96, textAlignVertical: 'top' }]}
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  launcher: { right: 20, bottom: 20, width: 60, height: 60, borderRadius: 999, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', zIndex: 900, boxShadow: '0 12px 30px rgba(37,88,232,0.38)', elevation: 8 } as any,
  launcherBadge: { position: 'absolute', top: -2, right: -2, minWidth: 22, height: 22, borderRadius: 999, backgroundColor: '#EF4444', color: '#fff', fontSize: 12, fontWeight: '800', textAlign: 'center', lineHeight: 22, overflow: 'hidden', borderWidth: 2, borderColor: '#fff' },
  panelWrap: { right: 20, bottom: 92, zIndex: 901 },
  panelWrapPhone: { left: 0, right: 0, top: 0, bottom: 0, zIndex: 901 },
  panel: { backgroundColor: colors.surface, borderRadius: 20, overflow: 'hidden', boxShadow: '0 24px 60px rgba(15,40,90,0.28)', elevation: 12 } as any,
  panelPhone: { flex: 1, borderRadius: 0 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 14 },
  headBtn: { width: 38, height: 38, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  headTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  headStatus: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  dot: { width: 8, height: 8, borderRadius: 999 },
  headSub: { color: 'rgba(255,255,255,0.9)', fontSize: 12, flexShrink: 1 },
  body: { padding: 16, gap: 12, flexGrow: 1 },
  hello: { fontSize: 20, fontWeight: '800', color: colors.text },
  label: { fontSize: 12, fontWeight: '800', color: colors.muted, letterSpacing: 0.6, textTransform: 'uppercase', marginTop: 4 },
  small: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: '#C9D7F8', backgroundColor: colors.surface, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  options: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginTop: 4 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.border },
  optIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.softBlue, alignItems: 'center', justifyContent: 'center' },
  optTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  convCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1.5, borderColor: colors.primary, padding: 12 },
  convTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
  badge: { minWidth: 22, height: 22, borderRadius: 999, backgroundColor: '#EF4444', color: '#fff', fontSize: 12, fontWeight: '800', textAlign: 'center', lineHeight: 22, overflow: 'hidden' },
  bubbleRow: { alignItems: 'flex-start', gap: 3 },
  bubbleLabel: { fontSize: 11, fontWeight: '800', color: colors.primary, marginLeft: 6 },
  bubble: { maxWidth: '86%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleLeft: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderTopLeftRadius: 4 },
  bubbleRight: { backgroundColor: colors.primary, borderTopRightRadius: 4 },
  bubbleText: { fontSize: 14.5, lineHeight: 21, color: colors.text },
  handoff: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: colors.text, borderRadius: 999, paddingHorizontal: 14, minHeight: 38 },
  handoffText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  link: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  aiNote: { alignSelf: 'center', fontSize: 12, color: colors.muted, backgroundColor: '#EEF2F8', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, overflow: 'hidden' },
  waitCard: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: colors.softBlue, borderRadius: 12, padding: 12 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 10, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  composerInput: { flex: 1, minHeight: 44, maxHeight: 120, borderWidth: 1, borderColor: '#D5DCEA', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: colors.text, outlineStyle: 'none' } as any,
  send: { width: 44, height: 44, borderRadius: 999, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  inputLabel: { fontSize: 13, fontWeight: '700', color: colors.text },
  input: { minHeight: 46, borderWidth: 1, borderColor: '#D5DCEA', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: colors.text, backgroundColor: colors.surface, outlineStyle: 'none' } as any,
  error: { color: '#B42318', fontSize: 13, fontWeight: '600' },
  primary: { backgroundColor: colors.primary, borderRadius: 12, minHeight: 50, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  powered: { textAlign: 'center', fontSize: 11, color: colors.muted, paddingVertical: 6, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
});
