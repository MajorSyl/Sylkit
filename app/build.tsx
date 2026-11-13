import { useLocalSearchParams, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { Ionicons } from '@expo/vector-icons';
import { createElement, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Footer } from '../src/components/Footer';
import { Header } from '../src/components/Header';
import { tx, useLang } from '../src/i18n';
import { useClientWidth } from '../src/lib/useClientWidth';
import { colors, shadow, waLink } from '../src/theme';

// Sylkit AI Builder: describe your business → AI writes the website → preview and change it by chat
// → choose the address (name.sylkit.com) → publish through the normal checkout ($7/month or $70/year).
// The site id and its secret edit token are kept in this browser (localStorage 'sk_build') and in the
// edit link, which also goes on the order. API: worker/build.js.

type Site = { name: string; icon: string; lang: string };
type Build = { id: string; token: string; slug?: string };
type Media = { logo: string; photos: string[] };
type Info = {
  site: Site | null;
  slug: string | null;
  live: boolean;
  url: string | null;
  order_number: string | null;
  media?: Media;
  domain?: string | null;
  domain_status?: string | null;
  target?: string;
};
type Question = { id: string; q: string; placeholder: string };
const STYLES = [
  { id: 'auto', es: 'Que elija la IA', en: 'Let AI choose', pt: 'A IA escolhe', colors: ['#2558e8', '#c2552d', '#0f766e'] },
  { id: 'clean', es: 'Limpio', en: 'Clean', pt: 'Limpo', colors: ['#ffffff', '#0f172a', '#2558e8'] },
  { id: 'warm', es: 'Cálido', en: 'Warm', pt: 'Acolhedor', colors: ['#fbf7f1', '#2a1d14', '#c2552d'] },
  { id: 'bold', es: 'Llamativo', en: 'Bold', pt: 'Marcante', colors: ['#0e0e0e', '#ffffff', '#e11d48'] },
  { id: 'elegant', es: 'Elegante', en: 'Elegant', pt: 'Elegante', colors: ['#faf9f7', '#1b1a18', '#a16207'] },
  { id: 'fresh', es: 'Fresco', en: 'Fresh', pt: 'Leve', colors: ['#f2f7f6', '#0d1f1c', '#0d9488'] },
];
const FALLBACK_Q: Record<'es' | 'en' | 'pt', Question[]> = {
  es: [
    { id: 'name', q: '¿Cómo se llama tu negocio?', placeholder: 'Ej.: Panadería Dulce Hogar' },
    { id: 'offer', q: '¿Qué vendes u ofreces? Si quieres, con precios.', placeholder: 'Ej.: Pan canilla $1, tortas desde $15' },
    { id: 'where', q: '¿Dónde estás?', placeholder: 'Ej.: Calle Principal de Petare, Caracas' },
    { id: 'hours', q: '¿Cuál es tu horario?', placeholder: 'Ej.: Lunes a sábado de 7:00 a 19:00' },
    { id: 'contact', q: '¿Tu WhatsApp y redes sociales?', placeholder: 'Ej.: 0414 123 4567 · Instagram @minegocio' },
  ],
  en: [
    { id: 'name', q: "What's your business called?", placeholder: 'e.g. Sunrise Bakery' },
    { id: 'offer', q: 'What do you sell or offer? Add prices if you like.', placeholder: 'e.g. Bread $1, custom cakes from $15' },
    { id: 'where', q: 'Where are you located?', placeholder: 'e.g. 12 Wilkinson Road, Freetown' },
    { id: 'hours', q: 'What are your opening hours?', placeholder: 'e.g. Monday to Saturday, 7am to 7pm' },
    { id: 'contact', q: 'Your WhatsApp and social media?', placeholder: 'e.g. +232 76 123 456 · Instagram @mybusiness' },
  ],
  pt: [
    { id: 'name', q: 'Qual é o nome do seu negócio?', placeholder: 'Ex.: Padaria Pão Quente' },
    { id: 'offer', q: 'O que você vende ou oferece? Com preços, se quiser.', placeholder: 'Ex.: Pão francês R$1, bolos a partir de R$50' },
    { id: 'where', q: 'Onde você fica?', placeholder: 'Ex.: Rua das Flores, 120, Campinas' },
    { id: 'hours', q: 'Qual é o seu horário?', placeholder: 'Ex.: Segunda a sábado, das 6h às 20h' },
    { id: 'contact', q: 'Seu WhatsApp e redes sociais?', placeholder: 'Ex.: (19) 99876-5432 · Instagram @meunegocio' },
  ],
};

// Shrinks a photo in the browser before upload (fast on slow connections, fits the storage limit).
async function shrink(file: File, max: number, type: 'image/jpeg' | 'image/png'): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error('encode'))), type, 0.82));
}

const KEY = 'sk_build';
const PRICE = '$7';
const load = (): Build | null => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || 'null');
    return v?.id && v?.token ? v : null;
  } catch {
    return null;
  }
};
const save = (b: Build | null) => {
  try {
    if (b) localStorage.setItem(KEY, JSON.stringify(b));
    else localStorage.removeItem(KEY);
  } catch {
    /* private mode: the edit link still works */
  }
};

const EXAMPLES = {
  es: [
    'Panadería familiar en Petare, Caracas. Hacemos pan, cachitos y tortas por encargo. Abrimos de lunes a sábado de 6 a 7. WhatsApp 0414 123 4567.',
    'Barbería moderna en Freetown. Cortes, barba y tintes. Atendemos con cita por WhatsApp +232 76 000 000. Instagram @barberiafresh.',
    'Taller mecánico en Valencia: frenos, cambio de aceite, diagnóstico computarizado y aire acondicionado. Llámanos al 0241 000 0000.',
  ],
  en: [
    'Family bakery in Freetown. Fresh bread, pastries and custom cakes. Open Monday to Saturday 7am to 6pm. WhatsApp +232 76 123 456.',
    'Modern barbershop in Lagos. Haircuts, beard trims and dyes. Book on WhatsApp +234 800 000 0000. Instagram @freshcuts.',
    'Car repair shop: brakes, oil changes, computer diagnostics and AC. Call +1 305 000 0000.',
  ],
  pt: [
    'Padaria familiar em São Paulo. Pães, salgados e bolos sob encomenda. Aberta de segunda a sábado, das 6h às 19h. WhatsApp (11) 90000-0000.',
    'Barbearia moderna no Rio. Cortes, barba e coloração. Agende pelo WhatsApp (21) 90000-0000. Instagram @barbeariafresh.',
    'Oficina mecânica: freios, troca de óleo, diagnóstico e ar-condicionado. Ligue (31) 3000-0000.',
  ],
};
const QUICK = {
  es: ['Cambia el color a azul', 'Hazlo más elegante', 'Agrega una sección de precios', 'Textos más cortos', 'Agrega preguntas frecuentes'],
  en: ['Make the color blue', 'Make it more elegant', 'Add a prices section', 'Shorter texts', 'Add an FAQ'],
  pt: ['Mude a cor para azul', 'Deixe mais elegante', 'Adicione uma seção de preços', 'Textos mais curtos', 'Adicione perguntas frequentes'],
};

function errorText(code: string) {
  switch (code) {
    case 'prompt_too_short':
      return tx('Tell us a bit more: what your business does, where it is and how people contact you.', 'Cuéntanos un poco más: qué hace tu negocio, dónde está y cómo te contactan.', 'Conte um pouco mais: o que seu negócio faz, onde fica e como entram em contato.');
    case 'not_allowed':
      return tx("We can't create sites that look like banks, payment apps or other brands, or that ask for passwords.", 'No podemos crear sitios que parezcan de bancos, apps de pago u otras marcas, ni que pidan contraseñas.', 'Não podemos criar sites que pareçam de bancos, apps de pagamento ou outras marcas, nem que peçam senhas.');
    case 'rate_limited':
      return tx("You've reached today's limit of free tries. Come back tomorrow, or message us and we'll help you.", 'Llegaste al límite de pruebas gratis de hoy. Vuelve mañana o escríbenos y te ayudamos.', 'Você atingiu o limite de testes grátis de hoje. Volte amanhã ou fale com a gente.');
    case 'edit_limit':
      return tx('This website has reached its limit of AI changes. Message us and we will make the changes for you.', 'Este sitio llegó a su límite de cambios con IA. Escríbenos y hacemos los cambios por ti.', 'Este site atingiu o limite de mudanças com IA. Fale com a gente e fazemos as mudanças.');
    case 'too_big':
    case 'not_an_image':
      return tx('That file is not a photo we can use. Try a JPG or PNG.', 'Ese archivo no es una foto que podamos usar. Prueba con JPG o PNG.', 'Esse arquivo não é uma foto que possamos usar. Tente JPG ou PNG.');
    case 'too_many':
      return tx('You can add up to 8 photos. Remove one to add another.', 'Puedes agregar hasta 8 fotos. Quita una para agregar otra.', 'Você pode adicionar até 8 fotos. Remova uma para adicionar outra.');
    case 'invalid_domain':
      return tx('Write your domain like www.yourbusiness.com', 'Escribe tu dominio así: www.tunegocio.com', 'Escreva seu domínio assim: www.seunegocio.com');
    case 'domain_taken':
      return tx('That domain is already connected to another website.', 'Ese dominio ya está conectado a otra web.', 'Esse domínio já está conectado a outro site.');
    case 'taken':
      return tx('That address is taken. Try another one.', 'Esa dirección ya está ocupada. Prueba otra.', 'Esse endereço já está em uso. Tente outro.');
    case 'reserved':
    case 'invalid':
      return tx('Use 3 to 30 letters, numbers or dashes.', 'Usa de 3 a 30 letras, números o guiones.', 'Use de 3 a 30 letras, números ou hífens.');
    default:
      return tx('The AI is busy right now. Please try again in a moment.', 'La IA está ocupada en este momento. Intenta de nuevo en un momento.', 'A IA está ocupada agora. Tente de novo em instantes.');
  }
}

async function api(path: string, body?: object) {
  const r = await fetch(`/api/build/${path}`, body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : undefined);
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, ...j } as any;
}

export default function BuildPage() {
  const { lang } = useLang();
  const L = (lang === 'pt' || lang === 'en' ? lang : 'es') as 'es' | 'en' | 'pt';
  const router = useRouter();
  const params = useLocalSearchParams<{ site?: string; t?: string }>();
  const width = useClientWidth();
  const wide = width >= 1000;

  const [build, setBuild] = useState<Build | null>(null);
  const [info, setInfo] = useState<Info | null>(null);
  const [prompt, setPrompt] = useState('');
  const [instruction, setInstruction] = useState('');
  const [slug, setSlug] = useState('');
  const [busy, setBusy] = useState<'' | 'ask' | 'generate' | 'edit' | 'publish' | 'upload' | 'domain'>('');
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [style, setStyle] = useState('auto');
  const [media, setMedia] = useState<Media>({ logo: '', photos: [] });
  const [domainInput, setDomainInput] = useState('');
  const logoInput = useRef<any>(null);
  const photoInput = useRef<any>(null);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  const [device, setDevice] = useState<'desktop' | 'phone'>('desktop');
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const scroller = useRef<ScrollView>(null);

  // Open a saved site: from the edit link (?site=&t=) or from this browser.
  const open = useCallback(async (b: Build) => {
    const j = await api(`site?id=${b.id}&t=${b.token}`);
    if (!j.ok) return false;
    const next = { ...b, slug: j.slug || b.slug };
    setBuild(next);
    save(next);
    if (j.media) setMedia(j.media);
    if (j.pending) {
      // Started but not created yet: ask the questions again.
      setQuestions(FALLBACK_Q[L]);
      setInfo(null);
      return true;
    }
    setInfo(j);
    setSlug(j.slug || b.slug || j.suggested || '');
    setVersion((v) => v + 1);
    return true;
  }, [L]);
  useEffect(() => {
    const fromLink = params.site && params.t ? { id: String(params.site), token: String(params.t) } : null;
    const saved = load();
    const b = fromLink || saved;
    if (b) open(b).then((ok) => !ok && save(null));
  }, [params.site, params.t, open]);

  // Rotating progress messages while the AI writes (it can take up to a minute on free models).
  useEffect(() => {
    if (busy !== 'generate') return;
    setStep(0);
    const id = setInterval(() => setStep((s) => s + 1), 4000);
    return () => clearInterval(id);
  }, [busy]);
  const steps = [
    tx('Reading about your business…', 'Leyendo sobre tu negocio…', 'Lendo sobre o seu negócio…'),
    tx('Writing your texts…', 'Escribiendo tus textos…', 'Escrevendo seus textos…'),
    tx('Choosing colors and style…', 'Eligiendo colores y estilo…', 'Escolhendo cores e estilo…'),
    tx('Putting your website together…', 'Armando tu sitio web…', 'Montando seu site…'),
    tx('Almost ready…', 'Ya casi…', 'Quase pronto…'),
  ];

  // Step 1: the short description → the AI's follow-up questions.
  const ask = async () => {
    setError('');
    if (prompt.trim().length < 8) return setError(errorText('prompt_too_short'));
    setBusy('ask');
    const j = await api('start', { prompt: prompt.trim(), lang: L }).catch(() => ({ ok: false }));
    setBusy('');
    if (!j.ok) return setError(errorText(j.error));
    const b = { id: j.id, token: j.token };
    setBuild(b);
    save(b);
    setQuestions(j.questions?.length ? j.questions : FALLBACK_Q[L]);
    setAnswers({});
    scroller.current?.scrollTo({ y: 0, animated: true });
  };

  // Step 2: answers + style + photos → the website.
  const generate = async () => {
    if (!build) return;
    setError('');
    setBusy('generate');
    const list = (questions ?? []).map((q) => ({ q: q.q, a: answers[q.id] || '' }));
    const j = await api('generate', { id: build.id, token: build.token, answers: list, style: style === 'auto' ? '' : style }).catch(() => ({ ok: false }));
    setBusy('');
    if (!j.ok) return setError(errorText(j.error));
    const b = { ...build, slug: j.slug };
    setBuild(b);
    save(b);
    setQuestions(null);
    setInfo({ site: j.site, slug: null, live: false, url: null, order_number: null, media });
    setSlug(j.slug || '');
    setVersion((v) => v + 1);
    scroller.current?.scrollTo({ y: 0, animated: true });
  };

  const edit = async (text?: string) => {
    const change = (text ?? instruction).trim();
    if (!build || change.length < 2) return;
    setError('');
    setBusy('edit');
    const j = await api('edit', { id: build.id, token: build.token, instruction: change }).catch(() => ({ ok: false }));
    setBusy('');
    if (!j.ok) return setError(errorText(j.error));
    setInstruction('');
    setInfo((i) => (i ? { ...i, site: j.site } : i));
    setVersion((v) => v + 1);
  };

  const publish = async () => {
    if (!build) return;
    setError('');
    setBusy('publish');
    const j = await api('slug', { id: build.id, token: build.token, slug }).catch(() => ({ ok: false }));
    setBusy('');
    if (!j.ok) {
      if (j.suggestion) setSlug(j.suggestion);
      return setError(errorText(j.error));
    }
    const b = { ...build, slug: j.slug };
    setBuild(b);
    save(b);
    router.push('/checkout?product=web-con-ia&plan=starter&billing=monthly' as any);
  };

  const startOver = () => {
    save(null);
    setBuild(null);
    setInfo(null);
    setQuestions(null);
    setMedia({ logo: '', photos: [] });
    setPrompt('');
    setError('');
  };

  const pickFiles = (kind: 'logo' | 'photo') => (kind === 'logo' ? logoInput : photoInput).current?.click();
  const onFiles = async (kind: 'logo' | 'photo', files: FileList | null) => {
    if (!build || !files?.length) return;
    setError('');
    setBusy('upload');
    try {
      const list = Array.from(files).slice(0, kind === 'logo' ? 1 : 8 - media.photos.length);
      for (const f of list) {
        const blob = await shrink(f, kind === 'logo' ? 512 : 1600, kind === 'logo' ? 'image/png' : 'image/jpeg').catch(() => f);
        const r = await fetch(`/api/build/upload?id=${build.id}&t=${build.token}&kind=${kind}`, { method: 'POST', body: blob });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) {
          setError(errorText(j.error));
          break;
        }
        setMedia(j.media);
      }
      setVersion((v) => v + 1);
    } finally {
      setBusy('');
      if (logoInput.current) logoInput.current.value = '';
      if (photoInput.current) photoInput.current.value = '';
    }
  };
  const removeMedia = async (url: string) => {
    if (!build) return;
    const j = await api('unmedia', { id: build.id, token: build.token, url }).catch(() => ({ ok: false }));
    if (j.ok) {
      setMedia(j.media);
      setVersion((v) => v + 1);
    }
  };
  const connectDomain = async (host: string) => {
    if (!build) return;
    setError('');
    setBusy('domain');
    const j = await api('domain', { id: build.id, token: build.token, hostname: host }).catch(() => ({ ok: false }));
    setBusy('');
    if (!j.ok) return setError(errorText(j.error));
    setInfo((i) => (i ? { ...i, domain: j.domain, domain_status: j.status ?? null, target: j.target ?? i.target } : i));
    if (!host) setDomainInput('');
  };

  // Hidden file pickers (web).
  const fileInputs =
    Platform.OS === 'web'
      ? [
          createElement('input', { key: 'l', ref: logoInput, type: 'file', accept: 'image/*', style: { display: 'none' }, onChange: (e: any) => onFiles('logo', e.target.files) }),
          createElement('input', { key: 'p', ref: photoInput, type: 'file', accept: 'image/*', multiple: true, style: { display: 'none' }, onChange: (e: any) => onFiles('photo', e.target.files) }),
        ]
      : null;

  // Logo + photos picker, used before creating and in the editor.
  const mediaBox = (
    <View style={{ gap: 10 }}>
      {fileInputs}
      <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <Pressable onPress={() => pickFiles('logo')} style={styles.upBox} accessibilityRole="button">
          {media.logo ? createElement('img', { src: media.logo, alt: '', style: { width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12 } }) : (
            <>
              <Ionicons name="image-outline" size={22} color={colors.primary} />
              <Text style={styles.upText}>{tx('Logo', 'Logo', 'Logo')}</Text>
            </>
          )}
        </Pressable>
        {media.photos.map((u) => (
          <View key={u} style={styles.upBox}>
            {createElement('img', { src: u, alt: '', style: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 } })}
            <Pressable onPress={() => removeMedia(u)} style={styles.upX} accessibilityRole="button" accessibilityLabel={tx('Remove photo', 'Quitar foto', 'Remover foto')}>
              <Ionicons name="close" size={14} color="#fff" />
            </Pressable>
          </View>
        ))}
        {media.photos.length < 8 ? (
          <Pressable onPress={() => pickFiles('photo')} style={styles.upBox} accessibilityRole="button">
            {busy === 'upload' ? <ActivityIndicator color={colors.primary} /> : <Ionicons name="camera-outline" size={22} color={colors.primary} />}
            <Text style={styles.upText}>{tx('Photos', 'Fotos', 'Fotos')}</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.small}>{tx('Your logo and up to 8 photos of your business, products or team. The first photo goes at the top.', 'Tu logo y hasta 8 fotos de tu negocio, productos o equipo. La primera foto va arriba.', 'Seu logo e até 8 fotos do seu negócio, produtos ou equipe. A primeira foto vai no topo.')}</Text>
    </View>
  );

  const editLink = build ? `https://sylkit.com/build?site=${build.id}&t=${build.token}` : '';
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(editLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const previewUrl = build ? `/api/build/preview?id=${build.id}&t=${build.token}&v=${version}` : '';
  const frame =
    Platform.OS === 'web' && build
      ? createElement('iframe', {
          key: previewUrl,
          src: previewUrl,
          title: tx('Website preview', 'Vista previa del sitio', 'Prévia do site'),
          style: { width: '100%', height: '100%', border: 0, display: 'block', background: '#fff' },
        })
      : null;

  // ---------- questions screen ----------
  if (build && !info?.site && questions) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <Head>
          <title>{tx('A few questions · Sylkit AI Builder', 'Unas preguntas · Sylkit AI Builder', 'Algumas perguntas · Sylkit AI Builder')}</title>
          <meta name="robots" content="noindex" />
        </Head>
        <Header />
        <ScrollView ref={scroller} contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.startWrap}>
            <View style={styles.badge}>
              <Ionicons name="chatbubbles-outline" size={14} color={colors.primary} />
              <Text style={styles.badgeText}>{tx('Step 2 of 3', 'Paso 2 de 3', 'Passo 2 de 3')}</Text>
            </View>
            <Text style={[styles.h1, { fontSize: 32 }]}>{tx('A few quick questions', 'Unas preguntas rápidas', 'Algumas perguntas rápidas')}</Text>
            <Text style={styles.lead}>{tx('Answer what you can. You can skip any question.', 'Responde lo que puedas. Puedes saltar cualquier pregunta.', 'Responda o que puder. Você pode pular qualquer pergunta.')}</Text>

            <View style={[styles.promptCard, shadow, { gap: 16 }]}>
              {questions.map((q, i) => (
                <View key={q.id} style={{ gap: 6 }}>
                  <Text style={styles.qLabel}>
                    {i + 1}. {q.q}
                  </Text>
                  <TextInput
                    value={answers[q.id] || ''}
                    onChangeText={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
                    placeholder={q.placeholder}
                    placeholderTextColor="#9AA6BC"
                    multiline
                    maxLength={600}
                    style={styles.qInput}
                  />
                </View>
              ))}
            </View>

            <View style={[styles.promptCard, shadow]}>
              <Text style={styles.qLabel}>{tx('Your logo and photos (optional)', 'Tu logo y fotos (opcional)', 'Seu logo e fotos (opcional)')}</Text>
              {mediaBox}
            </View>

            <View style={[styles.promptCard, shadow]}>
              <Text style={styles.qLabel}>{tx('Which style do you like?', '¿Qué estilo te gusta?', 'Qual estilo você prefere?')}</Text>
              <View style={styles.chips}>
                {STYLES.map((st) => {
                  const on = style === st.id;
                  return (
                    <Pressable key={st.id} onPress={() => setStyle(st.id)} style={[styles.styleChip, on && styles.styleOn]} accessibilityRole="radio" accessibilityState={{ checked: on }}>
                      <View style={{ flexDirection: 'row' }}>
                        {st.colors.map((c, k) => (
                          <View key={k} style={[styles.dot, { backgroundColor: c, marginLeft: k ? -6 : 0 }]} />
                        ))}
                      </View>
                      <Text style={[styles.chipText, on && { color: colors.primary }]}>{st[L]}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable onPress={generate} disabled={busy === 'generate' || busy === 'upload'} style={[styles.primary, { alignSelf: 'stretch' }, busy === 'generate' && { opacity: 0.85 }]} accessibilityRole="button">
              {busy === 'generate' ? <ActivityIndicator color="#fff" /> : <Ionicons name="sparkles" size={18} color="#fff" />}
              <Text style={styles.primaryText}>{busy === 'generate' ? steps[step % steps.length] : tx('Create my website', 'Crear mi web', 'Criar meu site')}</Text>
            </Pressable>
            <Pressable onPress={startOver} accessibilityRole="button">
              <Text style={[styles.small, { textDecorationLine: 'underline' }]}>{tx('Change my description', 'Cambiar mi descripción', 'Mudar minha descrição')}</Text>
            </Pressable>
          </View>
          <Footer />
        </ScrollView>
      </View>
    );
  }

  // ---------- start screen ----------
  if (!build || !info?.site) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <Head>
          <title>{tx('Build your website with AI · Sylkit', 'Crea tu web con IA · Sylkit', 'Crie seu site com IA · Sylkit')}</title>
          <meta name="description" content={tx('Describe your business and get a professional website in a minute. Free to try. Publish for $7/month.', 'Describe tu negocio y obtén un sitio web profesional en un minuto. Gratis para probar. Publica por $7 al mes.', 'Descreva seu negócio e tenha um site profissional em um minuto. Grátis para testar. Publique por $7/mês.')} />
        </Head>
        <Header />
        <ScrollView ref={scroller} contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.startWrap}>
            <View style={styles.badge}>
              <Ionicons name="sparkles" size={14} color={colors.primary} />
              <Text style={styles.badgeText}>Sylkit AI Builder</Text>
            </View>
            <Text style={styles.h1}>{tx('Build your website with AI', 'Crea tu web con IA', 'Crie seu site com IA')}</Text>
            <Text style={styles.lead}>
              {tx('Describe your business in a few lines. In about a minute you get a professional website, ready for WhatsApp. Free to try.', 'Describe tu negocio en pocas líneas. En un minuto tienes una web profesional, lista para WhatsApp. Gratis para probar.', 'Descreva seu negócio em poucas linhas. Em um minuto você tem um site profissional, pronto para o WhatsApp. Grátis para testar.')}
            </Text>

            <View style={[styles.promptCard, shadow]}>
              <TextInput
                value={prompt}
                onChangeText={setPrompt}
                multiline
                maxLength={1500}
                editable={busy !== 'ask'}
                placeholder={tx('Example: Family bakery in Freetown. Bread, pastries and custom cakes. Open Mon–Sat 7am–6pm. WhatsApp +232 76 123 456.', 'Ejemplo: Panadería familiar en Petare. Pan, cachitos y tortas por encargo. Abrimos de lunes a sábado de 6 a 7. WhatsApp 0414 123 4567.', 'Exemplo: Padaria familiar em São Paulo. Pães, salgados e bolos sob encomenda. Aberta de seg. a sáb. das 6h às 19h. WhatsApp (11) 90000-0000.')}
                placeholderTextColor="#9AA6BC"
                style={styles.promptInput}
                accessibilityLabel={tx('Describe your business', 'Describe tu negocio', 'Descreva seu negócio')}
              />
              <Text style={styles.hint}>
                {tx('A sentence or two is enough. Next, the AI asks you a few quick questions and you can add your logo and photos.', 'Con una o dos frases basta. Después la IA te hace unas preguntas rápidas y puedes agregar tu logo y fotos.', 'Uma ou duas frases bastam. Depois a IA faz algumas perguntas rápidas e você pode adicionar seu logo e fotos.')}
              </Text>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Pressable onPress={ask} disabled={busy === 'ask'} style={[styles.primary, busy === 'ask' && { opacity: 0.85 }]} accessibilityRole="button">
                {busy === 'ask' ? <ActivityIndicator color="#fff" /> : <Ionicons name="arrow-forward" size={18} color="#fff" />}
                <Text style={styles.primaryText}>{busy === 'ask' ? tx('Reading about your business…', 'Leyendo sobre tu negocio…', 'Lendo sobre o seu negócio…') : tx('Continue', 'Continuar', 'Continuar')}</Text>
              </Pressable>
            </View>

            {busy !== 'ask' ? (
              <View style={{ gap: 10, width: '100%' }}>
                <Text style={styles.small}>{tx('Or try an example:', 'O prueba un ejemplo:', 'Ou teste um exemplo:')}</Text>
                {EXAMPLES[L].map((e) => (
                  <Pressable key={e} onPress={() => setPrompt(e)} style={styles.example} accessibilityRole="button">
                    <Ionicons name="arrow-up-outline" size={16} color={colors.primary} />
                    <Text style={styles.exampleText}>{e}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            <View style={styles.how}>
              {[
                ['create-outline', tx('Describe', 'Describe', 'Descreva'), tx('Your business in your own words.', 'Tu negocio con tus palabras.', 'Seu negócio com suas palavras.')],
                ['color-wand-outline', tx('Adjust', 'Ajusta', 'Ajuste'), tx('Ask for changes like in a chat.', 'Pide cambios como en un chat.', 'Peça mudanças como num chat.')],
                ['rocket-outline', tx('Publish', 'Publica', 'Publique'), tx(`Online at yourname.sylkit.com for ${PRICE}/month.`, `En línea en tunombre.sylkit.com por ${PRICE}/mes.`, `No ar em seunome.sylkit.com por ${PRICE}/mês.`)],
              ].map(([icon, title, text]) => (
                <View key={title} style={styles.howItem}>
                  <View style={styles.howIcon}>
                    <Ionicons name={icon as any} size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.howTitle}>{title}</Text>
                  <Text style={styles.small}>{text}</Text>
                </View>
              ))}
            </View>
          </View>
          <Footer />
        </ScrollView>
      </View>
    );
  }

  // ---------- editor ----------
  const site = info.site as Site;
  const domainBox = (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{tx('Your own domain', 'Tu propio dominio', 'Seu próprio domínio')}</Text>
      {info.domain ? (
        <View style={{ gap: 8 }}>
          <Text style={styles.link}>{info.domain}</Text>
          {info.domain_status === 'active' ? (
            <Text style={styles.small}>✅ {tx('Connected. Your website opens on this address.', 'Conectado. Tu web abre en esta dirección.', 'Conectado. Seu site abre neste endereço.')}</Text>
          ) : (
            <>
              <Text style={styles.small}>{tx('At the company where you bought your domain, add this record (DNS):', 'En la empresa donde compraste tu dominio, agrega este registro (DNS):', 'Na empresa onde você comprou seu domínio, adicione este registro (DNS):')}</Text>
              <View style={styles.dns}>
                <Text style={styles.dnsText}>{tx('Type', 'Tipo', 'Tipo')}: CNAME</Text>
                <Text style={styles.dnsText}>{tx('Name', 'Nombre', 'Nome')}: {info.domain.startsWith('www.') ? 'www' : info.domain.split('.')[0]}</Text>
                <Text style={styles.dnsText}>{tx('Value', 'Valor', 'Valor')}: {info.target || 'sites.sylkit.com'}</Text>
              </View>
              <Text style={styles.small}>
                {info.domain_status === 'pending'
                  ? tx('We check it automatically. It can take from a few minutes to a few hours.', 'Lo revisamos automáticamente. Puede tardar de minutos a unas horas.', 'Verificamos automaticamente. Pode levar de minutos a algumas horas.')
                  : tx('We finish connecting it for you and message you on WhatsApp, usually within a day.', 'Terminamos de conectarlo por ti y te escribimos por WhatsApp, normalmente en un día.', 'Terminamos de conectar para você e avisamos pelo WhatsApp, normalmente em um dia.')}
              </Text>
            </>
          )}
          <Pressable onPress={() => connectDomain('')} accessibilityRole="button">
            <Text style={[styles.small, { textDecorationLine: 'underline' }]}>{tx('Remove this domain', 'Quitar este dominio', 'Remover este domínio')}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          <Text style={styles.small}>{tx('Already have a domain? Use it for this website. Your .sylkit.com address keeps working too.', '¿Ya tienes un dominio? Úsalo para esta web. Tu dirección .sylkit.com sigue funcionando.', 'Já tem um domínio? Use neste site. Seu endereço .sylkit.com continua funcionando.')}</Text>
          <View style={styles.slugRow}>
            <TextInput value={domainInput} onChangeText={(v) => setDomainInput(v.trim().toLowerCase())} placeholder="www.tunegocio.com" placeholderTextColor="#9AA6BC" autoCapitalize="none" autoCorrect={false} style={styles.slugInput} accessibilityLabel={tx('Your domain', 'Tu dominio', 'Seu domínio')} />
          </View>
          <Pressable onPress={() => connectDomain(domainInput)} disabled={!!busy || domainInput.length < 4} style={[styles.secondary, (!!busy || domainInput.length < 4) && { opacity: 0.55 }]} accessibilityRole="button">
            {busy === 'domain' ? <ActivityIndicator color={colors.primary} /> : <Ionicons name="link-outline" size={16} color={colors.primary} />}
            <Text style={styles.secondaryText}>{tx('Connect my domain', 'Conectar mi dominio', 'Conectar meu domínio')}</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/checkout?product=dominio-y-correo&plan=starter&billing=yearly' as any)} accessibilityRole="link">
            <Text style={[styles.small, { color: colors.primary, fontWeight: '700' }]}>{tx("Don't have one? Get your .com for $15/year →", '¿No tienes? Consigue tu .com por $15 al año →', 'Não tem? Tenha seu .com por $15/ano →')}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
  const tools = (
    <View style={{ gap: 14 }}>
      {info.live && info.url ? (
        <View style={[styles.panel, { backgroundColor: '#E9FBEF', borderColor: '#BDEFCD' }]}>
          <Text style={styles.panelTitle}>✅ {tx('Your website is live', 'Tu web está publicada', 'Seu site está no ar')}</Text>
          <Pressable onPress={() => Linking.openURL(info.url!)} accessibilityRole="link">
            <Text style={styles.link}>{info.url.replace('https://', '')}</Text>
          </Pressable>
          <Text style={styles.small}>{tx('Changes you make here appear on your website right away.', 'Los cambios que hagas aquí aparecen en tu web al instante.', 'As mudanças que você fizer aqui aparecem no seu site na hora.')}</Text>
        </View>
      ) : null}

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{tx('Change anything', 'Cambia lo que quieras', 'Mude o que quiser')}</Text>
        <Text style={styles.small}>{tx('Write what you want changed, like you would to a designer.', 'Escribe qué quieres cambiar, como se lo dirías a un diseñador.', 'Escreva o que quer mudar, como diria a um designer.')}</Text>
        <TextInput
          value={instruction}
          onChangeText={setInstruction}
          multiline
          maxLength={600}
          editable={!busy}
          placeholder={tx('e.g. Add delivery on weekends and change the color to green', 'Ej.: Agrega delivery los fines de semana y cambia el color a verde', 'Ex.: Adicione entrega nos fins de semana e mude a cor para verde')}
          placeholderTextColor="#9AA6BC"
          style={styles.editInput}
          onSubmitEditing={() => edit()}
        />
        <View style={styles.chips}>
          {QUICK[L].map((q) => (
            <Pressable key={q} onPress={() => edit(q)} disabled={!!busy} style={styles.chip} accessibilityRole="button">
              <Text style={styles.chipText}>{q}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={() => edit()} disabled={!!busy || instruction.trim().length < 2} style={[styles.secondary, (!!busy || instruction.trim().length < 2) && { opacity: 0.55 }]} accessibilityRole="button">
          {busy === 'edit' ? <ActivityIndicator color={colors.primary} /> : <Ionicons name="color-wand-outline" size={18} color={colors.primary} />}
          <Text style={styles.secondaryText}>{busy === 'edit' ? tx('Applying your change…', 'Aplicando tu cambio…', 'Aplicando sua mudança…') : tx('Apply change', 'Aplicar cambio', 'Aplicar mudança')}</Text>
        </Pressable>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{tx('Logo and photos', 'Logo y fotos', 'Logo e fotos')}</Text>
        {mediaBox}
      </View>

      {domainBox}

      {!info.live ? (
        <View style={[styles.panel, { borderColor: colors.primary }]}>
          <Text style={styles.panelTitle}>{tx('Publish your website', 'Publica tu web', 'Publique seu site')}</Text>
          <Text style={styles.small}>{tx('Choose your address:', 'Elige tu dirección:', 'Escolha seu endereço:')}</Text>
          <View style={styles.slugRow}>
            <TextInput
              value={slug}
              onChangeText={(v) => setSlug(v.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30))}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.slugInput}
              accessibilityLabel={tx('Website address', 'Dirección de tu web', 'Endereço do site')}
            />
            <Text style={styles.slugSuffix}>.sylkit.com</Text>
          </View>
          <View style={{ gap: 6 }}>
            {[
              tx('Online on your own address, with SSL', 'En línea en tu propia dirección, con SSL', 'No ar no seu endereço, com SSL'),
              tx('WhatsApp button on every page', 'Botón de WhatsApp en todas las páginas', 'Botão de WhatsApp em todas as páginas'),
              tx('Keep changing it with AI anytime', 'Sigue cambiándola con IA cuando quieras', 'Continue mudando com IA quando quiser'),
              tx('Add your own .com later if you want', 'Agrega tu propio .com después si quieres', 'Adicione seu próprio .com depois se quiser'),
            ].map((x) => (
              <View key={x} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                <Text style={styles.small}>{x}</Text>
              </View>
            ))}
          </View>
          <Pressable onPress={publish} disabled={!!busy || slug.length < 3} style={[styles.primary, (!!busy || slug.length < 3) && { opacity: 0.6 }]} accessibilityRole="button">
            {busy === 'publish' ? <ActivityIndicator color="#fff" /> : <Ionicons name="rocket-outline" size={18} color="#fff" />}
            <Text style={styles.primaryText}>{tx(`Publish for ${PRICE}/month`, `Publicar por ${PRICE}/mes`, `Publicar por ${PRICE}/mês`)}</Text>
          </Pressable>
          <Text style={[styles.small, { textAlign: 'center' }]}>
            {tx('Or $70/year (2 months free). Pay with PayPal, card, USDT, Pago Móvil or Orange Money. Cancel anytime.', 'O $70/año (2 meses gratis). Paga con PayPal, tarjeta, USDT, Pago Móvil u Orange Money. Cancela cuando quieras.', 'Ou $70/ano (2 meses grátis). Pague com PayPal, cartão, USDT, Pago Móvil ou Orange Money. Cancele quando quiser.')}
          </Text>
          {info.order_number ? (
            <Text style={[styles.small, { textAlign: 'center' }]}>
              {tx(`Order ${info.order_number}: your website goes live as soon as the payment is confirmed.`, `Pedido ${info.order_number}: tu web se publica en cuanto se confirme el pago.`, `Pedido ${info.order_number}: seu site entra no ar assim que o pagamento for confirmado.`)}
            </Text>
          ) : null}
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{tx('Save your edit link', 'Guarda tu enlace de edición', 'Guarde seu link de edição')}</Text>
        <Text style={styles.small}>{tx('With this link you can change your website from any phone or computer. Keep it private.', 'Con este enlace puedes cambiar tu web desde cualquier teléfono o computadora. No lo compartas.', 'Com este link você pode mudar seu site de qualquer celular ou computador. Não compartilhe.')}</Text>
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          <Pressable onPress={copyLink} style={styles.secondary} accessibilityRole="button">
            <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={16} color={colors.primary} />
            <Text style={styles.secondaryText}>{copied ? tx('Copied', 'Copiado', 'Copiado') : tx('Copy edit link', 'Copiar enlace', 'Copiar link')}</Text>
          </Pressable>
          <Pressable onPress={() => Linking.openURL(waLink(tx(`Hi! I need help with my AI website (${site.name}).`, `¡Hola! Necesito ayuda con mi web con IA (${site.name}).`, `Olá! Preciso de ajuda com meu site com IA (${site.name}).`)))} style={styles.secondary} accessibilityRole="link">
            <Ionicons name="logo-whatsapp" size={16} color={colors.primary} />
            <Text style={styles.secondaryText}>{tx('Help', 'Ayuda', 'Ajuda')}</Text>
          </Pressable>
        </View>
        {!info.live && !info.order_number ? (
          <Pressable onPress={startOver} accessibilityRole="button">
            <Text style={[styles.small, { color: colors.muted, textDecorationLine: 'underline' }]}>{tx('Start over with a new description', 'Empezar de nuevo con otra descripción', 'Recomeçar com outra descrição')}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );

  const previewBox = (
    <View style={{ gap: 10, flex: wide ? 1 : undefined }}>
      <View style={styles.previewBar}>
        <Text style={styles.previewTitle} numberOfLines={1}>
          {site.icon} {site.name}
        </Text>
        <View style={styles.seg}>
          {(['desktop', 'phone'] as const).map((d) => (
            <Pressable key={d} onPress={() => setDevice(d)} style={[styles.segBtn, device === d && styles.segOn]} accessibilityRole="button" accessibilityState={{ selected: device === d }}>
              <Ionicons name={d === 'desktop' ? 'desktop-outline' : 'phone-portrait-outline'} size={16} color={device === d ? '#fff' : colors.muted} />
            </Pressable>
          ))}
        </View>
      </View>
      <View style={[styles.frameWrap, shadow, { height: wide ? 760 : 620 }, device === 'phone' && { width: 390, maxWidth: '100%', alignSelf: 'center' }]}>
        {frame}
        {busy === 'edit' ? (
          <View style={styles.frameBusy}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : null}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Head>
        <title>{`${site.name} · ${tx('Website editor', 'Editor de tu web', 'Editor do site')} · Sylkit`}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Header />
      <ScrollView ref={scroller} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[styles.editorWrap, wide && { flexDirection: 'row', alignItems: 'flex-start' }]}>
          {previewBox}
          <View style={wide ? { width: 380 } : undefined}>{tools}</View>
        </View>
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  startWrap: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 36, paddingBottom: 48, gap: 16, alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.softBlue, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  badgeText: { color: colors.primary, fontWeight: '800', fontSize: 13 },
  h1: { fontSize: 40, fontWeight: '800', color: colors.text, letterSpacing: -1, textAlign: 'center' },
  lead: { fontSize: 17, lineHeight: 26, color: colors.muted, textAlign: 'center', maxWidth: 620 },
  promptCard: { width: '100%', backgroundColor: colors.surface, borderRadius: 22, padding: 16, gap: 12, borderWidth: 1, borderColor: colors.border, marginTop: 6 },
  promptInput: { minHeight: 140, fontSize: 16, lineHeight: 24, color: colors.text, padding: 12, borderRadius: 14, backgroundColor: colors.bg, textAlignVertical: 'top', outlineStyle: 'none' } as any,
  hint: { fontSize: 13, lineHeight: 19, color: colors.muted },
  error: { color: '#B42318', fontSize: 14, fontWeight: '600', lineHeight: 20 },
  primary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: colors.primary, borderRadius: 14, minHeight: 54, paddingHorizontal: 20 },
  primaryText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  secondary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.softBlue, borderRadius: 12, minHeight: 44, paddingHorizontal: 16 },
  secondaryText: { color: colors.primary, fontSize: 15, fontWeight: '700' },
  small: { fontSize: 14, lineHeight: 20, color: colors.muted },
  example: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: colors.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border },
  exampleText: { flex: 1, fontSize: 14, lineHeight: 20, color: colors.text },
  how: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, width: '100%', marginTop: 12 },
  howItem: { flexGrow: 1, flexBasis: 200, backgroundColor: colors.surface, borderRadius: 16, padding: 16, gap: 6, borderWidth: 1, borderColor: colors.border },
  howIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.softBlue, alignItems: 'center', justifyContent: 'center' },
  howTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  editorWrap: { width: '100%', maxWidth: 1400, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40, gap: 20 },
  previewBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  previewTitle: { fontSize: 18, fontWeight: '800', color: colors.text, flexShrink: 1 },
  seg: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 10, padding: 3, borderWidth: 1, borderColor: colors.border },
  segBtn: { width: 40, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: colors.primary },
  frameWrap: { width: '100%', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  frameBusy: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  panel: { backgroundColor: colors.surface, borderRadius: 18, padding: 16, gap: 10, borderWidth: 1, borderColor: colors.border },
  panelTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  link: { fontSize: 16, fontWeight: '800', color: colors.primary },
  editInput: { minHeight: 80, fontSize: 15, lineHeight: 22, color: colors.text, padding: 12, borderRadius: 12, backgroundColor: colors.bg, textAlignVertical: 'top', outlineStyle: 'none' } as any,
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, paddingHorizontal: 12, paddingVertical: 7 },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.text },
  slugRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg, borderRadius: 12, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  slugInput: { flex: 1, minWidth: 0, fontSize: 16, fontWeight: '700', color: colors.text, paddingHorizontal: 12, paddingVertical: 12, outlineStyle: 'none' } as any,
  qLabel: { fontSize: 16, fontWeight: '800', color: colors.text },
  qInput: { minHeight: 52, fontSize: 15, lineHeight: 22, color: colors.text, padding: 12, borderRadius: 12, backgroundColor: colors.bg, textAlignVertical: 'top', outlineStyle: 'none' } as any,
  styleChip: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 999, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 8 },
  styleOn: { borderColor: colors.primary, backgroundColor: colors.softBlue },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.12)' },
  upBox: { width: 76, height: 76, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.border, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: 2, overflow: 'hidden' },
  upText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  upX: { position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center' },
  dns: { backgroundColor: colors.bg, borderRadius: 12, padding: 12, gap: 4, borderWidth: 1, borderColor: colors.border },
  dnsText: { fontSize: 14, fontWeight: '700', color: colors.text, fontFamily: Platform.select({ web: 'ui-monospace, Menlo, Consolas, monospace', default: undefined }) } as any,
  slugSuffix: { fontSize: 15, color: colors.muted, paddingRight: 12, fontWeight: '600' },
});
