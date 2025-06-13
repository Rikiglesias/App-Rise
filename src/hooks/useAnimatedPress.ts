import { useCallback, useMemo, useRef } from 'react';
import { Animated } from 'react-native';

import { Animation } from '../shared/constants/designTokens';

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
const createPressInAnimations = (
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

const createPressOutAnimations = (
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
  options: UseAnimatedPressOptions = {}
): UseAnimatedPressReturn => {
  const {
    scaleValue = 0.98,
    minOpacity = 0.85,
    shadowEnabled = true,
  } = options;

  // Animation values
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const shadow = useRef(new Animated.Value(0)).current;

  // Press handlers
  const handlePressIn = useCallback(() => {
    const animations = createPressInAnimations(
      scale,
      opacity,
      shadow,
      scaleValue,
      minOpacity,
      shadowEnabled
    );
    Animated.parallel(animations).start();
  }, [scale, opacity, shadow, scaleValue, minOpacity, shadowEnabled]);

  const handlePressOut = useCallback(() => {
    const animations = createPressOutAnimations(
      scale,
      opacity,
      shadow,
      shadowEnabled
    );
    Animated.parallel(animations).start();
  }, [scale, opacity, shadow, shadowEnabled]);

  const animatedStyle = useAnimatedStyle(scale, opacity, shadow, shadowEnabled);

  return {
    scaleValue: scale,
    opacityValue: opacity,
    shadowValue: shadow,
    handlePressIn,
    handlePressOut,
    animatedStyle,
  };
};
