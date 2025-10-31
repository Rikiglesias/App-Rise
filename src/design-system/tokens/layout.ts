// ===================================================================
// ?? DESIGN TOKENS - LAYOUT
// ===================================================================

import { Spacing } from '../../shared/constants';
import { scale } from '../../shared/constants/perfectScale';

// Valori fissi per layout - DesignTokens e DeviceBreakpoints rimossi
const breakpointValues = {
  xs: 360, // Compact max width
  sm: 640, // Standard max width
  md: 768, // Large max width
  lg: 1024, // XLarge max width
  xl: 1280, // XXLarge min width
  '2xl': 1480, // XXLarge + 200
};

const containerSizes = {
  maxPhone: 480,
  maxTablet: 768,
  maxDesktop: 1200,
};

export const DesignLayout = {
  breakpoints: {
    ...breakpointValues,
  },
  container: {
    xs: '100%',
    sm: containerSizes.maxPhone,
    md: containerSizes.maxTablet,
    lg: containerSizes.maxDesktop,
    xl: containerSizes.maxDesktop,
    '2xl': containerSizes.maxDesktop,
  },
  component: {
    button: {
      height: {
        sm: 36, // Compact
        md: 44, // Standard
        lg: 52, // Large
      },
      minWidth: {
        sm: 88, // Minimum touch target
        md: 120, // Comfortable
        lg: 160, // Generous
      },
    },
    input: {
      height: {
        sm: 36,
        md: 44,
        lg: 52,
      },
    },
    card: {
      minHeight: scale(120),
      maxWidth: containerSizes.maxPhone,
    },
    modal: {
      minWidth: scale(320),
      maxWidth: containerSizes.maxTablet,
      minHeight: scale(200),
    },
  },
  spacing: {
    sectionSpacing: Spacing[6],
    screenPadding: Spacing[4],
    cardSpacing: Spacing[3],
    component: Spacing[2],
  },
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
    toast: 1070,
  },
  icon: {
    xs: scale(12),
    sm: 24, // Small icon
    md: 32, // Medium icon
    lg: 40, // Large icon
    xl: 48, // XLarge icon
    '2xl': scale(56),
  },
};

export const Layout = DesignLayout;

export default DesignLayout;
