// Customer accounts with Supabase Auth: "Continue with Google" or an email magic link.
// Browsing, demos and the chat never need an account; ordering and quotes do.
import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { supabase, SUPABASE_KEY, SUPABASE_URL } from './supabase';

/** Current session (null = signed out, undefined = still checking). Updates when it changes. */
export function useSession() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => alive && setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  return session;
}

/** Where to come back after signing in: the page the customer is on (same site only). */
function backHere() {
  if (typeof window === 'undefined') return 'https://sylkit.com/';
  return window.location.origin + window.location.pathname + window.location.search;
}

/** Whether Google sign-in is switched on in Supabase (the button only shows when it is). */
let googleOn: Promise<boolean> | null = null;
export function googleEnabled() {
  googleOn ||= fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_KEY } })
    .then((r) => r.json())
    .then((j) => !!j?.external?.google)
    .catch(() => false);
  return googleOn;
}

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: backHere() } });
}

export async function sendMagicLink(email: string) {
  return supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: backHere(), shouldCreateUser: true } });
}

export const signOut = () => supabase.auth.signOut();

/** Calls a /api/account endpoint with the customer's session. */
export async function accountApi<T = any>(path: string, body?: unknown): Promise<T & { error?: string; _status: number }> {
  const { data } = await supabase.auth.getSession();
  const jwt = data.session?.access_token;
  if (!jwt) return { error: 'sign_in_required', _status: 401 } as any;
  const r = await fetch(`/api/account/${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { authorization: `Bearer ${jwt}`, ...(body === undefined ? {} : { 'content-type': 'application/json' }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({ error: 'network' }));
  return { ...j, _status: r.status };
}

/** Links a just-placed order to the signed-in account (best effort, never blocks the order). */
export async function linkOrder(token: string) {
  try {
    await accountApi('link', { token });
  } catch {
    /* the order still exists; "My orders" also finds it by email */
  }
}

/** Name and email to prefill forms from the account. */
export function accountContact(session: Session | null | undefined) {
  const u = session?.user;
  const meta = (u?.user_metadata || {}) as Record<string, any>;
  return { email: u?.email ?? '', name: String(meta.full_name || meta.name || '') };
}
