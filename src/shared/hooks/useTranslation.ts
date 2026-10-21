/**
 * Hook useTranslation
 * Permette di usare le traduzioni nei componenti React
 *
 * ESEMPIO USO:
 * const { t, locale } = useTranslation();
 * <Text>{t('home.welcome')}</Text>
 */

import { useCallback, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';
import i18n, {
  getCurrentLocale,
  changeLanguage,
  syncDeviceLocale,
} from '@/locales';
import type { SupportedLocale } from '@/locales';
import { logger } from '@/shared/utils/logger';

interface UseTranslationReturn {
  // Funzione per tradurre chiavi
  t: (key: string, params?: Record<string, string | number>) => string;
  // Lingua corrente
  locale: SupportedLocale;
  // Funzione per cambiare lingua manualmente
  setLocale: (locale: SupportedLocale) => void;
  // Check se è italiano
  isItalian: boolean;
  // Check se è inglese
  isEnglish: boolean;
}

// Su Android la lingua del telefono cambia senza riavviare l'app: la documentazione di
// expo-localization chiede di rileggerla a ogni ritorno in primo piano. Un solo ascolto
// di AppState, aperto finché almeno un componente traduce; ogni cambio di `i18n.locale`
// (da qui o da `changeLanguage`) ridisegna chi usa questo hook.
let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null =
  null;
let translators = 0;

const subscribe = (onLocaleChange: () => void): (() => void) => {
  const unsubscribe = i18n.onChange(onLocaleChange);
  translators += 1;
  appStateSubscription ??= AppState.addEventListener('change', state => {
    if (state === 'active') syncDeviceLocale();
  });
  return () => {
    unsubscribe();
    translators -= 1;
    if (translators === 0) {
      appStateSubscription?.remove();
      appStateSubscription = null;
    }
  };
};

export const useTranslation = (): UseTranslationReturn => {
  // Lingua corrente, letta da i18n e aggiornata a ogni cambio
  const locale = useSyncExternalStore(subscribe, getCurrentLocale);

  // Funzione di traduzione con type-safety. Traduce nella lingua letta da questo
  // render e cambia identità con lei: i calcoli memorizzati su `t` si rifanno.
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      try {
        return i18n.t(key, { locale, ...params });
      } catch (error) {
        // Fallback in caso di chiave mancante
        logger.warn(`Translation key not found: ${key}`, 'i18n');
        return key;
      }
    },
    [locale]
  );

  // Funzione per cambiare lingua (i componenti si ridisegnano da soli)
  const setLocale = useCallback((newLocale: SupportedLocale) => {
    changeLanguage(newLocale);
  }, []);

  // Helper per check lingua
  const isItalian = locale === 'it';
  const isEnglish = locale === 'en';

  return {
    t,
    locale,
    setLocale,
    isItalian,
    isEnglish,
  };
};
