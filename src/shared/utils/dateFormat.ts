/**
 * DATE FORMATTING UTILITIES
 * Funzioni centralizzate per formattare date localizzate e calcolare
 * la data di cancellazione account dopo il grace period
 */

const INTL_LOCALES: Record<'it' | 'en', string> = {
  it: 'it-IT',
  en: 'en-US',
};

/**
 * Formatta una data in formato localizzato (giorno numerico + mese esteso + anno)
 * @example formatDateLocalized(new Date(2026, 6, 5), 'it') → "5 luglio 2026"
 * @example formatDateLocalized(new Date(2026, 6, 5), 'en') → "July 5, 2026"
 * @returns stringa vuota se l'input non è una data valida (mai crash)
 */
export const formatDateLocalized = (date: Date | string, locale: 'it' | 'en'): string => {
  const parsed = date instanceof Date ? date : new Date(date);
  if (isNaN(parsed.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat(INTL_LOCALES[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsed);
};

/**
 * Calcola la data in cui verrà eseguita la cancellazione dell'account,
 * sommando i giorni di grazia alla data di richiesta
 * @example getDeletionScheduledDate('2026-07-01T12:00:00Z', 30) → Date('2026-07-31T12:00:00.000Z')
 * @returns null se requestedAt è assente o non è una data valida
 */
export const getDeletionScheduledDate = (
  requestedAt: string | null | undefined,
  graceDays: number
): Date | null => {
  if (!requestedAt) {
    return null;
  }
  const requested = new Date(requestedAt);
  if (isNaN(requested.getTime())) {
    return null;
  }
  return new Date(requested.getTime() + graceDays * 24 * 60 * 60 * 1000);
};
