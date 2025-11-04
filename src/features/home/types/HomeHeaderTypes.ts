import { Animated, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';

// Dimensioni calcolate in modo millimetrico rispetto a iPhone 15 (393px)

// Configuration inline
export const ADVANCED_CONFIG = {
  headerSection: {
    paddingVertical: PerfectSpacing.sm,
    paddingHorizontal: PerfectSpacing.base,
    minHeight: scale(120),
  },
  imageSection: {
    // Altezza scalata proporzionalmente (aspect ratio 1567/1131 dell'immagine)
    // Base: 393px x 1.386 = 544px su iPhone 15
    // Scala automaticamente su tutti i device mantenendo proporzioni
    height: scale(544),
  },
  typography: {
    // Valori di fallback non usati negli stili (si usano TypographyTokens)
    title: 32,
    lineHeight: 36,
  },
  animations: {
    staggerDelay: 200,
    fadeInDuration: 1200,
  },
  scrollEffects: {
    fadeRange: [0, 150],
    translateRange: [0, 80],
    parallaxRange: [0, 200], // Ridotto l'effetto parallasse
    scaleRange: [1, 1.02], // Ridotto l'effetto scale
  },
};

export interface HomeHeaderSectionProps {
  readonly scrollY: Animated.Value;
  readonly onJoinPress?: () => void;
}

export interface UseHomeHeaderAnimationsReturn {
  titleAnim: Animated.Value;
  imageAnim: Animated.Value;
  containerAnim: Animated.Value;
}

export interface UseScrollInterpolationsReturn {
  titleOpacity: Animated.AnimatedInterpolation<number>;
  titleTransform: Animated.AnimatedInterpolation<number>;
  imageParallax: Animated.AnimatedInterpolation<number>;
  imageScale: Animated.AnimatedInterpolation<number>;
  gradientOpacity: Animated.AnimatedInterpolation<number>;
  imageRotation: Animated.AnimatedInterpolation<string>;
}

// Type for styles to avoid circular imports
export interface HomeHeaderStyles {
  container: ViewStyle;
  headerSection: ViewStyle;
  gradientBackground: ViewStyle;
  textContainer: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  imageSection: ViewStyle;
  image: ImageStyle;
  imageGradientOverlay: ViewStyle;
}

export interface HeaderTextSectionProps {
  readonly titleAnim: Animated.Value;
  readonly titleOpacity: Animated.AnimatedInterpolation<number>;
  readonly titleTransform: Animated.AnimatedInterpolation<number>;
  readonly styles: HomeHeaderStyles;
}

export interface HeaderImageSectionProps {
  readonly imageAnim: Animated.Value;
  readonly imageParallax: Animated.AnimatedInterpolation<number>;
  readonly imageScale: Animated.AnimatedInterpolation<number>;
  readonly gradientOpacity: Animated.AnimatedInterpolation<number>;
  readonly imageRotation: Animated.AnimatedInterpolation<string>;
  readonly styles: HomeHeaderStyles;
}
