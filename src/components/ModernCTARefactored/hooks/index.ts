import React from 'react';
import { Animated, Easing } from 'react-native';

import { Animation, Colors } from '../../../shared/constants/designTokens';

import {
  createButtonStyles,
  createContainerStyles,
  createContentStyles,
  createTypographyStyles,
} from '../styles';
import { AccessibilityConfig } from '../types';

// ===================================================================
// ANIMATIONS HOOK
// ===================================================================
export const useModernCTAAnimations = () => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  const shimmerValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: Animation.duration.slow,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: Animation.duration.slow,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    shimmerAnimation.start();

    return () => {
      shimmerAnimation.stop();
    };
  }, [shimmerValue]);

  const handlePressIn = React.useCallback(() => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: Animation.spring.snappy.tension,
      friction: Animation.spring.snappy.friction,
    }).start();
  }, [scaleValue]);

  const handlePressOut = React.useCallback(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: Animation.spring.snappy.tension,
      friction: Animation.spring.snappy.friction,
    }).start();
  }, [scaleValue]);

  return {
    scaleValue,
    shimmerValue,
    handlePressIn,
    handlePressOut,
  };
};

// ===================================================================
// ACCESSIBILITY CONFIG HOOK
// ===================================================================
export const useModernCTAConfig = (
  title: string,
  accessibilityLabel?: string,
  accessibilityHint?: string,
  disabled?: boolean
): AccessibilityConfig => {
  return React.useMemo(
    () => ({
      accessible: true,
      accessibilityRole: 'button' as const,
      accessibilityLabel: accessibilityLabel ?? title,
      accessibilityHint:
        accessibilityHint ?? `Tocca per ${title.toLowerCase()}`,
      accessibilityState: { disabled: disabled ?? false },
    }),
    [title, accessibilityLabel, accessibilityHint, disabled]
  );
};

// ===================================================================
// BASE STYLES HOOK
// ===================================================================
export const useModernCTABaseStyles = (colors: typeof Colors) => {
  const containerStyles = React.useMemo(() => createContainerStyles(), []);
  const buttonStyles = React.useMemo(
    () => createButtonStyles(colors),
    [colors]
  );
  const contentStyles = React.useMemo(
    () => createContentStyles(colors),
    [colors]
  );
  const typographyStyles = React.useMemo(
    () => createTypographyStyles(colors),
    [colors]
  );

  return {
    containerStyles,
    buttonStyles,
    contentStyles,
    typographyStyles,
  };
};

// ===================================================================
// DYNAMIC STYLES HOOK
// ===================================================================
export const useModernCTADynamicStyles = (
  containerStyles: ReturnType<typeof createContainerStyles>,
  buttonStyles: ReturnType<typeof createButtonStyles>,
  size: string,
  variant: string,
  disabled: boolean
) => {
  const containerStyle = [
    containerStyles.container,
    containerStyles[`${size}Container` as keyof typeof containerStyles],
  ];
  const buttonStyle = [
    buttonStyles.baseButton,
    buttonStyles[`${variant}Button` as keyof typeof buttonStyles],
    buttonStyles[`${size}Button` as keyof typeof buttonStyles],
    disabled && buttonStyles.disabledButton,
  ];

  return { containerStyle, buttonStyle };
};

// ===================================================================
// COMPLETE STYLES HOOK
// ===================================================================
export const useModernCTAStyles = (
  colors: typeof Colors,
  size: string,
  variant: string,
  disabled: boolean
) => {
  const baseStyles = useModernCTABaseStyles(colors);
  const dynamicStyles = useModernCTADynamicStyles(
    baseStyles.containerStyles,
    baseStyles.buttonStyles,
    size,
    variant,
    disabled
  );

  return {
    ...baseStyles,
    ...dynamicStyles,
  };
};
