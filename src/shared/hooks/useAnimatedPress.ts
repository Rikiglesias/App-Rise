import { useCallback, useMemo, useRef } from 'react';
import { Animated } from 'react-native';

import { Animation } from '@/shared/constants/designTokens';

interface UseAnimatedPressOptions {
  scaleValue?: number;
  minOpacity?: number;
  shadowEnabled?: boolean;
}

interface UseAnimatedPressReturn {
  scaleValue: Animated.Value;
  opacityValue: Animated.Value;
  shadowValue: Animated.Value;
  handlePressIn: () => void;
  handlePressOut: () => void;
  animatedStyle: {
    transform: { scale: Animated.Value }[];
    opacity: Animated.Value;
    shadowOpacity?: Animated.Value;
    elevation?: Animated.Value;
  };
}

// Animation factories - estratte per ridurre complessità
const _createPressInAnimations = (
  scale: Animated.Value,
  opacity: Animated.Value,
  shadow: Animated.Value,
  scaleValue: number,
  minOpacity: number,
  shadowEnabled: boolean
): Animated.CompositeAnimation[] => {
  const animations = [
    Animated.spring(scale, {
      toValue: scaleValue,
      useNativeDriver: true,
      ...Animation.spring.gentle,
    }),
    Animated.timing(opacity, {
      toValue: minOpacity,
      duration: Animation.duration.fast,
      useNativeDriver: true,
    }),
  ];

  if (shadowEnabled) {
    animations.push(
      Animated.timing(shadow, {
        toValue: 1,
        duration: Animation.duration.fast,
        useNativeDriver: true,
      })
    );
  }

  return animations;
};

const _createPressOutAnimations = (
  scale: Animated.Value,
  opacity: Animated.Value,
  shadow: Animated.Value,
  shadowEnabled: boolean
): Animated.CompositeAnimation[] => {
  const animations = [
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      ...Animation.spring.snappy,
    }),
    Animated.timing(opacity, {
      toValue: 1,
      duration: Animation.duration.normal,
      useNativeDriver: true,
    }),
  ];

  if (shadowEnabled) {
    animations.push(
      Animated.timing(shadow, {
        toValue: 0,
        duration: Animation.duration.normal,
        useNativeDriver: true,
      })
    );
  }

  return animations;
};

// Hook separato per lo styling
const useAnimatedStyle = (
  scale: Animated.Value,
  opacity: Animated.Value,
  shadow: Animated.Value,
  shadowEnabled: boolean
) => {
  return useMemo(
    () => ({
      transform: [{ scale }],
      opacity,
      ...(shadowEnabled && {
        shadowOpacity: shadow,
        elevation: shadow,
      }),
    }),
    [scale, opacity, shadow, shadowEnabled]
  );
};

export const useAnimatedPress = (
  _options: UseAnimatedPressOptions = {}
): UseAnimatedPressReturn => {
  // ANIMAZIONI DISABILITATE - Valori statici per performance ottimale
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const shadow = useRef(new Animated.Value(0)).current;

  // Press handlers disabilitati - nessuna animazione
  const handlePressIn = useCallback(() => {
    // Nessuna animazione
  }, []);

  const handlePressOut = useCallback(() => {
    // Nessuna animazione
  }, []);

  const animatedStyle = useAnimatedStyle(scale, opacity, shadow, false);

  return {
    scaleValue: scale,
    opacityValue: opacity,
    shadowValue: shadow,
    handlePressIn,
    handlePressOut,
    animatedStyle,
  };
};
