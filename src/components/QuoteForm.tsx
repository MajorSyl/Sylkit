import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLang } from '../i18n';
import type { Config } from '../lib/pricing';
import { friendlyError, supabase, createOrder } from '../lib/supabase';
import { colors, shadow } from '../theme';
import { Button } from './Button';
import { Field, formStyles } from './Field';
import { tx } from '../i18n';

export function QuoteForm({ productSlug, productName, config }: { productSlug?: string; productName?: string; config?: Config | null }) {
  const { lang } = useLang();
  const es = lang === 'es';
  const router = useRouter();
  const [f, setF] = useState({ name: '', email: '', whatsapp: '', business: '', country: '', details: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  const submit = async () => {
    setError('');
    if (f.name.trim().length < 2) return setError(tx('Please enter your name.', 'Escribe tu nombre.', "Digite seu nome."));
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) return setError(tx('Please check your email.', 'Revisa tu correo electrónico.', "Confira seu e-mail."));
    if (!productSlug && f.details.trim().length < 10)
      return setError(tx('Tell us a little about what you need.', 'Cuéntanos un poco qué necesitas.', "Conte um pouco sobre o que você precisa."));
    setBusy(true);
    const source = typeof window !== 'undefined' ? window.location.search.slice(0, 200) || 'direct' : 'app';
    const { data, error: err } = await createOrder({
      p_customer_name: f.name,
      p_email: f.email,
      p_whatsapp: f.whatsapp || null,
      p_business_name: f.business || null,
      p_country: f.country || null,
      p_details: f.details || null,
      p_product_slug: productSlug ?? null,
      p_lang: lang,
      p_source: source,
      p_config: config ?? null,
    });
    if (err || !data) {
      setBusy(false);
      return setError(friendlyError(err, lang));
    }
    const token = (data as any).token as string;
    // Fixed-price plan: confirm it at the server-calculated total so the client can pay right away.
    if (config) {
      try {
        await fetch('/api/pay/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token }) });
      } catch {
        /* if this fails, the order stays as a request and we send the quote manually */
      }
    }
    setBusy(false);
    router.push(`/order?t=${token}&new=1`);
  };

  return (
    <View style={[styles.card, shadow]}>
      <Text style={styles.title}>{config ? (tx('Your details', 'Tus datos', "Seus dados")) : tx('Request a quote', 'Solicitar cotización', "Pedir orçamento")}</Text>
      <Text style={styles.sub}>
        {config
          ? tx('We will send your receipt and order link to this email.', 'Te enviaremos el recibo y el enlace de tu pedido a este correo.', "Enviaremos seu recibo e o link do pedido para este e-mail.")
          : productName
          ? tx(`For: ${productName}. We reply with a price and notify you by email.`, `Para: ${productName}. Te respondemos con un precio y te avisamos por correo.`, `Para: ${productName}. Respondemos com um preço e avisamos por e-mail.`)
          : tx('Tell us what you need. We send you a quote and you can track your order online.', 'Cuéntanos qué necesitas. Te enviamos una cotización y puedes seguir tu pedido en línea.', "Conte o que você precisa. Enviamos um orçamento e você pode acompanhar seu pedido online.")}
      </Text>
      <View style={styles.row}>
        <View style={styles.col}>
          <Field label={tx('Name *', 'Nombre *', "Nome *")} value={f.name} onChangeText={set('name')} autoComplete="name" />
        </View>
        <View style={styles.col}>
          <Field label={tx('Company / business', 'Empresa / negocio', "Empresa / negócio")} value={f.business} onChangeText={set('business')} />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.col}>
          <Field
            label={tx('Email *', 'Correo electrónico *', "E-mail *")}
            value={f.email}
            onChangeText={set('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>
        <View style={styles.col}>
          <Field label="WhatsApp" value={f.whatsapp} onChangeText={set('whatsapp')} keyboardType="phone-pad" placeholder="+58 ..." />
        </View>
      </View>
      <Field label={tx('Country', 'País', "País")} value={f.country} onChangeText={set('country')} />
      <Field
        label={productSlug ? (tx('Details (optional)', 'Detalles (opcional)', "Detalhes (opcional)")) : tx('What do you need? *', '¿Qué necesitas? *', "Do que você precisa? *")}
        value={f.details}
        onChangeText={set('details')}
        multiline
        placeholder={tx('Type of business, number of locations, features you need…', 'Tipo de negocio, número de sucursales, funciones que necesitas…', "Tipo de negócio, número de unidades, funções que você precisa…")}
      />
      {error ? <Text style={formStyles.error}>{error}</Text> : null}
      <Button
        label={config ? (tx('Continue to payment', 'Continuar al pago', "Continuar para o pagamento")) : tx('Send request', 'Enviar solicitud', "Enviar solicitação")}
        icon={config ? 'lock-closed' : 'send'}
        onPress={submit}
        loading={busy}
      />
      <Text style={styles.fine}>
        {config
          ? tx('Next you choose how to pay: USDT or another method.', 'En el siguiente paso eliges cómo pagar: USDT u otro método.', "Em seguida você escolhe como pagar: cartão, USDT ou outro método.")
          : tx('No commitment. We usually reply within 24 hours.', 'Sin compromiso. Respondemos normalmente en menos de 24 horas.', "Sem compromisso. Normalmente respondemos em até 24 horas.")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, gap: 14, borderWidth: 1, borderColor: colors.border },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  sub: { fontSize: 14, lineHeight: 21, color: colors.muted },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  col: { flexGrow: 1, flexBasis: 240 },
  fine: { fontSize: 12, color: colors.muted, textAlign: 'center' },
});
