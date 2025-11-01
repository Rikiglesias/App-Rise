/**
 * NUMBER FORMATTING UTILITIES
 * Funzioni centralizzate per formattare numeri in vari formati
 */

/**
 * Formatta un numero secondo lo standard italiano
 * @example formatNumber(1234567) → "1.234.567"
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('it-IT').format(num);
};

/**
 * Formatta un numero in formato compatto con abbreviazioni
 * @example formatNumberCompact(1234567) → "1.2M+"
 * @example formatNumberCompact(5432) → "5K+"
 * @example formatNumberCompact(123) → "123"
 */
export const formatNumberCompact = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M+`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K+`;
  }
  return formatNumber(value);
};

/**
 * Alias per compatibilità con codice esistente
 * @deprecated Usa formatNumberCompact
 */
export const formatStat = formatNumberCompact;
