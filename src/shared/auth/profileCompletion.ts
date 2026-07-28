import type { Profile } from './types';

/**
 * Completezza del profilo donatore (goal partner-identita, P2 pezzo (b)).
 *
 * Perché esiste: la decisione D-a è «profilo MINIMO alla nascita + completamento
 * OBBLIGATORIO differito». Il rischio del disegno è tutto nella seconda metà —
 * *nullable ≠ opzionale per sempre*: senza qualcosa che sappia dire QUALI campi
 * mancano e li richieda alla prima occasione utile, «prima o poi» diventa «mai» e
 * l'associazione resta senza i dati che le servono.
 *
 * Il contesto che rende la cosa non rinviabile: con l'invariante I7 (un solo ingresso
 * sul nostro tenant Let's Donation) il nostro form diventa il solo cancello anche per
 * un acquisto minimo. Alleggerirlo alla nascita è ciò che rende sostenibile la
 * richiesta al partner; questo modulo è il contrappeso che impedisce che
 * l'alleggerimento diventi una perdita di dati.
 *
 * Funzioni PURE: nessuna dipendenza, testabili in isolamento.
 */

/**
 * Campi che un profilo deve avere PRIMA O POI, anche se non alla nascita.
 * `contact_email` è qui perché è il campo su cui poggia il riconoscimento della
 * persona nell'anagrafica importata dal partner: un profilo che ne è privo veniva
 * classificato «completo» e il sollecito non scattava proprio sul dato appena reso
 * obbligatorio — il presidio era cieco sul dato che deve difendere. Ne restano
 * privi tutti i profili nati da registrazione email/password (il form non la
 * chiede, il trigger non la scrive) e quelli creati prima della regola.
 */
export type CompletableField = 'phone' | 'city' | 'province' | 'contact_email';

/**
 * Stato di completezza, a tre valori — non un booleano.
 * `unknown` = il profilo non è ancora stato caricato: «non ancora saputo» non è
 * «completo» e nemmeno «incompleto». Senza questo terzo caso, all'avvio dell'app si
 * mostrerebbe un sollecito a chi ha il profilo già a posto (stessa trappola già
 * pagata sul consenso: vedi `useConsentState`).
 * `absent` = utente autenticato SENZA profilo (tipico post-social prima del
 * completamento): non è «un profilo incompleto», è un profilo che non esiste.
 */
export type ProfileCompletion =
  | 'unknown'
  | 'absent'
  | 'incomplete'
  | 'complete';

/**
 * Il sottoinsieme di colonne su cui si misura la completezza. Il tipo è un `Pick`, non
 * `Profile` intero, perché lo stesso predicato deve poter giudicare anche i valori che
 * si STANNO PER SCRIVERE (il payload dell'upsert non è ancora un profilo: non ha `id`
 * né i consensi). È questo che rende possibile un solo predicato per il cancello e per
 * il salvataggio invece di due elenchi di campi che col tempo divergono.
 */
export type ProfileCompletionFields = Pick<
  Profile,
  'phone' | 'city' | 'province' | 'country' | 'contact_email'
>;

/**
 * I campi ancora da raccogliere, in ordine di richiesta. Vuoto = niente da chiedere.
 * `province` è dovuta SOLO per l'Italia: per i paesi esteri il trigger scrive `null`
 * per costruzione (migration 0007), quindi pretenderla sarebbe un sollecito
 * impossibile da soddisfare.
 *
 * ⚠️ Su `null` ritorna `[]`, che letto da solo si legge «niente da chiedere»: un
 * utente autenticato SENZA profilo sembrerebbe a posto. Chi deve decidere se
 * sbarrare la strada non usa questa funzione ma `getProfileCompletion`, che
 * distingue `absent` da `complete`.
 */
export const missingProfileFields = (
  profile: ProfileCompletionFields | null | undefined
): CompletableField[] => {
  if (!profile) return [];
  const missing: CompletableField[] = [];
  if (!profile.phone?.trim()) missing.push('phone');
  if (!profile.city?.trim()) missing.push('city');
  if (profile.country === 'IT' && !profile.province?.trim()) {
    missing.push('province');
  }
  if (!profile.contact_email?.trim()) missing.push('contact_email');
  return missing;
};

/**
 * Stato di completezza da profilo + fase di caricamento.
 * `isLoaded` distingue «non ancora caricato» da «caricato e assente»: il chiamante
 * lo sa (lo status dell'auth), il profilo da solo no — `null` significa entrambe le
 * cose e confonderle è ciò che produce solleciti fantasma.
 */
export const getProfileCompletion = (
  profile: ProfileCompletionFields | null | undefined,
  isLoaded: boolean
): ProfileCompletion => {
  if (!isLoaded) return 'unknown';
  if (!profile) return 'absent';
  return missingProfileFields(profile).length > 0 ? 'incomplete' : 'complete';
};

/**
 * Il cancello sbarra la strada oppure no. UNICA definizione: la usano il navigatore
 * (per decidere quali schermate esistono) e la schermata di completamento (per
 * decidere se mostrare la via d'uscita). Due copie di questa condizione sono il modo
 * sicuro di ritrovarsi, dopo un refactor, con un cancello che blocca e un salvataggio
 * che non lo apre — la persona ricomincia da capo ogni volta che entra.
 *
 * - `absent` BLOCCA: un account senza riga `profiles` non è «a posto», è un profilo
 *   che non esiste (e `missingProfileFields(null)` da solo direbbe il contrario).
 * - `unknown` NON blocca: è lo stato all'avvio e **dopo un errore di rete**
 *   (`AuthContext` alza `profileLoaded` solo sull'assenza CONFERMATA, PGRST116).
 *   Sbarrare qui significherebbe chiudere fuori dall'app chi ha il profilo completo
 *   solo perché la rete è andata giù; si lascia passare e si ricontrolla al giro dopo.
 *   Il cancello raccoglie dati, non è un controllo di sicurezza: le RLS restano.
 */
export const isProfileGateBlocked = (completion: ProfileCompletion): boolean =>
  completion === 'absent' || completion === 'incomplete';
