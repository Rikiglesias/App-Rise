import {
  TypographyTokens,
  AccessibilityIntelligence,
} from '../../../shared/constants/responsiveSystem';

/**
 * Typography system utilities per FormattedText
 * Gestisce variants, accessibility e font sizing
 */

export type FormattedTextVariant =
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
 * Mapping variant a fontSize del sistema ibrido - SENZA SCALING
 * Lo scaling viene applicato UNA volta sola nel componente principale
 */
export const getVariantFontSize = (variant?: FormattedTextVariant): number => {
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
 * Hook per ottenere tutte le varianti disponibili (mantenuto per compatibilità)
 */
export const useFormattedTextVariants = () => {
  return {
    display: ['large', 'medium', 'small'],
    headline: ['large', 'medium', 'small'],
    title: ['large', 'medium', 'small'],
    body: ['large', 'medium', 'small'],
    label: ['large', 'medium', 'small'],
  };
};
