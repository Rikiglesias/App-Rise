/**
 * Redirect auth PKCE: codice nella query, errori nella query o nel fragment.
 * I token dei vecchi link impliciti non possono aprire una sessione.
 */

// Import nominato (non namespace): la guardia no-restricted-imports vieta
// `openURL` da expo-linking e un `* as` importerebbe anche quello.
import { createURL } from 'expo-linking';

/** Path del deep link di reset (deve combaciare con la route + l'allow-list Supabase). */
export const RESET_PASSWORD_PATH = 'reset-password';

/** Path del deep link di conferma email signup (coperto dall'allow-list `rahitalia://**`). */
export const EMAIL_CONFIRM_PATH = 'confirm-email';

/** Percorso distinto: PKCE non garantisce il parametro type nel redirect. */
export const EMAIL_CHANGE_PATH = 'confirm-email-change';

/** Redirect deep-link per il reset: `<scheme>://reset-password`. */
export const buildResetRedirectTo = (): string =>
  createURL(RESET_PASSWORD_PATH);

/** Redirect deep-link per la conferma email signup: `<scheme>://confirm-email`. */
export const buildEmailConfirmRedirectTo = (): string =>
  createURL(EMAIL_CONFIRM_PATH);

export const buildEmailChangeRedirectTo = (): string =>
  createURL(EMAIL_CHANGE_PATH);

export interface AuthRedirectParams {
  code?: string;
  type?: string;
  access_token?: string;
  refresh_token?: string;
  error_code?: string;
  error_description?: string;
}

/** Codice PKCE decodificato, o null se malformato (nessuno scambio). */
const decodeCode = (raw: string): string | null => {
  try {
    return decodeURIComponent(raw.replace(/\+/g, ' '));
  } catch {
    return null;
  }
};

/**
 * Legge query e fragment senza propagare URL o error_description alla UI/log.
 * Solo la query può fornire il codice PKCE; gli errori hanno precedenza.
 */
export const parseAuthRedirect = (url: string): AuthRedirectParams => {
  const [beforeFragment = '', fragment = ''] = url.split('#');
  const query = beforeFragment.split('?')[1] ?? '';
  const out: Record<string, string> = {};
  for (const pair of `${query}&${fragment}`.split('&')) {
    if (!pair) continue;
    const eq = pair.indexOf('=');
    const rawKey = eq === -1 ? pair : pair.slice(0, eq);
    const rawVal = eq === -1 ? '' : pair.slice(eq + 1);
    try {
      const key = decodeURIComponent(rawKey);
      const value = decodeURIComponent(rawVal.replace(/\+/g, ' '));
      if (value || !out[key]) out[key] = value;
    } catch {
      out[rawKey] = rawVal;
    }
  }
  // Un fragment non deve poter sostituire o introdurre il codice di scambio.
  const codePair = query.split('&').find(pair => pair.startsWith('code='));
  delete out.code;
  const code = codePair ? decodeCode(codePair.slice(5)) : null;
  if (code) out.code = code;
  return out;
};

export type AuthLinkKind = 'reset' | 'confirm' | 'emailChange';

/** Accetta solo i redirect dell'app, mai un percorso omonimo su un sito esterno. */
export const getLinkType = (url: string): AuthLinkKind | null => {
  const base = url.split(/[?#]/)[0]?.replace(/\/+$/, '');
  const matches = (path: string): boolean =>
    base === `rahitalia://${path}` ||
    base === createURL(path).replace(/\/+$/, '');
  const { type } = parseAuthRedirect(url);
  if (matches(RESET_PASSWORD_PATH))
    return !type || type === 'recovery' ? 'reset' : null;
  if (matches(EMAIL_CHANGE_PATH))
    return !type || type === 'email_change' ? 'emailChange' : null;
  if (matches(EMAIL_CONFIRM_PATH)) {
    if (type === 'email_change') return 'emailChange';
    return !type || type === 'signup' ? 'confirm' : null;
  }
  return null;
};

/** True solo per recovery PKCE, senza errori nel redirect. */
export const isRecoveryRedirect = (url: string): boolean => {
  const p = parseAuthRedirect(url);
  return getLinkType(url) === 'reset' && Boolean(p.code) && !p.error_code;
};

/** Conferma iscrizione o cambio email tramite codice PKCE. */
export const isEmailConfirmRedirect = (url: string): boolean => {
  const p = parseAuthRedirect(url);
  const kind = getLinkType(url);
  return (
    (kind === 'confirm' || kind === 'emailChange') &&
    Boolean(p.code) &&
    !p.error_code
  );
};

/** Quale link auth è tornato indietro con un errore. */
export type AuthLinkErrorKind = AuthLinkKind;

/**
 * Link scaduto, già usato o rifiutato: Supabase rientra nell'app sullo stesso
 * redirect ma con `error_code` nella query o nel fragment
 * (es. `rahitalia://reset-password#error=access_denied&error_code=otp_expired`).
 * Prima questo URL non combaciava con nessun ramo e la persona restava senza
 * spiegazioni. Ritorna quale flusso è fallito, o `null`.
 */
export const getAuthLinkError = (url: string): AuthLinkErrorKind | null => {
  if (!parseAuthRedirect(url).error_code) return null;
  return getLinkType(url);
};
