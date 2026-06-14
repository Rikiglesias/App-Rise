// ===================================================================
// 🏠 HOME FEATURE - TYPES
// ===================================================================

import type { NavigationProp } from '@react-navigation/native';
import type { Animated } from 'react-native';
import type { RootStackParamList } from '@/navigation/types';

/**
 * Home Screen Types
 * Tipi per la feature Home
 * RootStackParamList: SSOT in @/navigation/types (qui NON ridefinito).
 */

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
