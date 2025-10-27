// ===================================================================
// ?? DESIGN TOKENS - COLORS
// ===================================================================

import { Colors as BaseColors } from '../../shared/constants/designTokens';

/**
 * Design Colors
 * Re-uses the shared palette and exposes convenient semantic aliases
 * so that the design system remains in sync with the brand tokens.
 */
export const DesignColors = {
  ...BaseColors,

  background: {
    default: BaseColors.neutral[0],
    elevated: BaseColors.neutral[50],
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  text: {
    primary: BaseColors.neutral[900],
    secondary: BaseColors.neutral[600],
    disabled: BaseColors.neutral[400],
    inverse: BaseColors.neutral[0],
  },
  border: {
    default: BaseColors.neutral[200],
    focus: BaseColors.primary[500],
    error: BaseColors.semantic.error.main,
  },
};

export const Colors = DesignColors;

export default DesignColors;
