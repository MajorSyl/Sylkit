import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { tx, useLang } from '../i18n';
import { useHalo } from './motion';
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
// House style: answer first, then the key detail, then one clear next step. Short, warm, professional.
type Faq = { q?: [string, string, string]; a: [string, string, string]; keys: RegExp[]; handoff?: boolean };
const FAQ: Faq[] = [
  {
    q: ['What does Sylkit do?', '¿Qué hace Sylkit?', 'O que a Sylkit faz?'],
    keys: [/sylkit|what do you (do|sell|offer)|qué (hacen|venden|ofrecen)|que vocês (fazem|vendem|oferecem)|services?|servicios?|serviços?/i],
    a: [
      'Sylkit builds and runs cloud systems for businesses: point of sale, inventory, pharmacy, clinic, restaurant, online stores, websites and custom apps.\n\nEverything runs online, so there is nothing to install. We set it up remotely, host it, back up your data and keep it updated.\n\nNext step: open any system in the catalog to see its price and try the live demo.',
      'Sylkit crea y opera sistemas en la nube para negocios: punto de venta, inventario, farmacia, clínica, restaurante, tiendas online, páginas web y apps a medida.\n\nTodo funciona en línea, así que no hay nada que instalar. Lo configuramos a distancia, lo alojamos, respaldamos tus datos y lo mantenemos actualizado.\n\nSiguiente paso: abre cualquier sistema del catálogo para ver su precio y probar la demo en vivo.',
      'A Sylkit cria e opera sistemas na nuvem para empresas: ponto de venda, estoque, farmácia, clínica, restaurante, lojas online, sites e apps sob medida.\n\nTudo funciona online, então não há nada para instalar. Configuramos remotamente, hospedamos, fazemos backup dos seus dados e mantemos tudo atualizado.\n\nPróximo passo: abra qualquer sistema do catálogo para ver o preço e testar a demo ao vivo.',
    ],
  },
  {
    q: ['How much does it cost?', '¿Cuánto cuesta?', 'Quanto custa?'],
    keys: [/price|cost|how much|cuesta|cuánto|cuanto|precio|plan|tarifa|quanto|preço|valor/i],
    a: [
      'Each system shows its price on its own page: a monthly plan plus a one-time setup fee.\n\nPaying for the year gives you 2 months free. You can also buy a lifetime license, which includes the first 12 months of hosting, support and updates.\n\nNext step: open the system you are interested in and compare its plans.',
      'Cada sistema muestra su precio en su propia página: un plan mensual más una instalación única.\n\nSi pagas el año completo, tienes 2 meses gratis. También puedes comprar una licencia de por vida, que incluye los primeros 12 meses de alojamiento, soporte y actualizaciones.\n\nSiguiente paso: abre el sistema que te interesa y compara sus planes.',
      'Cada sistema mostra o preço na própria página: um plano mensal mais uma taxa única de instalação.\n\nPagando o ano inteiro, você ganha 2 meses grátis. Também é possível comprar uma licença vitalícia, que inclui os primeiros 12 meses de hospedagem, suporte e atualizações.\n\nPróximo passo: abra o sistema que interessa e compare os planos.',
    ],
  },
  {
    q: ['How can I pay?', '¿Cómo puedo pagar?', 'Como posso pagar?'],
    keys: [/pay|pago|pagar|card|tarjeta|cart[aã]o|paypal|usdt|crypto|cripto|transfer|m[oó]vil|orange|afrimoney|bol[ií]vares|leones/i],
    a: [
      'You choose how to pay at checkout:\n• Everywhere: PayPal or debit/credit card (on PayPal\'s secure page), or USDT crypto\n• Venezuela: Pago Móvil or bank transfer (Banco Mercantil), in bolívares at the BCV rate\n• Sierra Leone: Orange Money or Afrimoney, in leones\n\nAfter paying you get an order page where you can follow every step.',
      'Eliges cómo pagar al finalizar la compra:\n• Desde cualquier país: PayPal o tarjeta de débito/crédito (en la página segura de PayPal), o USDT en cripto\n• Venezuela: Pago Móvil o transferencia (Banco Mercantil), en bolívares a tasa BCV\n• Sierra Leona: Orange Money o Afrimoney, en leones\n\nDespués del pago recibes una página de tu pedido para seguir cada paso.',
      'Você escolhe como pagar na finalização:\n• De qualquer país: PayPal ou cartão de débito/crédito (na página segura do PayPal), ou USDT em cripto\n• Venezuela: Pago Móvil ou transferência (Banco Mercantil), em bolívares pela taxa do BCV\n• Serra Leoa: Orange Money ou Afrimoney, em leones\n\nDepois do pagamento você recebe uma página do pedido para acompanhar cada etapa.',
    ],
  },
  {
    q: ['Can I try it first?', '¿Puedo probarlo antes?', 'Posso testar antes?'],
    keys: [/demo|try|test|prob|prueba|testar|see it|verlo|ver como/i],
    a: [
      'Yes. Most systems have a free live demo with sample data, so you can use it before you pay.\n\nOpen the system and tap "Try the live demo". Design templates have a live preview too.',
      'Sí. La mayoría de los sistemas tienen una demo en vivo gratis con datos de ejemplo, para que lo uses antes de pagar.\n\nAbre el sistema y toca "Probar demo en vivo". Las plantillas de diseño también tienen vista previa.',
      'Sim. A maioria dos sistemas tem uma demo ao vivo grátis com dados de exemplo, para você usar antes de pagar.\n\nAbra o sistema e toque em "Testar demo ao vivo". Os modelos de design também têm prévia.',
    ],
  },
  {
    q: ['How long does setup take?', '¿Cuánto tarda la instalación?', 'Quanto tempo leva a instalação?'],
    keys: [/how long|when|setup|set up|install|deliver|tarda|tiempo|cu[aá]ndo|entrega|instal|demora|prazo|quando/i],
    a: [
      'It depends on the system and the extras you choose. Ready-made systems are the fastest, and custom projects take longer.\n\nWe confirm your exact delivery date when we confirm your order, and you can follow every step on your order page.',
      'Depende del sistema y de los extras que elijas. Los sistemas listos son los más rápidos, y los proyectos a medida toman más tiempo.\n\nTe confirmamos la fecha exacta de entrega al confirmar tu pedido, y puedes seguir cada paso en la página de tu pedido.',
      'Depende do sistema e dos extras que você escolher. Os sistemas prontos são os mais rápidos, e os projetos sob medida levam mais tempo.\n\nConfirmamos a data exata de entrega quando confirmamos seu pedido, e você acompanha cada etapa na página do pedido.',
    ],
  },
  {
    q: ['Do I need to install anything?', '¿Tengo que instalar algo?', 'Preciso instalar algo?'],
    keys: [/cloud|nube|nuvem|install|instalar|internet|offline|computer|computadora|phone|tel[eé]fono|celular|device|backup|respaldo|data|datos|dados|secure|segur/i],
    a: [
      'No. Sylkit systems run in the cloud and work on phone, tablet or computer, wherever you are.\n\nYour data is stored securely and backed up automatically, so a broken or lost device does not mean lost records. Updates and support happen remotely.',
      'No. Los sistemas de Sylkit funcionan en la nube y sirven en teléfono, tablet o computadora, donde estés.\n\nTus datos se guardan de forma segura y se respaldan automáticamente, así que si un equipo se daña o se pierde, no pierdes tu información. Las actualizaciones y el soporte se hacen a distancia.',
      'Não. Os sistemas da Sylkit funcionam na nuvem, no celular, tablet ou computador, onde você estiver.\n\nSeus dados ficam guardados com segurança e com backup automático, então um aparelho quebrado ou perdido não significa perder informações. Atualizações e suporte são feitos remotamente.',
    ],
  },
  {
    q: ['Do you build custom systems?', '¿Hacen sistemas a medida?', 'Vocês fazem sistemas sob medida?'],
    keys: [/custom|medida|personaliz|special|especial|sob medida|my own|propio|app|website|web|p[aá]gina|site|tienda|store|loja/i],
    a: [
      'Yes. We build custom systems, websites, online stores and mobile apps.\n\nTell us what you need on the "Custom system" page, and we reply with a quote, usually within 24 hours.',
      'Sí. Creamos sistemas a medida, páginas web, tiendas online y apps móviles.\n\nCuéntanos qué necesitas en la página "Sistema a medida" y te respondemos con una cotización, normalmente en menos de 24 horas.',
      'Sim. Criamos sistemas sob medida, sites, lojas online e apps móveis.\n\nConte o que você precisa na página "Sistema sob medida" e respondemos com um orçamento, normalmente em até 24 horas.',
    ],
  },
  {
    q: ['Where is my order?', '¿Dónde está mi pedido?', 'Onde está meu pedido?'],
    keys: [/track|order|status|seguir|pedido|estado|orden|acompanhar|my purchase|mi compra/i],
    a: [
      'You can check your order at any time on the "Track my order" page with your order number and email.\n\nIf something looks wrong with an order or a payment, tap "Talk to a person" and our team will look into it.',
      'Puedes revisar tu pedido en cualquier momento en la página "Seguir mi pedido" con tu número de pedido y tu correo.\n\nSi algo no se ve bien con un pedido o un pago, toca "Hablar con una persona" y nuestro equipo lo revisa.',
      'Você pode ver seu pedido a qualquer momento na página "Acompanhar meu pedido" com o número do pedido e seu e-mail.\n\nSe algo parecer errado com um pedido ou pagamento, toque em "Falar com uma pessoa" e nossa equipe verifica.',
    ],
  },
  {
    keys: [/account|sign ?in|log ?in|login|register|sign ?up|cuenta|registr|iniciar sesi[oó]n|entrar|conta|cadastr|password|contraseña|senha/i],
    a: [
      'You can create your Sylkit account with Google or with your email. There is no password to remember: we send you a secure sign-in link.\n\nIf you cannot get in, tap "Talk to a person" and we will help you.',
      'Puedes crear tu cuenta de Sylkit con Google o con tu correo. No hay contraseña que recordar: te enviamos un enlace seguro para entrar.\n\nSi no puedes entrar, toca "Hablar con una persona" y te ayudamos.',
      'Você pode criar sua conta Sylkit com o Google ou com seu e-mail. Não há senha para lembrar: enviamos um link seguro para entrar.\n\nSe não conseguir entrar, toque em "Falar com uma pessoa" e ajudamos você.',
    ],
  },
  {
    keys: [/support|soporte|suporte|help after|maintenance|mantenimiento|manuten|update|actualiz|atualiz|hours|horario|hor[aá]rio/i],
    a: [
      'Every plan includes support, updates and hosting. Our team answers Monday to Saturday, 9am to 6pm (Caracas time), and messages sent outside those hours are answered the next business day.\n\nYou can always reach us here or on WhatsApp.',
      'Todos los planes incluyen soporte, actualizaciones y alojamiento. Nuestro equipo atiende de lunes a sábado, de 9 am a 6 pm (hora de Caracas), y los mensajes fuera de ese horario se responden el siguiente día hábil.\n\nSiempre puedes escribirnos aquí o por WhatsApp.',
      'Todos os planos incluem suporte, atualizações e hospedagem. Nossa equipe atende de segunda a sábado, das 9h às 18h (horário de Caracas), e mensagens fora desse horário são respondidas no próximo dia útil.\n\nVocê sempre pode falar com a gente aqui ou pelo WhatsApp.',
    ],
  },
  {
    keys: [/refund|reembols|devoluc|devolu[cç][aã]o|cancel|guarantee|garant[ií]a|garantia|problem|problema|not working|no funciona|não funciona|error|falla|complain|queja|reclama/i],
    handoff: true,
    a: [
      'I am sorry for the trouble. Refunds, cancellations and problems with an order are handled personally by our team, so you get a precise answer.\n\nTap "Talk to a person" below and include your order number if you have it.',
      'Lamento el inconveniente. Los reembolsos, cancelaciones y problemas con un pedido los atiende nuestro equipo personalmente, para darte una respuesta precisa.\n\nToca "Hablar con una persona" aquí abajo e incluye tu número de pedido si lo tienes.',
      'Sinto muito pelo transtorno. Reembolsos, cancelamentos e problemas com um pedido são tratados pessoalmente pela nossa equipe, para você ter uma resposta precisa.\n\nToque em "Falar com uma pessoa" abaixo e inclua o número do pedido, se tiver.',
    ],
  },
];

const GREETING = /^\s*(hi|hello|hey|hola|buenas|buenos d[ií]as|buenas tardes|buenas noches|ol[aá]|oi|bom dia|boa tarde|boa noite)[\s!.,¡]*$/i;
const THANKS = /^\s*(thanks?|thank you|ok|okay|gracias|muchas gracias|obrigad[oa]|vale|perfecto|perfeito|great|genial)[\s!.,]*$/i;

// Picks the answer whose keywords match the question best (null when nothing fits).
function bestAnswer(q: string): Faq | null {
  let best: Faq | null = null;
  let score = 0;
  for (const f of FAQ) {
    const s = f.keys.reduce((n, k) => n + ((q.match(new RegExp(k.source, 'gi')) || []).length), 0);
    if (s > score) {
      score = s;
      best = f;
    }
  }
  return best;
}

export function HelpWidget() {
  const { lang } = useLang();
  const router = useRouter();
  const pathname = usePathname() || '/';
  const { width } = useWindowDimensions();
  const phone = width < 640;
  const L = (v: [string, string, string]) => (lang === 'es' ? v[1] : lang === 'pt' ? v[2] : v[0]);

  const [open, setOpen] = useState(false);
  const halo = useHalo(3);
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
  const hidden = pathname.startsWith('/backend');

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
      if (GREETING.test(q)) {
        reply = tx(
          'Hello, and welcome to Sylkit. I can help with our systems, prices, demos, payments and orders. What would you like to know?',
          'Hola, bienvenido a Sylkit. Puedo ayudarte con nuestros sistemas, precios, demos, pagos y pedidos. ¿Qué te gustaría saber?',
          'Olá, bem-vindo à Sylkit. Posso ajudar com nossos sistemas, preços, demos, pagamentos e pedidos. O que você gostaria de saber?',
        );
      } else if (THANKS.test(q)) {
        reply = tx(
          'You are welcome. If anything else comes up, I am here, or you can talk to our team directly.',
          'Con gusto. Si surge algo más, aquí estoy, o puedes hablar directamente con nuestro equipo.',
          'Por nada. Se surgir mais alguma coisa, estou aqui, ou você pode falar direto com nossa equipe.',
        );
      } else {
        const hit = bestAnswer(q);
        reply = hit
          ? L(hit.a)
          : tx(
              'Thank you for your question. To give you an accurate answer, I will connect you with our team.\n\nTap "Talk to a person" below, and we will reply as soon as possible.',
              'Gracias por tu pregunta. Para darte una respuesta precisa, te pongo en contacto con nuestro equipo.\n\nToca "Hablar con una persona" aquí abajo y te responderemos lo antes posible.',
              'Obrigado pela pergunta. Para dar uma resposta precisa, vou colocar você em contato com nossa equipe.\n\nToque em "Falar com uma pessoa" abaixo e responderemos o quanto antes.',
            );
        handoff = !hit || !!hit.handoff;
      }
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
      <Text style={styles.hello}>{tx('Hello. How can we help you today?', 'Hola. ¿En qué podemos ayudarte hoy?', 'Olá. Como podemos ajudar hoje?')}</Text>
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
        {FAQ.filter((f) => f.q).slice(0, 6).map((f) => (
          <Pressable key={f.q![0]} style={styles.chip} onPress={() => ask(L(f.q!))} accessibilityRole="button">
            <Text style={styles.chipText}>{L(f.q!)}</Text>
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
        <Bubble side="left" text={tx("Hello, I'm the Sylkit assistant. I can answer questions about our systems, prices, demos, payments and orders. How can I help you today?", 'Hola, soy el asistente de Sylkit. Puedo responder tus preguntas sobre nuestros sistemas, precios, demos, pagos y pedidos. ¿En qué puedo ayudarte hoy?', 'Olá, sou o assistente da Sylkit. Posso responder suas perguntas sobre nossos sistemas, preços, demos, pagamentos e pedidos. Como posso ajudar hoje?')} />
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
          {!open ? <Animated.View pointerEvents="none" style={[styles.halo, halo]} /> : null}
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
  launcher: { right: 20, bottom: 20, width: 60, height: 60, borderRadius: 999, backgroundColor: colors.primary, backgroundImage: 'linear-gradient(145deg,#3D7BFF 0%,#2558E8 55%,#1E46C4 100%)', alignItems: 'center', justifyContent: 'center', zIndex: 900, boxShadow: '0 12px 30px rgba(37,88,232,0.38), inset 0 1px 0 rgba(255,255,255,0.35)', elevation: 8 } as any,
  halo: { position: 'absolute', top: 0, left: 0, width: 60, height: 60, borderRadius: 999, backgroundColor: colors.primary },
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
