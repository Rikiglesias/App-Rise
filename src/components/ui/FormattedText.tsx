/**
 * FormattedText Component - SISTEMA INTELLIGENTE BI-DIREZIONALE
 *
 * ORDINE OPERAZIONI:
 * 1. fontSize base → 2. scaleFont() → 3. Sistema bi-direzionale intelligente (se abilitato)
 *
 * NUOVO SISTEMA intelligentAccessibilityScaling:
 * - Calcola automaticamente il fontSize OTTIMALE per ogni dispositivo
 * - Supporta zoom accessibilità fino ai limiti che rispettano fixedLines
 * - Funziona bi-direzionalmente: riduce su dispositivi piccoli, ingrandisce su grandi
 * - Layout consistency sempre garantito
 */

import React, { useMemo } from 'react';
import { Text, TextProps, Platform, Dimensions } from 'react-native';
import {
  DesignTokens,
  RTLTokens,
} from '../../shared/constants/responsiveSystem';
import {
  getVariantFontSize,
  applyReadabilityConstraints,
  calculateSmartFontSize,
} from './utils/fontSizeCalculation';
import {
  getIntelligentWrapProps,
  getFontWeight,
  getFallbackFontFamily,
} from './utils/fontUtils';

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
   * Modalità text wrapping - NUOVO SISTEMA BI-DIREZIONALE
   * - fixed: Layout controllato con sistema bi-direzionale intelligente
   * - compatibilità: wrapMode="fixed" supportato per backward compatibility
   */
  wrapMode?: 'fixed';

  /**
   * Attiva il sistema intelligente di layout fisso
   * - fixed={true}: Layout controllato con possibilità di abilitare sistema bi-direzionale
   * - fixed={true} + intelligentAccessibilityScaling={true}: Sistema bi-direzionale completo
   */
  fixed?: boolean;

  /**
   * Numero fisso di righe - OPZIONALE, funziona con sistema bi-direzionale
   * COMPORTAMENTO NUOVO: Con intelligentAccessibilityScaling={true}, calcola automaticamente fontSize ottimale per rispettare fixedLines
   * COMPORTAMENTO LEGACY: Senza intelligentAccessibilityScaling, ridimensiona conservativamente
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

  /**
   * NUOVO: Sistema di adattamento intelligente bi-direzionale
   * - true: Calcola automaticamente il fontSize OTTIMALE per ogni dispositivo rispettando sempre fixedLines
   * - Zoom UP: Se l'utente aumenta zoom → ingrandisce fino al limite che rispetta fixedLines
   * - Zoom DOWN: Se dispositivo piccolo → riduce fontSize per far entrare il testo nelle righe
   * - Zoom OPTIMAL: Su dispositivi grandi → ingrandisce per utilizzare meglio lo spazio
   * BENEFICIO: Accessibilità universale + Layout consistency assoluto + Utilizzo ottimale spazio
   */
  intelligentAccessibilityScaling?: boolean;
}

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
const FormattedTextComponent: React.FC<FormattedTextProps> = ({
  variant = 'body-medium',
  allowSystemFontScaling = false,
  maxFontSizeMultiplier = 1.2, // Limite Dynamic Type al 120%
  intelligentAccessibilityScaling = false, // NUOVO: Zoom intelligente
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
  // PASSO 1-3: Calcoli fontSize ottimizzati con useMemo
  const { baseFontSize: _baseFontSize, scaledFontSize } = useMemo(() => {
    const base = manualFontSize ?? getVariantFontSize(variant);
    let scaled = base;

    if (enforceReadabilityConstraints) {
      scaled = applyReadabilityConstraints(scaled);
    }

    return { baseFontSize: base, scaledFontSize: scaled };
  }, [manualFontSize, variant, enforceReadabilityConstraints]);

  // PASSO 4: SISTEMA BI-DIREZIONALE INTELLIGENTE - Solo se abilitato (memoized)
  const textString = useMemo(
    () => (typeof children === 'string' ? children : ''),
    [children]
  );

  // 🔍 DIAGNOSI: Debug temporaneamente disabilitato per evitare hang nei test
  // if (__DEV__ && textString.includes('Rise Against')) {
  //   // eslint-disable-next-line no-console
  //   console.log('🔍 FormattedText DEBUG:', {
  //     raw: baseFontSize,
  //     scaled: scaledFontSize,
  //     ratio: scaledFontSize / baseFontSize,
  //     hasDoubleScaling: scaledFontSize > baseFontSize * 1.2,
  //     text: textString.substring(0, 30) + '...',
  //   });
  // }
  // Calcoli layout ottimizzati con useMemo
  const { finalFontSize, wrapProps, isFixedMode } = useMemo(() => {
    let fontSize = scaledFontSize;
    let props = {};
    const fixedMode = fixed || wrapMode === 'fixed';

    if (fixedMode) {
      props = getIntelligentWrapProps(fixed, wrapMode, fixedLines);

      if (fixedLines && fixedLines > 0 && textString) {
        fontSize = calculateSmartFontSize(
          textString,
          scaledFontSize,
          fixedLines,
          containerWidth
        );
      }
    }

    return {
      finalFontSize: fontSize,
      wrapProps: props,
      isFixedMode: fixedMode,
    };
  }, [scaledFontSize, fixed, wrapMode, fixedLines, textString, containerWidth]);
  // ALTRIMENTI: Modalità normale con font scalato standard

  // Sistema di scaling intelligente ottimizzato con useMemo
  const {
    smartMaxFontSizeMultiplier,
    smartAllowSystemFontScaling,
    optimizedFinalFontSize,
  } = useMemo(() => {
    let maxMultiplier = maxFontSizeMultiplier;
    const allowScaling = allowSystemFontScaling;
    let optimizedFontSize = finalFontSize;

    if (
      intelligentAccessibilityScaling &&
      isFixedMode &&
      fixedLines &&
      fixedLines > 0 &&
      textString
    ) {
      const { width: screenWidth } = Dimensions.get('window');
      const containerWidthForCalc = containerWidth ?? screenWidth * 0.85;

      let bestFontSize = finalFontSize;

      for (
        let testSize = finalFontSize * 0.4;
        testSize <= finalFontSize * 2.5;
        testSize += 0.3
      ) {
        const avgCharWidth = testSize * 0.6;
        const charsPerLine = Math.floor(containerWidthForCalc / avgCharWidth);
        const totalLinesNeeded = Math.ceil(textString.length / charsPerLine);

        if (totalLinesNeeded <= fixedLines) {
          bestFontSize = testSize;
        } else {
          break;
        }
      }

      optimizedFontSize = bestFontSize;

      let maxSafeScaling = 1.0;
      for (let testScaling = 1.0; testScaling <= 3.0; testScaling += 0.1) {
        const testFontSize = optimizedFontSize * testScaling;
        const avgCharWidth = testFontSize * 0.6;
        const charsPerLine = Math.floor(containerWidthForCalc / avgCharWidth);
        const totalLinesNeeded = Math.ceil(textString.length / charsPerLine);

        if (totalLinesNeeded <= fixedLines) {
          maxSafeScaling = testScaling;
        } else {
          break;
        }
      }

      maxMultiplier = Math.max(1.2, maxSafeScaling);
    }

    return {
      smartMaxFontSizeMultiplier: maxMultiplier,
      smartAllowSystemFontScaling: allowScaling,
      optimizedFinalFontSize: optimizedFontSize,
    };
  }, [
    maxFontSizeMultiplier,
    allowSystemFontScaling,
    finalFontSize,
    intelligentAccessibilityScaling,
    isFixedMode,
    fixedLines,
    textString,
    containerWidth,
  ]);

  // Calcoli di stile ottimizzati con useMemo
  const {
    rtlAwareTextAlign: _rtlAwareTextAlign,
    platformLineBreakProps,
    determinedFontFamily: _determinedFontFamily,
    computedStyle,
  } = useMemo(() => {
    const textAlign = enableRTL ? RTLTokens.textAlign.start : 'left';

    const lineBreakProps = Platform.select({
      ios: {
        lineBreakStrategyIOS: lineBreakStrategyIOS,
      },
      android: {
        android_breakStrategy: breakStrategyAndroid,
        android_hyphenationFrequency: hyphenationFrequencyAndroid,
      },
      default: {},
    });

    const fontFamilyDetermined =
      enableFallbackFontChain && textString
        ? getFallbackFontFamily(textString, fontFamily)
        : (fontFamily ?? undefined);

    const styleComputed = [
      {
        fontSize: optimizedFinalFontSize,
        color: color ?? '#171717',
        fontWeight: getFontWeight(fontWeight),
        fontFamily: fontFamilyDetermined,
        lineHeight: DesignTokens?.containers?.baseline?.lineHeight
          ? DesignTokens.containers.baseline.lineHeight(optimizedFinalFontSize)
          : Math.round(optimizedFinalFontSize * 1.15),
        includeFontPadding: false,
        textAlignVertical: 'center' as const,
        textAlign: textAlign,
        writingDirection: enableRTL
          ? RTLTokens.writingDirection.auto
          : RTLTokens.writingDirection.ltr,
      },
      style,
    ];

    return {
      rtlAwareTextAlign: textAlign,
      platformLineBreakProps: lineBreakProps,
      determinedFontFamily: fontFamilyDetermined,
      computedStyle: styleComputed,
    };
  }, [
    enableRTL,
    lineBreakStrategyIOS,
    breakStrategyAndroid,
    hyphenationFrequencyAndroid,
    enableFallbackFontChain,
    textString,
    fontFamily,
    optimizedFinalFontSize,
    color,
    fontWeight,
    style,
  ]);

  return (
    <Text
      {...textProps}
      {...wrapProps}
      {...platformLineBreakProps}
      allowFontScaling={smartAllowSystemFontScaling}
      maxFontSizeMultiplier={
        smartAllowSystemFontScaling ? smartMaxFontSizeMultiplier : undefined
      }
      style={computedStyle}
    >
      {children}
    </Text>
  );
};

// Memoized component per ottimizzazioni performance
export const FormattedText = React.memo(FormattedTextComponent);

export default FormattedText;
