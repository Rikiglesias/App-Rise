import * as Haptics from 'expo-haptics';
import React, { useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { Animation, Glassmorphism } from '../constants/designTokens';

interface EnhancedTouchableProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'neon' | 'minimal';
  microAnimation?: 'scale' | 'lift' | 'glow' | 'bounce' | 'none';
  hapticFeedback?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}

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
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const elevationAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // 2025 MICROINTERACTION SYSTEM
  const handlePressIn = () => {
    // Haptic feedback con Expo Haptics
    if (hapticFeedback && !disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Scale animation based on type
    switch (microAnimation) {
      case 'scale':
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: Animation.duration.ultraFast,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
        break;

      case 'lift':
        Animated.parallel([
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
        ]).start();
        break;

      case 'glow':
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: Animation.duration.normal,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }).start();
        break;

      case 'bounce':
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: Animation.duration.ultraFast,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: Animation.spring.playful.tension,
            friction: Animation.spring.playful.friction,
            useNativeDriver: true,
          }),
        ]).start();
        break;

      default:
        break;
    }
  };

  const handlePressOut = () => {
    // Reset animations
    switch (microAnimation) {
      case 'scale':
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: Animation.duration.fast,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
        break;

      case 'lift':
        Animated.parallel([
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
        ]).start();
        break;

      case 'glow':
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: Animation.duration.normal,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }).start();
        break;

      default:
        break;
    }
  };

  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      // Success feedback animation
      if (microAnimation === 'bounce') {
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: Animation.duration.fast,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]).start();
      }

      onPress();
    }
  };

  // Dynamic styles based on variant
  const getVariantStyle = () => {
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
  };

  // Loading animation
  React.useEffect(() => {
    if (loading) {
      const loadingAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      loadingAnimation.start();

      return () => {
        loadingAnimation.stop();
      };
    }

    return undefined; // Fix TypeScript error
  }, [loading, scaleAnim]);

  return (
    <TouchableOpacity
      {...props}
      style={[style, disabled && styles.disabled, loading && styles.loading]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.9}
    >
      <Animated.View
        style={[
          getVariantStyle(),
          {
            transform: [
              {
                scale: scaleAnim,
              },
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
            elevation: elevationAnim,
          },
        ]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
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

  disabled: {
    opacity: 0.5,
  },

  loading: {
    opacity: 0.8,
  },
});

export default EnhancedTouchable;
