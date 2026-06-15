/**
 * Mappa il messaggio d'errore di Supabase Auth (GoTrue) a una chiave i18n sotto
 * `auth.errors.*`, così la UI mostra un messaggio azionabile invece del generico.
 * Fallback sicuro: 'generic'. Funzione pura, testabile in isolamento.
 */
export const mapAuthError = (message: string | null | undefined): string => {
  if (!message) return 'generic';
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'invalid_credentials';
  if (m.includes('email not confirmed')) return 'email_not_confirmed';
  if (
    m.includes('already registered') ||
    m.includes('already been registered') ||
    m.includes('user already exists')
  ) {
    return 'already_registered';
  }
  if (m.includes('rate limit') || m.includes('too many requests')) {
    return 'rate_limited';
  }
  return 'generic';
};
