import {
  Animated,
  Dimensions,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { Spacing } from '../../../shared/constants/designTokens';
import { useTheme } from '../../../shared/hooks/useTheme';

const { height: windowHeight, width: windowWidth } = Dimensions.get('window');

// Configuration inline
export const ADVANCED_CONFIG = {
  headerSection: {
    paddingVertical: Spacing[6],
    paddingHorizontal: Spacing[4],
    minHeight: 120,
  },
  imageSection: {
    height: windowHeight * 0.58,
  },
  typography: {
    title: windowWidth < 375 ? 28 : 32,
    lineHeight: windowWidth < 375 ? 32 : 36,
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
export type HomeHeaderStyles = Record<
  string,
  ViewStyle | TextStyle | ImageStyle
>;

export interface HeaderTextSectionProps {
  readonly colors: ReturnType<typeof useTheme>['colors'];
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

export interface HeaderMissionSectionProps {
  readonly styles: HomeHeaderStyles;
  readonly scrollY?: Animated.Value;
}
