import React, { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import type { TextProps } from 'react-native-paper';
import { PerfectText } from './PerfectText';

interface AnimatedNumberProps {
  readonly value: number;
  readonly style?: TextProps<never>['style'];
  readonly duration?: number;
  readonly startAnimation?: boolean;
  readonly _formatter?: (value: number) => string;
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
      return; // Early return, no cleanup needed
    }

    // Reset state for new value
    setRenderedValue('0');

    // Parse the value to get the number, suffix, and decimal precision
    const numericTarget = parseFloat(value.toString().replace(',', '.'));
    const suffixMatch = /[a-zA-Z+]+$/.exec(value.toString());
    const suffix = suffixMatch?.[0] ?? '';

    // Safely handle cases with no decimal part
    const valueStr = value.toString();
    const parts = valueStr.split(',');
    const decimalPart = parts[1]?.split(/[a-zA-Z+]/)[0] ?? '';
    const decimalPlaces = decimalPart.length > 0 ? decimalPart.length : 0;

    const listener = animatedValue.addListener(v => {
      const formattedValue = v.value.toFixed(decimalPlaces).replace('.', ',');
      setRenderedValue(`${formattedValue}${suffix}`);
    });

    // Start animation
    animatedValue.setValue(0); // Ensure animation starts from 0
    void Animated.timing(animatedValue, {
      toValue: isNaN(numericTarget) ? 0 : numericTarget,
      duration,
      useNativeDriver: false, // Essential for animating non-style props
    }).start();

    // Cleanup listener on unmount
    return () => {
      animatedValue.removeListener(listener);
    };
  }, [value, duration, animatedValue, startAnimation]);

  return (
    <PerfectText size={16} lines={1} fontWeight="600" style={style}>
      {renderedValue}
    </PerfectText>
  );
};

export default AnimatedNumber;
