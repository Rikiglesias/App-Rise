/**
 * RESPONSIVE THEME - SORGENTE UNICA DI VERITÀ
 *
 * Unifica colori, spacing, breakpoints per eliminare frammentazione
 * Preparato per dark mode, RTL, re-branding con una sola edit
 */

import { Colors } from './designTokens';
import { SpacingTokens, DeviceBreakpoints } from './responsiveSystem';
// Centralizziamo i breakpoints in responsiveSystem.ts per evitare duplicazioni
export { DeviceBreakpoints as ResponsiveBreakpoints } from './responsiveSystem';

// =================================================================
// COLORI CENTRALIZZATI CON DARK MODE
// =================================================================

export const ResponsiveColors = {
  // Background colors
  background: {
    primary: { light: '#FFFFFF', dark: '#0C0C0E' },
    secondary: { light: '#F8F8F8', dark: '#1C1C1E' },
    tertiary: { light: '#F0F0F0', dark: '#2C2C2E' },
  },

  // Text colors
  text: {
    primary: { light: '#1E1E1E', dark: '#F5F5F5' },
    secondary: { light: '#6B7280', dark: '#A1A1AA' },
    tertiary: { light: '#9CA3AF', dark: '#71717A' },
  },

  // Brand colors (immutabili)
  brand: {
    primary: '#DC2626',
    secondary: '#059669',
    accent: '#6B7280',
  },

  // Surface colors (cards, modals)
  surface: {
    elevated: { light: '#FFFFFF', dark: '#1C1C1E' },
    card: { light: '#FFFFFF', dark: '#2C2C2E' },
    modal: { light: '#FFFFFF', dark: '#1C1C1E' },
  },

  // Border colors
  border: {
    primary: { light: '#E5E7EB', dark: '#374151' },
    secondary: { light: '#F3F4F6', dark: '#4B5563' },
    accent: { light: '#DC2626', dark: '#EF4444' },
  },

  // Utilizza colori esistenti come fallback
  fallback: Colors,
} as const;

// =================================================================
// SPACING CENTRALIZZATO
// =================================================================

export const ResponsiveSpacing = {
  // Container spacing
  container: {
    compact: SpacingTokens[4], // 16
    standard: SpacingTokens[5], // 20
    large: SpacingTokens[6], // 24
    xlarge: SpacingTokens[8], // 32
    xxlarge: SpacingTokens[10], // 40
    // Tier aggiuntivi di layout (non breakpoints canonici)
    tabletXL: SpacingTokens[12], // 48
    desktop: SpacingTokens[12], // 48
    desktopXL: SpacingTokens[16], // 64
  },

  // Card spacing
  card: {
    compact: SpacingTokens[3], // 12
    standard: SpacingTokens[4], // 16
    large: SpacingTokens[5], // 20
    xlarge: SpacingTokens[6], // 24
    xxlarge: SpacingTokens[8], // 32
    tabletXL: SpacingTokens[10], // 40
    desktop: SpacingTokens[10], // 40
    desktopXL: SpacingTokens[12], // 48
  },

  // Section spacing
  section: {
    compact: SpacingTokens[5], // 20
    standard: SpacingTokens[6], // 24
    large: SpacingTokens[8], // 32
    xlarge: SpacingTokens[10], // 40
    xxlarge: SpacingTokens[12], // 48
    tabletXL: SpacingTokens[16], // 64
    desktop: SpacingTokens[16], // 64
    desktopXL: SpacingTokens[20], // 80
  },

  // Modal spacing
  modal: {
    compact: SpacingTokens[4], // 16
    standard: SpacingTokens[5], // 20
    large: SpacingTokens[6], // 24
    xlarge: SpacingTokens[8], // 32
    xxlarge: SpacingTokens[10], // 40
    tabletXL: SpacingTokens[12], // 48
    desktop: SpacingTokens[12], // 48
    desktopXL: SpacingTokens[16], // 64
  },
} as const;

// =================================================================
// LAYOUT CENTRALIZZATO
// =================================================================

export const ResponsiveLayout = {
  // Card widths
  cardWidth: {
    compact: '100%',
    standard: '47.5%',
    large: '47.5%',
    xlarge: '31%',
    xxlarge: '23%',
    tabletXL: '20%',
    desktop: '20%',
    desktopXL: '18%',
  },

  // Container widths
  containerWidth: {
    compact: '95%',
    standard: '90%',
    large: '85%',
    xlarge: '80%',
    xxlarge: '75%',
    tabletXL: '70%',
    desktop: '70%',
    desktopXL: '65%',
  },

  // Modal widths
  modalWidth: {
    compact: '95%',
    standard: '90%',
    large: '85%',
    xlarge: '70%',
    xxlarge: '60%',
    tabletXL: '50%',
    desktop: '50%',
    desktopXL: '40%',
  },

  // Progress bar widths
  progressWidth: {
    compact: '100%',
    standard: '90%',
    large: '80%',
    xlarge: '70%',
    xxlarge: '60%',
    tabletXL: '50%',
    desktop: '50%',
    desktopXL: '40%',
  },

  // Divider widths
  dividerWidth: {
    compact: '90%',
    standard: '80%',
    large: '70%',
    xlarge: '60%',
    xxlarge: '50%',
    tabletXL: '40%',
    desktop: '40%',
    desktopXL: '30%',
  },
} as const;

// =================================================================
// TEMA COMPOSITO
// =================================================================

export const ResponsiveTheme = {
  breakpoints: DeviceBreakpoints, // single source of truth
  colors: ResponsiveColors,
  spacing: ResponsiveSpacing,
  layout: ResponsiveLayout,

  // Shorthand
  bp: DeviceBreakpoints,
  c: ResponsiveColors,
  s: ResponsiveSpacing,
  l: ResponsiveLayout,
} as const;

// =================================================================
// UTILITIES
// =================================================================

export type ResponsiveBreakpoint = keyof typeof DeviceBreakpoints;
export type ResponsiveColorMode = 'light' | 'dark';
export type ResponsiveColorKey = keyof typeof ResponsiveColors;
export type ResponsiveSpacingKey = keyof typeof ResponsiveSpacing;
export type ResponsiveLayoutKey = keyof typeof ResponsiveLayout;

export const getResponsiveColor = (
  colorKey: keyof typeof ResponsiveColors,
  property: string,
  mode: ResponsiveColorMode = 'light'
): string => {
  const colorGroup = ResponsiveColors[colorKey] as Record<
    string,
    Record<string, string>
  >;
  const colorValue = colorGroup?.[property]?.[mode] as string | undefined;

  if (colorValue) {
    return colorValue;
  }

  const fallbackColor = (Colors as Record<string, unknown>)?.[property];

  if (typeof fallbackColor === 'string') {
    return fallbackColor;
  }

  if (typeof fallbackColor === 'object' && fallbackColor !== null) {
    return (fallbackColor as Record<string, string>)?.[500] ?? '#000000';
  }

  return '#000000';
};

export const getResponsiveSpacing = (
  spacingKey: keyof typeof ResponsiveSpacing,
  breakpoint: ResponsiveBreakpoint
): number => {
  const spacingGroup = ResponsiveSpacing[spacingKey] as Record<string, number>;
  // supporta solo i 5 breakpoints canonici; fallback su standard per tier extra
  const value = spacingGroup[breakpoint] ?? spacingGroup.standard;
  return value as number;
};

export const getResponsiveLayout = (
  layoutKey: keyof typeof ResponsiveLayout,
  breakpoint: ResponsiveBreakpoint
): string => {
  const layoutGroup = ResponsiveLayout[layoutKey] as Record<string, string>;
  // supporta solo i 5 breakpoints canonici; fallback su standard per tier extra
  const value = layoutGroup[breakpoint] ?? layoutGroup.standard;
  return value as string;
};
