// ===================================================================
// 🏠 HOME FEATURE - TYPES
// ===================================================================

import type { NavigationProp } from '@react-navigation/native';
import type { Animated } from 'react-native';

/**
 * Home Screen Types
 * Tipi per la feature Home
 */

// Navigation param list type
export type RootStackParamList = {
  Home: undefined;
  Impact: undefined;
  Projects: undefined;
  About: undefined;
  Actions: undefined;
  [key: string]: undefined | Record<string, unknown>;
};

// Navigation types
export interface HomeScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

// Animation types
export interface HomeAnimations {
  titleAnim: Animated.Value;
  imageAnim: Animated.Value;
  containerAnim: Animated.Value;
}

// Component types
export interface EntraInAzioneProps {
  navigation: NavigationProp<RootStackParamList>;
}

// Hook types
export interface UseHomeAnimationsReturn {
  titleAnim: Animated.Value;
  imageAnim: Animated.Value;
  containerAnim: Animated.Value;
}
