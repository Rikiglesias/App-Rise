// ===================================================================
// RISE AGAINST HUNGER ITALIA - DESIGN SYSTEM PREMIUM
// ROSSO & NERO - Professional & Modern Design System 2025
// NOW WITH RESPONSIVE SYSTEM - iPhone 15 proportions on all devices
// ===================================================================

import {
  SpacingTokens,
  TypographyTokens,
  ShadowTokens,
  DesignTokens,
  scaleSize,
  scaleFont,
} from './responsiveSystem';

// 🔴⚫ BRAND COLORS - ROSSO & NERO PREMIUM
export const Colors = {
  // PRIMARY RED - Main brand color
  primary: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#DC2626', // MAIN BRAND RED
    600: '#B91C1C',
    700: '#991B1B',
    800: '#7F1D1D',
    900: '#450A0A',
  },

  // BLACK & GRAYS - Professional palette
  black: {
    pure: '#000000',
    dark: '#0F0F0F',
    medium: '#1A1A1A',
    light: '#262626',
  },

  // NEUTRAL PALETTE
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0A0A0A',
  },

  // ACCENT COLORS
  accent: {
    gold: '#FFD700',
    silver: '#C0C0C0',
    white: '#FFFFFF',
  },

  // SEMANTIC COLORS
  semantic: {
    success: {
      light: '#D1FAE5',
      main: '#10B981',
      dark: '#065F46',
    },
    warning: {
      light: '#FEF3C7',
      main: '#F59E0B',
      dark: '#92400E',
    },
    error: {
      light: '#FEE2E2',
      main: '#DC2626',
      dark: '#B91C1C',
    },
    info: {
      light: '#DBEAFE',
      main: '#3B82F6',
      dark: '#1E40AF',
    },
  },

  // GRADIENTS
  gradients: {
    primary: ['#DC2626', '#B91C1C'] as const,
    redToBlack: ['#DC2626', '#000000'] as const,
    blackToRed: ['#000000', '#DC2626'] as const,
    subtle: ['#FAFAFA', '#F5F5F5'] as const,
    energy: ['#DC2626', '#FF4500'] as const,
  },

  // GLASSMORPHISM
  glass: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.2)',
    dark: 'rgba(0, 0, 0, 0.3)',
    red: 'rgba(220, 38, 38, 0.1)',
  },

  // DARK MODE COLORS
  dark: {
    surface: {
      primary: '#1A1A1A',
      secondary: '#262626',
      tertiary: '#404040',
    },
    border: {
      primary: '#404040',
      secondary: '#525252',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#D4D4D4',
      tertiary: '#A3A3A3',
    },
  },
};

// SPACING SYSTEM - Now with responsive scaling
export const Spacing = SpacingTokens;

// BORDER RADIUS - Now with responsive scaling
export const BorderRadius = {
  none: 0,
  sm: 6,
  md: 12,
  lg: 18,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  full: 9999,
};

// 🎨 BORDER COLORS - Sistema Bilanciato per Visibilità Ottimale
export const BorderColors = {
  // Bordi principali - Visibilità migliorata
  primary: Colors.neutral[200], // #E5E5E5 - Bordo standard visibile
  secondary: Colors.neutral[300], // #D4D4D4 - Bordo più visibile
  subtle: Colors.neutral[100], // #F5F5F5 - Bordo sottile

  // Bordi neutri bilanciati
  elegant: Colors.neutral[200], // #E5E5E5 - Grigio visibile
  refined: Colors.neutral[300], // #D4D4D4 - Grigio più visibile
  sophisticated: Colors.neutral[400], // #A3A3A3 - Grigio ben visibile

  // Bordi semantici - Versioni bilanciate
  success: Colors.semantic.success.light, // #D1FAE5 - Verde visibile
  warning: Colors.semantic.warning.light, // #FEF3C7 - Ambra visibile
  error: Colors.semantic.error.light, // #FEE2E2 - Rosso visibile
  info: Colors.semantic.info.light, // #DBEAFE - Blu visibile

  // Bordi brand - Gamma bilanciata
  brand: Colors.primary[200], // #FECACA - Rosso pieno sottile
  brandStrong: Colors.primary[500], // #DC2626 - Rosso pieno forte
  brandElegant: Colors.primary[300], // #FCA5A5 - Rosso medio visibile

  // Bordi interattivi - Visibilità ottimale
  focus: Colors.primary[400], // #F87171 - Focus rosso visibile
  hover: Colors.neutral[400], // #A3A3A3 - Hover grigio visibile
  disabled: Colors.neutral[200], // #E5E5E5 - Disabled grigio chiaro

  // Bordi glassmorphism - Bilanciati
  glass: {
    light: 'rgba(255, 255, 255, 0.2)',
    medium: 'rgba(255, 255, 255, 0.25)',
    dark: 'rgba(0, 0, 0, 0.1)',
    primary: 'rgba(220, 38, 38, 0.2)',
    elegant: 'rgba(31, 41, 55, 0.1)',
  },
};

// TYPOGRAPHY SYSTEM - Now with responsive scaling
export const Typography = {
  families: {
    heading: 'SF Pro Display',
    body: 'SF Pro Text',
    accent: 'SF Pro Display',
    mono: 'SF Mono',
  },

  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  } as const,

  // Typography sizes with responsive scaling - now using scaleFont()
  sizes: {
    xs: scaleFont(12), // Responsive minimum readable size
    sm: scaleFont(13), // Responsive small readable size
    base: scaleFont(14), // Responsive base readable size
    lg: scaleFont(16), // Responsive large readable size
    xl: scaleFont(18), // Responsive extra large size
    '2xl': scaleFont(20), // Responsive 2xl size
    '3xl': scaleFont(24), // Responsive 3xl size
    '4xl': scaleFont(28), // Responsive 4xl size
    '5xl': scaleFont(32), // Responsive 5xl size
    '6xl': scaleFont(36), // Responsive 6xl size
  },

  lineHeights: TypographyTokens.lineHeights,

  letterSpacing: TypographyTokens.letterSpacing,
};

// SHADOWS SYSTEM - Now with responsive scaling
export const Shadows = {
  ...ShadowTokens,
  red: {
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: scaleSize(4) },
    shadowOpacity: 0.3,
    shadowRadius: scaleSize(12),
    elevation: 6,
  },
  primary: {
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: scaleSize(6) },
    shadowOpacity: 0.2,
    shadowRadius: scaleSize(16),
    elevation: 8,
  },
};

// ANIMATIONS
export const Animations = {
  timing: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  easing: {
    smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  duration: {
    ultraFast: 100,
    fast: 150,
    normal: 250,
    slow: 350,
  },
  spring: {
    damping: 15,
    stiffness: 150,
    gentle: {
      tension: 100,
      friction: 8,
    },
    snappy: {
      tension: 180,
      friction: 6,
    },
    playful: {
      tension: 200,
      friction: 5,
    },
  },
};

// ANIMATION ALIAS (per compatibilità)
export const Animation = Animations;

// GLASSMORPHISM CONFIG
export const Glassmorphism = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  medium: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  dark: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  primary: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
};

// ACCESSIBILITY CONSTANTS
export const Accessibility = {
  touchTarget: {
    min: 44,
    comfortable: 48,
    large: 56,
  },
  contrast: {
    normal: 4.5,
    large: 3,
  },
};

// DARK MODE CONFIG
export const DarkMode = {
  isDark: false,
  colors: Colors.dark,
};

// LAYOUT CONSTANTS - Now with responsive dimensions
export const Layout = {
  screenPadding: DesignTokens.layout.screenPadding,
  sectionSpacing: DesignTokens.layout.sectionSpacing,
  cardSpacing: DesignTokens.layout.cardSpacing,
  golden: {
    xs: 0.618,
    sm: 1,
    md: 1.618,
    lg: 2.618,
    xl: 4.236,
  },
};

// UTILITY FUNCTIONS
export const getSemanticColor = (
  type: 'success' | 'warning' | 'error' | 'info',
  variant: 'light' | 'main' | 'dark' = 'main'
) => Colors.semantic[type][variant];

export const getPrimaryShade = (shade: keyof typeof Colors.primary) =>
  Colors.primary[shade];

export const fontWeight = (weight: keyof typeof Typography.weights) =>
  Typography.weights[weight];

// EXPORT ALL
export { Colors as default };
