// ===================================================================
// PREMIUM DESIGN SYSTEM - Rise Against Hunger Italia
// Enterprise-grade design tokens for $10,000 app store quality
// Enhanced for 2025 UI/UX Trends
// ===================================================================

// ======= BRAND COLORS - Enhanced for 2025 =======
export const Colors = {
  // Primary Brand Palette - Refined
  primary: {
    50: '#FEF2F2', // Ultra light - backgrounds
    100: '#FEE2E2', // Light - subtle accents
    200: '#FECACA', // Soft - disabled states
    300: '#FCA5A5', // Medium light - borders
    400: '#F87171', // Medium - hover states
    500: '#DC2626', // MAIN BRAND - primary actions
    600: '#B91C1C', // Dark - pressed states
    700: '#991B1B', // Darker - text on light
    800: '#7F1D1D', // Very dark - emphasis
    900: '#450A0A', // Deepest - high contrast
  },

  // DARK MODE SYSTEM - 2025 Trend Essential
  dark: {
    surface: {
      primary: '#0A0A0A', // Main dark background
      secondary: '#121212', // Card backgrounds
      tertiary: '#1E1E1E', // Elevated surfaces
      quaternary: '#2A2A2A', // Interactive elements
    },
    text: {
      primary: '#FFFFFF', // Main text
      secondary: '#E5E5E5', // Secondary text
      tertiary: '#A3A3A3', // Disabled text
      accent: '#FF6B6B', // Brand accent text
    },
    border: {
      primary: '#333333', // Main borders
      secondary: '#404040', // Subtle borders
      accent: '#DC2626', // Brand borders
    },
  },

  // GLASSMORPHISM COLORS - 2025 Trend
  glass: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.2)',
    heavy: 'rgba(255, 255, 255, 0.3)',
    darkLight: 'rgba(0, 0, 0, 0.1)',
    darkMedium: 'rgba(0, 0, 0, 0.2)',
    primaryGlass: 'rgba(220, 38, 38, 0.1)',
  },

  // FUTURISTIC COLORS - 2025 Trend
  neon: {
    electric: '#00FFFF', // Cyan neon
    plasma: '#FF00FF', // Magenta neon
    laser: '#00FF00', // Green neon
    energy: '#FFFF00', // Yellow neon
    pulse: '#FF4444', // Red neon
  },

  // Semantic Colors - Professional
  semantic: {
    success: {
      light: '#D1FAE5',
      main: '#10B981',
      dark: '#065F46',
      neon: '#00FF88',
    },
    warning: {
      light: '#FEF3C7',
      main: '#F59E0B',
      dark: '#92400E',
      neon: '#FFD700',
    },
    error: {
      light: '#FEE2E2',
      main: '#EF4444',
      dark: '#B91C1C',
      neon: '#FF4466',
    },
    info: {
      light: '#DBEAFE',
      main: '#3B82F6',
      dark: '#1E40AF',
      neon: '#00AAFF',
    },
  },

  // Neutral Palette - Sophisticated
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA', // App background
    100: '#F5F5F5', // Card backgrounds
    200: '#E5E5E5', // Borders light
    300: '#D4D4D4', // Borders
    400: '#A3A3A3', // Text disabled
    500: '#737373', // Text secondary
    600: '#525252', // Text primary
    700: '#404040', // Text emphasis
    800: '#262626', // Text high emphasis
    900: '#171717', // Text maximum
    950: '#0A0A0A', // Text absolute
  },

  // ENHANCED GRADIENT SYSTEM - 2025 Premium
  gradients: {
    primary: ['#DC2626', '#B91C1C'] as const,
    warmth: ['#FEF3C7', '#FDE68A'] as const,
    depth: ['#F9FAFB', '#F3F4F6'] as const,
    energy: ['#DC2626', '#EF4444', '#F87171'] as const,
    // NEW 2025 GRADIENTS
    neonPulse: ['#FF00FF', '#00FFFF', '#FFFF00'] as const,
    futureRed: ['#FF0040', '#FF4466', '#FF6B6B'] as const,
    darkGlass: ['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)'] as const,
    lightGlass: ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)'] as const,
    holographic: ['#FF00FF', '#00FFFF', '#FFFF00', '#FF00FF'] as const,
  },
};

// ======= SPACING SYSTEM =======
// Based on 8px grid system (4px for micro-adjustments)
export const Spacing = {
  0: 0,
  1: 4, // 4px - Micro spacing
  2: 8, // 8px - Base unit
  3: 12, // 12px - Small spacing
  4: 16, // 16px - Default spacing
  5: 20, // 20px - Medium spacing
  6: 24, // 24px - Large spacing
  8: 32, // 32px - XL spacing
  10: 40, // 40px - XXL spacing
  12: 48, // 48px - Section spacing
  16: 64, // 64px - Large sections
  20: 80, // 80px - Hero spacing
  24: 96, // 96px - Maximum spacing
};

// ======= BORDER RADIUS =======
export const BorderRadius = {
  none: 0,
  sm: 4, // Small elements
  md: 8, // Default cards
  lg: 12, // Large cards
  xl: 16, // Prominent elements
  '2xl': 20, // Hero elements
  '3xl': 24, // Maximum rounded
  full: 9999, // Circular
};

// ======= ENHANCED TYPOGRAPHY SYSTEM - 2025 Custom Fonts =======
export const Typography = {
  // CUSTOM FONT FAMILIES - 2025 Trend
  families: {
    heading: 'SFProDisplay-Heavy', // Custom bold for headings
    body: 'SFProText-Regular', // System for body
    accent: 'SFProDisplay-Black', // Ultra bold for CTAs
    mono: 'SFMono-Regular', // Monospace for tech elements
  },

  // Font Weights - Precise (React Native compatible)
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
    // NEW 2025 WEIGHTS
    ultralight: '100',
    thin: '200',
    heavy: '900', // Changed from '950' to '900' for RN compatibility
  } as const,

  // ENHANCED Font Scale - Mathematical (1.250 - Perfect Fourth)
  sizes: {
    xs: 12, // 12px - Legal text
    sm: 14, // 14px - Body small
    base: 16, // 16px - Body default
    lg: 18, // 18px - Body large
    xl: 20, // 20px - Subheadings
    '2xl': 24, // 24px - Headings
    '3xl': 30, // 30px - Page titles
    '4xl': 36, // 36px - Hero text
    '5xl': 48, // 48px - Display
    '6xl': 60, // 60px - Hero display
    // NEW 2025 SIZES
    '7xl': 72, // 72px - Ultra display
    '8xl': 96, // 96px - Massive hero
    '9xl': 128, // 128px - Statement text
  },

  // Line Heights - Optimized readability
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
    // NEW 2025 LINE HEIGHTS
    ultraTight: 1.1,
    extraLoose: 2.5,
  },

  // ENHANCED Letter Spacing - Professional refinement
  letterSpacing: {
    tighter: -0.05,
    tight: -0.025,
    normal: 0,
    wide: 0.025,
    wider: 0.05,
    widest: 0.1,
    // NEW 2025 SPACING
    ultraTight: -0.075,
    superWide: 0.15,
    extreme: 0.25,
  },
};

// ======= ENHANCED ELEVATION SYSTEM - 2025 =======
export const Shadows = {
  // Subtle elevation
  xs: {
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // Default card elevation
  sm: {
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  // Medium prominence
  md: {
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },

  // High prominence
  lg: {
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },

  // Maximum elevation
  xl: {
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 5,
  },

  // Brand colored shadows (premium touch)
  primary: {
    shadowColor: Colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },

  // NEW 2025 SHADOWS
  neon: {
    shadowColor: Colors.neon.electric,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },

  glow: {
    shadowColor: Colors.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },

  dramatic: {
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 20,
  },
};

// ======= GLASSMORPHISM SYSTEM - 2025 Trend =======
export const Glassmorphism = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(20px)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },

  medium: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(30px)',
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 12,
  },

  dark: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(25px)',
    shadowColor: 'rgba(255, 255, 255, 0.1)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },

  primary: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
    backdropFilter: 'blur(25px)',
    shadowColor: 'rgba(220, 38, 38, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
};

// ======= ADVANCED ANIMATION SYSTEM - 2025 =======
export const Animation = {
  // Duration tokens
  duration: {
    instant: 0,
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
    // NEW 2025 DURATIONS
    ultraFast: 100,
    gentle: 400,
    dramatic: 750,
    cinematic: 1000,
  },

  // ENHANCED Easing curves - Professional motion
  easing: {
    linear: 'linear',
    easeOut: [0.25, 0.46, 0.45, 0.94], // Natural deceleration
    easeIn: [0.55, 0.085, 0.68, 0.53], // Natural acceleration
    easeInOut: [0.645, 0.045, 0.355, 1], // Smooth transition
    bounce: [0.68, -0.6, 0.32, 1.6], // Playful bounce
    // NEW 2025 EASING
    elastic: [0.68, -0.55, 0.265, 1.55],
    dramatic: [0.25, 0.46, 0.45, 0.94],
    snappy: [0.4, 0.0, 0.2, 1],
    gentle: [0.25, 0.46, 0.45, 0.94],
  },

  // MICROINTERACTION PRESETS - 2025 Trend
  microInteractions: {
    buttonPress: {
      scale: 0.95,
      duration: 100,
      easing: 'snappy',
    },
    cardHover: {
      translateY: -2,
      scale: 1.02,
      duration: 200,
      easing: 'gentle',
    },
    iconBounce: {
      scale: [1, 1.2, 1],
      duration: 300,
      easing: 'bounce',
    },
    slideIn: {
      translateX: [-50, 0],
      opacity: [0, 1],
      duration: 400,
      easing: 'easeOut',
    },
  },

  // Spring configurations
  spring: {
    gentle: { tension: 120, friction: 14 },
    standard: { tension: 170, friction: 26 },
    snappy: { tension: 400, friction: 30 },
    // NEW 2025 SPRINGS
    playful: { tension: 300, friction: 10 },
    dramatic: { tension: 500, friction: 40 },
    smooth: { tension: 100, friction: 20 },
  },
};

// ======= GAMIFICATION SYSTEM - 2025 Trend =======
export const Gamification = {
  colors: {
    achievement: Colors.semantic.success.neon,
    progress: Colors.neon.electric,
    streak: Colors.neon.energy,
    milestone: Colors.primary[500],
    bonus: Colors.neon.plasma,
  },

  rewards: {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
    diamond: '#B9F2FF',
  },

  animations: {
    levelUp: {
      scale: [1, 1.3, 1],
      rotate: [0, 360],
      duration: 600,
    },
    achievement: {
      scale: [0, 1.2, 1],
      opacity: [0, 1, 1],
      duration: 500,
    },
    progress: {
      width: ['0%', '100%'],
      duration: 800,
    },
  },
};

// ======= ENHANCED COMPONENT PRESETS - 2025 =======
export const ComponentStyles = {
  // GLASSMORPHISM CARDS - 2025 Trend
  card: {
    base: {
      backgroundColor: Colors.neutral[0],
      borderRadius: BorderRadius.lg,
      padding: Spacing[6],
      borderWidth: 1,
      borderColor: Colors.neutral[200],
      ...Shadows.sm,
    },
    glass: {
      ...Glassmorphism.light,
      borderRadius: BorderRadius.xl,
      padding: Spacing[6],
    },
    glassHero: {
      ...Glassmorphism.medium,
      borderRadius: BorderRadius['2xl'],
      padding: Spacing[8],
    },
    darkGlass: {
      ...Glassmorphism.dark,
      borderRadius: BorderRadius.xl,
      padding: Spacing[6],
    },
    neon: {
      backgroundColor: Colors.dark.surface.secondary,
      borderRadius: BorderRadius.xl,
      padding: Spacing[6],
      borderWidth: 2,
      borderColor: Colors.neon.electric,
      shadowColor: Colors.neon.electric,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 15,
    },
  },

  // ENHANCED BUTTON SYSTEM - 2025
  button: {
    primary: {
      backgroundColor: Colors.primary[500],
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing[4],
      paddingHorizontal: Spacing[6],
      ...Shadows.sm,
    },
    neon: {
      backgroundColor: 'transparent',
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing[4],
      paddingHorizontal: Spacing[6],
      borderWidth: 2,
      borderColor: Colors.neon.electric,
      shadowColor: Colors.neon.electric,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 15,
      elevation: 10,
    },
    glass: {
      ...Glassmorphism.primary,
      borderRadius: BorderRadius.lg,
      paddingVertical: Spacing[4],
      paddingHorizontal: Spacing[6],
    },
    gradient: {
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing[4],
      paddingHorizontal: Spacing[6],
      // Gradient will be applied via LinearGradient component
    },
  },

  // ENHANCED TEXT STYLES - 2025
  text: {
    hero: {
      fontSize: Typography.sizes['6xl'],
      fontWeight: Typography.weights.black,
      lineHeight: Typography.lineHeights.ultraTight,
      color: Colors.neutral[900],
      letterSpacing: Typography.letterSpacing.ultraTight,
      fontFamily: Typography.families.heading,
    },
    heroNeon: {
      fontSize: Typography.sizes['6xl'],
      fontWeight: Typography.weights.black,
      lineHeight: Typography.lineHeights.ultraTight,
      color: Colors.neon.electric,
      letterSpacing: Typography.letterSpacing.wide,
      fontFamily: Typography.families.accent,
      textShadowColor: Colors.neon.electric,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 20,
    },
    displayGradient: {
      fontSize: Typography.sizes['5xl'],
      fontWeight: Typography.weights.black,
      lineHeight: Typography.lineHeights.tight,
      letterSpacing: Typography.letterSpacing.tight,
      fontFamily: Typography.families.heading,
      // Gradient will be applied via MaskedView
    },
  },
};

// ======= DARK MODE UTILITIES - 2025 Essential =======
export const DarkMode = {
  isDark: false, // This would be managed by theme context

  getColor: (lightColor: string, darkColor: string) => {
    return DarkMode.isDark ? darkColor : lightColor;
  },

  getBackgroundColor: () => {
    return DarkMode.isDark ? Colors.dark.surface.primary : Colors.neutral[50];
  },

  getCardColor: () => {
    return DarkMode.isDark ? Colors.dark.surface.secondary : Colors.neutral[0];
  },

  getTextColor: () => {
    return DarkMode.isDark ? Colors.dark.text.primary : Colors.neutral[900];
  },

  getBorderColor: () => {
    return DarkMode.isDark ? Colors.dark.border.primary : Colors.neutral[200];
  },
};

// ======= ADVANCED LAYOUT SYSTEM =======
const GOLDEN_RATIO = 1.618;
const BASE_UNIT = 8;

export const Layout = {
  // Golden Ratio based spacing for harmonious proportions
  golden: {
    xs: Math.round(BASE_UNIT * GOLDEN_RATIO), // ~13px
    sm: Math.round(BASE_UNIT * GOLDEN_RATIO * 1.5), // ~19px
    md: Math.round(BASE_UNIT * GOLDEN_RATIO * 2), // ~26px
    lg: Math.round(BASE_UNIT * GOLDEN_RATIO * 3), // ~39px
    xl: Math.round(BASE_UNIT * GOLDEN_RATIO * 4), // ~52px
    xxl: Math.round(BASE_UNIT * GOLDEN_RATIO * 6), // ~78px
  },

  // Container system for consistent width management
  containers: {
    mobile: {
      paddingHorizontal: Spacing[4], // 16px
      maxWidth: '100%',
    },
    tablet: {
      paddingHorizontal: Spacing[6], // 24px
      maxWidth: 768,
    },
    desktop: {
      paddingHorizontal: Spacing[8], // 32px
      maxWidth: 1024,
    },
    wide: {
      paddingHorizontal: Spacing[10], // 40px
      maxWidth: 1280,
    },
  },

  // Grid system based on 12-column layout
  grid: {
    columns: 12,
    gutter: Spacing[4], // 16px
    margin: Spacing[6], // 24px
  },

  // Section spacing with mathematical progression
  sections: {
    hero: Spacing[20], // 80px
    primary: Spacing[16], // 64px
    secondary: Spacing[12], // 48px
    tertiary: Spacing[10], // 40px
    minimal: Spacing[8], // 32px
  },

  // Rhythm system for vertical spacing consistency
  rhythm: {
    paragraph: Spacing[4], // 16px
    section: Spacing[8], // 32px
    subsection: Spacing[6], // 24px
    element: Spacing[3], // 12px
    tight: Spacing[2], // 8px
  },
};

// ======= ASPECT RATIOS =======
export const AspectRatios = {
  square: { width: 1, height: 1 }, // 1:1
  landscape: { width: 16, height: 9 }, // 16:9
  portrait: { width: 3, height: 4 }, // 3:4
  golden: { width: GOLDEN_RATIO, height: 1 }, // φ:1
  card: { width: 3, height: 2 }, // 3:2
  hero: { width: 5, height: 3 }, // 5:3
  wide: { width: 21, height: 9 }, // 21:9
};

// ======= BREAKPOINTS =======
export const Breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};

// ======= UTILITY FUNCTIONS =======

// Responsive value selector
export const responsive = (values: {
  mobile: number;
  tablet?: number;
  desktop?: number;
}) => {
  // Returns mobile value by default
  // Can be enhanced with actual responsive logic
  return values.mobile;
};

// Spacing helper with mathematical precision
export const space = (multiplier: number) => Spacing[2] * multiplier;

// Golden ratio spacing calculator
export const goldenSpace = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl') =>
  Layout.golden[size];

// Grid column width calculator
export const gridColumn = (columns: number, totalColumns: number = 12) => {
  const gutterCount = totalColumns - 1;
  const totalGutterWidth = gutterCount * Layout.grid.gutter;
  const availableWidth = totalColumns - totalGutterWidth;
  return (availableWidth * columns) / totalColumns;
};

// Container padding based on screen size (placeholder - would use actual screen detection)
export const containerPadding = (screenWidth: number) => {
  if (screenWidth >= Breakpoints.wide)
    return Layout.containers.wide.paddingHorizontal;
  if (screenWidth >= Breakpoints.desktop)
    return Layout.containers.desktop.paddingHorizontal;
  if (screenWidth >= Breakpoints.tablet)
    return Layout.containers.tablet.paddingHorizontal;
  return Layout.containers.mobile.paddingHorizontal;
};

// Proportional spacing based on golden ratio
export const proportionalSpacing = (
  baseSize: number,
  multiplier: number = 1
) => {
  return Math.round(baseSize * GOLDEN_RATIO * multiplier);
};

// ======= ACCESSIBILITY =======
export const Accessibility = {
  // Minimum touch targets (44x44 iOS, 48x48 Android)
  touchTarget: {
    minWidth: 44,
    minHeight: 44,
  },

  // Focus styles
  focus: {
    borderWidth: 2,
    borderColor: Colors.primary[500],
    borderRadius: BorderRadius.md,
  },

  // High contrast mode support
  highContrast: {
    borderWidth: 1,
    borderColor: Colors.neutral[900],
  },
};

// ===================================================================
// TYPESCRIPT HELPERS - Type Safety for React Native Styles
// ===================================================================

// Font Weight Type Helper
export type FontWeight =
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900'
  | 'normal'
  | 'bold';

// Animation Value Type Helper
export type AnimatedValue = {
  interpolate: (config: {
    inputRange: number[];
    outputRange: number[] | string[];
  }) => number;
};

// Style helper for type-safe font weights
export const fontWeight = (
  weight: keyof typeof Typography.weights
): FontWeight => Typography.weights[weight] as FontWeight;

// Export default design system
export default {
  Colors,
  Typography,
  Spacing,
  Layout,
  BorderRadius,
  Shadows,
  Animation,
  AspectRatios,
  Breakpoints,
  Glassmorphism,
  Gamification,
  ComponentStyles,
  DarkMode,
  Accessibility,
};
