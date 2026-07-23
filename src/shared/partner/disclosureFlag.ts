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

const KEY_PREFIX = 'partner_disclosure_seen_v1';

const storageKey = (userId?: string | null): string =>
  userId ? `${KEY_PREFIX}_${userId}` : KEY_PREFIX;

export const hasSeenPartnerDisclosure = async (
  userId?: string | null
): Promise<boolean> => {
  const key = storageKey(userId);
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

export const markPartnerDisclosureSeen = async (
  userId?: string | null
): Promise<void> => {
  const key = storageKey(userId);
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
