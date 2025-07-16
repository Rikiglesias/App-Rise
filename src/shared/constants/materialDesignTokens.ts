import { Platform } from 'react-native';

// ===================================================================
// MATERIAL DESIGN 3 (MATERIAL YOU) ANDROID SYSTEM
// ===================================================================

/**
 * Material Design 3 Color System per Android
 * Implementa le specifiche complete di Material You
 */
export const MaterialColors = {
  // Primary Color Tones (Material You style)
  primary: {
    0: '#000000',
    10: '#21005D',
    20: '#381E72',
    30: '#4F378B',
    40: '#6750A4',
    50: '#7F67BE',
    60: '#9A82DB',
    70: '#B69DF8',
    80: '#D0BCFF',
    90: '#EADDFF',
    95: '#F6EDFF',
    99: '#FFFBFE',
    100: '#FFFFFF',
  },

  // Secondary Colors
  secondary: {
    0: '#000000',
    10: '#1D192B',
    20: '#332D41',
    30: '#4A4458',
    40: '#625B71',
    50: '#7A7289',
    60: '#958DA5',
    70: '#B0A7C0',
    80: '#CCC2DC',
    90: '#E8DEF8',
    95: '#F6EDFF',
    99: '#FFFBFE',
    100: '#FFFFFF',
  },

  // Tertiary Colors (per accenti)
  tertiary: {
    0: '#000000',
    10: '#31111D',
    20: '#492532',
    30: '#633B48',
    40: '#7D5260',
    50: '#986977',
    60: '#B58392',
    70: '#D29DAC',
    80: '#EFB8C8',
    90: '#FFD8E4',
    95: '#FFECF1',
    99: '#FFFBFA',
    100: '#FFFFFF',
  },

  // Neutral Colors (per superfici)
  neutral: {
    0: '#000000',
    10: '#1C1B1F',
    20: '#313033',
    30: '#484649',
    40: '#605D62',
    50: '#787579',
    60: '#939094',
    70: '#AEAAAE',
    80: '#CAC4D0',
    90: '#E6E0E9',
    95: '#F4EFF4',
    99: '#FFFBFE',
    100: '#FFFFFF',
  },

  // Error Colors
  error: {
    0: '#000000',
    10: '#410E0B',
    20: '#601410',
    30: '#8C1D18',
    40: '#B3261E',
    50: '#DC362E',
    60: '#E46962',
    70: '#EC928E',
    80: '#F2B8B5',
    90: '#F9DEDC',
    95: '#FCEEEE',
    99: '#FFFBF9',
    100: '#FFFFFF',
  },

  // Brand specific (Rise Against Hunger)
  brand: {
    primary: '#DC2626', // Il rosso esistente
    primaryTones: {
      0: '#000000',
      10: '#2D0600',
      20: '#5D1100',
      30: '#8C1D00',
      40: '#B3261E',
      50: '#DC2626', // Main brand
      60: '#E46962',
      70: '#EC928E',
      80: '#F2B8B5',
      90: '#F9DEDC',
      95: '#FCEEEE',
      99: '#FFFBF9',
      100: '#FFFFFF',
    },
  },

  // Surface Colors (Material Design 3)
  surface: {
    dim: '#E6E0E9',
    bright: '#F4EFF4',
    containerLowest: '#FFFFFF',
    containerLow: '#F7F2FA',
    container: '#F3EDF7',
    containerHigh: '#ECE6F0',
    containerHighest: '#E6E0E9',
  },
};

/**
 * Material Design 3 Elevation System
 * Ogni livello ha shadow e surface tint appropriati
 */
export const MaterialElevation = {
  level0: {
    elevation: 0,
    shadowOpacity: 0,
    surfaceTint: 'transparent',
  },
  level1: {
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    surfaceTint: MaterialColors.primary[40],
    surfaceTintOpacity: 0.05,
  },
  level2: {
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    surfaceTint: MaterialColors.primary[40],
    surfaceTintOpacity: 0.08,
  },
  level3: {
    elevation: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    surfaceTint: MaterialColors.primary[40],
    surfaceTintOpacity: 0.11,
  },
  level4: {
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    surfaceTint: MaterialColors.primary[40],
    surfaceTintOpacity: 0.12,
  },
  level5: {
    elevation: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    surfaceTint: MaterialColors.primary[40],
    surfaceTintOpacity: 0.14,
  },
};

/**
 * Material Motion - Easing curves specifiche
 */
export const MaterialMotion = {
  easing: {
    standard: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    emphasized: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
  },
  duration: {
    short1: 50,
    short2: 100,
    short3: 150,
    short4: 200,
    medium1: 250,
    medium2: 300,
    medium3: 350,
    medium4: 400,
    long1: 450,
    long2: 500,
    long3: 550,
    long4: 600,
  },
  // Configurazioni specifiche per Android
  android: {
    ripple: {
      duration: 600,
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    },
    stateLayer: {
      duration: 100,
      easing: 'linear',
    },
    focus: {
      duration: 300,
      easing: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
    },
  },
};

/**
 * Material Typography Scale
 */
export const MaterialTypography = {
  // Display styles
  displayLarge: {
    fontFamily: 'Roboto',
    fontSize: 57,
    lineHeight: 64,
    letterSpacing: -0.25,
    fontWeight: '400',
  },
  displayMedium: {
    fontFamily: 'Roboto',
    fontSize: 45,
    lineHeight: 52,
    letterSpacing: 0,
    fontWeight: '400',
  },
  displaySmall: {
    fontFamily: 'Roboto',
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: 0,
    fontWeight: '400',
  },

  // Headline styles
  headlineLarge: {
    fontFamily: 'Roboto',
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: 0,
    fontWeight: '400',
  },
  headlineMedium: {
    fontFamily: 'Roboto',
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0,
    fontWeight: '400',
  },
  headlineSmall: {
    fontFamily: 'Roboto',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
    fontWeight: '400',
  },

  // Title styles
  titleLarge: {
    fontFamily: 'Roboto',
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
    fontWeight: '400',
  },
  titleMedium: {
    fontFamily: 'Roboto Medium',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    fontWeight: '500',
  },
  titleSmall: {
    fontFamily: 'Roboto Medium',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontWeight: '500',
  },

  // Label styles
  labelLarge: {
    fontFamily: 'Roboto Medium',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontWeight: '500',
  },
  labelMedium: {
    fontFamily: 'Roboto Medium',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  labelSmall: {
    fontFamily: 'Roboto Medium',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
    fontWeight: '500',
  },

  // Body styles
  bodyLarge: {
    fontFamily: 'Roboto',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    fontWeight: '400',
  },
  bodyMedium: {
    fontFamily: 'Roboto',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    fontWeight: '400',
  },
  bodySmall: {
    fontFamily: 'Roboto',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    fontWeight: '400',
  },
};

/**
 * Material Shape System
 */
export const MaterialShape = {
  corner: {
    none: 0,
    extraSmall: 4,
    small: 8,
    medium: 12,
    large: 16,
    extraLarge: 28,
    full: 9999,
  },
  // Forme specifiche per componenti
  components: {
    button: 20, // Rounded rectangle
    card: 12,
    dialog: 28,
    fab: 16,
    navigationBar: 0,
    snackbar: 4,
    textField: 4,
  },
};

/**
 * Material Ripple Effects per Android
 */
export const MaterialRipple = {
  primary: `rgba(${MaterialColors.brand.primary}, 0.24)`,
  onPrimary: 'rgba(255, 255, 255, 0.24)',
  secondary: `rgba(${MaterialColors.secondary[40]}, 0.24)`,
  onSecondary: 'rgba(255, 255, 255, 0.24)',
  surface: 'rgba(103, 80, 164, 0.12)',
  onSurface: 'rgba(28, 27, 31, 0.12)',
  error: `rgba(${MaterialColors.error[40]}, 0.24)`,
  onError: 'rgba(255, 255, 255, 0.24)',

  // Intensità diverse
  light: 'rgba(103, 80, 164, 0.08)',
  medium: 'rgba(103, 80, 164, 0.12)',
  strong: 'rgba(103, 80, 164, 0.16)',
};

/**
 * Utility per Android-only features
 */
export const getAndroidMaterialProps = (
  level: keyof typeof MaterialElevation = 'level2'
) => {
  if (Platform.OS !== 'android') return {};

  const elevationData = MaterialElevation[level];

  // Level0 non ha shadow properties
  if (level === 'level0') {
    return {
      elevation: elevationData.elevation,
    };
  }

  // Altri livelli hanno shadow properties
  const shadowData = elevationData as typeof MaterialElevation.level1;

  return {
    elevation: shadowData.elevation,
    shadowColor: shadowData.shadowColor,
    shadowOffset: shadowData.shadowOffset,
    shadowOpacity: shadowData.shadowOpacity,
    shadowRadius: shadowData.shadowRadius,
  };
};

/**
 * Component presets ottimizzati per Android
 */
export const MaterialComponents = {
  // Floating Action Button
  fab: {
    container: {
      borderRadius: MaterialShape.components.fab,
      ...getAndroidMaterialProps('level3'),
    },
    // FAB variants
    surface: {
      backgroundColor: MaterialColors.surface.containerHigh,
      ...getAndroidMaterialProps('level1'),
    },
    primary: {
      backgroundColor: MaterialColors.brand.primary,
      ...getAndroidMaterialProps('level3'),
    },
    secondary: {
      backgroundColor: MaterialColors.secondary[90],
      ...getAndroidMaterialProps('level3'),
    },
    tertiary: {
      backgroundColor: MaterialColors.tertiary[90],
      ...getAndroidMaterialProps('level3'),
    },
  },

  // Cards
  card: {
    elevated: {
      borderRadius: MaterialShape.components.card,
      backgroundColor: MaterialColors.surface.containerLow,
      ...getAndroidMaterialProps('level1'),
    },
    filled: {
      borderRadius: MaterialShape.components.card,
      backgroundColor: MaterialColors.surface.containerLowest,
    },
    outlined: {
      borderRadius: MaterialShape.components.card,
      backgroundColor: MaterialColors.surface.containerLowest,
      borderWidth: 1,
      borderColor: MaterialColors.neutral[20],
    },
  },

  // Buttons
  button: {
    elevated: {
      borderRadius: MaterialShape.components.button,
      backgroundColor: MaterialColors.surface.containerLow,
      ...getAndroidMaterialProps('level1'),
    },
    filled: {
      borderRadius: MaterialShape.components.button,
      backgroundColor: MaterialColors.brand.primary,
    },
    tonal: {
      borderRadius: MaterialShape.components.button,
      backgroundColor: MaterialColors.secondary[90],
    },
    outlined: {
      borderRadius: MaterialShape.components.button,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: MaterialColors.neutral[20],
    },
  },
};

// Export tutto per uso semplificato
export {
  MaterialColors as Colors,
  MaterialElevation as Elevation,
  MaterialMotion as Motion,
  MaterialTypography as Typography,
  MaterialShape as Shape,
  MaterialRipple as Ripple,
  MaterialComponents as Components,
};
