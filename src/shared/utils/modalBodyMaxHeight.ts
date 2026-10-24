/**
 * C41: le finestre modali tengono il corpo in uno ScrollView alto al massimo una
 * quota dell'altezza della finestra, con titolo e pulsanti fuori. Il resto della
 * finestra basta a titolo, pulsanti e margini anche col testo a 2,0 su 320×568.
 */

/** Finestre con due o tre pulsanti sotto il corpo («Stai per uscire dall'app»). */
export const BODY_SHARE_WITH_BUTTONS = 0.4;

/** Finestre col solo «chiudi» in alto («Info donazioni»). */
export const BODY_SHARE_CLOSE_ONLY = 0.6;

export const modalBodyMaxHeight = (
  windowHeight: number,
  share: number
): number => Math.floor(Math.max(0, windowHeight) * share);

/**
 * C74: la scheda intera non supera la finestra, nemmeno in orizzontale (600×300): altezza massima =
 * finestra − inset sopra e sotto − il margine dell'overlay su entrambi i lati. Dentro, il corpo
 * (`flexShrink: 1`) cede per primo; titolo e pulsanti restano fuori dallo ScrollView.
 */
export const modalCardMaxHeight = (
  windowHeight: number,
  insets: { top: number; bottom: number },
  margin: number
): number =>
  Math.max(
    0,
    Math.floor(windowHeight - insets.top - insets.bottom - 2 * margin)
  );
