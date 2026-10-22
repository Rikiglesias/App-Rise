/**
 * NUMERI NELLA LINGUA DELL'APP — formatter unico
 *
 * Separatori scritti qui e non chiesti a Intl: in italiano CLDR non raggruppa le
 * cifre a quattro («5833» accanto a «10.427») e il risultato di Intl dipende
 * dalla ICU del motore (Hermes, browser, Node). Qui il raggruppamento è sempre
 * attivo e il testo è lo stesso su ogni dispositivo.
 */

const SEPARATORI = {
  it: { migliaia: '.', decimali: ',' },
  en: { migliaia: ',', decimali: '.' },
} as const;

/**
 * Formatta un numero con i separatori della lingua dell'app (italiano se non indicata)
 * @example formatNumber(1234567) → "1.234.567"
 * @example formatNumber(5833, 'en') → "5,833"
 * @example formatNumber(3.14, 'it') → "3,14"
 */
export const formatNumber = (num: number, locale = 'it'): string => {
  const { migliaia, decimali } = locale.toLowerCase().startsWith('en')
    ? SEPARATORI.en
    : SEPARATORI.it;
  // Al massimo tre decimali, come il default di Intl.
  const [intero = '', frazione] = String(
    Math.round(Math.abs(num) * 1000) / 1000
  ).split('.');
  const gruppi = intero.replace(/\B(?=(\d{3})+(?!\d))/g, migliaia);
  return `${num < 0 ? '-' : ''}${gruppi}${frazione ? decimali + frazione : ''}`;
};
