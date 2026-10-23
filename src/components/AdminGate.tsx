import type { Session } from '@supabase/supabase-js';
import { Link } from 'expo-router';
import Head from 'expo-router/head';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { friendlyError, supabase } from '../lib/supabase';
import { colors, shadow } from '../theme';
import { Button } from './Button';
import { Field, formStyles } from './Field';

// Admin pages are in Spanish (internal tool).

export function AdminGate({ children, title }: { children: (session: Session) => React.ReactNode; title: string }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return setIsAdmin(null);
    supabase.rpc('is_admin').then(({ data }) => setIsAdmin(!!data));
  }, [session]);

  let content: React.ReactNode;
  if (!ready || (session && isAdmin === null)) content = <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 80 }} />;
  else if (!session) content = <Login />;
  else if (!isAdmin)
    content = (
      <View style={[styles.card, shadow]}>
        <Text style={styles.h2}>Cuenta sin acceso de administrador</Text>
        <Text style={styles.muted}>Sesión iniciada como {session.user.email}. Pide que activen esta cuenta como administrador.</Text>
        <Button label="Cerrar sesión" variant="secondary" onPress={() => supabase.auth.signOut()} />
      </View>
    );
  else content = children(session);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Head>
        <title>{title} · Sylkit Admin</title>
        <meta name="robots" content="noindex" />
      </Head>
      <View style={styles.bar}>
        <View style={styles.barInner}>
          <Link href="/admin" style={styles.brand}>
            Sylkit <Text style={{ color: colors.primary }}>Admin</Text>
          </Link>
          {session && isAdmin ? (
            <View style={styles.nav}>
              <Link href="/admin" style={styles.navLink}>Pedidos</Link>
              <Link href="/admin/products" style={styles.navLink}>Productos</Link>
              <Link href="/" style={styles.navLink}>Ver sitio</Link>
              <Pressable onPress={() => supabase.auth.signOut()}>
                <Text style={styles.navLink}>Salir</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 48 }}>
        <View style={styles.container}>{content}</View>
      </ScrollView>
    </View>
  );
}

function Login() {
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const submit = async () => {
    setError('');
    setInfo('');
    if (password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.');
    setBusy(true);
    if (mode === 'in') {
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (err) setError(friendlyError(err, 'es'));
    } else {
      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/admin` : undefined },
      });
      if (err) setError(err.message);
      else if (!data.session) setInfo('Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.');
    }
    setBusy(false);
  };

  return (
    <View style={[styles.card, shadow, { maxWidth: 440, alignSelf: 'center', width: '100%' }]}>
      <Text style={styles.h2}>{mode === 'in' ? 'Iniciar sesión' : 'Crear cuenta de administrador'}</Text>
      <Field label="Correo" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
      <Field label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" onSubmitEditing={submit} />
      {error ? <Text style={formStyles.error}>{error}</Text> : null}
      {info ? <Text style={formStyles.success}>{info}</Text> : null}
      <Button label={mode === 'in' ? 'Entrar' : 'Crear cuenta'} onPress={submit} loading={busy} />
      <Pressable onPress={() => setMode(mode === 'in' ? 'up' : 'in')} style={{ alignItems: 'center', padding: 8 }}>
        <Text style={{ color: colors.primary, fontWeight: '700' }}>
          {mode === 'in' ? 'Primera vez: crear cuenta' : 'Ya tengo cuenta: iniciar sesión'}
        </Text>
      </Pressable>
    </View>
  );
}

export const adminStyles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 18, padding: 18, gap: 12, borderWidth: 1, borderColor: colors.border },
  h1: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  h2: { fontSize: 18, fontWeight: '800', color: colors.text },
  muted: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  label: { fontSize: 12, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 15, color: colors.text },
});

const styles = StyleSheet.create({
  ...adminStyles,
  bar: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  barInner: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { fontSize: 18, fontWeight: '800', color: colors.text },
  nav: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignItems: 'center' },
  navLink: { fontSize: 14, fontWeight: '700', color: colors.text },
  container: { width: '100%', maxWidth: 1180, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 24 },
});
