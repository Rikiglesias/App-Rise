// ===================================================================
// ?? DESIGN TOKENS - SPACING
// ===================================================================

import { Spacing as BaseSpacing } from '../../shared/constants';
import { DesignTokens } from '../../shared/constants/responsiveSystem';

const spacingValue = (key: keyof typeof BaseSpacing): number => {
  const map = BaseSpacing as unknown as Record<string, number>;
  const value = map[key as string];
  return typeof value === 'number' ? value : 0;
};

export const DesignSpacing = {
  ...BaseSpacing,

  // Alias semantici
  xs: spacingValue('1'),
  sm: spacingValue('2'),
  md: spacingValue('4'),
  lg: spacingValue('6'),
  xl: spacingValue('8'),
  '2xl': spacingValue('10'),
  '3xl': spacingValue('16'),

  // Spaziature componenti
  component: {
    padding: {
      xs: spacingValue('2'),
      sm: spacingValue('3'),
      md: spacingValue('4'),
      lg: spacingValue('6'),
    },
    margin: {
      xs: spacingValue('1'),
      sm: spacingValue('2'),
      md: spacingValue('4'),
      lg: spacingValue('6'),
    },
    gap: {
      xs: spacingValue('1'),
      sm: spacingValue('2'),
      md: spacingValue('3'),
      lg: spacingValue('4'),
    },
  },

  // Spaziature layout derivate dal responsive system
  layout: {
    section: DesignTokens.layout.sectionSpacing,
    container: DesignTokens.layout.screenPadding,
    content: DesignTokens.layout.cardSpacing,
  },
};

export const Spacing = DesignSpacing;

export default DesignSpacing;
