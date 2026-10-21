/**
 * Scala del testo, come funzioni pure (C42 del contratto android-play).
 *
 * La grandezza a schermo di un testo nasce da due fattori:
 * 1. la dimensione che diamo a `<Text>` (dp), proporzionale allo schermo e mai sotto `MIN_TEXT_SIZE`;
 * 2. il moltiplicatore che il sistema applica da solo con `allowFontScaling`: la scala di sistema
 *    scelta dalla persona, dal primo passo sopra 1,0 (nessuna soglia: WCAG 1.4.4) fino a `MAX_FONT_SCALE`.
 * Sotto 1,0 (testo piccolo scelto nelle impostazioni) vale la scelta della persona.
 */
import {
  getWindowDimensions,
  scaleWithDimensions,
} from '@/shared/constants/perfectScale';

/** Dimensione minima del testo, in dp, prima della scala di sistema. */
export const MIN_TEXT_SIZE = 12;

/** Tetto del moltiplicatore di sistema, anche sui campi di testo (`maxFontSizeMultiplier`). */
export const MAX_FONT_SCALE = 2;

/** Interlinea di PerfectText, in rapporto alla dimensione del carattere. */
export const LINE_HEIGHT_RATIO = 1.2;

export interface WindowSize {
  width: number;
  height: number;
}

/** Dimensione da dare a `<Text>` (dp): `size` è riferito a iPhone 15, scalato sullo schermo, con il minimo. */
export const textFontSize = (size: number, window: WindowSize): number =>
  Math.max(
    MIN_TEXT_SIZE,
    scaleWithDimensions(size, window.width, window.height)
  );

/** `textFontSize` sulla finestra di adesso, per gli stili fuori dai componenti (`fontSize: scaleText(14)`). */
export const scaleText = (size: number): number =>
  textFontSize(size, getWindowDimensions());

/** Moltiplicatore applicato dal sistema: la scala di sistema, col tetto. */
export const systemTextMultiplier = (
  fontScale: number,
  maxFontScale: number = MAX_FONT_SCALE
): number => Math.min(fontScale, maxFontScale);

/** Grandezza a schermo (dp) di un testo di riferimento `size`. */
export const renderedTextSize = (
  size: number,
  window: WindowSize,
  fontScale: number,
  maxFontScale: number = MAX_FONT_SCALE
): number =>
  textFontSize(size, window) * systemTextMultiplier(fontScale, maxFontScale);
