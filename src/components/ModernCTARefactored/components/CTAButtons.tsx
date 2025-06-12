import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';

import { GradientButtonProps, StandardButtonProps } from '../types';
import { CTAContent } from './CTAContent';

// ===================================================================
// LOCAL STYLES
// ===================================================================
const localStyles = StyleSheet.create({
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

// ===================================================================
// GRADIENT BUTTON COMPONENT
// ===================================================================
export const GradientCTAButton: React.FC<GradientButtonProps> = ({
  containerStyle,
  scaleValue,
  onPress,
  handlePressIn,
  handlePressOut,
  disabled,
  accessibilityConfig,
  buttonStyle,
  colors,
  contentProps,
}) => (
  <Animated.View
    style={[containerStyle, { transform: [{ scale: scaleValue }] }]}
  >
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.9}
      {...accessibilityConfig}
    >
      <LinearGradient
        colors={colors.gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={localStyles.gradientOverlay}
      />
      <CTAContent {...contentProps} />
    </TouchableOpacity>
  </Animated.View>
);

// ===================================================================
// STANDARD BUTTON COMPONENT
// ===================================================================
export const StandardCTAButton: React.FC<StandardButtonProps> = ({
  containerStyle,
  scaleValue,
  buttonStyle,
  onPress,
  handlePressIn,
  handlePressOut,
  disabled,
  accessibilityConfig,
  contentProps,
}) => (
  <Animated.View
    style={[containerStyle, { transform: [{ scale: scaleValue }] }]}
  >
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.8}
      {...accessibilityConfig}
    >
      <CTAContent {...contentProps} />
    </TouchableOpacity>
  </Animated.View>
);
