import { supabase } from '@/shared/auth/supabaseClient';
import { logError } from '@/shared/utils/logger';

/**
 * Nickname della persona e sua PROIEZIONE su
 * `auth.users.raw_user_meta_data.preferred_username` (goal partner-identita, F-NICKNAME).
 *
 * Gemello di `displayName.ts`, stessa meccanica e stesso motivo: il claim OIDC che il
 * partner riceve NON lo componiamo noi, lo costruisce il server auth leggendo i
 * `user_metadata`. Verificato alla fonte sul codice di Supabase Auth (2026-07-29) su
 * entrambe le facce — `internal/tokens/service.go` (id_token) e
 * `internal/api/oauthserver/handlers.go` (UserInfo): entrambe leggono
 * `user_metadata["preferred_username"]`, con ripiego su `["username"]`.
 * Per questo la chiave si chiama `preferred_username` e non `nickname`: il nome della
 * colonna è nostro, il nome della chiave è del server.
 *
 * DIFFERENZA CHE CONTA rispetto a `name`: se `name` manca, il server ci mette l'EMAIL
 * dell'account come ripiego — ed è il motivo per cui `syncDisplayNameClaim` è urgente.
 * Per `preferred_username` NON esiste ripiego: se manca, il claim viene omesso e basta.
 * Un nickname assente non fa quindi trapelare nulla, ed è ciò che rende sicuro tenerlo
 * facoltativo.
 *
 * Come per il nome, `profiles` resta la fonte di verità e il metadato è la sua
 * proiezione, riallineata a ogni scrittura del nickname. Stesso residuo dichiarato:
 * le due copie possono divergere se la sincronizzazione fallisce (rete); non si
 * blocca l'utente per questo — il profilo è salvato, il claim serve a un flusso non
 * ancora attivo — l'anomalia va nei log a ERROR e la scrittura successiva la risana.
 */

/** Lunghezza ammessa, allineata al CHECK `nickname_forma` della migration 0017. */
export const NICKNAME_MIN = 2;
export const NICKNAME_MAX = 30;

/**
 * Riallinea `user_metadata.preferred_username` al nickname del profilo.
 * `updateUser({ data })` FONDE le chiavi passate, quindi non perde `name`/`first_name`/…
 *
 * A differenza di `syncDisplayNameClaim`, qui il valore VUOTO è un caso legittimo e va
 * PROPAGATO: chi cancella il proprio nickname si aspetta che sparisca anche dal sito
 * del partner. Scriviamo `null` — che il server auth tratta come assente — invece di
 * saltare la scrittura, altrimenti il claim resterebbe congelato all'ultimo valore.
 *
 * Non solleva e non blocca il chiamante: ritorna `true` se il metadato è allineato.
 */
export const syncNicknameClaim = async (
  nickname: string | null | undefined
): Promise<boolean> => {
  const value = (nickname ?? '').trim();
  try {
    const { error } = await supabase.auth.updateUser({
      data: { preferred_username: value === '' ? null : value },
    });
    if (error) {
      // Il profilo È salvato: qui perdiamo solo l'allineamento del claim OIDC.
      logError(
        'sync di user_metadata.preferred_username fallita',
        'nickname',
        error
      );
      return false;
    }
    return true;
  } catch (e) {
    // Un throw (rete che cade, client non inizializzato) NON deve interrompere il
    // chiamante: arriverebbe DOPO il salvataggio del profilo e prima della
    // navigazione, lasciando l'utente fermo sulla schermata senza spiegazione.
    logError(
      'sync di user_metadata.preferred_username ha lanciato',
      'nickname',
      e
    );
    return false;
  }
};
