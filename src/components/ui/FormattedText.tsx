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

import React from 'react';
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
export const FormattedText: React.FC<FormattedTextProps> = ({
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
  // PASSO 1: Ottieni fontSize base (RAW, senza scaling)
  const baseFontSize = manualFontSize ?? getVariantFontSize(variant);

  // PASSO 2: Usa il font base come misura logica 393 (la scala viene gestita a monte dal Sistema Perfetto)
  let scaledFontSize = baseFontSize;

  // PASSO 3: Applica vincoli accessibilità se richiesto
  if (enforceReadabilityConstraints) {
    scaledFontSize = applyReadabilityConstraints(scaledFontSize);
  }

  // PASSO 4: SISTEMA BI-DIREZIONALE INTELLIGENTE - Solo se abilitato
  const textString = typeof children === 'string' ? children : '';

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
  let finalFontSize = scaledFontSize; // GIÀ SCALATO per device
  let wrapProps = {};

  const isFixedMode = fixed || wrapMode === 'fixed';

  if (isFixedMode) {
    wrapProps = getIntelligentWrapProps(fixed, wrapMode, fixedLines);

    // SISTEMA BI-DIREZIONALE INTELLIGENTE: Calcola fontSize ottimale per dispositivo
    if (fixedLines && fixedLines > 0 && textString) {
      // CALCOLO OTTIMALE: Trova il fontSize perfetto per ogni dispositivo
      finalFontSize = calculateSmartFontSize(
        textString,
        scaledFontSize, // Parte dal font GIÀ SCALATO
        fixedLines,
        containerWidth // Usa containerWidth se specificato
      );
    }
  }
  // ALTRIMENTI: Modalità normale con font scalato standard

  // 🆕 SISTEMA BI-DIREZIONALE INTELLIGENTE: Calcola fontSize ottimale per dispositivo
  let smartMaxFontSizeMultiplier = maxFontSizeMultiplier;
  const smartAllowSystemFontScaling = allowSystemFontScaling;

  if (
    intelligentAccessibilityScaling &&
    isFixedMode &&
    fixedLines &&
    fixedLines > 0 &&
    textString
  ) {
    // MANTIENI allowSystemFontScaling come specificato dall'utente
    // NON forziamo più il zoom di sistema - rispettiamo la scelta dello sviluppatore

    // STEP 1: Calcola il fontSize OTTIMALE per questo dispositivo/container
    const { width: screenWidth } = Dimensions.get('window');
    // Usa containerWidth specificato o calcola 85% della larghezza schermo (più realistico)
    const containerWidthForCalc = containerWidth ?? screenWidth * 0.85;

    // Trova il fontSize perfetto che utilizza al meglio lo spazio disponibile
    let optimalFontSize = finalFontSize;
    let bestFontSize = finalFontSize;

    // Test fontSize con range più ampio per trovare l'ottimale
    for (
      let testSize = finalFontSize * 0.4; // Minimo 40% del fontSize originale
      testSize <= finalFontSize * 2.5; // Massimo 250% del fontSize originale
      testSize += 0.3
    ) {
      const avgCharWidth = testSize * 0.6; // Stima più accurata
      const charsPerLine = Math.floor(containerWidthForCalc / avgCharWidth);
      const totalLinesNeeded = Math.ceil(textString.length / charsPerLine);

      if (totalLinesNeeded <= fixedLines) {
        bestFontSize = testSize; // Questo fontSize funziona
      } else {
        break; // Superato il limite, fermiamo qui
      }
    }

    // STEP 2: Usa il fontSize ottimale trovato come nuovo base
    optimalFontSize = bestFontSize;
    finalFontSize = optimalFontSize; // Aggiorna il fontSize finale

    // STEP 3: Calcola i limiti di zoom attorno al fontSize ottimale
    let maxSafeScaling = 1.0;
    for (let testScaling = 1.0; testScaling <= 3.0; testScaling += 0.1) {
      const testFontSize = optimalFontSize * testScaling;
      const avgCharWidth = testFontSize * 0.6; // Stima più accurata
      const charsPerLine = Math.floor(containerWidthForCalc / avgCharWidth);
      const totalLinesNeeded = Math.ceil(textString.length / charsPerLine);

      if (totalLinesNeeded <= fixedLines) {
        maxSafeScaling = testScaling;
      } else {
        break; // Trovato il limite superiore
      }
    }

    // Imposta il limite calcolato (min 1.2 per garantire accessibilità base)
    smartMaxFontSizeMultiplier = Math.max(1.2, maxSafeScaling);
  }

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

export default FormattedText;
