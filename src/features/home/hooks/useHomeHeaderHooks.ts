import { useRef } from 'react';
import { Animated } from 'react-native';
import {
  type UseHomeHeaderAnimationsReturn,
  type UseScrollInterpolationsReturn,
} from '../types/HomeHeaderTypes';

// Hook for animations - ANIMAZIONI DISABILITATE
export const useHomeHeaderAnimations = (): UseHomeHeaderAnimationsReturn => {
  // Valori statici per performance ottimale - nessuna animazione
  const titleAnim = useRef(new Animated.Value(1)).current;
  const imageAnim = useRef(new Animated.Value(1)).current;
  const containerAnim = useRef(new Animated.Value(1)).current;

  // useEffect rimosso - nessuna animazione da eseguire

  return { titleAnim, imageAnim, containerAnim };
};

// Hook for scroll interpolations
export const useScrollInterpolations = (
  scrollY: Animated.Value
): UseScrollInterpolationsReturn => {
  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1], // No opacity changes
    extrapolate: 'clamp',
  });

  const titleTransform = scrollY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0], // No movement
    extrapolate: 'clamp',
  });

  // All parallax effects removed - static image positioning
  const imageParallax = scrollY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0], // No movement
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1], // No scaling
    extrapolate: 'clamp',
  });

  const gradientOpacity = scrollY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0], // No gradient changes
    extrapolate: 'clamp',
  });

  const imageRotation = scrollY.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '0deg'], // No rotation
    extrapolate: 'clamp',
  });

  return {
    titleOpacity,
    titleTransform,
    imageParallax,
    imageScale,
    gradientOpacity,
    imageRotation,
  };
};
