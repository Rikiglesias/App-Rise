import * as Sentry from '@sentry/react-native';

import { mapAuthError } from './authErrors';
import { logWarn } from '@/shared/utils/logger';

// Fallimenti auth ATTESI e frequenti (password errata, email già registrata, rate
// limit): NON vanno in captureMessage o inonderebbero Sentry di eventi previsti,
// bruciando quota e annegando il segnale reale. Il breadcrumb li conserva comunque
// per il contesto di un crash successivo. mapAuthError li riconosce dal messaggio GoTrue.
const EXPECTED_AUTH_ERRORS = new Set([
  'invalid_credentials',
  'email_not_confirmed',
  'already_registered',
  'rate_limited',
]);

/**
 * Telemetria auth: senza questa, login/registrazioni/cancellazioni FALLITE sono
 * invisibili in produzione (l'errore Supabase viene solo mostrato in UI e perso).
 * Breadcrumb Sentry SEMPRE (contesto per un crash successivo) + captureMessage solo
 * sui fallimenti INATTESI. MAI PII: nessuna email/password/token, solo l'esito e il
 * messaggio d'errore GoTrue (già generico, es. "Invalid credentials").
 */
export const authTelemetry = (
  event: string,
  errorMessage?: string | null
): void => {
  Sentry.addBreadcrumb({
    category: 'auth',
    message: event,
    level: errorMessage ? 'warning' : 'info',
    ...(errorMessage ? { data: { error: errorMessage } } : {}),
  });
  if (errorMessage) {
    logWarn(`auth ${event} failed`, 'auth', { error: errorMessage });
    if (!EXPECTED_AUTH_ERRORS.has(mapAuthError(errorMessage))) {
      Sentry.captureMessage(`auth.${event}_failed`, 'warning');
    }
  }
};
