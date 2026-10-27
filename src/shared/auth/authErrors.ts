/**
 * Mappa il messaggio d'errore di Supabase Auth (GoTrue) a una chiave i18n sotto
 * `auth.errors.*`, così la UI mostra un messaggio azionabile invece del generico.
 * Fallback sicuro: 'generic'. Funzione pura, testabile in isolamento.
 */
export const mapAuthError = (error: unknown): string => {
  const details =
    typeof error === 'object' && error !== null ? error : undefined;
  const code = details && 'code' in details ? details.code : undefined;
  const name = details && 'name' in details ? details.name : undefined;
  const message =
    typeof error === 'string'
      ? error
      : details && 'message' in details && typeof details.message === 'string'
        ? details.message
        : '';
  const m = message.toLowerCase();
  if (name === 'AbortError' || m === 'aborted' || m.includes('aborterror')) {
    return 'network';
  }
  if (
    code === 'same_password' ||
    m === 'same_password' ||
    m.includes('should be different from the old password')
  )
    return 'same_password';
  if (
    code === 'weak_password' ||
    m === 'weak_password' ||
    m.includes('weak password')
  )
    return 'weak_password';
  // Codice di `deleteAccountNow`: chiamata fallita senza che il server sapesse dire
  // se l'account esiste ancora (vedi accountActions.ts).
  if (m === 'delete_interrupted') return 'delete_interrupted';
  if (m.includes('invalid login credentials')) return 'invalid_credentials';
  if (code === 'email_not_confirmed' || m.includes('email not confirmed'))
    return 'email_not_confirmed';
  if (
    m.includes('already registered') ||
    m.includes('already been registered') ||
    m.includes('user already exists')
  ) {
    return 'already_registered';
  }
  if (
    code === 'over_email_send_rate_limit' ||
    code === 'over_request_rate_limit' ||
    m.includes('rate limit') ||
    m.includes('too many requests')
  ) {
    return 'rate_limited';
  }
  // fetch fallita senza risposta (supabase-js la rilancia col messaggio originale):
  // React Native, Chrome, Safari, Firefox.
  if (
    name === 'FunctionsFetchError' ||
    m === 'failed to send a request to the edge function' ||
    m.includes('network request failed') ||
    m.includes('network request timed out') ||
    m.includes('failed to fetch') ||
    m === 'load failed' ||
    m.includes('networkerror when attempting to fetch')
  ) {
    return 'network';
  }
  return 'generic';
};
