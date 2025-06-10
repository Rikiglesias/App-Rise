import React, { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { Text, TextProps } from 'react-native-paper';

interface AnimatedNumberProps {
  value: number;
  style?: TextProps<never>['style'];
  duration?: number;
  startAnimation?: boolean;
  _formatter?: (value: number) => string;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  style,
  duration = 1500,
  startAnimation = false,
  _formatter,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [renderedValue, setRenderedValue] = useState('0');

  useEffect(() => {
    if (!startAnimation) {
      setRenderedValue('0'); // Reset to 0 if not visible
      return;
    }

    // Reset state for new value
    setRenderedValue('0');

    // Parse the value to get the number, suffix, and decimal precision
    const numericTarget = parseFloat(value.toString().replace(',', '.'));
    const suffix = value.toString().match(/[a-zA-Z+]+$/)?.[0] || '';

    // Safely handle cases with no decimal part
    const decimalPart = (value.toString().split(',')[1] || '').split(
      /[a-zA-Z+]/
    )[0];
    const decimalPlaces = decimalPart ? decimalPart.length : 0;

    const listener = animatedValue.addListener(v => {
      const formattedValue = v.value.toFixed(decimalPlaces).replace('.', ',');
      setRenderedValue(`${formattedValue}${suffix}`);
    });

    // Start animation
    animatedValue.setValue(0); // Ensure animation starts from 0
    Animated.timing(animatedValue, {
      toValue: isNaN(numericTarget) ? 0 : numericTarget,
      duration,
      useNativeDriver: false, // Essential for animating non-style props
    }).start();

    // Cleanup listener on unmount
    return () => {
      animatedValue.removeListener(listener);
    };
  }, [value, duration, animatedValue, startAnimation]);

  return <Text style={style}>{renderedValue}</Text>;
};

export default AnimatedNumber;
