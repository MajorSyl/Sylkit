import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { ReactNode, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Button } from '../src/components/Button';
import { Field, formStyles } from '../src/components/Field';
import { Footer } from '../src/components/Footer';
import { Header } from '../src/components/Header';
import { useLang } from '../src/i18n';
import { categoryOf, fetchListing, Listing, multiple, usd } from '../src/lib/listings';
import { friendlyError, supabase } from '../src/lib/supabase';
import { colors, shadow } from '../src/theme';

// One business for sale: facts, what's included, and a form to ask for details or make an offer.

export default function StartupPage() {
  const { s } = useLocalSearchParams<{ s?: string }>();
  const { t, lang } = useLang();
  const es = lang === 'es';
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const [l, setL] = useState<Listing | null | undefined>(undefined);

  useEffect(() => {
    if (!s) return setL(null);
    fetchListing(String(s)).then(setL);
  }, [s]);

  if (l === undefined)
    return (
      <Shell>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 80 }} />
      </Shell>
    );
  if (!l)
    return (
      <Shell>
        <View style={[styles.container, { paddingTop: 60, alignItems: 'center', gap: 14 }]}>
          <Text style={styles.h1}>{es ? 'No encontramos este negocio' : "We couldn't find this business"}</Text>
          <Link href="/startups" style={styles.back}>
            {es ? '← Ver negocios en venta' : '← See businesses for sale'}
          </Link>
        </View>
      </Shell>
    );

  const cat = categoryOf(l.category);
  const sold = l.status === 'sold';
  const facts: [string, string][] = [
    [es ? 'Precio pedido' : 'Asking price', usd(l.asking_price)],
    [es ? 'Ingresos anuales' : 'Annual revenue', Number(l.annual_revenue) ? usd(l.annual_revenue) : es ? 'Sin ingresos aún' : 'Pre-revenue'],
    [es ? 'Ganancia mensual' : 'Monthly profit', Number(l.monthly_profit) ? usd(l.monthly_profit) : '—'],
    [es ? 'Múltiplo' : 'Multiple', multiple(l) ?? '—'],
    [es ? 'Usuarios al mes' : 'Monthly users', l.monthly_users != null ? Number(l.monthly_users).toLocaleString('en-US') : '—'],
    [es ? 'Antigüedad' : 'Age', l.age_months != null ? `${l.age_months} ${es ? 'meses' : 'months'}` : '—'],
  ];

  return (
    <Shell title={`${l.title} · ${es ? 'En venta' : 'For sale'} · Sylkit`} description={l.tagline}>
      <View style={[styles.container, { paddingTop: 20, gap: 20 }]}>
        <Link href="/startups" style={styles.back}>
          {es ? '← Todos los negocios en venta' : '← All businesses for sale'}
        </Link>

        <View style={[{ gap: 20 }, wide && { flexDirection: 'row', alignItems: 'flex-start' }]}>
          <View style={[{ gap: 18 }, wide && { flex: 1.6 }]}>
            <View style={[styles.media, { backgroundColor: `${cat.tint}14` }]}>
              {l.image_url ? (
                <Image source={{ uri: l.image_url }} style={styles.img} resizeMode="cover" accessibilityLabel={l.title} />
              ) : (
                <Ionicons name={cat.icon as any} size={80} color={cat.tint} />
              )}
            </View>
            <View style={{ gap: 8 }}>
              <View style={styles.pills}>
                <Text style={[styles.pill, { backgroundColor: `${cat.tint}1A`, color: cat.tint }]}>{t(cat.name)}</Text>
                {l.country ? <Text style={[styles.pill, { backgroundColor: '#F1F5F9', color: colors.muted }]}>📍 {l.country}</Text> : null}
                {sold ? <Text style={[styles.pill, { backgroundColor: '#DCFCE7', color: '#166534' }]}>{es ? 'Vendido' : 'Sold'}</Text> : null}
                {l.status === 'under_offer' ? <Text style={[styles.pill, { backgroundColor: '#FEF3C7', color: '#92400E' }]}>{es ? 'En negociación' : 'Under offer'}</Text> : null}
              </View>
              <Text style={styles.h1}>{l.title}</Text>
              <Text style={styles.tagline}>{l.tagline}</Text>
            </View>

            <View style={styles.facts}>
              {facts.map(([k, v]) => (
                <View key={k} style={styles.fact}>
                  <Text style={styles.factValue}>{v}</Text>
                  <Text style={styles.factLabel}>{k}</Text>
                </View>
              ))}
            </View>

            {l.description ? (
              <Section title={es ? 'Sobre el negocio' : 'About the business'}>
                <Text style={styles.body}>{l.description}</Text>
              </Section>
            ) : null}
            {l.included?.length ? (
              <Section title={es ? 'Qué incluye la venta' : "What's included"}>
                {l.included.map((x) => (
                  <View key={x} style={styles.li}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.cyan} />
                    <Text style={styles.body}>{x}</Text>
                  </View>
                ))}
              </Section>
            ) : null}
            {l.tech_stack?.length ? (
              <Section title={es ? 'Tecnología' : 'Tech stack'}>
                <View style={styles.pills}>
                  {l.tech_stack.map((x) => (
                    <Text key={x} style={[styles.pill, { backgroundColor: colors.surface, color: colors.text, borderWidth: 1, borderColor: colors.border }]}>
                      {x}
                    </Text>
                  ))}
                </View>
              </Section>
            ) : null}
            {l.reason_for_selling ? (
              <Section title={es ? 'Por qué se vende' : 'Why it is for sale'}>
                <Text style={styles.body}>{l.reason_for_selling}</Text>
              </Section>
            ) : null}
            {l.demo_url ? (
              <Pressable style={styles.demo} onPress={() => Linking.openURL(l.demo_url!)} accessibilityRole="link">
                <Ionicons name="open-outline" size={18} color={colors.primary} />
                <Text style={styles.demoText}>{es ? 'Ver demo' : 'View demo'}</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={[wide && { flex: 1 }, wide && ({ position: 'sticky', top: 90 } as any)]}>
            {sold ? (
              <View style={[styles.box, shadow]}>
                <Text style={styles.boxTitle}>{es ? 'Este negocio ya se vendió' : 'This business has been sold'}</Text>
                <Text style={styles.body}>
                  {es ? '¿Tienes uno parecido? Publícalo y te conectamos con compradores.' : 'Have a similar one? List it and we connect you with buyers.'}
                </Text>
                <Link href="/sell" style={styles.back}>
                  {es ? 'Vender mi negocio →' : 'Sell my business →'}
                </Link>
              </View>
            ) : (
              <InquiryBox listing={l} />
            )}
          </View>
        </View>
      </View>
    </Shell>
  );
}

function InquiryBox({ listing }: { listing: Listing }) {
  const { lang } = useLang();
  const es = lang === 'es';
  const [kind, setKind] = useState<'info' | 'offer'>('info');
  const [f, setF] = useState({ name: '', email: '', whatsapp: '', offer: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  const submit = async () => {
    setMsg(null);
    setBusy(true);
    const { error } = await supabase.rpc('create_listing_inquiry', {
      p_slug: listing.slug,
      p_kind: kind,
      p_name: f.name,
      p_email: f.email,
      p_whatsapp: f.whatsapp || null,
      p_offer: kind === 'offer' ? Number(f.offer.replace(/[^\d.]/g, '')) || null : null,
      p_message: f.message || null,
      p_lang: lang,
    });
    setBusy(false);
    if (error) return setMsg({ ok: false, text: friendlyError(error, lang) });
    setMsg({
      ok: true,
      text: es
        ? 'Recibido. Te escribimos en menos de 24 horas con los próximos pasos.'
        : 'Received. We will write to you within 24 hours with the next steps.',
    });
    setF({ name: '', email: '', whatsapp: '', offer: '', message: '' });
  };

  return (
    <View style={[styles.box, shadow]}>
      <Text style={styles.price}>{usd(listing.asking_price)}</Text>
      <Text style={styles.factLabel}>{es ? 'Precio pedido' : 'Asking price'}</Text>
      <View style={styles.tabs}>
        {(['info', 'offer'] as const).map((k) => (
          <Pressable key={k} onPress={() => setKind(k)} style={[styles.tab, kind === k && styles.tabOn]} accessibilityRole="button" accessibilityState={{ selected: kind === k }}>
            <Text style={[styles.tabText, kind === k && { color: '#fff' }]}>
              {k === 'info' ? (es ? 'Pedir detalles' : 'Request details') : es ? 'Hacer oferta' : 'Make an offer'}
            </Text>
          </Pressable>
        ))}
      </View>
      <Field label={es ? 'Nombre *' : 'Name *'} value={f.name} onChangeText={set('name')} autoComplete="name" />
      <Field label={es ? 'Correo *' : 'Email *'} value={f.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
      <Field label="WhatsApp" value={f.whatsapp} onChangeText={set('whatsapp')} keyboardType="phone-pad" placeholder="+58 …" />
      {kind === 'offer' ? <Field label={es ? 'Tu oferta (USD) *' : 'Your offer (USD) *'} value={f.offer} onChangeText={set('offer')} keyboardType="decimal-pad" placeholder="5000" /> : null}
      <Field
        label={es ? 'Mensaje' : 'Message'}
        value={f.message}
        onChangeText={set('message')}
        multiline
        placeholder={es ? 'Qué quieres saber, cómo pagarías, cuándo…' : 'What you want to know, how you would pay, timing…'}
      />
      {msg ? <Text style={msg.ok ? formStyles.success : formStyles.error}>{msg.text}</Text> : null}
      <Button label={kind === 'offer' ? (es ? 'Enviar oferta' : 'Send offer') : es ? 'Pedir detalles' : 'Request details'} icon="send" onPress={submit} loading={busy} />
      <Text style={styles.fine}>
        {es
          ? 'Sylkit revisa cada contacto y te presenta al vendedor. Los datos privados del negocio se comparten solo con compradores serios.'
          : 'Sylkit reviews every inquiry and introduces you to the seller. Private business data is shared only with serious buyers.'}
      </Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={[styles.section, shadow]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Shell({ children, title, description }: { children: ReactNode; title?: string; description?: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Head>
        <title>{title ?? 'Sylkit'}</title>
        {description ? <meta name="description" content={description} /> : null}
      </Head>
      <Header />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {children}
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 1180, alignSelf: 'center', paddingHorizontal: 16, paddingBottom: 32 },
  back: { fontSize: 15, fontWeight: '700', color: colors.primary },
  media: { aspectRatio: 16 / 9, borderRadius: 20, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  img: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: { fontSize: 12, fontWeight: '800', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, overflow: 'hidden' },
  h1: { fontSize: 32, lineHeight: 38, fontWeight: '800', color: colors.text, letterSpacing: -0.7 },
  tagline: { fontSize: 17, lineHeight: 25, color: colors.muted },
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  fact: { flexGrow: 1, flexBasis: 150, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14, gap: 2 },
  factValue: { fontSize: 20, fontWeight: '800', color: colors.text },
  factLabel: { fontSize: 12, color: colors.muted },
  section: { backgroundColor: colors.surface, borderRadius: 16, padding: 18, gap: 10, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  body: { fontSize: 15, lineHeight: 23, color: colors.text, flexShrink: 1 },
  li: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  demo: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', backgroundColor: colors.softBlue, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
  demoText: { color: colors.primary, fontWeight: '800' },
  box: { backgroundColor: colors.surface, borderRadius: 20, padding: 18, gap: 12, borderWidth: 1, borderColor: colors.border },
  boxTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  price: { fontSize: 32, fontWeight: '800', color: colors.text, letterSpacing: -0.8 },
  tabs: { flexDirection: 'row', backgroundColor: colors.bg, borderRadius: 12, padding: 4, gap: 4 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
  tabOn: { backgroundColor: colors.primary },
  tabText: { fontWeight: '800', fontSize: 14, color: colors.text },
  fine: { fontSize: 12, lineHeight: 17, color: colors.muted },
});
