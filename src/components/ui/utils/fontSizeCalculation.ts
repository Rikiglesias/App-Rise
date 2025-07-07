import {
  TypographyTokens,
  AccessibilityIntelligence,
  DeviceInfo,
} from '../../../shared/constants/responsiveSystem';
import { smartFontSizeCache } from '../../../shared/utils/SmartFontSizeCache';
import { FormattedTextProps } from '../FormattedText';

/**
 * Mapping variant a fontSize del sistema ibrido - SENZA SCALING
 * Lo scaling viene applicato UNA volta sola nel componente principale
 */
export const getVariantFontSize = (
  variant: FormattedTextProps['variant']
): number => {
  if (!variant) return TypographyTokens.styles.body.medium;

  const [category, size] = variant.split('-') as [string, string];

  let baseFontSize: number;

  switch (category) {
    case 'display':
      baseFontSize =
        TypographyTokens.styles.display[
          size as keyof typeof TypographyTokens.styles.display
        ] || TypographyTokens.styles.display.medium;
      break;
    case 'headline':
      baseFontSize =
        TypographyTokens.styles.headline[
          size as keyof typeof TypographyTokens.styles.headline
        ] || TypographyTokens.styles.headline.medium;
      break;
    case 'title':
      baseFontSize =
        TypographyTokens.styles.title[
          size as keyof typeof TypographyTokens.styles.title
        ] || TypographyTokens.styles.title.medium;
      break;
    case 'body':
      baseFontSize =
        TypographyTokens.styles.body[
          size as keyof typeof TypographyTokens.styles.body
        ] || TypographyTokens.styles.body.medium;
      break;
    case 'label':
      baseFontSize =
        TypographyTokens.styles.label[
          size as keyof typeof TypographyTokens.styles.label
        ] || TypographyTokens.styles.label.medium;
      break;
    default:
      baseFontSize = TypographyTokens.styles.body.medium;
  }

  // RITORNA fontSize RAW - lo scaling viene applicato dopo
  return baseFontSize;
};

/**
 * Applica vincoli Netflix + Apple accessibility intelligence
 */
export const applyReadabilityConstraints = (fontSize: number): number => {
  return AccessibilityIntelligence.calculateAccessibleFontSize(fontSize);
};

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
export const calculateSmartFontSizeInternal = (
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
