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
// Lingue disattivate - solo italiano attivo
// import en from './en';
// import es from './es';
// import fr from './fr';
// import de from './de';
// import pt from './pt';
// import nl from './nl';
// import pl from './pl';
// import ro from './ro';
// import el from './el';
// import cs from './cs';
// import sv from './sv';
// import hu from './hu';
// import da from './da';
// import fi from './fi';
// import no from './no';
// import bg from './bg';
// import sk from './sk';
// import hr from './hr';
import type { SupportedLocale } from './types';

// Solo italiano attivo
const i18n = new I18n({
  it,
  // en,
  // es,
  // fr,
  // de,
  // pt,
  // nl,
  // pl,
  // ro,
  // el,
  // cs,
  // sv,
  // hu,
  // da,
  // fi,
  // no,
  // bg,
  // sk,
  // hr,
});

// Configurazione
i18n.defaultLocale = 'it'; // Italiano come fallback
i18n.enableFallback = true;

// Rileva lingua di sistema
const getDeviceLocale = (): SupportedLocale => {
  // expo-localization.getLocales() ritorna array di lingue preferite
  const locales = Localization.getLocales();
  const primaryLocale = locales[0]?.languageCode || 'it';

  // Solo italiano supportato
  const supportedLocales: SupportedLocale[] = [
    'it',
    // 'en',
    // 'es',
    // 'fr',
    // 'de',
    // 'pt',
    // 'nl',
    // 'pl',
    // 'ro',
    // 'el',
    // 'cs',
    // 'sv',
    // 'hu',
    // 'da',
    // 'fi',
    // 'no',
    // 'bg',
    // 'sk',
    // 'hr',
  ];

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
export {
  it,
  // en,
  // es,
  // fr,
  // de,
  // pt,
  // nl,
  // pl,
  // ro,
  // el,
  // cs,
  // sv,
  // hu,
  // da,
  // fi,
  // no,
  // bg,
  // sk,
  // hr,
};
export type { SupportedLocale };
