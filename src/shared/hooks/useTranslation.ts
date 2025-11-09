/**
 * Hook useTranslation
 * Permette di usare le traduzioni nei componenti React
 *
 * ESEMPIO USO:
 * const { t, locale } = useTranslation();
 * <Text>{t('home.welcome')}</Text>
 */

import { useCallback, useMemo } from 'react';
import i18n, { getCurrentLocale, changeLanguage } from '@/locales';
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

export const useTranslation = (): UseTranslationReturn => {
  // Ottieni lingua corrente
  const locale = useMemo(() => getCurrentLocale(), []);

  // Funzione di traduzione con type-safety
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      try {
        return i18n.t(key, params);
      } catch (error) {
        // Fallback in caso di chiave mancante
        logger.warn('i18n', `Translation key not found: ${key}`);
        return key;
      }
    },
    []
  );

  // Funzione per cambiare lingua
  const setLocale = useCallback((newLocale: SupportedLocale) => {
    changeLanguage(newLocale);
    // Nota: Per trigger re-render, potresti usare un Context/State globale
    // Per ora questa versione è semplice e funziona per traduzioni statiche
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
