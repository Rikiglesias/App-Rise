/**
 * Misure della barra delle schede (C44 del contratto android-play), come funzioni pure.
 *
 * A scala di sistema 1,0 la barra è alta `TAB_BAR_BASE_HEIGHT` (riferimento iPhone 15): ci stanno il
 * cerchio centrale, lo spazio e una riga d'etichetta, con ~4 dp sopra e sotto. Quando il testo
 * cresce, cresce solo l'etichetta (le icone no): la barra si allunga di quanto si allunga quella riga,
 * dal primo passo sopra 1,0 fino al tetto, senza soglie.
 */
import { scaleWithDimensions } from '@/shared/constants/perfectScale';
import {
  LINE_HEIGHT_RATIO,
  MAX_FONT_SCALE,
  systemTextMultiplier,
  textFontSize,
  type WindowSize,
} from '@/shared/utils/textScale';

/** Altezza della barra a scala 1,0, riferita a iPhone 15. */
export const TAB_BAR_BASE_HEIGHT = 95;

/** Dimensione dell'etichetta delle schede, riferita a iPhone 15. */
export const TAB_LABEL_SIZE = 16;

/** Altezza di una riga d'etichetta a scala 1,0 (dp). */
export const tabLabelLineHeight = (window: WindowSize): number =>
  textFontSize(TAB_LABEL_SIZE, window) * LINE_HEIGHT_RATIO;

/** Altezza della barra (dp, senza la distanza dal bordo) alla scala di sistema data. */
export const tabBarHeight = (
  fontScale: number,
  window: WindowSize,
  maxFontScale: number = MAX_FONT_SCALE
): number =>
  scaleWithDimensions(TAB_BAR_BASE_HEIGHT, window.width, window.height) +
  tabLabelLineHeight(window) *
    (systemTextMultiplier(fontScale, maxFontScale) - 1);
