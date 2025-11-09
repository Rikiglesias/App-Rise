/**
 * Sistema i18n - Internazionalizzazione
 * Rise Against Hunger Italia
 *
 * FUNZIONAMENTO:
 * - iOS: Rileva lingua da Settings → General → Language & Region
 * - Android: Rileva lingua da Impostazioni → Sistema → Lingua
 * - Cambia automaticamente quando utente modifica lingua di sistema
 * - Traduzioni aggiornabili via OTA Updates
 */

import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import it from './it';
import en from './en';
import type { SupportedLocale } from './types';

// Crea istanza i18n
const i18n = new I18n({
  it,
  en,
});

// Configurazione
i18n.defaultLocale = 'it'; // Italiano come fallback
i18n.enableFallback = true;

// Rileva lingua di sistema
const getDeviceLocale = (): SupportedLocale => {
  // expo-localization.getLocales() ritorna array di lingue preferite
  const locales = Localization.getLocales();
  const primaryLocale = locales[0]?.languageCode || 'it';

  // Mappa lingua rilevata a lingua supportata
  const supportedLocales: SupportedLocale[] = ['it', 'en'];

  // Verifica se lingua rilevata è supportata
  if (supportedLocales.includes(primaryLocale as SupportedLocale)) {
    return primaryLocale as SupportedLocale;
  }

  // Fallback a italiano
  return 'it';
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

// Export traduzioni per accesso diretto (opzionale)
export { it, en };
export type { SupportedLocale };
