import { Ionicons } from '@expo/vector-icons';
import { useClientWidth } from '../src/lib/useClientWidth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Button } from '../src/components/Button';
import { Field, formStyles } from '../src/components/Field';
import { Footer } from '../src/components/Footer';
import { Header } from '../src/components/Header';
import { shieldPlans, shieldPolicies, shieldSteps } from '../src/data/shield';
import type { Text as T } from '../src/i18n';
import { useLang } from '../src/i18n';
import { friendlyError, supabase } from '../src/lib/supabase';
import { colors, shadow } from '../src/theme';

// Sylkit Shield: book a security check for a website, app or business system.
// Bookings are saved as quote requests (create_order) and appear in Admin with every other quote.

const DARK = '#0B1B3A';

const L = {
  title: { en: 'Sylkit Shield: security for your website, app or system', es: 'Sylkit Shield: seguridad para tu sitio, app o sistema' },
  badge: { en: 'Sylkit Shield', es: 'Sylkit Shield' },
  h1: { en: 'Your app works. Is it safe?', es: 'Tu app funciona. ¿Es segura?' },
  sub: {
    en: 'We find the security holes in your website, app or business system and help you close them, before someone else finds them.',
    es: 'Encontramos los huecos de seguridad en tu sitio, app o sistema y te ayudamos a cerrarlos antes de que otro los encuentre.',
  },
  ctaBook: { en: 'Book a free Snapshot', es: 'Pide tu diagnóstico gratis' },
  ctaPlans: { en: 'See plans', es: 'Ver planes' },
  problemTitle: { en: 'Fast to build. Easy to break into.', es: 'Rápido de construir. Fácil de vulnerar.' },
  problemSub: {
    en: 'AI tools and quick builds make launching easy. They don’t make it secure. Most systems we check have at least one of these:',
    es: 'Las herramientas de IA y los desarrollos rápidos facilitan lanzar. No lo hacen seguro. La mayoría de los sistemas que revisamos tiene al menos uno de estos problemas:',
  },
  stat: {
    en: 'In a 2026 scan of 3,680 reachable Supabase-backed apps, 57% let anyone read their database tables without logging in.',
    es: 'En un estudio de 2026 con 3.680 apps que usan Supabase, el 57% dejaba que cualquiera leyera sus tablas sin iniciar sesión.',
  },
  checkTitle: { en: 'What we check', es: 'Qué revisamos' },
  pricingTitle: { en: 'Simple pricing. Start free.', es: 'Precios simples. Empieza gratis.' },
  pricingSub: {
    en: 'One price list for everyone. Start small and move up only when you need to.',
    es: 'Un solo precio para todos. Empieza pequeño y sube solo cuando lo necesites.',
  },
  popular: { en: 'Most popular', es: 'Más elegido' },
  choose: { en: 'Choose', es: 'Elegir' },
  delivery: { en: 'Delivery', es: 'Entrega' },
  policiesTitle: { en: 'Made to be affordable', es: 'Pensado para ser accesible' },
  howTitle: { en: 'How it works', es: 'Cómo funciona' },
  whyTitle: { en: 'Why Sylkit Shield', es: 'Por qué Sylkit Shield' },
  formTitle: { en: 'Book a security check', es: 'Reserva tu revisión de seguridad' },
  formSub: {
    en: 'Tell us about your system. We reply within 24 hours with next steps and, for paid plans, a quote you can pay online.',
    es: 'Cuéntanos sobre tu sistema. Respondemos en menos de 24 horas con los próximos pasos y, en planes pagos, una cotización que puedes pagar en línea.',
  },
  faqTitle: { en: 'Questions', es: 'Preguntas frecuentes' },
};

const problems: { icon: string; t: T }[] = [
  { icon: 'server', t: { en: 'Database tables anyone on the internet can read', es: 'Tablas de base de datos que cualquiera puede leer' } },
  { icon: 'key', t: { en: 'API keys or passwords visible in the code', es: 'Claves o contraseñas visibles en el código' } },
  { icon: 'lock-open', t: { en: 'Admin pages with no login check', es: 'Páginas de administración sin control de acceso' } },
  { icon: 'cube', t: { en: 'Outdated plugins, packages or PHP versions', es: 'Plugins, paquetes o versiones de PHP desactualizados' } },
  { icon: 'cloud-offline', t: { en: 'No backups, no monitoring, no alerts', es: 'Sin respaldos, sin monitoreo, sin alertas' } },
];

const checks: { icon: string; t: T; d: T }[] = [
  { icon: 'globe', t: { en: 'Websites and web apps', es: 'Sitios y apps web' }, d: { en: 'React, Next.js, PHP, Laravel, WordPress', es: 'React, Next.js, PHP, Laravel, WordPress' } },
  { icon: 'phone-portrait', t: { en: 'Mobile apps', es: 'Apps móviles' }, d: { en: 'Android and iOS', es: 'Android e iOS' } },
  { icon: 'server', t: { en: 'Databases and backends', es: 'Bases de datos y backends' }, d: { en: 'Supabase, Firebase, MySQL, PostgreSQL, APIs', es: 'Supabase, Firebase, MySQL, PostgreSQL, APIs' } },
  { icon: 'storefront', t: { en: 'Business systems', es: 'Sistemas de negocio' }, d: { en: 'POS, inventory and custom internal tools', es: 'Punto de venta, inventario y herramientas internas' } },
];

const how: { icon: string; t: T; d: T }[] = [
  { icon: 'create', t: { en: 'Book', es: 'Reserva' }, d: { en: 'Tell us about your system in a 2-minute form.', es: 'Cuéntanos sobre tu sistema en 2 minutos.' } },
  { icon: 'document-text', t: { en: 'Authorize', es: 'Autoriza' }, d: { en: 'Sign a short agreement giving us permission to test.', es: 'Firma un acuerdo breve que nos permite hacer las pruebas.' } },
  { icon: 'search', t: { en: 'We analyze', es: 'Analizamos' }, d: { en: 'Automated scans plus a manual expert review.', es: 'Escaneos automáticos más revisión experta manual.' } },
  { icon: 'clipboard', t: { en: 'You get a report', es: 'Recibes un informe' }, d: { en: 'Every issue explained in plain language, ranked by risk.', es: 'Cada problema explicado en lenguaje claro, por nivel de riesgo.' } },
  { icon: 'build', t: { en: 'We fix it', es: 'Lo corregimos' }, d: { en: 'Optional: we close the gaps and re-test.', es: 'Opcional: cerramos las brechas y volvemos a probar.' } },
  { icon: 'shield-checkmark', t: { en: 'Stay protected', es: 'Mantente protegido' }, d: { en: 'Optional: monthly monitoring with Secure Care.', es: 'Opcional: monitoreo mensual con Secure Care.' } },
];

const why: { icon: string; t: T }[] = [
  { icon: 'person', t: { en: 'A real expert reviews every system, not just a robot', es: 'Un experto real revisa cada sistema, no solo un robot' } },
  { icon: 'chatbox-ellipses', t: { en: 'Plain-language reports, no security jargon', es: 'Informes claros, sin jerga técnica' } },
  { icon: 'hammer', t: { en: 'We don’t only find problems: we fix them', es: 'No solo encontramos problemas: los corregimos' } },
  { icon: 'language', t: { en: 'English and Spanish', es: 'Inglés y español' } },
  { icon: 'code-slash', t: { en: 'Built by developers who build systems every day', es: 'Hecho por desarrolladores que construyen sistemas a diario' } },
];

const faq: { q: T; a: T }[] = [
  {
    q: { en: 'Will testing break my site?', es: '¿Las pruebas pueden dañar mi sitio?' },
    a: {
      en: 'No. We agree on the scope first, test carefully, never run destructive or denial-of-service tests, and never touch live data destructively.',
      es: 'No. Acordamos el alcance primero, probamos con cuidado, nunca hacemos pruebas destructivas ni de saturación y no alteramos datos reales.',
    },
  },
  {
    q: { en: 'Do you need my code?', es: '¿Necesitan mi código?' },
    a: {
      en: 'Not for the Snapshot or Starter Scan. Audits go deeper with code or repo access, which we keep confidential and delete after the job.',
      es: 'No para el diagnóstico ni el escaneo inicial. Las auditorías son más profundas con acceso al código, que mantenemos confidencial y eliminamos al terminar.',
    },
  },
  {
    q: { en: 'Can you test any website?', es: '¿Pueden probar cualquier sitio?' },
    a: {
      en: 'Only systems you own or are authorized to test. Testing someone else’s system without permission is illegal, so every job starts with a signed authorization.',
      es: 'Solo sistemas que te pertenecen o que estás autorizado a probar. Probar un sistema ajeno sin permiso es ilegal, por eso cada trabajo empieza con una autorización firmada.',
    },
  },
  {
    q: { en: 'How do I pay?', es: '¿Cómo pago?' },
    a: {
      en: 'After we confirm your quote, you pay on your order page with USDT or another method. Audits from $499 can be split in two payments.',
      es: 'Cuando confirmamos tu cotización, pagas en la página de tu pedido con USDT u otro método. Las auditorías desde $499 se pueden pagar en dos partes.',
    },
  },
  {
    q: { en: 'Is my information private?', es: '¿Mi información es privada?' },
    a: { en: 'Yes. Everything we find stays between us and you.', es: 'Sí. Todo lo que encontramos queda entre tú y nosotros.' },
  },
];

// Form options
const systemTypes: { id: string; t: T }[] = [
  { id: 'website', t: { en: 'Website', es: 'Sitio web' } },
  { id: 'webapp', t: { en: 'Web app', es: 'App web' } },
  { id: 'mobile', t: { en: 'Mobile app', es: 'App móvil' } },
  { id: 'business', t: { en: 'Business system', es: 'Sistema de negocio' } },
  { id: 'other', t: { en: 'Other', es: 'Otro' } },
];
const stacks = ['React / Next.js', 'PHP', 'Laravel', 'WordPress', 'Supabase', 'Firebase', 'Node.js', 'Flutter / React Native'];
const builders: { id: string; t: T }[] = [
  { id: 'me', t: { en: 'I built it', es: 'Yo lo hice' } },
  { id: 'dev', t: { en: 'A developer or agency', es: 'Un desarrollador o agencia' } },
  { id: 'ai', t: { en: 'An AI tool', es: 'Una herramienta de IA' } },
  { id: 'unknown', t: { en: 'Don’t know', es: 'No sé' } },
];
const userCounts: { id: string; t: T }[] = [
  { id: '<100', t: { en: 'Under 100 users', es: 'Menos de 100 usuarios' } },
  { id: '100-1000', t: { en: '100–1,000', es: '100–1.000' } },
  { id: '1000+', t: { en: '1,000+', es: 'Más de 1.000' } },
];
const dataKinds: { id: string; t: T }[] = [
  { id: 'personal', t: { en: 'Personal info', es: 'Datos personales' } },
  { id: 'payments', t: { en: 'Payments', es: 'Pagos' } },
  { id: 'health', t: { en: 'Health', es: 'Salud' } },
  { id: 'passwords', t: { en: 'Passwords / logins', es: 'Contraseñas / accesos' } },
  { id: 'none', t: { en: 'None of these', es: 'Ninguno' } },
];
const codeAccess: { id: string; t: T }[] = [
  { id: 'yes', t: { en: 'Yes', es: 'Sí' } },
  { id: 'no', t: { en: 'No', es: 'No' } },
  { id: 'unsure', t: { en: 'Not sure', es: 'No estoy seguro' } },
];

export default function SecurityPage() {
  const { t, lang } = useLang();
  const es = lang === 'es';
  const width = useClientWidth();
  const wide = width >= 820;
  const router = useRouter();
  const params = useLocalSearchParams<{ plan?: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const [formY, setFormY] = useState(0);
  const [plansY, setPlansY] = useState(0);
  const [bodyY, setBodyY] = useState(0);

  const initialPlan = shieldPlans.some((p) => p.id === params.plan) ? (params.plan as string) : 'snapshot';
  const [plan, setPlan] = useState(initialPlan);
  const [f, setF] = useState({ name: '', email: '', whatsapp: '', business: '', country: '', urls: '', concern: '' });
  const [sysType, setSysType] = useState('');
  const [stack, setStack] = useState<string[]>([]);
  const [builder, setBuilder] = useState('');
  const [users, setUsers] = useState('');
  const [data, setData] = useState<string[]>([]);
  const [access, setAccess] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));
  const toggle = (list: string[], v: string, setter: (x: string[]) => void) =>
    setter(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const goForm = (planId?: string) => {
    if (planId) setPlan(planId);
    scrollRef.current?.scrollTo({ y: Math.max(bodyY + formY - 12, 0), animated: true });
  };

  const labelOf = (opts: { id: string; t: T }[], id: string) => opts.find((o) => o.id === id)?.t.en ?? id;

  const submit = async () => {
    setError('');
    if (f.name.trim().length < 2) return setError(es ? 'Escribe tu nombre.' : 'Please enter your name.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) return setError(es ? 'Revisa tu correo electrónico.' : 'Please check your email.');
    if (f.urls.trim().length < 4) return setError(es ? 'Escribe la dirección o enlace de tu sistema.' : 'Please enter your system’s URL or app link.');
    if (!sysType) return setError(es ? 'Elige el tipo de sistema.' : 'Please choose the type of system.');
    if (!authorized)
      return setError(
        es ? 'Confirma que eres dueño del sistema o estás autorizado a pedir las pruebas.' : 'Please confirm you own this system or are authorized to request testing.',
      );

    const chosen = shieldPlans.find((p) => p.id === plan);
    // Details are written in English for the admin, whatever the visitor's language.
    const details = [
      `[Sylkit Shield] Plan: ${chosen?.name.en ?? plan} (${chosen?.price.en ?? ''})`,
      `System: ${labelOf(systemTypes, sysType)} · ${f.urls.trim()}`,
      `Stack: ${stack.length ? stack.join(', ') : 'not specified'}`,
      `Built by: ${builder ? labelOf(builders, builder) : 'not specified'} · Users: ${users ? labelOf(userCounts, users) : 'not specified'}`,
      `Sensitive data: ${data.length ? data.map((d) => labelOf(dataKinds, d)).join(', ') : 'not specified'}`,
      `Code/repo access: ${access ? labelOf(codeAccess, access) : 'not specified'}`,
      `Authorized to request testing: yes`,
      f.concern.trim() ? `Main concern: ${f.concern.trim()}` : '',
    ]
      .filter(Boolean)
      .join('\n')
      .slice(0, 1900);

    setBusy(true);
    const { data: res, error: err } = await supabase.rpc('create_order', {
      p_customer_name: f.name,
      p_email: f.email,
      p_whatsapp: f.whatsapp || null,
      p_business_name: f.business || null,
      p_country: f.country || null,
      p_details: details,
      p_product_slug: null,
      p_lang: lang,
      p_source: `shield:${plan}`,
      p_config: null,
    });
    setBusy(false);
    if (err || !res) return setError(friendlyError(err, lang));
    router.push(`/track?t=${(res as any).token}&new=1`);
  };

  const cols = width >= 1024 ? 3 : width >= 640 ? 2 : 1;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Head>
        <title>{t(L.title)}</title>
        <meta name="description" content={t(L.sub)} />
      </Head>
      <Header />
      <ScrollView ref={scrollRef} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={[styles.sphere, { width: 300, height: 300, top: -110, right: -70, backgroundColor: colors.cyan, opacity: 0.22 }]} />
          <View style={[styles.sphere, { width: 220, height: 220, bottom: -90, left: -60, backgroundColor: colors.primary, opacity: 0.3 }]} />
          <View style={[styles.container, { alignItems: 'center' }]}>
            <View style={styles.badge}>
              <Ionicons name="shield-checkmark" size={16} color={colors.cyan} />
              <Text style={styles.badgeText}>{t(L.badge)}</Text>
            </View>
            <Text style={[styles.h1, wide && { fontSize: 54, lineHeight: 60 }]}>{t(L.h1)}</Text>
            <Text style={[styles.heroSub, wide && { fontSize: 18, lineHeight: 28 }]}>{t(L.sub)}</Text>
            <View style={styles.heroBtns}>
              <Button label={t(L.ctaBook)} icon="shield-checkmark" onPress={() => goForm('snapshot')} />
              <Button
                label={t(L.ctaPlans)}
                icon="pricetags"
                variant="secondary"
                onPress={() => scrollRef.current?.scrollTo({ y: Math.max(bodyY + plansY - 12, 0), animated: true })}
              />
            </View>
          </View>
        </View>

        <View style={styles.container} onLayout={(e) => setBodyY(e.nativeEvent.layout.y)}>
          {/* Problem */}
          <View style={[styles.section, wide && { flexDirection: 'row', gap: 32 }]}>
            <View style={{ flex: wide ? 1 : undefined, gap: 10 }}>
              <Text style={styles.h2}>{t(L.problemTitle)}</Text>
              <Text style={styles.body}>{t(L.problemSub)}</Text>
              <View style={[styles.statCard, shadow]}>
                <Text style={styles.statNum}>57%</Text>
                <Text style={styles.statText}>{t(L.stat)}</Text>
              </View>
            </View>
            <View style={{ flex: wide ? 1 : undefined, gap: 10, marginTop: wide ? 0 : 16 }}>
              {problems.map((p, i) => (
                <View key={i} style={[styles.problem, shadow]}>
                  <View style={styles.problemIcon}>
                    <Ionicons name={p.icon as any} size={18} color="#B42318" />
                  </View>
                  <Text style={styles.problemText}>{t(p.t)}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* What we check */}
          <Text style={[styles.h2, styles.sectionTitle]}>{t(L.checkTitle)}</Text>
          <View style={styles.grid}>
            {checks.map((c, i) => (
              <View key={i} style={{ width: width >= 1024 ? '25%' : width >= 640 ? '50%' : '100%', padding: 8 }}>
                <View style={[styles.card, shadow]}>
                  <View style={styles.iconWrap}>
                    <Ionicons name={c.icon as any} size={22} color={colors.primary} />
                  </View>
                  <Text style={styles.cardTitle}>{t(c.t)}</Text>
                  <Text style={styles.cardBody}>{t(c.d)}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Pricing */}
          <View onLayout={(e) => setPlansY(e.nativeEvent.layout.y)}>
            <Text style={[styles.h2, styles.sectionTitle, { textAlign: 'center' }]}>{t(L.pricingTitle)}</Text>
            <Text style={[styles.body, { textAlign: 'center', marginBottom: 8 }]}>{t(L.pricingSub)}</Text>

            {shieldSteps.map((s) => (
              <View key={s.step} style={{ marginTop: 24 }}>
                <View style={styles.stepHead}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>{s.step}</Text>
                  </View>
                  <View style={{ flexShrink: 1 }}>
                    <Text style={styles.stepTitle}>{t(s.title)}</Text>
                    <Text style={styles.stepSub}>{t(s.sub)}</Text>
                  </View>
                </View>
                <View style={styles.grid}>
                  {shieldPlans
                    .filter((p) => p.step === s.step)
                    .map((p) => (
                      <View key={p.id} style={{ width: `${100 / cols}%`, padding: 8 }}>
                        <View style={[styles.plan, shadow, p.popular && styles.planPopular]}>
                          {p.popular ? (
                            <View style={styles.popular}>
                              <Text style={styles.popularText}>{t(L.popular)}</Text>
                            </View>
                          ) : null}
                          <Text style={styles.planName}>{t(p.name)}</Text>
                          <Text style={styles.planBest}>{t(p.best)}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginTop: 6 }}>
                            <Text style={styles.planPrice}>{t(p.price)}</Text>
                            {p.period ? <Text style={styles.planPeriod}>{t(p.period)}</Text> : null}
                          </View>
                          {p.delivery ? (
                            <Text style={styles.planDelivery}>
                              {t(L.delivery)}: {t(p.delivery)}
                            </Text>
                          ) : null}
                          <View style={{ gap: 8, marginTop: 12, flexGrow: 1 }}>
                            {p.items.map((it, i) => (
                              <View key={i} style={styles.planItem}>
                                <Ionicons name="checkmark-circle" size={18} color={colors.cyan} />
                                <Text style={styles.planItemText}>{t(it)}</Text>
                              </View>
                            ))}
                          </View>
                          <Button
                            label={t(L.choose)}
                            variant={p.popular ? 'primary' : 'secondary'}
                            onPress={() => goForm(p.id)}
                            style={{ marginTop: 16 }}
                          />
                        </View>
                      </View>
                    ))}
                </View>
              </View>
            ))}
          </View>

          {/* Policies */}
          <Text style={[styles.h2, styles.sectionTitle]}>{t(L.policiesTitle)}</Text>
          <View style={styles.grid}>
            {shieldPolicies.map((p, i) => (
              <View key={i} style={{ width: `${100 / cols}%`, padding: 8 }}>
                <View style={[styles.policy, shadow]}>
                  <Ionicons name={p.icon as any} size={20} color={colors.primary} />
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.cardTitle}>{t(p.t)}</Text>
                    <Text style={styles.cardBody}>{t(p.d)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* How it works */}
          <Text style={[styles.h2, styles.sectionTitle]}>{t(L.howTitle)}</Text>
          <View style={styles.grid}>
            {how.map((h, i) => (
              <View key={i} style={{ width: `${100 / cols}%`, padding: 8 }}>
                <View style={[styles.card, shadow]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={styles.iconWrap}>
                      <Ionicons name={h.icon as any} size={20} color={colors.primary} />
                    </View>
                    <Text style={styles.howNum}>0{i + 1}</Text>
                  </View>
                  <Text style={styles.cardTitle}>{t(h.t)}</Text>
                  <Text style={styles.cardBody}>{t(h.d)}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Why */}
          <View style={[styles.why, wide && { flexDirection: 'row', alignItems: 'flex-start', gap: 32 }]}>
            <View style={[styles.sphere, { width: 220, height: 220, top: -90, right: -40, backgroundColor: colors.cyan, opacity: 0.18 }]} />
            <Text style={[styles.h2, { color: '#fff', flex: wide ? 1 : undefined }]}>{t(L.whyTitle)}</Text>
            <View style={{ flex: wide ? 1.4 : undefined, gap: 12, marginTop: wide ? 0 : 16 }}>
              {why.map((w, i) => (
                <View key={i} style={styles.whyItem}>
                  <Ionicons name={w.icon as any} size={20} color={colors.cyan} />
                  <Text style={styles.whyText}>{t(w.t)}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Booking form */}
          <View onLayout={(e) => setFormY(e.nativeEvent.layout.y)} style={[styles.form, shadow]}>
            <Text style={styles.formTitle}>{t(L.formTitle)}</Text>
            <Text style={styles.body}>{t(L.formSub)}</Text>

            <Label text={es ? 'Plan' : 'Plan'} />
            <View style={styles.chips}>
              {shieldPlans.map((p) => (
                <Chip key={p.id} label={`${t(p.name)} · ${t(p.price)}`} active={plan === p.id} onPress={() => setPlan(p.id)} />
              ))}
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Field label={es ? 'Nombre *' : 'Name *'} value={f.name} onChangeText={set('name')} autoComplete="name" />
              </View>
              <View style={styles.col}>
                <Field label={es ? 'Empresa / negocio' : 'Company / business'} value={f.business} onChangeText={set('business')} />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.col}>
                <Field
                  label={es ? 'Correo electrónico *' : 'Email *'}
                  value={f.email}
                  onChangeText={set('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
              <View style={styles.col}>
                <Field label="WhatsApp" value={f.whatsapp} onChangeText={set('whatsapp')} keyboardType="phone-pad" placeholder="+1 ..." />
              </View>
            </View>
            <Field label={es ? 'País' : 'Country'} value={f.country} onChangeText={set('country')} />
            <Field
              label={es ? 'Dirección web o enlace de la app *' : 'Website URL or app store link *'}
              value={f.urls}
              onChangeText={set('urls')}
              autoCapitalize="none"
              placeholder="https://..."
            />

            <Label text={es ? 'Tipo de sistema *' : 'Type of system *'} />
            <View style={styles.chips}>
              {systemTypes.map((o) => (
                <Chip key={o.id} label={t(o.t)} active={sysType === o.id} onPress={() => setSysType(o.id)} />
              ))}
            </View>

            <Label text={es ? 'Tecnología (si la sabes)' : 'Tech stack (if you know)'} />
            <View style={styles.chips}>
              {stacks.map((s) => (
                <Chip key={s} label={s} active={stack.includes(s)} onPress={() => toggle(stack, s, setStack)} />
              ))}
            </View>

            <Label text={es ? '¿Quién lo construyó?' : 'Who built it?'} />
            <View style={styles.chips}>
              {builders.map((o) => (
                <Chip key={o.id} label={t(o.t)} active={builder === o.id} onPress={() => setBuilder(o.id)} />
              ))}
            </View>

            <Label text={es ? 'Usuarios' : 'Users'} />
            <View style={styles.chips}>
              {userCounts.map((o) => (
                <Chip key={o.id} label={t(o.t)} active={users === o.id} onPress={() => setUsers(o.id)} />
              ))}
            </View>

            <Label text={es ? '¿Qué datos guarda?' : 'What data does it hold?'} />
            <View style={styles.chips}>
              {dataKinds.map((o) => (
                <Chip key={o.id} label={t(o.t)} active={data.includes(o.id)} onPress={() => toggle(data, o.id, setData)} />
              ))}
            </View>

            <Label text={es ? '¿Puedes darnos acceso al código?' : 'Can you share code or repo access?'} />
            <View style={styles.chips}>
              {codeAccess.map((o) => (
                <Chip key={o.id} label={t(o.t)} active={access === o.id} onPress={() => setAccess(o.id)} />
              ))}
            </View>

            <Field
              label={es ? '¿Qué te preocupa? (opcional)' : 'Main concern (optional)'}
              value={f.concern}
              onChangeText={set('concern')}
              multiline
              placeholder={es ? 'Ej. me preocupa que alguien vea los datos de mis clientes…' : 'E.g. I’m worried someone could see my customers’ data…'}
            />

            <Pressable
              style={styles.consent}
              onPress={() => setAuthorized((v) => !v)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: authorized }}
            >
              <Ionicons name={authorized ? 'checkbox' : 'square-outline'} size={22} color={authorized ? colors.primary : colors.muted} />
              <Text style={styles.consentText}>
                {es
                  ? 'Confirmo que soy dueño de este sistema o estoy autorizado a pedir pruebas de seguridad. Entiendo que no se hará ninguna prueba hasta firmar el acuerdo de alcance.'
                  : 'I confirm I own this system or am authorized to request security testing. I understand no testing starts until the scope agreement is signed.'}
              </Text>
            </Pressable>

            {error ? <Text style={formStyles.error}>{error}</Text> : null}
            <Button label={es ? 'Enviar solicitud' : 'Send request'} icon="send" onPress={submit} loading={busy} />
            <Text style={styles.fine}>
              {es ? 'Sin compromiso. Respondemos normalmente en menos de 24 horas.' : 'No commitment. We usually reply within 24 hours.'}
            </Text>
          </View>

          {/* FAQ */}
          <Text style={[styles.h2, styles.sectionTitle]}>{t(L.faqTitle)}</Text>
          <View style={{ gap: 10 }}>
            {faq.map((x, i) => (
              <View key={i} style={[styles.faq, shadow]}>
                <Text style={styles.cardTitle}>{t(x.q)}</Text>
                <Text style={styles.cardBody}>{t(x.a)}</Text>
              </View>
            ))}
          </View>
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
}

function Label({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.chipText, active && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 1180, alignSelf: 'center', paddingHorizontal: 16 },
  hero: { backgroundColor: DARK, paddingTop: 56, paddingBottom: 56, overflow: 'hidden', position: 'relative' },
  sphere: { position: 'absolute', borderRadius: 999 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(25,195,230,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(25,195,230,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: { color: colors.cyan, fontWeight: '800', fontSize: 13, letterSpacing: 0.3 },
  h1: { fontSize: 38, lineHeight: 44, fontWeight: '800', color: '#fff', letterSpacing: -1, textAlign: 'center', marginTop: 18, maxWidth: 760 },
  heroSub: { fontSize: 16, lineHeight: 24, color: '#C9D5EC', textAlign: 'center', marginTop: 14, maxWidth: 640 },
  heroBtns: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 28 },
  section: { marginTop: 48 },
  sectionTitle: { marginTop: 48, marginBottom: 8 },
  h2: { fontSize: 28, lineHeight: 34, fontWeight: '800', color: colors.text, letterSpacing: -0.6 },
  body: { fontSize: 15, lineHeight: 23, color: colors.muted },
  statCard: { backgroundColor: colors.surface, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: colors.border, gap: 4, marginTop: 6 },
  statNum: { fontSize: 40, fontWeight: '800', color: '#B42318', letterSpacing: -1 },
  statText: { fontSize: 14, lineHeight: 21, color: colors.muted },
  problem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  problemIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#FEF3F2', alignItems: 'center', justifyContent: 'center' },
  problemText: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 },
  card: { backgroundColor: colors.surface, borderRadius: 18, padding: 18, gap: 8, borderWidth: 1, borderColor: colors.border, height: '100%' },
  iconWrap: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.softBlue, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  cardBody: { fontSize: 14, lineHeight: 21, color: colors.muted },
  stepHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  stepNum: { width: 36, height: 36, borderRadius: 999, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  stepTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  stepSub: { fontSize: 14, color: colors.muted },
  plan: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.border, height: '100%' },
  planPopular: { borderColor: colors.primary, borderWidth: 2 },
  popular: { alignSelf: 'flex-start', backgroundColor: colors.softBlue, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8 },
  popularText: { color: colors.primary, fontWeight: '800', fontSize: 12 },
  planName: { fontSize: 18, fontWeight: '800', color: colors.text },
  planBest: { fontSize: 13, color: colors.muted, marginTop: 2 },
  planPrice: { fontSize: 32, fontWeight: '800', color: colors.text, letterSpacing: -0.8 },
  planPeriod: { fontSize: 13, color: colors.muted, marginBottom: 6 },
  planDelivery: { fontSize: 13, color: colors.muted, marginTop: 2 },
  planItem: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  planItemText: { flex: 1, fontSize: 14, lineHeight: 20, color: colors.text },
  policy: { flexDirection: 'row', gap: 12, backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, height: '100%' },
  howNum: { fontSize: 22, fontWeight: '800', color: colors.softBlue },
  why: { backgroundColor: DARK, borderRadius: 24, padding: 28, marginTop: 48, overflow: 'hidden', position: 'relative' },
  whyItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  whyText: { flex: 1, color: '#E6EEFB', fontSize: 15, fontWeight: '600', lineHeight: 22 },
  form: { backgroundColor: colors.surface, borderRadius: 24, padding: 22, gap: 14, borderWidth: 1, borderColor: colors.border, marginTop: 48 },
  formTitle: { fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  label: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: -4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, backgroundColor: colors.softBlue, borderWidth: 1, borderColor: 'transparent', minHeight: 40, justifyContent: 'center' },
  chipActive: { backgroundColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  col: { flexGrow: 1, flexBasis: 240 },
  consent: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: colors.bg, borderRadius: 12, padding: 12 },
  consentText: { flex: 1, fontSize: 13, lineHeight: 20, color: colors.text },
  fine: { fontSize: 12, color: colors.muted, textAlign: 'center' },
  faq: { backgroundColor: colors.surface, borderRadius: 16, padding: 18, gap: 6, borderWidth: 1, borderColor: colors.border },
});
