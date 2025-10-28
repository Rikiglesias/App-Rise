import { Platform } from 'react-native';
import { Colors } from './designTokens';

// ===================================================================
// PLATFORM-AWARE DESIGN TOKENS
// ===================================================================

/**
 * Helper function to convert hex color to rgba
 */
const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Shadows intelligenti che usano:
 * - iOS: shadowColor, shadowOffset, shadowOpacity, shadowRadius
 * - Android: elevation (più performante)
 */
export const PlatformShadows = {
  xs: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    android: { elevation: 1 },
  }),
  sm: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: { elevation: 2 },
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    android: { elevation: 4 },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
    },
    android: { elevation: 8 },
  }),
  xl: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
    },
    android: { elevation: 12 },
  }),
  primary: Platform.select({
    ios: {
      shadowColor: Colors.primary[500],
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
      shadowColor: Colors.primary[500],
    },
  }),
};

/**
 * Animazioni ottimizzate per piattaforma
 */
export const PlatformAnimations = {
  duration: {
    // iOS: può gestire animazioni più veloci
    ultraFast: Platform.OS === 'ios' ? 100 : 150,
    fast: Platform.OS === 'ios' ? 150 : 200,
    normal: Platform.OS === 'ios' ? 250 : 300,
    slow: Platform.OS === 'ios' ? 350 : 400,
  },

  spring: Platform.select({
    ios: {
      // iOS: animazioni più fluide
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    },
    android: {
      // Android: più conservative per performance
      tension: 80,
      friction: 10,
      useNativeDriver: true,
    },
  }),

  scale: Platform.select({
    ios: {
      pressIn: 0.95,
      pressOut: 1.0,
      bounce: 1.1,
    },
    android: {
      // Android: scale più conservative
      pressIn: 0.97,
      pressOut: 1.0,
      bounce: 1.05,
    },
  }),
};

/**
 * Colors con supporto ripple Android
 */
export const PlatformColors = {
  ...Colors,

  // Ripple colors per Material Design
  ripple: {
    primary: hexToRgba(Colors.primary[500], 0.2),
    secondary: hexToRgba(Colors.neutral[500], 0.1),
    light: 'rgba(255, 255, 255, 0.1)',
    dark: 'rgba(0, 0, 0, 0.1)',
  },

  // Surface colors Material Design
  surface: Platform.select({
    ios: {
      primary: Colors.neutral[0],
      secondary: Colors.neutral[50],
      elevated: Colors.neutral[0],
    },
    android: {
      primary: '#FFFFFF',
      secondary: '#F5F5F5',
      elevated: '#FFFFFF',
    },
  }),
};

/**
 * Typography ottimizzata per piattaforma
 */
export const PlatformTypography = {
  // Font family platform-specific
  family: Platform.select({
    ios: {
      heading: 'SF Pro Display',
      body: 'SF Pro Text',
      mono: 'SF Mono',
    },
    android: {
      heading: 'Roboto',
      body: 'Roboto',
      mono: 'Roboto Mono',
    },
  }),

  // Line height ottimizzate
  lineHeight: Platform.select({
    ios: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
    android: {
      // Android needs slightly more spacing
      tight: 1.3,
      normal: 1.6,
      relaxed: 1.8,
    },
  }),
};

/**
 * Touch target sizes ottimizzati
 */
export const PlatformTouch = {
  minSize: Platform.select({
    ios: 44, // iOS HIG requirement
    android: 48, // Material Design requirement
  }),

  comfortable: Platform.select({
    ios: 48,
    android: 56,
  }),

  large: Platform.select({
    ios: 56,
    android: 64,
  }),
};

// Export everything
export {
  PlatformShadows as Shadows,
  PlatformAnimations as Animations,
  PlatformColors as Colors,
  PlatformTypography as Typography,
  PlatformTouch as Touch,
};
