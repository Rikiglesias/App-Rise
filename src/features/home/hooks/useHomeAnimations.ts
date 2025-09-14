import { useRef } from 'react';
import { Animated } from 'react-native';

export const useHomeAnimations = () => {
  // ANIMAZIONI DISABILITATE - Valori statici per performance ottimale
  const titleAnim = useRef(new Animated.Value(1)).current;
  const imageAnim = useRef(new Animated.Value(1)).current;
  const containerAnim = useRef(new Animated.Value(1)).current;

  // useEffect rimosso - nessuna animazione da eseguire

  return { titleAnim, imageAnim, containerAnim };
};

export const useScrollInterpolations = (scrollY: Animated.Value) => {
  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const titleTransform = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -10],
    extrapolate: 'clamp',
  });

  const imageParallax = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 1.1],
    extrapolate: 'clamp',
  });

  const gradientOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 0.3],
    extrapolate: 'clamp',
  });

  const imageRotation = scrollY.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '1deg'],
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
