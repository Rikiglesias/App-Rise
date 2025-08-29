/**
 * HOOK RESPONSIVE SYSTEM
 * Hook principale per gestire il responsive design in tutta l'app
 */

/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Dimensions, LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  BreakpointLayouts,
  RTLTokens,
  ShadowTokens,
  refreshResponsiveValues,
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
      refreshResponsiveValues();
      setDimensions({
        width: window.width,
        height: window.height,
        breakpoint: getCurrentBreakpoint(),
      });
    };

    const subscription = Dimensions.addEventListener('change', updateDimensions);
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

    // Legacy compatibility - DEPRECATED: Use new breakpoint system instead
    // isSmallDevice: Use isCompact instead
    // isMediumDevice: Use isStandard instead
    // isLargeDevice: Use isLarge, isXLarge, or isXXLarge instead

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

/**
 * 📱 CONTAINER LAYOUT HOOK (Professional Typography Guide)
 * Gestisce automaticamente:
 * - Larghezza costante (90% su phone, fisso su tablet)
 * - Padding interno costante
 * - Safe area handling
 * - RTL support
 * - Baseline grid
 */
export const useContainerLayout = (options?: {
  variant?: 'text' | 'card' | 'section';
  enableRTL?: boolean;
  forceWidth?: string | number;
}) => {
  const { variant = 'text', enableRTL = false, forceWidth } = options || {};
  const breakpoint = getCurrentBreakpoint();
  const { bottom: safeAreaBottom, top: safeAreaTop } = useSafeAreaInsets();

  // Determine layout strategy based on breakpoint
  const getLayoutStrategy = () => {
    if (DeviceInfo.width <= 480) return BreakpointLayouts.phone;
    if (DeviceInfo.width <= 900) return BreakpointLayouts.tablet;
    return BreakpointLayouts.desktop;
  };

  const strategy = getLayoutStrategy();

  // Container styles (width, padding, margins)
  const containerStyle = useMemo(() => {
    const baseStyle = {
      // Width management
      maxWidth: forceWidth ?? strategy.container.maxWidth,
      alignSelf: 'center' as const,
      width: '100%',

      // Padding (constant across devices)
      paddingHorizontal: strategy.container.padding,

      // Safe area integration
      paddingTop: Math.max(
        safeAreaTop,
        DesignTokens.containers.safeArea.vertical
      ),
      paddingBottom: Math.max(
        safeAreaBottom,
        DesignTokens.containers.safeArea.vertical
      ),

      // Margin (responsive)
      marginHorizontal: strategy.container.margin,
    };

    // Variant-specific adjustments
    switch (variant) {
      case 'card':
        return {
          ...baseStyle,
          backgroundColor: '#FFFFFF',
          borderRadius: DesignTokens.borderRadius.medium,
          ...ShadowTokens.sm,
        };
      case 'section':
        return {
          ...baseStyle,
          marginVertical: DesignTokens.layout.sectionSpacing,
        };
      default:
        return baseStyle;
    }
  }, [strategy, forceWidth, safeAreaBottom, safeAreaTop, variant]);

  // Text styles (alignment, direction, line-height)
  const textStyle = useMemo(() => {
    const baseTextStyle = {
      // Text alignment
      textAlign: strategy.text.alignment,

      // Writing direction (RTL support)
      writingDirection: enableRTL
        ? RTLTokens.writingDirection.auto
        : strategy.text.direction,

      // Prevent system font scaling
      allowFontScaling: false,
    };

    return baseTextStyle;
  }, [strategy, enableRTL]);

  // Baseline grid helper
  const getBaselineLineHeight = useCallback((fontSize: number) => {
    return DesignTokens.containers.baseline.lineHeight(fontSize);
  }, []);

  // RTL-aware line break helper
  const getLineBreak = useCallback(
    (type: 'soft' | 'hard' = 'soft') => {
      if (!enableRTL) return type === 'soft' ? '\n' : '\n\n';
      return type === 'soft'
        ? RTLTokens.lineBreak.rtlSoft
        : RTLTokens.lineBreak.hardBreak;
    },
    [enableRTL]
  );

  // Layout measurement callback
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;

      // Development logging for layout consistency
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('📐 Container Layout:', {
          width,
          height,
          breakpoint,
          strategy: strategy.container.maxWidth,
          actualWidth: width,
          widthDiff:
            typeof strategy.container.maxWidth === 'string'
              ? 'percentage'
              : Math.abs(width - (strategy.container.maxWidth as number)),
        });
      }
    },
    [breakpoint, strategy]
  );

  return {
    // Styles
    containerStyle,
    textStyle,

    // Helpers
    getBaselineLineHeight,
    getLineBreak,
    handleLayout,

    // Layout info
    breakpoint,
    strategy,

    // Measurements
    containerWidth: DeviceInfo.width * 0.9, // For calculations
    maxTextWidth:
      typeof strategy.container.maxWidth === 'string'
        ? DeviceInfo.width * 0.9
        : strategy.container.maxWidth,

    // RTL support
    isRTL: enableRTL,
    textDirection: enableRTL
      ? RTLTokens.writingDirection.auto
      : RTLTokens.writingDirection.ltr,
  };
};

export default useResponsive;
