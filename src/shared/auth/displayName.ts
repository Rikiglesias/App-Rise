import { supabase } from '@/shared/auth/supabaseClient';
import { logError } from '@/shared/utils/logger';

/**
 * Nome visualizzato dell'utente e sua PROIEZIONE su `auth.users.raw_user_meta_data.name`
 * (goal partner-identita, P1).
 *
 * Perché esiste (e perché il dato è duplicato): quando Let's Donation entrerà con
 * "Login con RAH", il claim OIDC `name` che riceve NON lo componiamo noi. Lo costruisce
 * il server auth, e legge SOLO `user_metadata["name"]` — verificato alla fonte sul
 * codice di Supabase Auth, su ENTRAMBE le facce (id_token in `internal/tokens/service.go`,
 * endpoint UserInfo in `internal/api/oauthserver/handlers.go`); i claim custom non
 * raggiungono il client OIDC. Nessuna chiave alternativa: `full_name` NON viene letta.
 *
 * Il punto che rende la cosa urgente: se la chiave manca il claim non resta vuoto,
 * ci finisce l'EMAIL dell'account come fallback. Per un utente "Accedi con Apple" che
 * nasconde la mail, il partner vedrebbe come nome il suo alias `@privaterelay.appleid.com`.
 *
 * Di conseguenza `profiles` resta la fonte di verità del nome e il metadato è una sua
 * proiezione, riallineata a OGNI scrittura del nome (registrazione, completamento
 * profilo post-social, rettifica Art.16).
 *
 * Residuo dichiarato: le due copie possono divergere se la sincronizzazione fallisce
 * (rete). Non blocchiamo l'operazione dell'utente per questo — il profilo è salvato e
 * il claim serve a un flusso non ancora attivo — ma l'anomalia va nei log a livello
 * ERROR (warn/info sono scartati in produzione, vedi `logger.ts`) e la scrittura
 * successiva del nome la risana.
 */

/**
 * Nome unico da nome + cognome, per il claim `name` e per la UI.
 * Tollera spazi e parti mancanti: `' Mario '`+`''` → `'Mario'`; entrambe vuote → `''`.
 */
export const buildDisplayName = (
  firstName: string | null | undefined,
  lastName: string | null | undefined
): string => `${(firstName ?? '').trim()} ${(lastName ?? '').trim()}`.trim();

/**
 * Riallinea `user_metadata.name` a nome+cognome. `updateUser({ data })` FONDE le chiavi
 * passate (verificato: `UpdateUserMetaData` «doesn't override attributes that are not in
 * the provided map»), quindi non perde `first_name`/`birth_date`/… già presenti.
 *
 * Non solleva e non blocca il chiamante: ritorna `true` se il metadato è allineato.
 * Con nome vuoto non scrive nulla (scrivere `''` equivale ad assente per il server auth,
 * che poi ripiegherebbe comunque sull'email).
 */
export const syncDisplayNameClaim = async (
  firstName: string | null | undefined,
  lastName: string | null | undefined
): Promise<boolean> => {
  const name = buildDisplayName(firstName, lastName);
  if (!name) return false;
  try {
    const { error } = await supabase.auth.updateUser({ data: { name } });
    if (error) {
      // Il profilo È salvato: qui perdiamo solo l'allineamento del claim OIDC.
      logError('sync di user_metadata.name fallita', 'displayName', error);
      return false;
    }
    return true;
  } catch (e) {
    // Un throw (rete che cade, client non inizializzato) NON deve interrompere il
    // chiamante: nel completamento profilo arriverebbe DOPO il salvataggio e prima
    // della navigazione, lasciando l'utente fermo sulla schermata senza spiegazione.
    logError('sync di user_metadata.name ha lanciato', 'displayName', e);
    return false;
  }
};
