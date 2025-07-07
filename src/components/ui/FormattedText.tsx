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
import { Text, TextProps, Platform } from 'react-native';
import {
  scaleFont,
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

// Hook e utilità esportate da file separati
export { useFormattedTextVariants } from './hooks/useFormattedTextVariants';
export default FormattedText;
