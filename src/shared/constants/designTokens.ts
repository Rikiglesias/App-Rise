// ===================================================================
// RISE AGAINST HUNGER ITALIA - DESIGN TOKENS
// SOLO VALORI - NESSUN IMPORT SISTEMI VECCHI
// ===================================================================

import { Platform } from 'react-native';

const selectPlatformValue = <T>(
  options: { ios?: T; android?: T; default?: T },
  fallback: T
): T => {
  try {
    if (Platform && typeof Platform.select === 'function') {
      const value = Platform.select(options);
      if (value !== undefined && value !== null) {
        return value;
      }
    }
  } catch {
    // Jest or non-RN environments may not provide Platform; fall back.
  }
  return fallback;
};

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
    // Action buttons gradients
    donate: ['#E11D48', '#DC2626', '#B91C1C'] as const, // Rose → Red
    shop: ['#DC2626', '#B91C1C', '#991B1B'] as const, // Red gradient
    projects: ['#0F766E', '#0D9488', '#14B8A6'] as const, // Teal gradient
    tracking: ['#1565C0', '#1976D2', '#2196F3'] as const, // Blue gradient
    events: ['#7C3AED', '#8B5CF6', '#A855F7'] as const, // Purple gradient
    community: ['#1F2937', '#374151', '#4B5563'] as const, // Dark gray gradient
    success: ['#059669', '#10B981', '#047857'] as const, // Green gradient
    purple: ['#8B5CF6', '#7C3AED', '#6D28D9'] as const, // Purple gradient for partners
    // Social platforms gradients
    website: ['#6B7280', '#9CA3AF', '#D1D5DB'] as const, // Gray gradient
    instagram: ['#E1306C', '#F56040', '#FCAF45'] as const, // Instagram gradient
    facebook: ['#1877F2', '#42A5F5', '#64B5F6'] as const, // Facebook blue gradient
    linkedin: ['#0077B5', '#00A0DC', '#40E0D0'] as const, // LinkedIn blue gradient
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

// SPACING SYSTEM - ⚠️ DEPRECATO - Usa PerfectSpacing invece!
// Il vecchio Spacing è stato rimosso. Usa PerfectSpacing per spacing semantico e scalato.

// BORDER RADIUS
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

// TYPOGRAPHY SYSTEM
export const Typography = {
  families: {
    // Use platform system fonts to remove custom font dependency
    heading: selectPlatformValue(
      {
        ios: 'System',
        android: 'Roboto',
        default: 'System',
      },
      'System'
    ),
    body: selectPlatformValue(
      {
        ios: 'System',
        android: 'Roboto',
        default: 'System',
      },
      'System'
    ),
    accent: selectPlatformValue(
      {
        ios: 'System',
        android: 'Roboto',
        default: 'System',
      },
      'System'
    ),
    mono: selectPlatformValue(
      {
        ios: 'SF Mono',
        android: 'monospace',
        default: 'monospace',
      },
      'monospace'
    ),
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

  // ⚠️ NO sizes - usa direttamente numeri in <PerfectText size={16}>
  // Perfect System scala automaticamente tramite scale()

  lineHeights: {
    tight: 1.1,
    normal: 1.3,
    relaxed: 1.5,
  },

  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};

// SHADOWS SYSTEM - Valori fissi
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  red: {
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primary: {
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
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

// ALIAS
export const Animation = Animations;

// EXPORT DEFAULT
export { Colors as default };
