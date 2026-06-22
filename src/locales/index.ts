/**
 * Sistema i18n - Internazionalizzazione
 * Rise Against Hunger Italia
 *
 * FUNZIONAMENTO:
 * - iOS: Rileva lingua da Settings → General → Language & Region
 * - Android: Rileva lingua da Impostazioni → Sistema → Lingua
 * - Cambia automaticamente quando utente modifica lingua di sistema
 * - Traduzioni aggiornabili via OTA Updates
 *
 * STRATEGIA LINGUE:
 * - 🇮🇹 Dispositivo Italiano → App in Italiano
 * - 🇬🇧 Dispositivo Inglese → App in Inglese
 * - 🌍 Qualsiasi altra lingua → App in Inglese (fallback universale)
 */

import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import it from './it';
import en from './en';

// Le traduzioni registrate sono la SSOT delle lingue supportate.
const translations = { it, en };

// Lingue supportate, derivate dalle traduzioni effettivamente registrate
// (evita il drift fra tipo dichiarato e lingue realmente caricate in i18n).
export type SupportedLocale = keyof typeof translations;

const i18n = new I18n(translations);

i18n.defaultLocale = 'en';
i18n.enableFallback = true;

// Rileva lingua di sistema
const getDeviceLocale = (): SupportedLocale => {
  // expo-localization.getLocales() ritorna array di lingue preferite
  const locales = Localization.getLocales();
  const primaryLocale = locales[0]?.languageCode || 'it';

  const supportedLocales: SupportedLocale[] = ['it', 'en'];

  // Verifica se lingua rilevata è supportata
  if (supportedLocales.includes(primaryLocale as SupportedLocale)) {
    return primaryLocale as SupportedLocale;
  }

  // Fallback a inglese per tutte le altre lingue
  return 'en';
};

// Imposta lingua corrente
i18n.locale = getDeviceLocale();

// Funzione per cambiare lingua manualmente (opzionale)
export const changeLanguage = (locale: SupportedLocale) => {
  i18n.locale = locale;
};

// Funzione per ottenere lingua corrente
export const getCurrentLocale = (): SupportedLocale => {
  return i18n.locale as SupportedLocale;
};

// Export istanza configurata
export default i18n;

export { it, en };
