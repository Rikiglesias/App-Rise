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
 * proiezione, riallineata a ogni scrittura del nickname.
 *
 * ⚠️ DALLA MIGRATION 0020 QUESTA SINCRONIZZAZIONE NON È PIÙ LA DIFESA, è una comodità.
 * Il claim viene DERIVATO da `profiles` da due trigger nel database, e ciò che scriviamo
 * qui viene riallineato subito dopo. Il motivo per cui la difesa si è spostata là: i punti
 * che scrivono `preferred_username` sono quattro, e uno — `PUT /user` chiamato con una
 * sessione valida — non passa da questo file né da nessun altro nostro. Le tre garanzie
 * che il brief dà al partner (unico, da 2 a 30 caratteri, se lo togli smette di arrivare)
 * vivono sui vincoli di `public.profiles`, quindi il claim deve nascere da lì.
 * ⇒ il residuo che questo commento dichiarava — «le due copie possono divergere se la
 * sincronizzazione fallisce» — **non è più vero: la 0020 è viva in produzione dal
 * 2026-07-31** (registrata come `20260731152655`, trigger verificati abilitati). Se questa
 * chiamata fallisce, il claim resta comunque allineato al profilo.
 */

/** Lunghezza ammessa, allineata al CHECK `nickname_forma` della migration 0017. */
export const NICKNAME_MIN = 2;
export const NICKNAME_MAX = 30;

/**
 * Chiede al database se un nickname è libero (migration 0018).
 *
 * `true` libero · `false` già di qualcun altro · `null` NON VERIFICABILE (rete assente,
 * errore del server). I tre casi sono distinti apposta: `null` non è «occupato».
 *
 * ⚠️ PERCHÉ UNA RPC E NON UNA `select`. Le policy di `profiles` sono `auth.uid() = id`:
 * una select dal client vedrebbe zero righe in registrazione (chi scrive è `anon`) e solo
 * la propria in modifica profilo. Risponderebbe «libero» sempre — anche, e soprattutto,
 * quando è occupato. La funzione `nickname_disponibile` è `security definer` proprio per
 * questo, e restituisce solo un booleano. Dettaglio nella migration 0018.
 *
 * ⚠️ NON SOLLEVA MAI. Questo è un controllo di CORTESIA: serve a dire alla persona che
 * quel nome è preso, prima che scopra il silenzio. L'integrità la garantiscono l'indice
 * unico e le due clemenze del trigger (0017), che restano l'unica difesa vera. Se la
 * rete non c'è, la persona deve poter completare la registrazione lo stesso: si perde
 * l'avviso, non il servizio. Chi chiama tratta `null` come «non so», mai come «no».
 */
export const isNicknameAvailable = async (
  nickname: string
): Promise<boolean | null> => {
  const value = nickname.trim();
  // Nessun nickname è sempre ammissibile: non si disturba il server per chiederlo.
  if (value === '') return true;
  try {
    const { data, error } = await supabase.rpc('nickname_disponibile', {
      p_nickname: value,
    });
    if (error) {
      logError('controllo disponibilità nickname fallito', 'nickname', error);
      return null;
    }
    // Difesa sul tipo: la RPC dichiara `returns boolean`, ma un `data` inatteso
    // (null per una firma cambiata, un oggetto) non deve diventare «occupato» per
    // via di un cast implicito — diventerebbe un errore mostrato senza motivo.
    return typeof data === 'boolean' ? data : null;
  } catch (e) {
    logError('controllo disponibilità nickname ha lanciato', 'nickname', e);
    return null;
  }
};

/**
 * Nome dell'indice unico creato dalla 0017. Vive qui perché è l'unico modo che il client
 * ha per riconoscere UNA collisione di nickname da un guasto qualunque.
 */
const INDICE_UNICO = 'profiles_nickname_unico';

/**
 * Riconosce «il nickname è stato preso da un altro NELL'ISTANTE fra il controllo e il
 * salvataggio» dal messaggio d'errore della scrittura.
 *
 * Perché sul MESSAGGIO e non sul codice `23505`: `updateProfile` restituisce
 * `{ error: string }`, cioè il solo `error.message` — cambiarne la firma vorrebbe dire
 * toccare tutti i chiamanti per un caso che si tratta in un punto solo. Il nome
 * dell'indice, però, compare SEMPRE nel messaggio di Postgres
 * («duplicate key value violates unique constraint "profiles_nickname_unico"») ed è un
 * identificatore, quindi non cambia con la lingua del server.
 *
 * Il confronto è deliberatamente STRETTO: un `23505` su un altro vincolo non deve
 * diventare «nickname occupato», perché manderebbe la persona a cambiare un campo che
 * non c'entra mentre il guasto vero resta nascosto.
 */
export const isNicknameConflict = (message: string | null): boolean =>
  message?.toLowerCase().includes(INDICE_UNICO) ?? false;

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
