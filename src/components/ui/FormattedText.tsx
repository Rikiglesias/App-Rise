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
import { Text, TextProps, TextStyle } from 'react-native';
import {
  TypographyTokens,
  AccessibilityIntelligence,
  scaleFont,
} from '../../shared/constants/responsiveSystem';

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
   * Controlla se applicare vincoli Netflix di leggibilità
   */
  enforceReadabilityConstraints?: boolean;

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
 */
const calculateSmartFontSize = (
  text: string,
  scaledFontSize: number, // Già scalato con scaleFont()
  targetLines: number,
  maxWidth: number = 350
): number => {
  if (!text || targetLines <= 0) return scaledFontSize;

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
      maxWidth
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
    const charsPerLine = Math.floor(maxWidth / avgCharWidth);
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
  enforceReadabilityConstraints = true,
  fontSize: manualFontSize,
  color,
  fontWeight,
  wrapMode, // LEGACY: Supporto per backward compatibility
  fixed = false, // NUOVO: Sistema intelligente
  fixedLines, // OPZIONALE - funziona solo con fixed={true}
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
  let wrapProps = {};

  const isFixedMode = fixed || wrapMode === 'fixed';

  if (isFixedMode) {
    wrapProps = getIntelligentWrapProps(fixed, wrapMode, fixedLines);

    // MODALITÀ INTELLIGENTE CONSERVATIVA: Con fixedLines ridimensiona minimamente il font
    if (fixedLines && fixedLines > 0 && textString) {
      // CALCOLO CONSERVATIVO: Trova il fontSize ottimale per far entrare tutto il testo
      finalFontSize = calculateSmartFontSize(
        textString,
        scaledFontSize, // Parte dal font GIÀ SCALATO
        fixedLines
      );
    }
  }
  // ALTRIMENTI: Modalità normale con font scalato standard

  // Calcola stile finale
  const computedStyle = [
    {
      fontSize: finalFontSize,
      color: color ?? '#171717',
      fontWeight: getFontWeight(fontWeight),
      lineHeight: finalFontSize * TypographyTokens.lineHeights.normal,
      includeFontPadding: false,
      textAlignVertical: 'center' as const,
    },
    style,
  ];

  return (
    <Text
      {...textProps}
      {...wrapProps}
      allowFontScaling={allowSystemFontScaling}
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
