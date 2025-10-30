// ===================================================================
// ?? DESIGN TOKENS - SPACING
// ===================================================================

import { Spacing as BaseSpacing } from '../../shared/constants';

export const DesignSpacing = {
  ...BaseSpacing,

  // Alias semantici
  xs: BaseSpacing[1],
  sm: BaseSpacing[2],
  md: BaseSpacing[4],
  lg: BaseSpacing[6],
  xl: BaseSpacing[8],
  '2xl': BaseSpacing[10],
  '3xl': BaseSpacing[16],

  // Spaziature componenti
  component: {
    padding: {
      xs: BaseSpacing[2],
      sm: BaseSpacing[3],
      md: BaseSpacing[4],
      lg: BaseSpacing[6],
    },
    margin: {
      xs: BaseSpacing[1],
      sm: BaseSpacing[2],
      md: BaseSpacing[4],
      lg: BaseSpacing[6],
    },
    gap: {
      xs: BaseSpacing[1],
      sm: BaseSpacing[2],
      md: BaseSpacing[3],
      lg: BaseSpacing[4],
    },
  },

  // Layout section commentata - DesignTokens rimosso
  // layout: {
  //   section: 24,
  //   container: 16,
  //   content: 12,
  // },
};

export const Spacing = DesignSpacing;

export default DesignSpacing;
