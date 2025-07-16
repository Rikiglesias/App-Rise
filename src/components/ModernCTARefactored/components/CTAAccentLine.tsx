import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { CTAAccentLineProps } from '../types';

// ===================================================================
// LOCAL STYLES
// ===================================================================
const localStyles = StyleSheet.create({
  gradientOpacity: {
    opacity: 0.3,
  },
  standardOpacity: {
    opacity: 0.1,
  },
});

// ===================================================================
// ACCENT LINE COMPONENT
// ===================================================================
export const CTAAccentLine: React.FC<CTAAccentLineProps> = ({
  variant,
  contentStyles,
  shimmerValue,
}) => {
  const isGradient = variant === 'gradient';

  return (
    <View style={contentStyles.accentLine}>
      <Animated.View
        style={[
          contentStyles.shimmerOverlay,
          isGradient
            ? localStyles.gradientOpacity
            : localStyles.standardOpacity,
          {
            width: shimmerValue.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
};
