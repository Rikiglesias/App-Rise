import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Colors } from '../constants/designTokens';

interface ProgressRingProps {
  readonly progress: number; // 0 to 1
  readonly size?: number;
  readonly strokeWidth?: number;
  readonly color?: string;
  readonly backgroundColor?: string;
  readonly children?: React.ReactNode;
  readonly animateOnMount?: boolean;
  readonly duration?: number;
  readonly startAnimation?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 80,
  strokeWidth = 6,
  color = Colors.primary[500],
  backgroundColor = Colors.neutral[200],
  children,
  animateOnMount = true,
  duration = 1500,
  startAnimation = false,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    if (!startAnimation && !animateOnMount) return;

    // Reset animation
    animatedValue.setValue(0);

    // Start progress animation
    Animated.timing(animatedValue, {
      toValue: progress,
      duration,
      useNativeDriver: false, // We're animating SVG props
    }).start();
  }, [progress, startAnimation, animateOnMount, duration, animatedValue]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, circumference - circumference * progress],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress ring */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Content in center */}
      {children !== undefined && children !== null && (
        <View style={styles.centerContent}>{children}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProgressRing;
