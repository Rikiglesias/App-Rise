import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

import {
  BorderRadius,
  Shadows,
  Spacing,
  Typography,
} from '../../shared/constants/designTokens';
import { TypographyTokens } from '../../shared/constants/responsiveSystem';
import { useHapticFeedback } from '../../shared/hooks/useHapticFeedback';
import { useTheme } from '../../shared/hooks/useTheme';
import { PerfectText } from './PerfectText';
import PlatformTouchable from './PlatformTouchable';

// iPhone 15 reference width - will be scaled automatically by Perfect System
const REFERENCE_WIDTH = 393;

interface PremiumFloatingButtonProps {
  readonly onPress?: () => void;
  readonly title?: string;
  readonly icon?: string;
  readonly position?: 'bottom-right' | 'bottom-center' | 'bottom-left';
  readonly variant?: 'primary' | 'gradient' | 'glass';
}

// Animation factories
const createPressInAnimation = (
  scaleValue: Animated.Value,
  glowValue: Animated.Value
) =>
  Animated.parallel([
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }),
    Animated.timing(glowValue, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }),
  ]);

const createPressOutAnimation = (
  scaleValue: Animated.Value,
  glowValue: Animated.Value
) =>
  Animated.parallel([
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }),
    Animated.timing(glowValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }),
  ]);

const createPulseAnimation = (pulseValue: Animated.Value) =>
  Animated.loop(
    Animated.sequence([
      Animated.timing(pulseValue, {
        toValue: 1.05,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ])
  );

// Hook for animations - now simplified
const usePremiumFloatingButtonAnimations = () => {
  const { buttonPress, pulsePattern } = useHapticFeedback();

  const scaleValue = useRef(new Animated.Value(1)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const glowValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseAnimation = createPulseAnimation(pulseValue);
    void pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, [pulseValue]);

  const handlePressIn = useCallback(() => {
    void buttonPress();
    void createPressInAnimation(scaleValue, glowValue).start();
  }, [buttonPress, scaleValue, glowValue]);

  const handlePressOut = useCallback(() => {
    void createPressOutAnimation(scaleValue, glowValue).start();
  }, [scaleValue, glowValue]);

  const handlePress = useCallback(
    (onPress?: () => void) => {
      void pulsePattern();
      onPress?.();
    },
    [pulsePattern]
  );

  return {
    scaleValue,
    pulseValue,
    glowValue,
    handlePressIn,
    handlePressOut,
    handlePress,
  };
};

// Hook for position calculation
const usePositionStyle = (position: string) => {
  return useMemo(() => {
    const baseStyle = {
      position: 'absolute' as const,
      bottom: Spacing[8],
      zIndex: 1000,
    };

    switch (position) {
      case 'bottom-center':
        return { ...baseStyle, left: REFERENCE_WIDTH / 2 - 75 }; // 196.5 - 75 = 121.5
      case 'bottom-left':
        return { ...baseStyle, left: Spacing[6] };
      case 'bottom-right':
      default:
        return { ...baseStyle, right: Spacing[6] };
    }
  }, [position]);
};

const usePremiumFloatingButtonStyles = (variant: string, position: string) => {
  const { colors } = useTheme();
  const positionStyle = usePositionStyle(position);

  return useMemo(
    () =>
      StyleSheet.create({
        container: { ...positionStyle },
        button: {
          width: 150,
          height: 60,
          borderRadius: BorderRadius.full,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: Spacing[4],
          ...Shadows.lg,
        },
        primaryButton: { backgroundColor: colors.primary[500] },
        glassButton: {
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.3)',
        },
        content: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing[2],
        },
        icon: {},
        title: {
          color: colors.neutral[0],
          fontSize: TypographyTokens.styles.body.medium,
          fontWeight: Typography.weights.bold,
          textShadowColor: 'rgba(0, 0, 0, 0.3)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        },
        glassTitle: {
          color: colors.neutral[900],
          textShadowColor: 'rgba(255, 255, 255, 0.5)',
        },
        glow: {
          position: 'absolute',
          top: -5,
          left: -5,
          right: -5,
          bottom: -5,
          borderRadius: BorderRadius.full,
          backgroundColor: colors.primary[400],
          opacity: 0.3,
        },
      }),

    [colors, positionStyle]
  );
};

// Extracted render component to reduce main component lines
const PremiumFloatingButtonContent: React.FC<{
  styles: ReturnType<typeof usePremiumFloatingButtonStyles>;
  animatedStyle: Record<string, unknown>;
  glowStyle: Record<string, unknown>;
  variant: string;
  memoizedOnPress: () => void;
  handlePressIn: () => void;
  handlePressOut: () => void;
  title: string;
  icon: string;
}> = ({
  styles,
  animatedStyle,
  glowStyle,
  variant,
  memoizedOnPress,
  handlePressIn,
  handlePressOut,
  title,
  icon,
}) => {
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Animated.View style={[styles.glow, glowStyle]} />
      <PlatformTouchable
        style={[
          styles.button,
          variant === 'glass' ? styles.glassButton : styles.primaryButton,
        ]}
        onPress={memoizedOnPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`${title} - Pulsante di azione rapida`}
      >
        <Animated.View style={styles.content}>
          <PerfectText size={20} lines={1} style={styles.icon}>
            {icon}
          </PerfectText>
          <PerfectText
            size={14}
            lines={1}
            style={[
              styles.title,
              ...(variant === 'glass' ? [styles.glassTitle] : []),
            ]}
          >
            {title}
          </PerfectText>
        </Animated.View>
      </PlatformTouchable>
    </Animated.View>
  );
};

// Main Component - Now much smaller
export const PremiumFloatingButton: React.FC<PremiumFloatingButtonProps> = ({
  onPress,
  title = 'Aiuta Ora',
  icon = '💝',
  position = 'bottom-right',
  variant = 'gradient',
}) => {
  const {
    scaleValue,
    pulseValue,
    glowValue,
    handlePressIn,
    handlePressOut,
    handlePress,
  } = usePremiumFloatingButtonAnimations();

  const styles = usePremiumFloatingButtonStyles(variant, position);

  // Memoized press handler to avoid jsx-no-bind
  const memoizedOnPress = useCallback(() => {
    handlePress(onPress);
  }, [handlePress, onPress]);

  const animatedStyle = {
    transform: [{ scale: Animated.multiply(scaleValue, pulseValue) }],
  };

  const glowStyle = {
    opacity: glowValue,
    transform: [
      {
        scale: glowValue.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.2],
        }),
      },
    ],
  };

  return (
    <PremiumFloatingButtonContent
      styles={styles}
      animatedStyle={animatedStyle}
      glowStyle={glowStyle}
      variant={variant}
      memoizedOnPress={memoizedOnPress}
      handlePressIn={handlePressIn}
      handlePressOut={handlePressOut}
      title={title}
      icon={icon}
    />
  );
};

export default PremiumFloatingButton;
