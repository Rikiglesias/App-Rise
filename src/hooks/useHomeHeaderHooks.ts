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
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation for hero banner
    const pulseAnimation = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.02,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]);

    // Main entrance animation
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

    // Start continuous pulse animation
    Animated.loop(pulseAnimation).start();
  }, [containerAnim, titleAnim, imageAnim, pulseAnim]);

  return { titleAnim, imageAnim, containerAnim, pulseAnim };
};

// Hook for scroll interpolations
export const useScrollInterpolations = (
  scrollY: Animated.Value
): UseScrollInterpolationsReturn => {
  const titleOpacity = scrollY.interpolate({
    inputRange: ADVANCED_CONFIG.scrollEffects.fadeRange,
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const titleTransform = scrollY.interpolate({
    inputRange: ADVANCED_CONFIG.scrollEffects.translateRange,
    outputRange: [0, -40],
    extrapolate: 'clamp',
  });

  const imageParallax = scrollY.interpolate({
    inputRange: ADVANCED_CONFIG.scrollEffects.parallaxRange,
    outputRange: [0, -100],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: ADVANCED_CONFIG.scrollEffects.scaleRange,
    extrapolate: 'clamp',
  });

  const gradientOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0.1, 0.3],
    extrapolate: 'clamp',
  });

  return {
    titleOpacity,
    titleTransform,
    imageParallax,
    imageScale,
    gradientOpacity,
  };
};
