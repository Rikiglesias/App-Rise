/**
 * Rilevazione della mail "relay" di Apple Hide-My-Email.
 *
 * Con "Nascondi la mia email" nel Sign in with Apple, il provider fornisce un
 * indirizzo casuale `…@privaterelay.appleid.com` al posto della vera mail: Apple
 * inoltra i messaggi al vero inbox SOLO da mittenti registrati nel relay e l'utente
 * può disattivare l'alias in qualsiasi momento. Per un'associazione donatori (ricevute,
 * comunicazioni) serve un indirizzo reale e stabile → quando la mail è una relay
 * chiediamo una mail di contatto nel completamento profilo.
 */
export const APPLE_RELAY_SUFFIX = '@privaterelay.appleid.com';

/** True se `email` è una relay Apple Hide-My-Email. Case-insensitive, trim-safe. */
export const isApplePrivateRelayEmail = (
  email: string | null | undefined
): boolean => (email ?? '').trim().toLowerCase().endsWith(APPLE_RELAY_SUFFIX);
