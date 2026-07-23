/**
 * Regole email per il prefill dei form partner (Donorbox).
 * Funzioni PURE, nessuna dipendenza: testabili in isolamento.
 *
 * Contesto (goal partner-identita, F1.7): quando l'utente parte dall'app verso
 * Donorbox, precompiliamo il form con i suoi dati. L'email da usare segue la regola
 * `contact_email ?? auth.email`, MA con una guardia: se l'email risolta è un
 * indirizzo Apple Private Relay non la precompiliamo — l'utente ha scelto di
 * nascondere la sua email reale con Apple, e una ricevuta di donazione conviene
 * che arrivi a una casella che lui riconosce. In quel caso lasciamo il campo vuoto
 * così lo compila lui sul form del partner.
 */

/**
 * Vero se `email` è un indirizzo Apple Private Relay
 * (`<qualcosa>@privaterelay.appleid.com`, generato da "Accedi con Apple" quando
 * l'utente sceglie "Nascondi la mia email"). Case-insensitive, whitespace-tollerante.
 * L'ancora `@` prima del dominio evita falsi positivi tipo
 * `x@evil-privaterelay.appleid.com` (lì il carattere prima di `privaterelay` è `-`).
 */
export const isApplePrivateRelayEmail = (
  email: string | null | undefined
): boolean => {
  if (!email) return false;
  return email.trim().toLowerCase().endsWith('@privaterelay.appleid.com');
};

export interface PrefillEmailInput {
  /** `profiles.contact_email` — email di contatto scelta dall'utente (può mancare). */
  contactEmail?: string | null;
  /** `auth.users.email` — email dell'account (può essere un Apple Private Relay). */
  authEmail?: string | null;
}

/**
 * Email da usare per il prefill del form partner, o `null` se non va precompilata.
 * Regola: `contact_email ?? auth.email`; se il risultato è un Apple Private Relay
 * (o è vuoto) ritorna `null` — meglio nessun prefill che un indirizzo relay che
 * l'utente potrebbe non riconoscere sulla ricevuta.
 */
export const resolvePrefillEmail = ({
  contactEmail,
  authEmail,
}: PrefillEmailInput): string | null => {
  const resolved = (contactEmail ?? authEmail ?? '').trim();
  if (!resolved) return null;
  if (isApplePrivateRelayEmail(resolved)) return null;
  return resolved;
};
