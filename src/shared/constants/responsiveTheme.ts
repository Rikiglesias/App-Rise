/**
 * RESPONSIVE THEME - SORGENTE UNICA DI VERITÀ
 *
 * Unifica colori, spacing, breakpoints per eliminare frammentazione
 * Preparato per dark mode, RTL, re-branding con una sola edit
 */

import { Colors } from './designTokens';
import { SpacingTokens } from './responsiveSystem';

// =================================================================
// BREAKPOINTS CENTRALIZZATI
// =================================================================

export const ResponsiveBreakpoints = {
  compact: 0,
  standard: 376,
  large: 415,
  xlarge: 481,
  xxlarge: 601,
  // 🚀 TABLET XL: Una riga aggiunta - TUTTI i componenti supportano automaticamente
  tabletXL: 1280,

  // Per future estensioni (desktop)
  desktop: 1024,
  desktopXL: 1440,
} as const;

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
// LAYOUT PERCENTUALI CENTRALIZZATE
// =================================================================

export const ResponsiveLayout = {
  // Card widths (elimina hard-coding)
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

  // Progress bar widths (unifica esistenti)
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
// TEMA UNIFICATO
// =================================================================

export const ResponsiveTheme = {
  breakpoints: ResponsiveBreakpoints,
  colors: ResponsiveColors,
  spacing: ResponsiveSpacing,
  layout: ResponsiveLayout,

  // Shorthand per accesso rapido
  bp: ResponsiveBreakpoints,
  c: ResponsiveColors,
  s: ResponsiveSpacing,
  l: ResponsiveLayout,
} as const;

// =================================================================
// TYPES EXPORT
// =================================================================

export type ResponsiveBreakpoint = keyof typeof ResponsiveBreakpoints;
export type ResponsiveColorMode = 'light' | 'dark';
export type ResponsiveColorKey = keyof typeof ResponsiveColors;
export type ResponsiveSpacingKey = keyof typeof ResponsiveSpacing;
export type ResponsiveLayoutKey = keyof typeof ResponsiveLayout;

// =================================================================
// UTILITIES
// =================================================================

/**
 * Ottiene colore basato su modo (light/dark)
 */
export const getResponsiveColor = (
  colorKey: keyof typeof ResponsiveColors,
  property: string,
  mode: ResponsiveColorMode = 'light'
): string => {
  const colorGroup = ResponsiveColors[colorKey] as Record<string, unknown>;
  const colorProperty = colorGroup?.[property];

  if (
    typeof colorProperty === 'object' &&
    colorProperty !== null &&
    mode in colorProperty
  ) {
    const color = (colorProperty as Record<string, string>)[mode];
    return color ?? ResponsiveColors.fallback.primary[500];
  }

  if (typeof colorProperty === 'string') {
    return colorProperty;
  }

  // Fallback a colori esistenti
  return ResponsiveColors.fallback.primary[500];
};

/**
 * Ottiene spacing basato su breakpoint
 */
export const getResponsiveSpacing = (
  spacingKey: keyof typeof ResponsiveSpacing,
  breakpoint: ResponsiveBreakpoint
): number => {
  const spacingGroup = ResponsiveSpacing[spacingKey];
  return spacingGroup[breakpoint] || spacingGroup.standard;
};

/**
 * Ottiene layout width basato su breakpoint
 */
export const getResponsiveLayout = (
  layoutKey: keyof typeof ResponsiveLayout,
  breakpoint: ResponsiveBreakpoint
): string => {
  const layoutGroup = ResponsiveLayout[layoutKey];
  return layoutGroup[breakpoint] || layoutGroup.standard;
};
