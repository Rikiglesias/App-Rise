// ===================================================================
// ?? DESIGN TOKENS - BORDERS
// ===================================================================

import { BorderRadius as BaseBorderRadius } from '../../shared/constants/designTokens';
import { DesignColors } from './colors';

const radiusValues = {
  none: BaseBorderRadius.none,
  xs: Math.max(2, Math.round(BaseBorderRadius.sm / 2)),
  sm: BaseBorderRadius.sm,
  md: BaseBorderRadius.md,
  lg: BaseBorderRadius.lg,
  xl: BaseBorderRadius.xl,
  '2xl': BaseBorderRadius['2xl'],
  '3xl': BaseBorderRadius['3xl'],
  full: BaseBorderRadius.full,
};

export const DesignBorders = {
  width: {
    none: 0,
    thin: 1,
    normal: 2,
    thick: 4,
  },
  radius: radiusValues,
  style: {
    solid: 'solid',
    dashed: 'dashed',
    dotted: 'dotted',
  },
  semantic: {
    default: {
      width: 1,
      style: 'solid',
      color: DesignColors.border.default,
    },
    focus: {
      width: 2,
      style: 'solid',
      color: DesignColors.border.focus,
    },
    error: {
      width: 1,
      style: 'solid',
      color: DesignColors.border.error,
    },
    success: {
      width: 1,
      style: 'solid',
      color: DesignColors.semantic.success.main,
    },
  },
  component: {
    button: {
      radius: radiusValues.md,
      width: 1,
    },
    card: {
      radius: radiusValues.lg,
      width: 1,
    },
    input: {
      radius: radiusValues.sm,
      width: 1,
    },
    modal: {
      radius: radiusValues.xl,
      width: 0,
    },
  },
};

export const Borders = DesignBorders;

export default DesignBorders;
