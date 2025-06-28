import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import {
  ADVANCED_CONFIG,
  type UseHomeHeaderAnimationsReturn,
  type UseScrollInterpolationsReturn,
} from '../types/HomeHeaderTypes';

// Hook for animations
export const useHomeHeaderAnimations = (): UseHomeHeaderAnimationsReturn => {
  const titleAnim = useRef(new Animated.Value(0)).current;
  const imageAnim = useRef(new Animated.Value(0)).current;
  const containerAnim = useRef(new Animated.Value(0)).current;
  // pulseAnim removed - no more breathing animation

  useEffect(() => {
    // Main entrance animation only - no breathing, no continuous loops
    Animated.sequence([
      Animated.timing(containerAnim, {
        toValue: 1,
        duration: ADVANCED_CONFIG.animations.fadeInDuration * 0.6,
        useNativeDriver: true,
      }),
      Animated.stagger(ADVANCED_CONFIG.animations.staggerDelay, [
        Animated.spring(titleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 120,
          friction: 8,
        }),
        Animated.timing(imageAnim, {
          toValue: 1,
          duration: ADVANCED_CONFIG.animations.fadeInDuration,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [containerAnim, titleAnim, imageAnim]);

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
