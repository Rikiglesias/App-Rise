/**
 * HOOK RESPONSIVE SYSTEM
 * Hook principale per gestire il responsive design in tutta l'app
 */

import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import {
  ScalingFactors,
  DeviceInfo,
  getCurrentBreakpoint,
  scaleSize,
  scaleFont,
  scaleSpacing,
  DesignTokens,
  TypographyTokens,
  SpacingTokens,
} from '../constants/responsiveSystem';

/**
 * Hook principale per il sistema responsive
 * Fornisce tutte le utility necessarie per mantenere l'aspetto dell'iPhone 15
 */
export const useResponsive = () => {
  const [dimensions, setDimensions] = useState({
    width: DeviceInfo.width,
    height: DeviceInfo.height,
    breakpoint: getCurrentBreakpoint(),
  });

  // Aggiorna dimensioni quando cambia l'orientamento
  useEffect(() => {
    const updateDimensions = ({
      window,
    }: {
      window: { width: number; height: number };
    }) => {
      setDimensions({
        width: window.width,
        height: window.height,
        breakpoint: getCurrentBreakpoint(),
      });
    };

    const subscription = Dimensions.addEventListener(
      'change',
      updateDimensions
    );
    return () => subscription?.remove();
  }, []);

  return {
    // Dimensioni e info device
    dimensions,
    deviceInfo: DeviceInfo,
    scalingFactors: ScalingFactors,

    // Funzioni di scaling
    scale: scaleSize,
    scaleFont,
    scaleSpacing,

    // Valori pre-calcolati
    spacing: SpacingTokens,
    typography: TypographyTokens,
    layout: DesignTokens,

    // Device categories (aggiornate per nuovo sistema)
    isCompact: dimensions.breakpoint === 'compact',
    isStandard: dimensions.breakpoint === 'standard',
    isLarge: dimensions.breakpoint === 'large',
    isXLarge: dimensions.breakpoint === 'xlarge',
    isXXLarge: dimensions.breakpoint === 'xxlarge',

    // Utilities intelligenti per scaling bidirezionale
    canScaleUp:
      dimensions.breakpoint === 'large' ||
      dimensions.breakpoint === 'xlarge' ||
      dimensions.breakpoint === 'xxlarge',
    shouldScaleDown: dimensions.breakpoint === 'compact',

    // Legacy compatibility
    isSmallDevice: dimensions.width < 375,
    isMediumDevice: dimensions.width >= 375 && dimensions.width <= 414,
    isLargeDevice: dimensions.width > 414,

    // Responsive values helper (supporta tutti i breakpoints)
    select: <T>(values: {
      compact?: T;
      standard?: T;
      large?: T;
      xlarge?: T;
      xxlarge?: T;
      default: T;
    }): T => {
      const breakpoint = dimensions.breakpoint;
      return values[breakpoint] ?? values.default;
    },
  };
};

/**
 * Hook per valori responsive con tipo generico (supporta tutti i breakpoints)
 */
export const useResponsiveValue = <T>(values: {
  compact?: T;
  standard?: T;
  large?: T;
  xlarge?: T;
  xxlarge?: T;
  default: T;
}): T => {
  const { select } = useResponsive();
  return select(values);
};

/**
 * Hook per spacing responsive
 */
export const useResponsiveSpacing = () => {
  const { spacing } = useResponsive();
  return spacing;
};

/**
 * Hook per typography responsive
 */
export const useResponsiveTypography = () => {
  const { typography } = useResponsive();
  return typography;
};

/**
 * 🚀 Hook per Font Scaling Intelligente (Bi-directional)
 * Gestisce automaticamente lo scaling in base al breakpoint
 */
export const useIntelligentFontScaling = () => {
  const { scaleFont, canScaleUp, shouldScaleDown, dimensions } =
    useResponsive();

  return {
    scaleFont,
    canScaleUp,
    shouldScaleDown,
    currentBreakpoint: dimensions.breakpoint,

    // Helper per scaling condizionale
    scaleIfLarge: (baseSize: number, largeSize?: number) => {
      if (canScaleUp && largeSize) {
        return scaleFont(largeSize);
      }
      return scaleFont(baseSize);
    },

    // Helper per calcolare font ottimale
    getOptimalFontSize: (small: number, medium: number, large: number) => {
      if (shouldScaleDown) return scaleFont(small);
      if (canScaleUp) return scaleFont(large);
      return scaleFont(medium);
    },
  };
};

/**
 * 🎯 Hook per Breakpoint-Aware Components
 * Fornisce utilities per componenti che devono adattarsi completamente
 */
export const useBreakpointAware = () => {
  const responsive = useResponsive();

  return {
    ...responsive,

    // Utility per rendering condizionale
    renderFor: (
      breakpoints: ('compact' | 'standard' | 'large' | 'xlarge' | 'xxlarge')[]
    ) => {
      return breakpoints.includes(responsive.dimensions.breakpoint);
    },

    // Helper per componenti adattivi
    getAdaptiveProps: <T>(propsMap: {
      compact?: T;
      standard?: T;
      large?: T;
      xlarge?: T;
      xxlarge?: T;
      default: T;
    }) => {
      return responsive.select(propsMap);
    },
  };
};

export default useResponsive;
