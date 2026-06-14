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
import { classifyDeviceType } from '@/shared/constants/perfectScale';

export const useDeviceType = () => {
  const { width, height } = useWindowDimensions();

  // Stessa SSOT di getDeviceType (perfectScale): un'unica definizione di breakpoint.
  // isTablet resta = lato corto >= 500 (comportamento invariato per i 13 consumer).
  const deviceType = useMemo(
    () => classifyDeviceType(Math.min(width, height)),
    [width, height]
  );

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
