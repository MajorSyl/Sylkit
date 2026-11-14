import { Ionicons } from '@expo/vector-icons';
import type { Session } from '@supabase/supabase-js';
import { ReactNode, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { tx } from '../i18n';
import { sendMagicLink, signInWithGoogle, useSession } from '../lib/auth';
import { colors } from '../theme';

// Shows the sign-in card until the customer has an account session, then renders the page.
// Used in front of ordering and quotes; browsing, demos and the chat never pass through here.
export function SignInGate({ title, sub, children }: { title: string; sub?: string; children: (session: Session) => ReactNode }) {
  const session = useSession();
  if (session === undefined) return <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 80 }} />;
  if (session) return <>{children(session)}</>;
  return <SignInCard title={title} sub={sub} />;
}

export function SignInCard({ title, sub }: { title: string; sub?: string }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState<'google' | 'email' | null>(null);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const google = async () => {
    setError('');
    setBusy('google');
    const { error: err } = await signInWithGoogle();
    // On success the browser leaves for Google; we only get here on an error.
    if (err) {
      setBusy(null);
      setError(tx('Google sign-in is not available right now. Use your email below.', 'El acceso con Google no está disponible ahora. Usa tu correo abajo.', 'O acesso com Google não está disponível agora. Use seu e-mail abaixo.'));
    }
  };

  const magic = async () => {
    setError('');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return setError(tx('Please check your email.', 'Revisa tu correo electrónico.', 'Confira seu e-mail.'));
    setBusy('email');
    const { error: err } = await sendMagicLink(email);
    setBusy(null);
    if (err) {
      const wait = /rate|seconds|security purposes/i.test(err.message);
      return setError(
        wait
          ? tx('We just sent you a link. Please wait a minute before asking for another.', 'Te acabamos de enviar un enlace. Espera un minuto antes de pedir otro.', 'Acabamos de enviar um link. Espere um minuto antes de pedir outro.')
          : tx('We could not send the link. Please try again.', 'No pudimos enviar el enlace. Intenta de nuevo.', 'Não conseguimos enviar o link. Tente de novo.'),
      );
    }
    setSent(true);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.icon}>
          <Ionicons name="person-circle-outline" size={30} color={colors.primary} />
        </View>
        <Text style={styles.title} accessibilityRole="header">{title}</Text>
        <Text style={styles.sub}>
          {sub ??
            tx(
              'Sign in so your order, invoices and messages are saved in one place. It takes a few seconds and no password.',
              'Inicia sesión para guardar tus pedidos, facturas y mensajes en un solo lugar. Toma unos segundos y no necesitas contraseña.',
              'Entre para guardar seus pedidos, faturas e mensagens num só lugar. Leva segundos e não precisa de senha.',
            )}
        </Text>

        {sent ? (
          <View style={styles.sent} accessibilityRole="alert">
            <Ionicons name="mail-open-outline" size={22} color="#067647" />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.sentTitle}>{tx('Check your email', 'Revisa tu correo', 'Confira seu e-mail')}</Text>
              <Text style={styles.sentText}>
                {tx(
                  `We sent a sign-in link to ${email.trim()}. Open it on this device and you'll come right back here.`,
                  `Enviamos un enlace de acceso a ${email.trim()}. Ábrelo en este dispositivo y volverás aquí.`,
                  `Enviamos um link de acesso para ${email.trim()}. Abra neste aparelho e você volta para cá.`,
                )}
              </Text>
              <Pressable onPress={() => setSent(false)} accessibilityRole="button">
                <Text style={styles.link}>{tx('Use a different email', 'Usar otro correo', 'Usar outro e-mail')}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <Pressable onPress={google} disabled={!!busy} style={[styles.google, busy && { opacity: 0.6 }]} accessibilityRole="button">
              {busy === 'google' ? <ActivityIndicator color={colors.text} /> : <Ionicons name="logo-google" size={18} color={colors.text} />}
              <Text style={styles.googleText}>{tx('Continue with Google', 'Continuar con Google', 'Continuar com Google')}</Text>
            </Pressable>

            <View style={styles.or}>
              <View style={styles.line} />
              <Text style={styles.orText}>{tx('or', 'o', 'ou')}</Text>
              <View style={styles.line} />
            </View>

            <Text style={styles.label}>{tx('Email', 'Correo electrónico', 'E-mail')}</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@business.com"
              placeholderTextColor="#98A2B3"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              onSubmitEditing={magic}
              style={styles.input}
              accessibilityLabel={tx('Email', 'Correo electrónico', 'E-mail')}
            />
            <Pressable onPress={magic} disabled={!!busy} style={[styles.main, busy && { opacity: 0.6 }]} accessibilityRole="button">
              {busy === 'email' ? <ActivityIndicator color="#fff" /> : <Ionicons name="mail-outline" size={18} color="#fff" />}
              <Text style={styles.mainText}>{tx('Email me a sign-in link', 'Enviarme un enlace de acceso', 'Enviar link de acesso')}</Text>
            </Pressable>
          </>
        )}

        {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
        <Text style={styles.fine}>
          {tx('Just browsing? You can look at every system and chat with us without an account.', '¿Solo estás mirando? Puedes ver todos los sistemas y escribirnos sin cuenta.', 'Só olhando? Você pode ver todos os sistemas e falar com a gente sem conta.')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', alignItems: 'center', paddingVertical: 32, paddingHorizontal: 16 },
  card: { width: '100%', maxWidth: 440, backgroundColor: colors.surface, borderRadius: 22, padding: 24, gap: 12, borderWidth: 1, borderColor: colors.border },
  icon: { width: 52, height: 52, borderRadius: 999, backgroundColor: colors.softBlue, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: -0.4 },
  sub: { fontSize: 14.5, lineHeight: 21, color: colors.muted },
  google: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 50, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(11,27,58,0.18)', backgroundColor: '#fff', marginTop: 6 },
  googleText: { fontSize: 15.5, fontWeight: '700', color: colors.text },
  or: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 2 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  orText: { fontSize: 13, color: colors.muted },
  label: { fontSize: 13, fontWeight: '700', color: colors.text },
  input: { borderWidth: 1, borderColor: 'rgba(11,27,58,0.18)', borderRadius: 12, paddingHorizontal: 14, minHeight: 48, fontSize: 15.5, color: colors.text, backgroundColor: '#fff' },
  main: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 50, borderRadius: 14, backgroundColor: colors.text },
  mainText: { fontSize: 15.5, fontWeight: '800', color: '#fff' },
  sent: { flexDirection: 'row', gap: 12, backgroundColor: '#ECFDF3', borderRadius: 14, padding: 14, marginTop: 4 },
  sentTitle: { fontSize: 15, fontWeight: '800', color: '#067647' },
  sentText: { fontSize: 14, lineHeight: 20, color: '#054F31' },
  link: { fontSize: 13.5, fontWeight: '700', color: colors.primary, marginTop: 4 },
  error: { fontSize: 14, color: '#B42318', fontWeight: '600' },
  fine: { fontSize: 12.5, color: colors.muted, lineHeight: 18, marginTop: 4 },
});
