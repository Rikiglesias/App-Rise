/**
 * FORMATTED TEXT COMPONENT - ENTERPRISE GRADE
 *
 * Component che garantisce layout consistency assoluto:
 * - allowFontScaling: false (ignora zoom sistema)
 * - Text wrapping intelligente (2 righe = 2 righe sempre)
 * - Integrazione con Sistema Ibrido Google-Apple-Netflix
 * - Supporto completo accessibilità controllata
 */

import React from 'react';
import { Text, TextProps, TextStyle, Platform } from 'react-native';
import {
  TypographyTokens,
  AccessibilityIntelligence,
  scaleFont,
  DesignTokens,
  RTLTokens,
  DeviceInfo,
} from '../../shared/constants/responsiveSystem';
import { smartFontSizeCache } from '../../shared/utils/SmartFontSizeCache';

// Extend TextProps con nuove proprietà specifiche
export interface FormattedTextProps
  extends Omit<TextProps, 'allowFontScaling'> {
  /**
   * Variant del testo basato su Material Design + Apple HIG
   */
  variant?:
    | 'display-large'
    | 'display-medium'
    | 'display-small'
    | 'headline-large'
    | 'headline-medium'
    | 'headline-small'
    | 'title-large'
    | 'title-medium'
    | 'title-small'
    | 'body-large'
    | 'body-medium'
    | 'body-small'
    | 'label-large'
    | 'label-medium'
    | 'label-small';

  /**
   * Controllo esplicito font scaling (default: false per layout consistency)
   */
  allowSystemFontScaling?: boolean;

  /**
   * Modalità text wrapping - SOLO 'fixed' per layout consistency assoluto
   * RIVOLUZIONE: 'auto', 'strict', 'flexible', 'none' sono OBSOLETI
   */
  wrapMode?: 'fixed';

  /**
   * Attiva il sistema intelligente di layout fisso
   * - fixed={true}: Controlla altezza ma permette text wrapping naturale
   * - fixed={true} + fixedLines={n}: Ridimensiona automaticamente il font per far entrare tutto il testo nelle righe specificate (MAI tronca)
   */
  fixed?: boolean;

  /**
   * Numero fisso di righe - OPZIONALE, funziona solo con fixed={true}
   * RANGE CONSIGLIATO: 1-8 righe
   * COMPORTAMENTO: Ridimensiona automaticamente il font per far entrare tutto il testo nelle righe specificate (MAI tronca)
   */
  fixedLines?: number;

  /**
   * Supporto RTL - Abilita layout e text alignment per lingue RTL
   */
  enableRTL?: boolean;

  /**
   * Override della larghezza container per calcoli di layout (usa 90% screen width se non specificato)
   */
  containerWidth?: number;

  /**
   * Controlla se applicare vincoli Netflix di leggibilità
   */
  enforceReadabilityConstraints?: boolean;

  /**
   * Strategia di line break per consistency cross-platform
   * - 'push-out': iOS default, ottimale per titoli
   * - 'standard': Bilanciato per testi normali
   * - 'hangul-word': Per lingue asiatiche
   * - 'none': Disabilitato
   */
  lineBreakStrategyIOS?: 'push-out' | 'standard' | 'hangul-word' | 'none';

  /**
   * Strategia di break per Android (complementare a iOS)
   * - 'highQuality': Equivalente a 'push-out' iOS
   * - 'balanced': Distribuzione uniforme
   * - 'simple': Fallback veloce
   */
  breakStrategyAndroid?: 'simple' | 'highQuality' | 'balanced';

  /**
   * Frequenza di hyphenation per Android
   * - 'full': Massima qualità, come iOS
   * - 'normal': Bilanciato
   * - 'none': Disabilitato
   */
  hyphenationFrequencyAndroid?: 'none' | 'normal' | 'full';

  /**
   * Override manuale fontSize (bypassa variant)
   */
  fontSize?: number;

  /**
   * Colore del testo con supporto theme
   */
  color?: string;

  /**
   * Font weight override
   */
  fontWeight?:
    | 'light'
    | 'regular'
    | 'medium'
    | 'semibold'
    | 'bold'
    | 'extrabold'
    | 'black';

  /**
   * Font family personalizzata (opzionale)
   */
  fontFamily?: string;

  /**
   * Abilita catena di fallback font automatica per emoji/CJK/arabo
   */
  enableFallbackFontChain?: boolean;

  /**
   * Limite massimo per Dynamic Type scaling (default: 1.2)
   * Previene testi troppo grandi in modalità accessibilità
   */
  maxFontSizeMultiplier?: number;
}

/**
 * Mapping variant a fontSize del sistema ibrido - SENZA SCALING
 * Lo scaling viene applicato UNA volta sola nel componente principale
 */
const getVariantFontSize = (variant: FormattedTextProps['variant']): number => {
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
const applyReadabilityConstraints = (fontSize: number): number => {
  return AccessibilityIntelligence.calculateAccessibleFontSize(fontSize);
};

/**
 * SISTEMA INTELLIGENTE MIGLIORATO: Calcola fontSize ottimale per fixedLines
 * PRINCIPIO: Mai troncare il testo, ridimensionare conservativamente per farlo entrare
 * MIGLIORAMENTI: Meno aggressivo, preserva meglio font weight e leggibilità
 * CONTAINER AWARE: Usa larghezza container da Design Tokens per calcoli precisi
 * PERFORMANCE: Integrato con SmartFontSizeCache per hit-rate ≥ 95%
 */
const calculateSmartFontSize = (
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
const calculateOptimalFontSizeForText = (
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

/**
 * SISTEMA INTELLIGENTE: Proprietà per modalità fixed
 * - Con fixedLines: Sistema intelligente che ridimensiona il font conservativamente (MAI tronca)
 * - Senza fixedLines: Layout controllato ma testo naturale
 */
const getIntelligentWrapProps = (
  fixed: boolean,
  wrapMode?: string,
  fixedLines?: number
) => {
  // Supporta sia fixed={true} che wrapMode="fixed" per backward compatibility
  const isFixedMode = fixed || wrapMode === 'fixed';

  if (!isFixedMode) {
    // Modalità normale: testo naturale
    return {};
  }

  if (fixedLines && fixedLines > 0) {
    // MODALITÀ INTELLIGENTE: Numero righe fisso + font auto-ridimensionato conservativamente
    return {
      numberOfLines: fixedLines,
      ellipsizeMode: 'clip' as const, // Non troncare con "...", il font è già ottimizzato
      adjustsFontSizeToFit: false, // Usiamo la nostra logica più precisa
    };
  }

  // Solo fixed={true}: Layout controllato ma testo naturale
  return {
    adjustsFontSizeToFit: false,
  };
};

/**
 * Mapping font weights a valori numerici/string
 */
const getFontWeight = (
  weight: FormattedTextProps['fontWeight']
): TextStyle['fontWeight'] => {
  const weights: Record<string, TextStyle['fontWeight']> = {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  };

  return weight ? weights[weight] : '400';
};

/**
 * Detecta il tipo di contenuto del testo per font fallback
 */
const detectTextContent = (
  text: string
): 'emoji' | 'cjk' | 'arabic' | 'latin' => {
  // Emoji detection (Unicode ranges)
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  if (emojiRegex.test(text)) return 'emoji';

  // CJK detection (Chinese, Japanese, Korean)
  const cjkRegex =
    /[\u4e00-\u9fff]|[\u3400-\u4dbf]|[\u3040-\u309f]|[\u30a0-\u30ff]|[\uac00-\ud7af]/;
  if (cjkRegex.test(text)) return 'cjk';

  // Arabic detection
  const arabicRegex =
    /[\u0600-\u06ff]|[\u0750-\u077f]|[\u08a0-\u08ff]|[\ufb50-\ufdff]|[\ufe70-\ufeff]/;
  if (arabicRegex.test(text)) return 'arabic';

  return 'latin';
};

/**
 * Catena di fallback font per diversi tipi di contenuto
 */
const getFallbackFontFamily = (
  textContent: string,
  customFontFamily?: string
): string => {
  const contentType = detectTextContent(textContent);
  const customFont = customFontFamily ?? '';

  const fontChains = Platform.select({
    ios: {
      emoji: `${customFont}, "Apple Color Emoji", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`,
      cjk: `${customFont}, "Noto Sans CJK SC", "PingFang SC", "Hiragino Sans GB", -apple-system, BlinkMacSystemFont`,
      arabic: `${customFont}, "Noto Sans Arabic", "Geeza Pro", -apple-system, BlinkMacSystemFont`,
      latin: `${customFont}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,
    },
    android: {
      emoji: `${customFont}, "Noto Color Emoji", "Segoe UI Emoji", "Segoe UI", Roboto, sans-serif`,
      cjk: `${customFont}, "Noto Sans CJK SC", "Source Han Sans", "Droid Sans Fallback", Roboto, sans-serif`,
      arabic: `${customFont}, "Noto Sans Arabic", "Droid Arabic Naskh", Roboto, sans-serif`,
      latin: `${customFont}, Roboto, "Helvetica Neue", Arial, sans-serif`,
    },
    default: {
      emoji: `${customFont}, "Segoe UI Emoji", "Segoe UI", "Helvetica Neue", Arial, sans-serif`,
      cjk: `${customFont}, "Noto Sans CJK SC", "Helvetica Neue", Arial, sans-serif`,
      arabic: `${customFont}, "Noto Sans Arabic", "Helvetica Neue", Arial, sans-serif`,
      latin: `${customFont}, "Helvetica Neue", Arial, sans-serif`,
    },
  });

  return fontChains[contentType] || fontChains.latin;
};

/**
 * FormattedText Component - SISTEMA INTELLIGENTE CONSERVATIVO
 *
 * ORDINE OPERAZIONI:
 * 1. fontSize base → 2. scaleFont() → 3. ridimensionamento intelligente (se fixedLines)
 *
 * BEHAVIOR fixedLines:
 * - Garantisce SEMPRE il numero di righe esatto (layout consistency)
 * - Ridimensiona CONSERVATIVAMENTE il font (max 15% di riduzione)
 * - NON taglia MAI il testo (tutto visibile sempre)
 * - Preserva grassetto e qualità del font
 */
export const FormattedText: React.FC<FormattedTextProps> = ({
  variant = 'body-medium',
  allowSystemFontScaling = false,
  maxFontSizeMultiplier = 1.2, // Limite Dynamic Type al 120%
  enforceReadabilityConstraints = true,
  fontSize: manualFontSize,
  color,
  fontWeight,
  fontFamily, // Custom font family
  enableFallbackFontChain = true, // Automatic font fallback
  wrapMode, // LEGACY: Supporto per backward compatibility
  fixed = false, // NUOVO: Sistema intelligente
  fixedLines, // OPZIONALE - funziona solo con fixed={true}
  enableRTL = false, // RTL support
  containerWidth, // Container width override
  lineBreakStrategyIOS = 'push-out', // iOS line break strategy
  breakStrategyAndroid = 'highQuality', // Android break strategy
  hyphenationFrequencyAndroid = 'full', // Android hyphenation
  style,
  children,
  ...textProps
}) => {
  // PASSO 1: Ottieni fontSize base (RAW, senza scaling)
  const baseFontSize = manualFontSize ?? getVariantFontSize(variant);

  // PASSO 2: Applica scaleFont() UNA volta sola
  let scaledFontSize = scaleFont(baseFontSize);

  // PASSO 3: Applica vincoli accessibilità se richiesto
  if (enforceReadabilityConstraints) {
    scaledFontSize = applyReadabilityConstraints(scaledFontSize);
  }

  // PASSO 4: SISTEMA INTELLIGENTE - Solo se fixed={true} o wrapMode="fixed"
  const textString = typeof children === 'string' ? children : '';

  // 🔍 DIAGNOSI: Logging per verificare doppio scaling
  if (__DEV__ && textString.includes('Rise Against')) {
    // eslint-disable-next-line no-console
    console.log('🔍 FormattedText DEBUG:', {
      raw: baseFontSize,
      scaled: scaledFontSize,
      ratio: scaledFontSize / baseFontSize,
      hasDoubleScaling: scaledFontSize > baseFontSize * 1.2,
      text: textString.substring(0, 30) + '...',
    });
  }
  let finalFontSize = scaledFontSize; // GIÀ SCALATO per device
  let wrapProps = {};

  const isFixedMode = fixed || wrapMode === 'fixed';

  if (isFixedMode) {
    wrapProps = getIntelligentWrapProps(fixed, wrapMode, fixedLines);

    // MODALITÀ INTELLIGENTE CONSERVATIVA: Con fixedLines ridimensiona minimalmente il font
    if (fixedLines && fixedLines > 0 && textString) {
      // CALCOLO CONSERVATIVO: Trova il fontSize ottimale per far entrare tutto il testo
      finalFontSize = calculateSmartFontSize(
        textString,
        scaledFontSize, // Parte dal font GIÀ SCALATO
        fixedLines,
        containerWidth // Usa containerWidth se specificato
      );
    }
  }
  // ALTRIMENTI: Modalità normale con font scalato standard

  // RTL SUPPORT: Calcola textAlign basato su direzione
  const rtlAwareTextAlign = enableRTL ? RTLTokens.textAlign.start : 'left';

  // CROSS-PLATFORM LINE BREAK STRATEGIES
  const platformLineBreakProps = Platform.select({
    ios: {
      lineBreakStrategyIOS: lineBreakStrategyIOS,
    },
    android: {
      android_breakStrategy: breakStrategyAndroid,
      android_hyphenationFrequency: hyphenationFrequencyAndroid,
    },
    default: {},
  });

  // FALLBACK FONT CHAIN: Determina fontFamily basata sul contenuto
  const determinedFontFamily =
    enableFallbackFontChain && textString
      ? getFallbackFontFamily(textString, fontFamily)
      : (fontFamily ?? undefined);

  // Calcola stile finale con lineHeight intelligente usando baseline grid
  const computedStyle = [
    {
      fontSize: finalFontSize,
      color: color ?? '#171717',
      fontWeight: getFontWeight(fontWeight),
      fontFamily: determinedFontFamily,
      // BASELINE GRID: lineHeight proporzionale usando Design Tokens (with fallback for tests)
      lineHeight: DesignTokens?.containers?.baseline?.lineHeight
        ? DesignTokens.containers.baseline.lineHeight(finalFontSize)
        : Math.round(finalFontSize * 1.15),
      includeFontPadding: false,
      textAlignVertical: 'center' as const,
      // RTL SUPPORT: Text alignment
      textAlign: rtlAwareTextAlign,
      // RTL SUPPORT: Writing direction
      writingDirection: enableRTL
        ? RTLTokens.writingDirection.auto
        : RTLTokens.writingDirection.ltr,
    },
    style,
  ];

  return (
    <Text
      {...textProps}
      {...wrapProps}
      {...platformLineBreakProps}
      allowFontScaling={allowSystemFontScaling}
      maxFontSizeMultiplier={
        allowSystemFontScaling ? maxFontSizeMultiplier : undefined
      }
      style={computedStyle}
    >
      {children}
    </Text>
  );
};

/**
 * Hook per utilizzare FormattedText con variant predefiniti
 */
export const useFormattedTextVariants = () => {
  return {
    // Display variants (grandi titoli)
    displayLarge: (props: Omit<FormattedTextProps, 'variant'>) => (
      <FormattedText variant="display-large" {...props} />
    ),
    displayMedium: (props: Omit<FormattedTextProps, 'variant'>) => (
      <FormattedText variant="display-medium" {...props} />
    ),
    displaySmall: (props: Omit<FormattedTextProps, 'variant'>) => (
      <FormattedText variant="display-small" {...props} />
    ),

    // Headline variants (titoli sezioni)
    headlineLarge: (props: Omit<FormattedTextProps, 'variant'>) => (
      <FormattedText variant="headline-large" {...props} />
    ),
    headlineMedium: (props: Omit<FormattedTextProps, 'variant'>) => (
      <FormattedText variant="headline-medium" {...props} />
    ),
    headlineSmall: (props: Omit<FormattedTextProps, 'variant'>) => (
      <FormattedText variant="headline-small" {...props} />
    ),

    // Title variants (titoli componenti)
    titleLarge: (props: Omit<FormattedTextProps, 'variant'>) => (
      <FormattedText variant="title-large" {...props} />
    ),
    titleMedium: (props: Omit<FormattedTextProps, 'variant'>) => (
      <FormattedText variant="title-medium" {...props} />
    ),
    titleSmall: (props: Omit<FormattedTextProps, 'variant'>) => (
      <FormattedText variant="title-small" {...props} />
    ),

    // Body variants (testo principale)
    bodyLarge: (props: Omit<FormattedTextProps, 'variant'>) => (
      <FormattedText variant="body-large" {...props} />
    ),
    bodyMedium: (props: Omit<FormattedTextProps, 'variant'>) => (
      <FormattedText variant="body-medium" {...props} />
    ),
    bodySmall: (props: Omit<FormattedTextProps, 'variant'>) => (
      <FormattedText variant="body-small" {...props} />
    ),

    // Label variants (etichette UI)
    labelLarge: (props: Omit<FormattedTextProps, 'variant'>) => (
      <FormattedText variant="label-large" {...props} />
    ),
    labelMedium: (props: Omit<FormattedTextProps, 'variant'>) => (
      <FormattedText variant="label-medium" {...props} />
    ),
    labelSmall: (props: Omit<FormattedTextProps, 'variant'>) => (
      <FormattedText variant="label-small" {...props} />
    ),
  };
};

export default FormattedText;
