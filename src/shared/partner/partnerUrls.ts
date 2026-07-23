/**
 * Costruzione degli URL partner con il `rise_ref` di correlazione (goal
 * partner-identita, F1.7). Funzioni PURE.
 *
 * Due partner, due canali di trasporto del ref (entrambi verificati, vedi binding
 * ~/todos/partner-identita.md e docs/integrazioni/letsdonation-donorbox-identita.md):
 * - Donorbox: il ref viaggia in `utm_content`, i dati anagrafici nei parametri di
 *   prefill documentati (donorbox.zendesk.com — first_name/last_name/email/...).
 * - Let's Donation: il ref viaggia in `rise_ref`; il 301 dal dominio vecchio a
 *   quello nuovo conserva la query string (curl -sIL, 2026-07-23).
 *
 * NB: costruzione manuale della query string con encodeURIComponent invece di
 * URL/URLSearchParams: il runtime React Native (Hermes) non garantisce
 * URLSearchParams e il progetto non importa un polyfill. In test (Node) sarebbe
 * disponibile, ma il codice deve comportarsi come in produzione.
 */

/**
 * URL di donazione Donorbox: la pagina ospitata, verificata dal vivo il 2026-07-24
 * (browser: prefill first_name/last_name/email/amount applicati sul form; il nostro
 * `utm_content` conservato nell'URL e propagato agli iframe interni di Donorbox, dove
 * la donazione viene registrata). Per l'apertura in un browser standalone (useLinkHandler)
 * è più curata dell'embed, che è pensato per un iframe. Dominio già in allowlist.
 * Resta da confermare con una donazione reale che `utm_content` torni su
 * GET /api/v1/donations (leva utente). Per un contesto iframe passare come `base`:
 * https://donorbox.org/embed/dona-ora-rah?show_content=true
 */
export const DONORBOX_DONATION_URL = 'https://donorbox.org/dona-ora-rah';

/** Nome del parametro Donorbox che trasporta il ref (tracciamento UTM). */
const DONORBOX_REF_PARAM = 'utm_content';
/** Nome del parametro Let's Donation che trasporta il ref. */
const LETSDONATION_REF_PARAM = 'rise_ref';

/**
 * Appende parametri di query a un URL preservando quelli già presenti.
 * I valori nulli/vuoti sono ignorati. Sceglie `?` o `&` in base all'URL.
 */
const appendQueryParams = (
  url: string,
  params: Record<string, string | null | undefined>
): string => {
  const pairs = Object.entries(params)
    .filter(
      ([, value]) => value !== null && value !== undefined && value !== ''
    )
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`
    );
  if (pairs.length === 0) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${pairs.join('&')}`;
};

export interface DonorboxPrefill {
  firstName?: string | null;
  lastName?: string | null;
  /** Email già risolta da resolvePrefillEmail (null = non precompilare). */
  email?: string | null;
}

/**
 * URL Donorbox con il ref in `utm_content` e i campi di prefill anagrafici.
 * `ref` null → nessun utm_content (donazione senza correlazione, es. utente ospite).
 * `base` override solo per test / futuro swap alla pagina ospitata.
 */
export const buildDonorboxDonationUrl = (
  ref: string | null | undefined,
  prefill: DonorboxPrefill = {},
  base: string = DONORBOX_DONATION_URL
): string =>
  appendQueryParams(base, {
    [DONORBOX_REF_PARAM]: ref,
    first_name: prefill.firstName,
    last_name: prefill.lastName,
    email: prefill.email,
  });

/**
 * URL Let's Donation con il ref in `rise_ref`. `ref` null → URL invariato
 * (l'utente non loggato esce senza correlazione, comportamento non regressivo).
 */
export const appendRiseRef = (
  url: string,
  ref: string | null | undefined
): string => appendQueryParams(url, { [LETSDONATION_REF_PARAM]: ref });
