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
import { Text, TextProps, Platform, TextStyle } from 'react-native';
import {
  TypographyTokens,
  TextIntelligence,
  AccessibilityIntelligence,
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
   * Modalità text wrapping per layout consistency
   */
  wrapMode?: 'strict' | 'flexible' | 'none';

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
 * Mapping variant a fontSize del sistema ibrido
 */
const getVariantFontSize = (variant: FormattedTextProps['variant']): number => {
  if (!variant) return TypographyTokens.styles.body.medium;

  const [category, size] = variant.split('-') as [string, string];

  switch (category) {
    case 'display':
      return (
        TypographyTokens.styles.display[
          size as keyof typeof TypographyTokens.styles.display
        ] || TypographyTokens.styles.display.medium
      );
    case 'headline':
      return (
        TypographyTokens.styles.headline[
          size as keyof typeof TypographyTokens.styles.headline
        ] || TypographyTokens.styles.headline.medium
      );
    case 'title':
      return (
        TypographyTokens.styles.title[
          size as keyof typeof TypographyTokens.styles.title
        ] || TypographyTokens.styles.title.medium
      );
    case 'body':
      return (
        TypographyTokens.styles.body[
          size as keyof typeof TypographyTokens.styles.body
        ] || TypographyTokens.styles.body.medium
      );
    case 'label':
      return (
        TypographyTokens.styles.label[
          size as keyof typeof TypographyTokens.styles.label
        ] || TypographyTokens.styles.label.medium
      );
    default:
      return TypographyTokens.styles.body.medium;
  }
};

/**
 * Applica vincoli Netflix + Apple accessibility intelligence
 */
const applyReadabilityConstraints = (fontSize: number): number => {
  return AccessibilityIntelligence.calculateAccessibleFontSize(fontSize);
};

/**
 * Ottieni proprietà text wrapping basate su modalità + Netflix intelligence
 */
const getWrapProps = (
  wrapMode: FormattedTextProps['wrapMode'],
  text: string = '',
  fontSize: number = 14
) => {
  // Netflix intelligence: calcola larghezza ottimale per il testo
  const optimalWidth = TextIntelligence.getOptimalTextWidth(fontSize);
  const shouldWrap = TextIntelligence.shouldWrapText(
    text,
    fontSize,
    optimalWidth
  );
  const optimalLines = TextIntelligence.getOptimalLineCount(
    text,
    fontSize,
    optimalWidth
  );

  switch (wrapMode) {
    case 'strict':
      return {
        numberOfLines: shouldWrap ? optimalLines : 1,
        ellipsizeMode: 'clip' as const,
        adjustsFontSizeToFit: false,
      };
    case 'flexible':
      return {
        numberOfLines: shouldWrap ? optimalLines : undefined,
        ellipsizeMode: 'tail' as const,
        adjustsFontSizeToFit: Platform.OS === 'ios' && !shouldWrap,
      };
    case 'none':
      return {
        numberOfLines: 1,
        ellipsizeMode: 'tail' as const,
        adjustsFontSizeToFit: false,
      };
    default:
      return {
        numberOfLines: shouldWrap ? optimalLines : undefined,
        ellipsizeMode: 'tail' as const,
        adjustsFontSizeToFit: false,
      };
  }
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
 * FormattedText Component
 *
 * Garantisce layout consistency su tutti i dispositivi ignorando zoom sistema
 * e applicando text wrapping intelligente.
 */
export const FormattedText: React.FC<FormattedTextProps> = ({
  variant = 'body-medium',
  allowSystemFontScaling = false,
  wrapMode = 'flexible',
  enforceReadabilityConstraints = true,
  fontSize: manualFontSize,
  color,
  fontWeight,
  style,
  children,
  ...textProps
}) => {
  // Calcola fontSize finale
  const baseFontSize = manualFontSize ?? getVariantFontSize(variant);
  const finalFontSize = enforceReadabilityConstraints
    ? applyReadabilityConstraints(baseFontSize)
    : baseFontSize;

  // Ottieni proprietà wrapping intelligenti
  const textString = typeof children === 'string' ? children : '';
  const wrapProps = getWrapProps(wrapMode, textString, finalFontSize);

  // Calcola stile finale
  const computedStyle = [
    {
      fontSize: finalFontSize,
      color: color ?? '#171717', // Default neutral-900
      fontWeight: getFontWeight(fontWeight),
      // Imposta lineHeight proporzionale per consistency
      lineHeight: finalFontSize * TypographyTokens.lineHeights.normal,
      // Disabilita font padding su Android per consistency
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
