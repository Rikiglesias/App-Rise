// ===================================================================
// SISTEMA RESPONSIVE UNIVERSALE - TUTTI I DISPOSITIVI 2025
// Supporto completo per iPhone + Android + Tablet + Desktop
// ===================================================================

import { Dimensions } from 'react-native';

// ===================================================================
// BREAKPOINT UNIVERSALI - TUTTE LE DIMENSIONI REALI 2025
// Basato su viewport CSS (logical pixels) di tutti i dispositivi popolari
// ===================================================================
export const UniversalBreakpoints = {
  // EXTRA SMALL - Dispositivi molto piccoli
  xs: 320, // iPhone SE 1st gen, Android entry-level

  // SMALL - Dispositivi compatti
  sm: 360, // Galaxy S24/S23/S22, Android standard, iPhone SE 2nd/3rd

  // MEDIUM SMALL - iPhone standard + alcuni Android
  md: 375, // iPhone mini, iPhone SE 2nd/3rd, alcuni Android

  // MEDIUM - iPhone moderni + Android mid-range
  lg: 390, // iPhone 14/13/12, Android mid-range

  // MEDIUM LARGE - iPhone 15/16 + Android premium
  xl: 393, // iPhone 15/16, Pixel 5/4, Android premium

  // LARGE - iPhone 16 Pro + Android large
  '2xl': 402, // iPhone 16 Pro

  // EXTRA LARGE - Android premium + iPhone large
  '3xl': 412, // Pixel 8/7/6, OnePlus, Samsung Note, iPhone 11/XR

  // XXL - iPhone Pro Max + Android XL
  '4xl': 428, // iPhone 13/12 Pro Max

  // XXXL - iPhone Pro Max moderni
  '5xl': 430, // iPhone 15/14 Pro Max + Plus

  // HUGE - iPhone 16 Pro Max
  '6xl': 440, // iPhone 16 Pro Max

  // PREMIUM ANDROID - Pixel Pro + Samsung Ultra
  '7xl': 448, // Pixel 8 Pro, dispositivi Android premium

  // TABLET SMALL - Tablet compatti
  tablet: 600, // Tablet 7-8"

  // TABLET LARGE - Tablet standard
  'tablet-lg': 768, // iPad, tablet Android 10"+

  // DESKTOP - Computer
  desktop: 1024, // Desktop, laptop
};

// ===================================================================
// DEVICE CATEGORIES UNIVERSALI - iOS + ANDROID
// ===================================================================
export const UniversalDeviceCategories = {
  // 320-359px: iPhone SE 1st gen, Android entry-level
  extraSmall: {
    min: 0,
    max: UniversalBreakpoints.xs + 39,
    devices: ['iPhone SE 1st gen', 'Android entry-level', 'Dispositivi budget'],
  },

  // 360-374px: Galaxy S24/S23/S22, Android standard
  small: {
    min: UniversalBreakpoints.sm,
    max: UniversalBreakpoints.md - 1,
    devices: ['Galaxy S24/S23/S22', 'Android standard', 'Xiaomi Redmi'],
  },

  // 375-389px: iPhone SE 2nd/3rd, iPhone mini, alcuni Android
  mediumSmall: {
    min: UniversalBreakpoints.md,
    max: UniversalBreakpoints.lg - 1,
    devices: ['iPhone SE 2nd/3rd', 'iPhone 13/12 mini', 'Android mid-range'],
  },

  // 390-401px: iPhone 14/13/12, Android mid-range
  medium: {
    min: UniversalBreakpoints.lg,
    max: UniversalBreakpoints['2xl'] - 1,
    devices: ['iPhone 14/13/12', 'iPhone 13/12 Pro', 'Android mid-range'],
  },

  // 402-411px: iPhone 16 Pro, Pixel 5/4, Android premium
  mediumLarge: {
    min: UniversalBreakpoints['2xl'],
    max: UniversalBreakpoints['3xl'] - 1,
    devices: ['iPhone 16 Pro', 'iPhone 15/16', 'Pixel 5/4', 'Android premium'],
  },

  // 412-427px: Pixel 8/7/6, OnePlus, iPhone 11/XR, Samsung Note
  large: {
    min: UniversalBreakpoints['3xl'],
    max: UniversalBreakpoints['4xl'] - 1,
    devices: ['Pixel 8/7/6', 'OnePlus', 'iPhone 11/XR', 'Samsung Note'],
  },

  // 428-439px: iPhone 13/12 Pro Max
  extraLarge: {
    min: UniversalBreakpoints['4xl'],
    max: UniversalBreakpoints['5xl'] - 1,
    devices: ['iPhone 13/12 Pro Max'],
  },

  // 440-447px: iPhone 15/14 Pro Max + Plus
  huge: {
    min: UniversalBreakpoints['5xl'],
    max: UniversalBreakpoints['7xl'] - 1,
    devices: ['iPhone 16 Pro Max', 'iPhone 15/14 Pro Max', 'iPhone Plus'],
  },

  // 448-599px: Pixel Pro, Samsung Ultra, Android XL
  premium: {
    min: UniversalBreakpoints['7xl'],
    max: UniversalBreakpoints.tablet - 1,
    devices: [
      'Pixel 8 Pro',
      'Galaxy S24 Ultra',
      'Android flagship',
      'Foldable esterni',
    ],
  },

  // 600-767px: Tablet piccoli
  tabletSmall: {
    min: UniversalBreakpoints.tablet,
    max: UniversalBreakpoints['tablet-lg'] - 1,
    devices: ['Tablet 7-8"', 'iPad mini', 'Android tablet compatti'],
  },

  // 768-1023px: Tablet standard
  tablet: {
    min: UniversalBreakpoints['tablet-lg'],
    max: UniversalBreakpoints.desktop - 1,
    devices: ['iPad standard', 'Android tablet 10"+', 'Foldable aperti'],
  },

  // 1024px+: Desktop
  desktop: {
    min: UniversalBreakpoints.desktop,
    max: Infinity,
    devices: ['Desktop', 'Laptop', 'Monitor esterni'],
  },
} as const;

// ===================================================================
// RESPONSIVE SPACING SYSTEM - UNIVERSALE
// ===================================================================
export const UniversalResponsiveSpacing = {
  // Moltiplicatori OTTIMIZZATI PER OGNI DISPOSITIVO - RIDOTTI PER EVITARE ZOOM
  multipliers: {
    extraSmall: 1.0, // iPhone SE 1st - baseline
    small: 1.0, // Galaxy S24, Android standard - baseline
    mediumSmall: 1.0, // iPhone SE 2nd/3rd, mini - baseline
    medium: 1.0, // iPhone 14/13/12 - baseline perfetto
    mediumLarge: 1.0, // iPhone 16 Pro - baseline
    large: 0.85, // iPhone 11/XR - RIDOTTO per evitare effetto zoom
    extraLarge: 1.0, // iPhone Pro Max - baseline
    huge: 1.0, // iPhone 16 Pro Max - baseline
    premium: 1.0, // Pixel Pro, Galaxy Ultra - baseline
    tabletSmall: 1.05, // Tablet piccoli - incremento RIDOTTO per evitare zoom
    tablet: 1.1, // Tablet standard - incremento RIDOTTO per evitare zoom
    desktop: 1.15, // Desktop - incremento RIDOTTO per evitare zoom
  },

  getSpacing: (baseSpacing: number, screenWidth: number): number => {
    const category = getUniversalDeviceCategory(screenWidth);
    const multiplier = UniversalResponsiveSpacing.multipliers[category];
    return Math.round(baseSpacing * multiplier);
  },
};

// ===================================================================
// RESPONSIVE TYPOGRAPHY SYSTEM - UNIVERSALE
// ===================================================================
export const UniversalResponsiveTypography = {
  // Moltiplicatori font OTTIMIZZATI PER OGNI DISPOSITIVO - RIDOTTI PER EVITARE ZOOM
  fontSizeMultipliers: {
    extraSmall: 1.0, // iPhone SE 1st - baseline
    small: 1.0, // Galaxy S24, Android standard - baseline
    mediumSmall: 1.0, // iPhone SE 2nd/3rd, mini - baseline
    medium: 1.0, // iPhone 14/13/12 - baseline perfetto
    mediumLarge: 1.0, // iPhone 16 Pro, iPhone 15 - baseline
    large: 0.85, // iPhone 11/XR - RIDOTTO per evitare effetto zoom
    extraLarge: 1.0, // iPhone Pro Max - baseline
    huge: 1.0, // iPhone 16 Pro Max - baseline
    premium: 1.0, // Pixel Pro, Galaxy Ultra - baseline
    tabletSmall: 1.05, // Tablet piccoli - scaling RIDOTTO per evitare zoom
    tablet: 1.1, // Tablet standard - scaling RIDOTTO per evitare zoom
    desktop: 1.15, // Desktop - scaling RIDOTTO per evitare zoom
  },

  getFontSize: (baseFontSize: number, screenWidth: number): number => {
    const category = getUniversalDeviceCategory(screenWidth);
    const multiplier =
      UniversalResponsiveTypography.fontSizeMultipliers[category];
    return Math.round(baseFontSize * multiplier);
  },
};

// ===================================================================
// RESPONSIVE LAYOUT CONFIGURATIONS - UNIVERSALE
// ===================================================================
export const UniversalResponsiveLayouts = {
  // Configurazioni UNIFORMI - STESSA ESPERIENZA SU TUTTI I MOBILE
  actionCards: {
    extraSmall: { columns: 2, cardWidth: '47%', gap: 12 }, // iPhone SE 1st - layout standard mobile
    small: { columns: 2, cardWidth: '47%', gap: 12 }, // Galaxy S24 - layout standard mobile
    mediumSmall: { columns: 2, cardWidth: '47%', gap: 12 }, // iPhone SE 2nd/3rd - layout standard mobile
    medium: { columns: 2, cardWidth: '47%', gap: 12 }, // iPhone 14/13/12 - baseline mobile
    mediumLarge: { columns: 2, cardWidth: '47%', gap: 12 }, // iPhone 16 Pro - identico mobile
    large: { columns: 2, cardWidth: '47%', gap: 12 }, // iPhone 11/XR - identico mobile
    extraLarge: { columns: 2, cardWidth: '47%', gap: 12 }, // iPhone Pro Max - identico mobile
    huge: { columns: 2, cardWidth: '47%', gap: 12 }, // iPhone 16 Pro Max - identico mobile
    premium: { columns: 2, cardWidth: '47%', gap: 12 }, // Pixel Pro, Galaxy Ultra - identico mobile
    tabletSmall: { columns: 3, cardWidth: '31%', gap: 16 }, // Tablet piccoli - 3 colonne
    tablet: { columns: 3, cardWidth: '30%', gap: 20 }, // Tablet standard - 3 colonne spaziose
    desktop: { columns: 4, cardWidth: '23%', gap: 20 }, // Desktop - 4 colonne
  },

  // Configurazioni padding UNIFORMI per mobile
  sectionPadding: {
    extraSmall: { horizontal: 16, vertical: 20 }, // iPhone SE 1st - padding standard mobile
    small: { horizontal: 16, vertical: 20 }, // Galaxy S24 - padding standard mobile
    mediumSmall: { horizontal: 16, vertical: 20 }, // iPhone SE 2nd/3rd - padding standard mobile
    medium: { horizontal: 16, vertical: 20 }, // iPhone 14/13/12 - baseline mobile
    mediumLarge: { horizontal: 16, vertical: 20 }, // iPhone 16 Pro - identico mobile
    large: { horizontal: 16, vertical: 20 }, // iPhone 11/XR - identico mobile
    extraLarge: { horizontal: 16, vertical: 20 }, // iPhone Pro Max - identico mobile
    huge: { horizontal: 16, vertical: 20 }, // iPhone 16 Pro Max - identico mobile
    premium: { horizontal: 16, vertical: 20 }, // Pixel Pro, Galaxy Ultra - identico mobile
    tabletSmall: { horizontal: 28, vertical: 32 }, // Tablet piccoli - ampio
    tablet: { horizontal: 32, vertical: 36 }, // Tablet standard - molto ampio
    desktop: { horizontal: 40, vertical: 44 }, // Desktop - massimo
  },
};

// ===================================================================
// UTILITY FUNCTIONS UNIVERSALI
// ===================================================================

/**
 * Ottiene la categoria dispositivo basata sulla larghezza schermo
 */
export const getUniversalDeviceCategory = (
  screenWidth: number
): keyof typeof UniversalDeviceCategories => {
  for (const [category, range] of Object.entries(UniversalDeviceCategories)) {
    if (screenWidth >= range.min && screenWidth <= range.max) {
      return category as keyof typeof UniversalDeviceCategories;
    }
  }
  return 'medium'; // fallback
};

/**
 * Verifica se il dispositivo è di una dimensione specifica o maggiore
 */
export const isUniversalMinWidth = (
  screenWidth: number,
  breakpoint: keyof typeof UniversalBreakpoints
): boolean => {
  return screenWidth >= UniversalBreakpoints[breakpoint];
};

/**
 * Verifica se il dispositivo è in un range di dimensioni
 */
export const isUniversalBetweenWidths = (
  screenWidth: number,
  minBreakpoint: keyof typeof UniversalBreakpoints,
  maxBreakpoint: keyof typeof UniversalBreakpoints
): boolean => {
  return (
    screenWidth >= UniversalBreakpoints[minBreakpoint] &&
    screenWidth < UniversalBreakpoints[maxBreakpoint]
  );
};

/**
 * Ottiene la configurazione layout per lo schermo corrente
 */
export const getUniversalLayoutConfig = (
  screenWidth: number,
  layoutType: keyof typeof UniversalResponsiveLayouts = 'actionCards'
) => {
  const category = getUniversalDeviceCategory(screenWidth);
  return UniversalResponsiveLayouts[layoutType][category];
};

/**
 * Ottiene spacing adattivo per lo schermo corrente
 */
export const getUniversalAdaptiveSpacing = (
  baseSpacing: number,
  screenWidth: number
): number => {
  return UniversalResponsiveSpacing.getSpacing(baseSpacing, screenWidth);
};

/**
 * Ottiene font size adattivo per lo schermo corrente
 */
export const getUniversalAdaptiveFontSize = (
  baseFontSize: number,
  screenWidth: number
): number => {
  const category = getUniversalDeviceCategory(screenWidth);
  const multiplier =
    UniversalResponsiveTypography.fontSizeMultipliers[category];
  return Math.round(baseFontSize * multiplier);
};

// ===================================================================
// CURRENT DEVICE INFO UNIVERSALE
// ===================================================================

// Funzione lazy per ottenere le dimensioni (compatibile con i test)
const getCurrentDeviceInfo = () => {
  try {
    const { width: screenWidth } = Dimensions.get('window');
    return {
      width: screenWidth,
      category: getUniversalDeviceCategory(screenWidth),
      breakpoint:
        Object.entries(UniversalBreakpoints)
          .reverse()
          .find(([, value]) => screenWidth >= value)?.[0] ?? 'xs',
      isSmallDevice: screenWidth < UniversalBreakpoints.lg,
      isMediumDevice:
        screenWidth >= UniversalBreakpoints.lg &&
        screenWidth < UniversalBreakpoints['3xl'],
      isLargeDevice: screenWidth >= UniversalBreakpoints['3xl'],
      isTablet: screenWidth >= UniversalBreakpoints.tablet,
      isDesktop: screenWidth >= UniversalBreakpoints.desktop,
      deviceInfo:
        UniversalDeviceCategories[getUniversalDeviceCategory(screenWidth)],
    };
  } catch {
    // Fallback per test environment
    return {
      width: 390,
      category: 'medium' as keyof typeof UniversalDeviceCategories,
      breakpoint: 'lg',
      isSmallDevice: false,
      isMediumDevice: true,
      isLargeDevice: false,
      isTablet: false,
      isDesktop: false,
      deviceInfo: UniversalDeviceCategories.medium,
    };
  }
};

export const UniversalCurrentDevice = getCurrentDeviceInfo();

// ===================================================================
// COMPATIBILITY LAYER - Mantiene API precedente
// ===================================================================

// Re-export delle API precedenti per compatibilità
export const iPhoneBreakpoints = UniversalBreakpoints;
export const DeviceCategories = UniversalDeviceCategories;
export const ResponsiveSpacing = UniversalResponsiveSpacing;
export const ResponsiveTypography = UniversalResponsiveTypography;
export const ResponsiveLayouts = UniversalResponsiveLayouts;
export const CurrentDevice = UniversalCurrentDevice;
export const getDeviceCategory = getUniversalDeviceCategory;
export const isMinWidth = isUniversalMinWidth;
export const isBetweenWidths = isUniversalBetweenWidths;
export const getLayoutConfig = getUniversalLayoutConfig;
export const getAdaptiveSpacing = getUniversalAdaptiveSpacing;
export const getAdaptiveFontSize = getUniversalAdaptiveFontSize;

// ===================================================================
// EXPORT EVERYTHING
// ===================================================================
export {
  UniversalBreakpoints as Breakpoints,
  UniversalDeviceCategories as Categories,
  UniversalResponsiveSpacing as Spacing,
  UniversalResponsiveTypography as Typography,
  UniversalResponsiveLayouts as Layouts,
};

export default {
  Breakpoints: UniversalBreakpoints,
  Categories: UniversalDeviceCategories,
  CurrentDevice: UniversalCurrentDevice,
  getDeviceCategory: getUniversalDeviceCategory,
  isMinWidth: isUniversalMinWidth,
  isBetweenWidths: isUniversalBetweenWidths,
  getLayoutConfig: getUniversalLayoutConfig,
  getAdaptiveSpacing: getUniversalAdaptiveSpacing,
  getAdaptiveFontSize: getUniversalAdaptiveFontSize,

  // Informazioni sui dispositivi supportati
  supportedDevices: {
    iPhone: [
      'iPhone SE 1st/2nd/3rd gen',
      'iPhone 12/13/14/15/16 (tutte le varianti)',
      'iPhone mini, Pro, Pro Max, Plus',
      'iPhone 11, XR, X, XS series',
    ],
    Android: [
      'Samsung Galaxy S24/S23/S22 series',
      'Google Pixel 8/7/6/5/4 series',
      'OnePlus (tutti i modelli recenti)',
      'Xiaomi Redmi e Mi series',
      'Samsung Galaxy Note series',
      'Samsung Galaxy Ultra series',
    ],
    Tablet: [
      'iPad (tutte le dimensioni)',
      'Android tablet 7-10"+',
      'Dispositivi foldable aperti',
    ],
    Desktop: ['Computer desktop', 'Laptop e notebook', 'Monitor esterni'],
  },
};
