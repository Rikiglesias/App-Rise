/**
 * FORMATTED TEXT COMPONENT - ENTERPRISE GRADE (REFACTORED)
 *
 * Component che garantisce layout consistency assoluto:
 * - allowFontScaling: false (ignora zoom sistema)
 * - Text wrapping intelligente (2 righe = 2 righe sempre)
 * - Integrazione con Sistema Ibrido Google-Apple-Netflix
 * - Supporto completo accessibilità controllata
 */

import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { scaleFont } from '../../shared/constants/responsiveSystem';
import { calculateSmartFontSize } from './utils/fontSizeCalculation';
import {
  detectTextContent,
  getFallbackFontFamily,
  getFontWeight,
} from './utils/fontUtils';
import {
  getIntelligentWrapProps,
  getPlatformTextProps,
} from './utils/platformLogic';
import {
  applyReadabilityConstraints,
  getVariantFontSize,
  type FormattedTextVariant,
  useFormattedTextVariants,
} from './utils/typographySystem';

// Extend TextProps con nuove proprietà specifiche
export interface FormattedTextProps
  extends Omit<TextProps, 'allowFontScaling'> {
  /**
   * Variant del testo basato su Material Design + Apple HIG
   */
  variant?: FormattedTextVariant;

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
  let finalFontSize = scaledFontSize; // GIÀ SCALATO per device

  // Sistema intelligente per fixedLines
  if (
    (fixed || wrapMode === 'fixed') &&
    fixedLines &&
    fixedLines > 0 &&
    textString
  ) {
    finalFontSize = calculateSmartFontSize(
      textString,
      scaledFontSize,
      fixedLines,
      containerWidth
    );
  }

  // PASSO 5: Configura proprietà wrapping
  const wrapProps = getIntelligentWrapProps(fixed, wrapMode, fixedLines);

  // PASSO 6: Configura proprietà platform-specific
  const platformProps = getPlatformTextProps(
    lineBreakStrategyIOS,
    breakStrategyAndroid,
    hyphenationFrequencyAndroid
  );

  // PASSO 7: Configura font family con fallback
  const computedFontFamily = enableFallbackFontChain
    ? getFallbackFontFamily(textString, fontFamily)
    : fontFamily;

  // PASSO 8: Componi style finale
  const computedStyle: TextStyle = {
    fontSize: finalFontSize,
    fontWeight: getFontWeight(fontWeight),
    color,
    fontFamily: computedFontFamily,
    includeFontPadding: false, // Consistency cross-platform
    textAlignVertical: 'center', // Alignment consistency
    ...(enableRTL && {
      writingDirection:
        detectTextContent(textString) === 'arabic' ? 'rtl' : 'ltr',
    }),
    ...(Array.isArray(style) ? Object.assign({}, ...style) : style),
  };

  return (
    <Text
      allowFontScaling={allowSystemFontScaling}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={computedStyle}
      {...wrapProps}
      {...platformProps}
      {...textProps}
    >
      {children}
    </Text>
  );
};

// Export utilities per compatibilità
export { useFormattedTextVariants };
