import { getCurrentLocale } from '@/locales';
import type { SupportedLocale } from '@/locales';

export type LocalizedText = Readonly<Record<SupportedLocale, string>>;

/** Risolve i contenuti editoriali nella lingua corrente, senza cache all'import. */
export const resolveLocalizedText = (text: LocalizedText): string =>
  text[getCurrentLocale()];
