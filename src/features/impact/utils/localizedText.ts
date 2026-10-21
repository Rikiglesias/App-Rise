import { getCurrentLocale } from '@/locales';
import type { SupportedLocale } from '@/locales';

export type LocalizedText = Readonly<Record<SupportedLocale, string>>;

/**
 * Risolve i contenuti editoriali nella lingua indicata (di norma quella corrente),
 * senza cache all'import.
 */
export const resolveLocalizedText = (
  text: LocalizedText,
  locale: SupportedLocale = getCurrentLocale()
): string => text[locale];
