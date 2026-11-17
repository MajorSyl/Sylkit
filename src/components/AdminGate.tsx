import type { Session } from '@supabase/supabase-js';
import { Link } from 'expo-router';
import Head from 'expo-router/head';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { colors, shadow } from '../theme';
import { Button } from './Button';
import { SignInCard } from './SignInGate';

// Admin pages are in English (internal tool).

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
        <Text style={styles.h2}>This account has no admin access</Text>
        <Text style={styles.muted}>Signed in as {session.user.email}. Ask for this account to be activated as an admin.</Text>
        <Button label="Sign out" variant="secondary" onPress={() => supabase.auth.signOut()} />
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
              <Link href="/admin" style={styles.navLink}>Orders</Link>
              <Link href="/admin/support" style={styles.navLink}>Support</Link>
              <Link href="/admin/products" style={styles.navLink}>Products</Link>
              <Link href="/" style={styles.navLink}>View site</Link>
              <Pressable onPress={() => supabase.auth.signOut()}>
                <Text style={styles.navLink}>Sign out</Text>
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

// Admin sign-in uses the same passwordless login as customers (Google or an email link).
// Only accounts listed in public.admins get past the is_admin() check above.
function Login() {
  return (
    <SignInCard
      title="Sylkit Admin"
      sub="Sign in with your admin Google account or get a sign-in link by email. No password needed."
    />
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
