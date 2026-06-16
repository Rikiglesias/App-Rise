/**
 * Deep-link redirect dell'auth (flusso reset password).
 * Pattern Supabase "Native Mobile Deep Linking" (Expo): il link dell'email di
 * recovery rientra nell'app con i token nel FRAGMENT dell'URL (flusso implicit,
 * coerente con `detectSessionInUrl: false` del client). Qui i puri util:
 * costruzione del redirectTo e parsing del fragment. Testabili in isolamento.
 */

import * as Linking from 'expo-linking';

/** Path del deep link di reset (deve combaciare con la route + l'allow-list Supabase). */
export const RESET_PASSWORD_PATH = 'reset-password';

/** Path del deep link di conferma email signup (coperto dall'allow-list `rahitalia://**`). */
export const EMAIL_CONFIRM_PATH = 'confirm-email';

/** Redirect deep-link per il reset: `<scheme>://reset-password`. */
export const buildResetRedirectTo = (): string =>
  Linking.createURL(RESET_PASSWORD_PATH);

/** Redirect deep-link per la conferma email signup: `<scheme>://confirm-email`. */
export const buildEmailConfirmRedirectTo = (): string =>
  Linking.createURL(EMAIL_CONFIRM_PATH);

export interface AuthRedirectParams {
  type?: string;
  access_token?: string;
  refresh_token?: string;
  error_code?: string;
  error_description?: string;
}

/**
 * Estrae i parametri auth dal fragment (`#k=v&...`) di un redirect Supabase.
 * Ritorna `{}` se non c'è fragment o è vuoto. Decodifica i valori URL-encoded.
 */
export const parseAuthRedirect = (url: string): AuthRedirectParams => {
  const hashIndex = url.indexOf('#');
  if (hashIndex === -1) return {};
  const fragment = url.slice(hashIndex + 1);
  if (!fragment) return {};

  const out: Record<string, string> = {};
  for (const pair of fragment.split('&')) {
    if (!pair) continue;
    const eq = pair.indexOf('=');
    const rawKey = eq === -1 ? pair : pair.slice(0, eq);
    const rawVal = eq === -1 ? '' : pair.slice(eq + 1);
    try {
      out[decodeURIComponent(rawKey)] = decodeURIComponent(rawVal);
    } catch {
      out[rawKey] = rawVal;
    }
  }
  return out;
};

/** True se l'URL è un redirect di recovery password (con token nel fragment). */
export const isRecoveryRedirect = (url: string): boolean => {
  const p = parseAuthRedirect(url);
  return (
    p.type === 'recovery' && Boolean(p.access_token) && Boolean(p.refresh_token)
  );
};

/** True se l'URL è un redirect di conferma email signup (con token nel fragment). */
export const isEmailConfirmRedirect = (url: string): boolean => {
  const p = parseAuthRedirect(url);
  return (
    p.type === 'signup' && Boolean(p.access_token) && Boolean(p.refresh_token)
  );
};
