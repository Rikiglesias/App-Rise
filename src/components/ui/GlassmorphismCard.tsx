// BlurView removed - will implement fallback glassmorphism
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import type { ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';

import {
  BorderRadius,
  Glassmorphism,
  Spacing,
} from '../../shared/constants/designTokens';
import { useThemeStyles } from '../../shared/hooks/useTheme';

interface GlassmorphismCardProps {
  readonly children: React.ReactNode;
  readonly style?: ViewStyle;
  readonly variant?: 'light' | 'medium' | 'dark' | 'primary';
  readonly intensity?: 'subtle' | 'normal' | 'strong';
  readonly gradient?: boolean;
}

export const GlassmorphismCard: React.FC<GlassmorphismCardProps> = ({
  children,
  style,
  variant = 'light',
  intensity = 'normal',
  gradient = false,
}) => {
  const themeStyles = useThemeStyles();

  // Get glassmorphism style based on variant
  const getGlassStyle = () => {
    const baseStyle = Glassmorphism[variant];

    // Adjust intensity
    const intensityMultiplier = {
      subtle: 0.5,
      normal: 1,
      strong: 1.5,
    }[intensity];

    return {
      ...baseStyle,
      shadowOpacity: baseStyle.shadowOpacity * intensityMultiplier,
      shadowRadius: baseStyle.shadowRadius * intensityMultiplier,
    };
  };

  const glassStyle = getGlassStyle();

  // Gradient colors based on variant and theme
  const getGradientColors = (): [string, string] => {
    if ((themeStyles.isDark !== null) !== null) {
      switch (variant) {
        case 'primary':
          return ['rgba(220, 38, 38, 0.2)', 'rgba(220, 38, 38, 0.05)'];
        case 'dark':
          return ['rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.1)'];
        default:
          return ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.02)'];
      }
    } else {
      switch (variant) {
        case 'primary':
          return ['rgba(220, 38, 38, 0.15)', 'rgba(220, 38, 38, 0.05)'];
        case 'dark':
          return ['rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.02)'];
        default:
          return ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)'];
      }
    }
  };

  // Fallback glassmorphism effect with gradient and styling
  return (
    <View style={[styles.container, glassStyle, style]}>
      {gradient && (
        <LinearGradient
          colors={getGradientColors()}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    padding: Spacing[6],
    overflow: 'hidden',
  },

  content: {
    position: 'relative',
    zIndex: 1,
  },
});

export default GlassmorphismCard;
