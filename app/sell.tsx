import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import Head from 'expo-router/head';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../src/components/Button';
import { Field, formStyles } from '../src/components/Field';
import { Footer } from '../src/components/Footer';
import { Header } from '../src/components/Header';
import { useLang } from '../src/i18n';
import { feeFor, feeTiers, listingCategories, ListingCategory, usd } from '../src/lib/listings';
import { friendlyError, supabase } from '../src/lib/supabase';
import { colors, shadow } from '../src/theme';

// Sellers submit their business; it is reviewed before it goes live.

const INCLUDED = [
  { es: 'Código fuente', en: 'Source code' },
  { es: 'Dominio', en: 'Domain' },
  { es: 'Usuarios / clientes', en: 'Users / customers' },
  { es: 'Redes sociales', en: 'Social media accounts' },
  { es: 'Diseños y marca', en: 'Designs and brand' },
  { es: 'Apps publicadas en las tiendas', en: 'Published store apps' },
  { es: '30 días de soporte al comprador', en: '30 days of buyer support' },
];

const num = (v: string) => {
  const n = Number(v.replace(/[^\d.]/g, ''));
  return v.trim() === '' || isNaN(n) ? null : n;
};

export default function SellPage() {
  const { t, lang } = useLang();
  const es = lang === 'es';
  const [f, setF] = useState({
    title: '',
    tagline: '',
    description: '',
    price: '',
    revenue: '',
    profit: '',
    users: '',
    age: '',
    stack: '',
    reason: '',
    website: '',
    demo: '',
    image: '',
    country: '',
    name: '',
    email: '',
    whatsapp: '',
  });
  const [cat, setCat] = useState<ListingCategory>('saas');
  const [included, setIncluded] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));
  const price = num(f.price);
  const fee = price ? feeFor(price) : null;

  const submit = async () => {
    setError('');
    setBusy(true);
    const { error: err } = await supabase.rpc('submit_listing', {
      p_title: f.title,
      p_tagline: f.tagline,
      p_description: f.description || null,
      p_category: cat,
      p_asking_price: price,
      p_annual_revenue: num(f.revenue) ?? 0,
      p_monthly_profit: num(f.profit) ?? 0,
      p_monthly_users: num(f.users),
      p_age_months: num(f.age),
      p_tech_stack: f.stack.split(',').map((x) => x.trim()).filter(Boolean).slice(0, 12),
      p_included: included,
      p_reason: f.reason || null,
      p_website_url: f.website || null,
      p_demo_url: f.demo || null,
      p_image_url: f.image || null,
      p_country: f.country || null,
      p_seller_name: f.name,
      p_seller_email: f.email,
      p_seller_whatsapp: f.whatsapp || null,
    });
    setBusy(false);
    if (err) return setError(friendlyError(err, lang));
    setDone(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Head>
        <title>{es ? 'Vende tu negocio online · Sylkit' : 'Sell your online business · Sylkit'}</title>
      </Head>
      <Header />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <Link href="/startups" style={styles.back}>
            {es ? '← Negocios en venta' : '← Businesses for sale'}
          </Link>
          <Text style={styles.h1}>{es ? 'Vende tu app, web o tienda online' : 'Sell your app, website or online store'}</Text>
          <Text style={styles.sub}>
            {es
              ? 'Publicar es gratis. Revisamos tu negocio, lo presentamos a compradores y te ayudamos a cerrar. Pagas comisión solo si se vende.'
              : 'Listing is free. We review your business, present it to buyers and help you close. You pay a fee only if it sells.'}
          </Text>

          <View style={styles.fees}>
            {feeTiers.map((x) => (
              <View key={x.from} style={[styles.fee, shadow]}>
                <Text style={styles.feeRate}>{x.rate}%</Text>
                <Text style={styles.feeFrom}>
                  {es ? 'desde' : 'from'} {usd(x.from)}
                </Text>
              </View>
            ))}
          </View>

          {done ? (
            <View style={[styles.card, shadow, { alignItems: 'center' }]}>
              <Ionicons name="checkmark-circle" size={48} color="#16A34A" />
              <Text style={styles.h2}>{es ? '¡Recibimos tu negocio!' : 'We received your business!'}</Text>
              <Text style={[styles.sub, { textAlign: 'center' }]}>
                {es
                  ? 'Lo revisamos y te escribimos en menos de 48 horas para confirmar los datos y publicarlo.'
                  : 'We will review it and write to you within 48 hours to confirm the details and publish it.'}
              </Text>
              <Link href="/startups" style={styles.back}>
                {es ? 'Ver negocios en venta →' : 'See businesses for sale →'}
              </Link>
            </View>
          ) : (
            <View style={[styles.card, shadow]}>
              <Text style={styles.h2}>{es ? 'Tu negocio' : 'Your business'}</Text>
              <Field label={es ? 'Nombre del negocio *' : 'Business name *'} value={f.title} onChangeText={set('title')} placeholder={es ? 'Ej. App de recordatorios para farmacias' : 'e.g. Pharmacy reminder app'} />
              <Field label={es ? 'Descripción corta *' : 'One-line pitch *'} value={f.tagline} onChangeText={set('tagline')} placeholder={es ? 'Qué hace y para quién, en una frase' : 'What it does and for whom, in one sentence'} />
              <Text style={styles.label}>{es ? 'Categoría' : 'Category'}</Text>
              <View style={styles.chips}>
                {listingCategories.map((c) => (
                  <Pressable key={c.id} onPress={() => setCat(c.id)} style={[styles.chip, cat === c.id && styles.chipOn]} accessibilityRole="radio" accessibilityState={{ checked: cat === c.id }}>
                    <Text style={[styles.chipText, cat === c.id && { color: '#fff' }]}>{t(c.name)}</Text>
                  </Pressable>
                ))}
              </View>
              <Field label={es ? 'Descripción completa' : 'Full description'} value={f.description} onChangeText={set('description')} multiline placeholder={es ? 'Cómo funciona, de dónde vienen los clientes, cuánto tiempo toma manejarlo…' : 'How it works, where customers come from, time it takes to run…'} />

              <Text style={styles.h2}>{es ? 'Números' : 'Numbers'}</Text>
              <View style={styles.row}>
                <View style={styles.col}>
                  <Field label={es ? 'Precio pedido (USD) *' : 'Asking price (USD) *'} value={f.price} onChangeText={set('price')} keyboardType="decimal-pad" placeholder="5000" />
                </View>
                <View style={styles.col}>
                  <Field label={es ? 'Ingresos anuales (USD)' : 'Annual revenue (USD)'} value={f.revenue} onChangeText={set('revenue')} keyboardType="decimal-pad" placeholder={es ? '0 si aún no factura' : '0 if pre-revenue'} />
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.col}>
                  <Field label={es ? 'Ganancia mensual (USD)' : 'Monthly profit (USD)'} value={f.profit} onChangeText={set('profit')} keyboardType="decimal-pad" />
                </View>
                <View style={styles.col}>
                  <Field label={es ? 'Usuarios al mes' : 'Monthly users'} value={f.users} onChangeText={set('users')} keyboardType="number-pad" />
                </View>
                <View style={styles.col}>
                  <Field label={es ? 'Antigüedad (meses)' : 'Age (months)'} value={f.age} onChangeText={set('age')} keyboardType="number-pad" />
                </View>
              </View>
              {fee ? (
                <Text style={styles.feeLine}>
                  {es ? `Si se vende en ${usd(price)}, la comisión es ${fee.rate}% (${usd(fee.amount)}) y recibes ${usd(price! - fee.amount)}.` : `If it sells for ${usd(price)}, the fee is ${fee.rate}% (${usd(fee.amount)}) and you receive ${usd(price! - fee.amount)}.`}
                </Text>
              ) : null}

              <Text style={styles.h2}>{es ? 'Detalles' : 'Details'}</Text>
              <Text style={styles.label}>{es ? 'Qué incluye la venta' : "What's included in the sale"}</Text>
              <View style={styles.chips}>
                {INCLUDED.map((x) => {
                  const v = t(x);
                  const on = included.includes(v);
                  return (
                    <Pressable key={x.en} onPress={() => setIncluded((s) => (on ? s.filter((y) => y !== v) : [...s, v]))} style={[styles.chip, on && styles.chipOn]} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
                      <Text style={[styles.chipText, on && { color: '#fff' }]}>{on ? '✓ ' : ''}{v}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Field label={es ? 'Tecnología (separada por comas)' : 'Tech stack (comma separated)'} value={f.stack} onChangeText={set('stack')} placeholder="React Native, Supabase, Stripe" autoCapitalize="none" />
              <Field label={es ? '¿Por qué lo vendes?' : 'Why are you selling?'} value={f.reason} onChangeText={set('reason')} multiline />
              <View style={styles.row}>
                <View style={styles.col}>
                  <Field label={es ? 'Sitio web (privado)' : 'Website (kept private)'} value={f.website} onChangeText={set('website')} autoCapitalize="none" keyboardType="url" placeholder="https://" hint={es ? 'Solo lo ven compradores aprobados.' : 'Only approved buyers see it.'} />
                </View>
                <View style={styles.col}>
                  <Field label={es ? 'Link de demo (público)' : 'Demo link (public)'} value={f.demo} onChangeText={set('demo')} autoCapitalize="none" keyboardType="url" placeholder="https://" />
                </View>
              </View>
              <Field label={es ? 'Link a una captura de pantalla' : 'Link to a screenshot'} value={f.image} onChangeText={set('image')} autoCapitalize="none" keyboardType="url" placeholder="https://…png" hint={es ? 'Opcional. Si no tienes, la tomamos nosotros.' : "Optional. If you don't have one, we'll take it for you."} />
              <Field label={es ? 'País' : 'Country'} value={f.country} onChangeText={set('country')} />

              <Text style={styles.h2}>{es ? 'Tus datos (privados)' : 'Your details (private)'}</Text>
              <View style={styles.row}>
                <View style={styles.col}>
                  <Field label={es ? 'Nombre *' : 'Name *'} value={f.name} onChangeText={set('name')} autoComplete="name" />
                </View>
                <View style={styles.col}>
                  <Field label={es ? 'Correo *' : 'Email *'} value={f.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
                </View>
                <View style={styles.col}>
                  <Field label="WhatsApp" value={f.whatsapp} onChangeText={set('whatsapp')} keyboardType="phone-pad" placeholder="+58 …" />
                </View>
              </View>
              {error ? <Text style={formStyles.error}>{error}</Text> : null}
              <Button label={es ? 'Enviar para revisión' : 'Submit for review'} icon="send" onPress={submit} loading={busy} />
              <Text style={styles.fine}>
                {es
                  ? 'Al publicar confirmas que el negocio es tuyo y que los datos son reales. Revisamos cada publicación antes de mostrarla.'
                  : 'By submitting you confirm the business is yours and the numbers are real. We review every listing before it goes live.'}
              </Text>
            </View>
          )}
        </View>
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 820, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 24, paddingBottom: 32, gap: 14 },
  back: { fontSize: 15, fontWeight: '700', color: colors.primary },
  h1: { fontSize: 34, lineHeight: 40, fontWeight: '800', color: colors.text, letterSpacing: -0.8 },
  h2: { fontSize: 19, fontWeight: '800', color: colors.text, marginTop: 6 },
  sub: { fontSize: 16, lineHeight: 24, color: colors.muted },
  fees: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  fee: { flexGrow: 1, flexBasis: 140, backgroundColor: colors.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border },
  feeRate: { fontSize: 26, fontWeight: '800', color: colors.primary },
  feeFrom: { fontSize: 13, color: colors.muted },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, gap: 14, borderWidth: 1, borderColor: colors.border },
  label: { fontSize: 14, fontWeight: '700', color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.text },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  col: { flexGrow: 1, flexBasis: 200 },
  feeLine: { fontSize: 14, color: '#0E7F98', fontWeight: '700', backgroundColor: colors.softCyan, padding: 12, borderRadius: 10 },
  fine: { fontSize: 12, lineHeight: 17, color: colors.muted, textAlign: 'center' },
});
