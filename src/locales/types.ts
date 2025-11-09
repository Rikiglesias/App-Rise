/**
 * TypeScript Types per i18n
 * Garantisce type-safety nelle traduzioni
 */

import it from './it';

// Tipo per le chiavi delle traduzioni (type-safe)
export type TranslationKeys = typeof it;

// Lingue supportate
export type SupportedLocale = 'it' | 'en';

// Configurazione i18n
export interface I18nConfig {
  locale: SupportedLocale;
  fallbackLocale: SupportedLocale;
  translations: Record<SupportedLocale, TranslationKeys>;
}
