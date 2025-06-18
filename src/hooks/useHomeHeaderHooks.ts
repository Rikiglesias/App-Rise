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
    // Subtle breathing animation for hero banner - più professionale
    const breathingAnimation = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.008, // Molto più sottile
        duration: 3000, // Più lento e rilassante
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 3000,
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

    // Start continuous breathing animation
    Animated.loop(breathingAnimation).start();
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

  // Animazione parallasse più naturale e meno aggressiva
  const imageParallax = scrollY.interpolate({
    inputRange: [0, 200, 400],
    outputRange: [0, -15, -30], // Movimento ridotto per evitare overlapping
    extrapolate: 'clamp',
  });

  // Scale molto più sottile per evitare distorsioni
  const imageScale = scrollY.interpolate({
    inputRange: [0, 150, 300],
    outputRange: [1, 1.02, 0.98], // Scale molto più delicato
    extrapolate: 'clamp',
  });

  // Gradient overlay più graduale
  const gradientOpacity = scrollY.interpolate({
    inputRange: [0, 100, 200, 400],
    outputRange: [0.02, 0.08, 0.15, 0.25], // Transizione più delicata
    extrapolate: 'clamp',
  });

  // Rotazione quasi impercettibile
  const imageRotation = scrollY.interpolate({
    inputRange: [0, 600],
    outputRange: ['0deg', '0.5deg'], // Rotazione minima per naturalezza
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
