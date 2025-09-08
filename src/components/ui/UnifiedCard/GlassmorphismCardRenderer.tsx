/**
 * GLASSMORPHISM CARD RENDERER - Renderer per Glassmorphism Cards
 * Gestisce la logica specifica per GlassmorphismCard con effetti vetro
 */

import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import type { ViewStyle, GestureResponderEvent } from 'react-native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import {
  BorderRadius,
  Glassmorphism,
  Spacing,
} from '../../../shared/constants/designTokens';
import type { GlassmorphismVariant, GlassmorphismIntensity } from './types';

interface GlassmorphismCardRendererProps {
  children: React.ReactNode;
  style?: ViewStyle | undefined;
  variant: GlassmorphismVariant;
  intensity: GlassmorphismIntensity;
  gradient: boolean;
  onPress?: ((event: GestureResponderEvent) => void) | undefined;
  disabled: boolean;
}

export const GlassmorphismCardRenderer: React.FC<
  GlassmorphismCardRendererProps
> = ({ children, style, variant, intensity, gradient, onPress, disabled }) => {
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

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      style={[styles.container, glassStyle, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {gradient ? (
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientOverlay}
        >
          <View style={styles.content}>{children}</View>
        </LinearGradient>
      ) : (
        <View style={styles.content}>{children}</View>
      )}
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    padding: Spacing[6],
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  gradientOverlay: {
    flex: 1,
    borderRadius: BorderRadius.xl,
  },
  content: {
    position: 'relative',
    zIndex: 1,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    flex: 1,
  },
});
