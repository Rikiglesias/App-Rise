import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { logWarn } from '@/shared/utils/logger';

/**
 * Flag "schermata onesta già vista" (goal partner-identita, F1.7e).
 *
 * La schermata che avverte della doppia registrazione su Let's Donation si mostra
 * UNA VOLTA PER UTENTE: dopo che l'ha vista e ha proseguito, le uscite successive
 * vanno dritte (il ref viene comunque propagato ogni volta, quello è altrove).
 *
 * Persistenza: SecureStore su iOS/Android, localStorage in dev/preview web (il
 * target di produzione è mobile). La chiave è scopata per utente così il flag di
 * un donatore non nasconde l'avviso a un altro che usa lo stesso dispositivo;
 * senza utente (ospite) si usa una chiave condivisa.
 *
 * Fail-open in lettura: se lo storage non è leggibile ritorniamo "non vista" →
 * al massimo l'avviso si rimostra (informativo, innocuo), mai soppresso per errore.
 */

/**
 * I due canali hanno avvisi DIVERSI e quindi flag diversi: chi ha già visto quello
 * di Let's Donation non deve saltarsi quello di Donorbox, che dice un'altra cosa
 * (quali dati personali finiscono nell'indirizzo).
 */
export type CanaleAvviso = 'letsdonation' | 'donorbox';

// La chiave di Let's Donation resta ESATTAMENTE quella di prima: cambiarla
// rimostrerebbe l'avviso a chi l'ha già visto e proseguito.
const KEY_PREFIX = 'partner_disclosure_seen_v1';
const KEY_PREFIX_DONORBOX = 'donorbox_disclosure_seen_v1';

const storageKey = (userId?: string | null, canale?: CanaleAvviso): string => {
  const prefix = canale === 'donorbox' ? KEY_PREFIX_DONORBOX : KEY_PREFIX;
  return userId ? `${prefix}_${userId}` : prefix;
};

export const hasSeenPartnerDisclosure = async (
  userId?: string | null,
  canale: CanaleAvviso = 'letsdonation'
): Promise<boolean> => {
  const key = storageKey(userId, canale);
  if (Platform.OS === 'web') {
    return typeof localStorage !== 'undefined'
      ? localStorage.getItem(key) === '1'
      : false;
  }
  try {
    return (await SecureStore.getItemAsync(key)) === '1';
  } catch (error) {
    // fail-open: mostra l'avviso invece di sopprimerlo per errore
    if (__DEV__) logWarn('lettura flag fallita', 'disclosureFlag', error);
    return false;
  }
};

/**
 * «Continua senza i miei dati» è una PREFERENZA, non un gesto singolo.
 *
 * Senza questa memoria succedeva il contrario di ciò che la persona ha chiesto:
 * la scelta valeva per quella volta, l'avviso risultava letto, e alla donazione
 * successiva l'indirizzo ripartiva con nome, cognome ed email — senza nemmeno
 * più un avviso, perché ormai era «già visto». Chi si era protetto una volta
 * veniva scoperto per sempre dalla volta dopo.
 *
 * Fail-open come la lettura del flag: se lo storage non risponde si risponde
 * «nessuna rinuncia». Qui il fail-open è però il lato MENO protettivo, ed è
 * accettabile solo perché in quel caso l'avviso ricompare e la scelta si può
 * rifare — non perché sia innocuo.
 */
const KEY_PREFIX_PREFILL_OPTOUT = 'donorbox_prefill_optout_v1';

const optOutKey = (userId?: string | null): string =>
  userId ? `${KEY_PREFIX_PREFILL_OPTOUT}_${userId}` : KEY_PREFIX_PREFILL_OPTOUT;

export const hasOptedOutOfPrefill = async (
  userId?: string | null
): Promise<boolean> => {
  const key = optOutKey(userId);
  if (Platform.OS === 'web') {
    return typeof localStorage !== 'undefined'
      ? localStorage.getItem(key) === '1'
      : false;
  }
  try {
    return (await SecureStore.getItemAsync(key)) === '1';
  } catch (error) {
    if (__DEV__) logWarn('lettura opt-out fallita', 'disclosureFlag', error);
    return false;
  }
};

export const setPrefillOptOut = async (
  userId: string | null | undefined,
  optOut: boolean
): Promise<void> => {
  const key = optOutKey(userId);
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      if (optOut) localStorage.setItem(key, '1');
      else localStorage.removeItem(key);
    }
    return;
  }
  try {
    if (optOut) await SecureStore.setItemAsync(key, '1');
    else await SecureStore.deleteItemAsync(key);
  } catch (error) {
    if (__DEV__) logWarn('scrittura opt-out fallita', 'disclosureFlag', error);
  }
};

export const markPartnerDisclosureSeen = async (
  userId?: string | null,
  canale: CanaleAvviso = 'letsdonation'
): Promise<void> => {
  const key = storageKey(userId, canale);
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, '1');
    return;
  }
  try {
    await SecureStore.setItemAsync(key, '1');
  } catch (error) {
    // Scrittura fallita → al prossimo giro l'avviso si rimostra. Accettabile.
    if (__DEV__) logWarn('scrittura flag fallita', 'disclosureFlag', error);
  }
};
