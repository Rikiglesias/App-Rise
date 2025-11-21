/**
 * useDeviceType - Hook per rilevare tipo device dinamicamente
 *
 * Usa useWindowDimensions per reagire a rotazione e resize.
 * Perfetto per logiche responsive condizionali.
 *
 * @returns Device type info con helper boolean
 */

import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

const DEVICE_BREAKPOINTS = {
  small: 380, // iPhone SE, mini
  normal: 500, // iPhone standard, Android (max: iPhone Pro Max 430px)
  large: 500, // iPad, tablet (min: iPad Mini portrait 768px)
} as const;

export const useDeviceType = () => {
  const { width, height } = useWindowDimensions();

  const deviceType = useMemo(() => {
    // Usa la dimensione minore (portrait orientation)
    const minDimension = Math.min(width, height);

    if (minDimension < DEVICE_BREAKPOINTS.small) return 'small';
    if (minDimension < DEVICE_BREAKPOINTS.large) return 'normal';
    return 'large';
  }, [width, height]);

  return {
    deviceType,
    isSmall: deviceType === 'small',
    isNormal: deviceType === 'normal',
    isLarge: deviceType === 'large',
    isTablet: deviceType === 'large', // Alias per chiarezza
    isPhone: deviceType !== 'large', // Tutto ciò che non è tablet
    width,
    height,
  };
};
