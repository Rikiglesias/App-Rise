import { smartFontSizeCache } from '../../../shared/utils/SmartFontSizeCache';
import { DeviceInfo } from '../../../shared/constants/responsiveSystem';

/**
 * Font size calculation utilities per FormattedText
 * Sistema intelligente per layout fisso con ridimensionamento conservativo
 */

/**
 * SISTEMA INTELLIGENTE MIGLIORATO: Calcola fontSize ottimale per fixedLines
 * PRINCIPIO: Mai troncare il testo, ridimensionare conservativamente per farlo entrare
 * MIGLIORAMENTI: Meno aggressivo, preserva meglio font weight e leggibilità
 * CONTAINER AWARE: Usa larghezza container da Design Tokens per calcoli precisi
 * PERFORMANCE: Integrato con SmartFontSizeCache per hit-rate ≥ 95%
 */
export const calculateSmartFontSize = (
  text: string,
  scaledFontSize: number, // Già scalato con scaleFont()
  targetLines: number,
  maxWidth?: number // Opzionale, usa container width se non specificato
): number => {
  if (!text || targetLines <= 0) return scaledFontSize;

  // CONTAINER AWARE: Usa larghezza container da Design Tokens (with fallback for tests)
  const containerWidth = maxWidth ?? (DeviceInfo?.width ?? 375) * 0.9; // 90% screen width come default

  // PERFORMANCE BOOST: Usa SmartFontSizeCache per calcoli ripetuti
  return smartFontSizeCache.get(
    text,
    scaledFontSize,
    targetLines,
    containerWidth,
    () =>
      calculateSmartFontSizeInternal(
        text,
        scaledFontSize,
        targetLines,
        containerWidth
      )
  );
};

/**
 * Logica interna di calcolo fontSize (wrapped dalla cache)
 */
const calculateSmartFontSizeInternal = (
  text: string,
  scaledFontSize: number,
  targetLines: number,
  containerWidth: number
): number => {
  // GESTIONE \n ESPLICITI: Rispetta sempre i line breaks manuali
  const explicitLines = text.split('\n');
  const hasExplicitLineBreaks = explicitLines.length > 1;

  if (hasExplicitLineBreaks) {
    // Se ci sono più \n delle righe target, riduci conservativamente
    if (explicitLines.length > targetLines) {
      return scaledFontSize * 0.9; // CONSERVATIVO: solo 10% di riduzione
    }

    // Per testo con \n, calcola la larghezza necessaria per la riga più lunga
    const longestLine = explicitLines.reduce((longest, line) => {
      const cleanLine = line.trim();
      return cleanLine.length > longest.length ? cleanLine : longest;
    }, '');

    // Se la riga più lunga è corta, mantieni il fontSize originale
    if (longestLine.length <= 20) {
      // AUMENTATO da 15 a 20
      return scaledFontSize; // Mantieni dimensione originale
    }

    return calculateOptimalFontSizeForText(
      longestLine,
      scaledFontSize,
      containerWidth
    );
  }

  // GESTIONE WRAPPING AUTOMATICO: Calcola spazio necessario
  const totalChars = text.length;

  // Algoritmo CONSERVATIVO: riduce il meno possibile
  let bestFit = scaledFontSize;

  // MOLTO MENO AGGRESSIVO: da 75% a 85% minimum
  for (let sizeFactor = 1.0; sizeFactor >= 0.85; sizeFactor -= 0.02) {
    const testSize = scaledFontSize * sizeFactor;
    const avgCharWidth = testSize * 0.55; // Stima larghezza carattere
    const charsPerLine = Math.floor(containerWidth / avgCharWidth);
    const totalLinesNeeded = Math.ceil(totalChars / charsPerLine);

    if (totalLinesNeeded <= targetLines) {
      bestFit = testSize;
      break; // Trovato il fontSize più grande che fa entrare tutto
    }
  }

  // CONSERVATIVO: non va mai sotto l'85% del fontSize originale
  const minFontSize = scaledFontSize * 0.85;
  return Math.max(minFontSize, bestFit);
};

/**
 * Helper: Calcola fontSize ottimale per una singola riga di testo
 */
export const calculateOptimalFontSizeForText = (
  text: string,
  baseFontSize: number,
  maxWidth: number
): number => {
  if (!text) return baseFontSize;

  let optimalSize = baseFontSize;

  // CONSERVATIVO: solo fino all'85%
  for (let sizeFactor = 1.0; sizeFactor >= 0.85; sizeFactor -= 0.02) {
    const testSize = baseFontSize * sizeFactor;
    const avgCharWidth = testSize * 0.55;
    const estimatedWidth = text.length * avgCharWidth;

    if (estimatedWidth <= maxWidth) {
      optimalSize = testSize;
      break;
    }
  }

  return optimalSize;
};
