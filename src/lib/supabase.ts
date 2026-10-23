import { createClient } from '@supabase/supabase-js';

// Public values: safe to ship in the app. Access is controlled by database rules (RLS).
export const SUPABASE_URL = 'https://chcljhwcvzlmxrrhetfv.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_A0oOnUNRvW4ig6sXbM0CFw_1Tr2MwYy';

const isBrowser = typeof window !== 'undefined';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: isBrowser,
    autoRefreshToken: isBrowser,
    detectSessionInUrl: isBrowser,
  },
});

export const friendlyError = (e: unknown, lang: 'es' | 'en') => {
  const msg = String((e as any)?.message ?? e ?? '');
  const map: Record<string, [string, string]> = {
    invalid_name: ['Escribe tu nombre.', 'Please enter your name.'],
    invalid_email: ['Revisa tu correo electrónico.', 'Please check your email.'],
    too_long: ['Algún campo es demasiado largo.', 'One of the fields is too long.'],
    rate_limited: ['Recibimos varias solicitudes tuyas. Intenta de nuevo en una hora.', 'We got several requests from you. Please try again in an hour.'],
    invalid_reference: ['Escribe la referencia del pago.', 'Please enter the payment reference.'],
    cannot_accept: ['Esta cotización ya no se puede aceptar. Escríbenos.', 'This quote can no longer be accepted. Please contact us.'],
    cannot_submit_payment: ['No se pudo registrar el pago en este estado.', 'Payment cannot be registered at this stage.'],
    'Invalid login credentials': ['Correo o contraseña incorrectos.', 'Wrong email or password.'],
  };
  const hit = Object.keys(map).find((k) => msg.includes(k));
  if (hit) return map[hit][lang === 'es' ? 0 : 1];
  return lang === 'es' ? 'Algo salió mal. Intenta de nuevo.' : 'Something went wrong. Please try again.';
};
