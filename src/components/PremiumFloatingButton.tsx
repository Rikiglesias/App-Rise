import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import {
  BorderRadius,
  Shadows,
  Spacing,
  Typography,
} from '../constants/designTokens';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { useTheme } from '../hooks/useTheme';

const { width } = Dimensions.get('window');

interface PremiumFloatingButtonProps {
  onPress?: () => void;
  title?: string;
  icon?: string;
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left';
  variant?: 'primary' | 'gradient' | 'glass';
}

export const PremiumFloatingButton: React.FC<PremiumFloatingButtonProps> = ({
  onPress,
  title = 'Aiuta Ora',
  icon = '💝',
  position = 'bottom-right',
  variant = 'gradient',
}) => {
  const { colors } = useTheme();
  const { buttonPress, pulsePattern } = useHapticFeedback();

  const scaleValue = useRef(new Animated.Value(1)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const glowValue = useRef(new Animated.Value(0)).current;

  // Animazione di pulsazione continua
  useEffect(() => {
    const pulseAnimation = Animated.loop(
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
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, [pulseValue]);

  const handlePressIn = () => {
    buttonPress();
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
    ]).start();
  };

  const handlePressOut = () => {
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
    ]).start();
  };

  const handlePress = () => {
    pulsePattern();
    onPress?.();
  };

  const getPositionStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      bottom: Spacing[8],
      zIndex: 1000,
    };

    switch (position) {
      case 'bottom-center':
        return { ...baseStyle, left: width / 2 - 75 };
      case 'bottom-left':
        return { ...baseStyle, left: Spacing[6] };
      case 'bottom-right':
      default:
        return { ...baseStyle, right: Spacing[6] };
    }
  };

  const styles = StyleSheet.create({
    container: {
      ...getPositionStyle(),
    },
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
    primaryButton: {
      backgroundColor: colors.primary[500],
    },
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
    icon: {
      fontSize: 20,
    },
    title: {
      color: colors.neutral[0],
      fontSize: Typography.sizes.base,
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
  });

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

  if (variant === 'gradient') {
    return (
      <Animated.View style={[styles.container, animatedStyle]}>
        <Animated.View style={[styles.glow, glowStyle]} />
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`${title} - Pulsante di azione rapida`}
        >
          <LinearGradient
            colors={colors.gradients.energy}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Animated.View style={styles.content}>
              <Text style={styles.icon}>{icon}</Text>
              <Text style={styles.title}>{title}</Text>
            </Animated.View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Animated.View style={[styles.glow, glowStyle]} />
      <TouchableOpacity
        style={[
          styles.button,
          variant === 'glass' ? styles.glassButton : styles.primaryButton,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${title} - Pulsante di azione rapida`}
      >
        <Animated.View style={styles.content}>
          <Text style={styles.icon}>{icon}</Text>
          <Text
            style={[styles.title, variant === 'glass' && styles.glassTitle]}
          >
            {title}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default PremiumFloatingButton;
