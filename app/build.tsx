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
type Info = { site: Site; slug: string | null; live: boolean; url: string | null; order_number: string | null };

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
  const [busy, setBusy] = useState<'' | 'generate' | 'edit' | 'publish'>('');
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
    setInfo(j);
    setSlug(j.slug || b.slug || j.suggested || '');
    setVersion((v) => v + 1);
    return true;
  }, []);
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

  const generate = async () => {
    setError('');
    if (prompt.trim().length < 12) return setError(errorText('prompt_too_short'));
    setBusy('generate');
    const j = await api('generate', { prompt: prompt.trim(), lang: L }).catch(() => ({ ok: false }));
    setBusy('');
    if (!j.ok) return setError(errorText(j.error));
    const b = { id: j.id, token: j.token, slug: j.slug };
    setBuild(b);
    save(b);
    setInfo({ site: j.site, slug: null, live: false, url: null, order_number: null });
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
    setPrompt('');
    setError('');
  };

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

  // ---------- start screen ----------
  if (!build || !info) {
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
                editable={busy !== 'generate'}
                placeholder={tx('Example: Family bakery in Freetown. Bread, pastries and custom cakes. Open Mon–Sat 7am–6pm. WhatsApp +232 76 123 456.', 'Ejemplo: Panadería familiar en Petare. Pan, cachitos y tortas por encargo. Abrimos de lunes a sábado de 6 a 7. WhatsApp 0414 123 4567.', 'Exemplo: Padaria familiar em São Paulo. Pães, salgados e bolos sob encomenda. Aberta de seg. a sáb. das 6h às 19h. WhatsApp (11) 90000-0000.')}
                placeholderTextColor="#9AA6BC"
                style={styles.promptInput}
                accessibilityLabel={tx('Describe your business', 'Describe tu negocio', 'Descreva seu negócio')}
              />
              <Text style={styles.hint}>
                {tx('Include: what you sell or do, your city, your hours and your WhatsApp. The AI only uses the contact details you write.', 'Incluye: qué vendes o haces, tu ciudad, tu horario y tu WhatsApp. La IA solo usa los datos de contacto que escribas.', 'Inclua: o que você vende ou faz, sua cidade, seu horário e seu WhatsApp. A IA só usa os contatos que você escrever.')}
              </Text>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Pressable onPress={generate} disabled={busy === 'generate'} style={[styles.primary, busy === 'generate' && { opacity: 0.85 }]} accessibilityRole="button">
                {busy === 'generate' ? <ActivityIndicator color="#fff" /> : <Ionicons name="sparkles" size={18} color="#fff" />}
                <Text style={styles.primaryText}>{busy === 'generate' ? steps[step % steps.length] : tx('Create my website', 'Crear mi web', 'Criar meu site')}</Text>
              </Pressable>
            </View>

            {busy !== 'generate' ? (
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
  const site = info.site;
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
  slugSuffix: { fontSize: 15, color: colors.muted, paddingRight: 12, fontWeight: '600' },
});
