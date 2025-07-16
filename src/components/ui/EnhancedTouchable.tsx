import * as Haptics from 'expo-haptics';
import React, { useCallback, useRef } from 'react';
import type { TouchableOpacityProps, StyleProp, ViewStyle } from 'react-native';
import { Animated, Easing, StyleSheet, TouchableOpacity } from 'react-native';

import { Animation, Glassmorphism } from '../../shared/constants/designTokens';

interface EnhancedTouchableProps extends TouchableOpacityProps {
  readonly children: React.ReactNode;
  readonly variant?: 'default' | 'glass' | 'neon' | 'minimal';
  readonly microAnimation?: 'scale' | 'lift' | 'glow' | 'bounce' | 'none';
  readonly hapticFeedback?: boolean;
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly onPress?: () => void;
}

// Animation factory functions - Separated to reduce function length
const createPressInAnimation = (
  type: string,
  scaleAnim: Animated.Value,
  elevationAnim: Animated.Value,
  glowAnim: Animated.Value
) => {
  switch (type) {
    case 'scale':
      return Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: Animation.duration.ultraFast,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      });
    case 'lift':
      return Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.02,
          duration: Animation.duration.fast,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(elevationAnim, {
          toValue: 8,
          duration: Animation.duration.fast,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
      ]);
    case 'glow':
      return Animated.timing(glowAnim, {
        toValue: 1,
        duration: Animation.duration.normal,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      });
    case 'bounce':
      return Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: Animation.duration.ultraFast,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      });
    default:
      return null;
  }
};

const createPressOutAnimation = (
  type: string,
  scaleAnim: Animated.Value,
  elevationAnim: Animated.Value,
  glowAnim: Animated.Value
) => {
  switch (type) {
    case 'scale':
    case 'bounce':
      return Animated.timing(scaleAnim, {
        toValue: 1,
        duration: Animation.duration.fast,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      });
    case 'lift':
      return Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: Animation.duration.fast,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(elevationAnim, {
          toValue: 0,
          duration: Animation.duration.fast,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
      ]);
    case 'glow':
      return Animated.timing(glowAnim, {
        toValue: 0,
        duration: Animation.duration.normal,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      });
    default:
      return null;
  }
};

// Animation Handlers Custom Hook - Now simplified
const useAnimationHandlers = (
  microAnimation: EnhancedTouchableProps['microAnimation'],
  scaleAnim: Animated.Value,
  elevationAnim: Animated.Value,
  glowAnim: Animated.Value
) => {
  const executePressInAnimation = useCallback(() => {
    const animation = createPressInAnimation(
      microAnimation ?? '',
      scaleAnim,
      elevationAnim,
      glowAnim
    );
    animation?.start();
  }, [microAnimation, scaleAnim, elevationAnim, glowAnim]);

  const executePressOutAnimation = useCallback(() => {
    const animation = createPressOutAnimation(
      microAnimation ?? '',
      scaleAnim,
      elevationAnim,
      glowAnim
    );
    animation?.start();
  }, [microAnimation, scaleAnim, elevationAnim, glowAnim]);

  return { executePressInAnimation, executePressOutAnimation };
};

// Simplified Enhanced Touchable Animations Hook
const useEnhancedTouchableAnimations = (
  microAnimation: EnhancedTouchableProps['microAnimation'],
  hapticFeedback: boolean,
  disabled: boolean,
  loading: boolean,
  onPress?: () => void
) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const elevationAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const { executePressInAnimation, executePressOutAnimation } =
    useAnimationHandlers(microAnimation, scaleAnim, elevationAnim, glowAnim);

  const handlePressIn = useCallback(() => {
    // Haptic feedback
    if (hapticFeedback && !disabled) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    executePressInAnimation();
  }, [hapticFeedback, disabled, executePressInAnimation]);

  const handlePressOut = useCallback(() => {
    executePressOutAnimation();
  }, [executePressOutAnimation]);

  const handlePress = useCallback(() => {
    if (!disabled && !loading && onPress) {
      onPress();
    }
  }, [disabled, loading, onPress]);

  return {
    scaleAnim,
    elevationAnim,
    glowAnim,
    rotateAnim,
    handlePressIn,
    handlePressOut,
    handlePress,
  };
};

// Custom Hook for Enhanced Touchable Styles
const useEnhancedTouchableStyles = (
  variant: EnhancedTouchableProps['variant'],
  glowAnim: Animated.Value
) => {
  const getVariantStyle = useCallback(() => {
    switch (variant) {
      case 'glass':
        return [
          styles.glassVariant,
          {
            ...Glassmorphism.light,
            shadowOpacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.1, 0.3],
            }),
          },
        ];

      case 'neon':
        return [
          styles.neonVariant,
          {
            shadowOpacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.8],
            }),
            shadowRadius: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [10, 25],
            }),
          },
        ];

      case 'minimal':
        return styles.minimalVariant;

      default:
        return styles.defaultVariant;
    }
  }, [variant, glowAnim]);

  return { getVariantStyle };
};

// Animation Styles Hook - Extracted transform logic
// Note: Using flexible types for React Native compatibility
const useAnimationStyles = (
  getVariantStyle: () => unknown,
  scaleAnim: Animated.Value,
  rotateAnim: Animated.Value,
  elevationAnim: Animated.Value,
  style?: unknown
): StyleProp<ViewStyle> => {
  return [
    getVariantStyle(),
    {
      transform: [
        { scale: scaleAnim },
        {
          rotate: rotateAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
          }),
        },
      ],
      elevation: elevationAnim,
    },
    style,
  ].filter(Boolean) as StyleProp<ViewStyle>;
};

// Main Component - Now much smaller
export const EnhancedTouchable: React.FC<EnhancedTouchableProps> = ({
  children,
  style,
  variant = 'default',
  microAnimation = 'scale',
  hapticFeedback = true,
  loading = false,
  disabled = false,
  onPress,
  ...props
}) => {
  // Use custom hooks
  const {
    scaleAnim,
    elevationAnim,
    glowAnim,
    rotateAnim,
    handlePressIn,
    handlePressOut,
    handlePress,
  } = useEnhancedTouchableAnimations(
    microAnimation,
    hapticFeedback,
    disabled,
    loading,
    onPress
  );

  const { getVariantStyle } = useEnhancedTouchableStyles(variant, glowAnim);

  // Loading animation effect
  React.useEffect(() => {
    if (loading) {
      const animation = Animated.loop(
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        })
      );
      animation.start();
      return () => animation.stop();
    }
    // Return undefined for non-loading state
    return undefined;
  }, [loading, scaleAnim]);

  // Animation styles
  const animationStyles = useAnimationStyles(
    getVariantStyle,
    scaleAnim,
    rotateAnim,
    elevationAnim,
    style
  );

  // Render
  return (
    <Animated.View style={animationStyles}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.9}
        style={styles.touchableContainer}
        {...props}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  defaultVariant: {
    // Default styling - will be overridden by parent styles
  },

  glassVariant: {
    // Glassmorphism styling applied via getVariantStyle()
    borderRadius: 12,
    overflow: 'hidden',
  },

  neonVariant: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00FFFF',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },

  minimalVariant: {
    backgroundColor: 'transparent',
  },

  touchableContainer: {
    flex: 1,
  },
});

export default EnhancedTouchable;
