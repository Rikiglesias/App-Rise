/**
 * FOLDABLE LAYOUT HOOK - PRODUCTION READY
 *
 * Gestisce automaticamente i dispositivi pieghevoli:
 * - Galaxy Fold/Flip detection
 * - Posture detection (normal, table-top, book)
 * - Layout strategy automatico
 * - Orientation handling
 * - Split-screen support
 */

import { useEffect, useState, useMemo } from 'react';
import { Dimensions, Platform } from 'react-native';
import { useResponsive } from './useResponsive';

/**
 * Posture types per dispositivi pieghevoli
 */
export type FoldablePosture =
  | 'normal' // Completamente aperto o dispositivo standard
  | 'table-top' // Piegato ad angolo (video calling position)
  | 'book' // Piegato come libro (dual screen)
  | 'tent' // Piegato come tenda
  | 'closed'; // Chiuso (solo screen esterno)

/**
 * Layout strategy per ogni posture
 */
export type FoldableLayoutStrategy =
  | 'single' // Single screen normal
  | 'dual' // Dual screen side by side
  | 'stacked' // Stacked vertically
  | 'tablet' // Force tablet layout
  | 'compact'; // Force compact layout

/**
 * Device info per dispositivi pieghevoli
 */
export interface FoldableDeviceInfo {
  isFoldable: boolean;
  foldableType: 'vertical' | 'horizontal' | 'none';
  screenCount: number;
  isFlexMode: boolean;
  hingeAngle?: number;
}

/**
 * Configurazione layout per foldable
 */
export interface FoldableLayoutConfig {
  posture: FoldablePosture;
  strategy: FoldableLayoutStrategy;
  containerWidth: string | number;
  containerHeight?: string | number;
  forcedBreakpoint?: 'compact' | 'standard' | 'large' | 'xlarge' | 'xxlarge';
  dualScreen?: {
    primary: { width: number; height: number };
    secondary: { width: number; height: number };
  };
}

/**
 * Detect foldable device characteristics
 */
const detectFoldableDevice = (
  width: number,
  height: number
): FoldableDeviceInfo => {
  const aspectRatio = Math.max(width, height) / Math.min(width, height);

  // Galaxy Fold family detection
  if (width > 600 && Platform.OS === 'android') {
    return {
      isFoldable: true,
      foldableType: 'vertical',
      screenCount: 2,
      isFlexMode: false,
    };
  }

  // Galaxy Flip family detection
  if (height > 800 && aspectRatio > 2.1 && Platform.OS === 'android') {
    return {
      isFoldable: true,
      foldableType: 'horizontal',
      screenCount: 2,
      isFlexMode: false,
    };
  }

  // iPad Pro aspect ratio could indicate foldable mode
  if (Platform.OS === 'ios' && aspectRatio > 1.6 && width > 700) {
    return {
      isFoldable: true,
      foldableType: 'vertical',
      screenCount: 1,
      isFlexMode: false,
    };
  }

  return {
    isFoldable: false,
    foldableType: 'none',
    screenCount: 1,
    isFlexMode: false,
  };
};

/**
 * Detect current posture based on dimensions
 */
const detectPosture = (
  width: number,
  height: number,
  deviceInfo: FoldableDeviceInfo
): FoldablePosture => {
  if (!deviceInfo.isFoldable) return 'normal';

  // Table-top mode: width > height but height is very small
  if (width > height && height < 500) {
    return 'table-top';
  }

  // Book mode: dual screen side by side
  if (width > 700 && height > 500 && width / height > 1.5) {
    return 'book';
  }

  // Tent mode: very wide aspect ratio
  if (width > height && width / height > 2.0) {
    return 'tent';
  }

  return 'normal';
};

/**
 * Calculate optimal layout strategy
 */
const calculateLayoutStrategy = (
  posture: FoldablePosture,
  deviceInfo: FoldableDeviceInfo,
  dimensions: { width: number; height: number }
): FoldableLayoutStrategy => {
  const { width } = dimensions;

  switch (posture) {
    case 'table-top':
      // Table-top mode: force tablet layout for better UX
      return 'tablet';

    case 'book':
      // Book mode: dual screen if wide enough
      return width > 700 ? 'dual' : 'single';

    case 'tent':
      // Tent mode: stacked layout
      return 'stacked';

    case 'closed':
      // Closed: force compact layout
      return 'compact';

    default:
      // Normal: standard responsive behavior
      if (width > 600) return 'tablet';
      if (width > 480) return 'single';
      return 'compact';
  }
};

/**
 * Calculate container dimensions for strategy
 */
const calculateContainerDimensions = (
  strategy: FoldableLayoutStrategy,
  posture: FoldablePosture,
  dimensions: { width: number; height: number }
): { width: string | number; height?: string | number | undefined } => {
  const { width, height } = dimensions;

  switch (strategy) {
    case 'dual':
      return {
        width: Math.floor(width / 2) - 16, // Split screen with margin
        height: height,
      };

    case 'stacked':
      return {
        width: width * 0.9,
        height: Math.floor(height / 2) - 16,
      };

    case 'tablet':
      return {
        width: 428, // Fixed tablet width
        height: undefined,
      };

    case 'compact':
      return {
        width: '95%', // Wider on compact mode
        height: undefined,
      };

    default:
      return {
        width: '90%', // Standard responsive width
        height: undefined,
      };
  }
};

/**
 * FOLDABLE LAYOUT HOOK
 *
 * @param options - Configuration options
 * @returns Layout configuration optimized for foldable devices
 */
export const useFoldableLayout = (options?: {
  enablePostureDetection?: boolean;
  preferredStrategy?: FoldableLayoutStrategy;
  minTabletWidth?: number;
}) => {
  const {
    enablePostureDetection = true,
    preferredStrategy,
    minTabletWidth = 600,
  } = options ?? {};

  const { dimensions: responsiveDimensions } = useResponsive();

  const [dimensions, setDimensions] = useState({
    width: responsiveDimensions.width,
    height: responsiveDimensions.height,
  });

  // Update dimensions when device changes
  useEffect(() => {
    const updateDimensions = ({
      window,
    }: {
      window: { width: number; height: number };
    }) => {
      setDimensions({
        // @ts-expect-error - Legacy hook, Perfect System uses fixed dimensions
        width: window.width,
        // @ts-expect-error - Legacy hook, Perfect System uses fixed dimensions
        height: window.height,
      });
    };

    const subscription = Dimensions.addEventListener(
      'change',
      updateDimensions
    );
    return () => subscription?.remove();
  }, []);

  // Calculate foldable configuration
  const foldableConfig = useMemo(() => {
    const { width, height } = dimensions;

    // Detect device characteristics
    const deviceInfo = detectFoldableDevice(width, height);

    // Detect posture if enabled
    const posture = enablePostureDetection
      ? detectPosture(width, height, deviceInfo)
      : 'normal';

    // Calculate layout strategy
    const strategy =
      preferredStrategy ??
      calculateLayoutStrategy(posture, deviceInfo, dimensions);

    // Calculate container dimensions
    const containerDimensions = calculateContainerDimensions(
      strategy,
      posture,
      dimensions
    );

    // Determine forced breakpoint
    let forcedBreakpoint: FoldableLayoutConfig['forcedBreakpoint'];
    if (
      strategy === 'tablet' ||
      (strategy === 'dual' && width > minTabletWidth)
    ) {
      forcedBreakpoint = 'xxlarge';
    } else if (strategy === 'compact') {
      forcedBreakpoint = 'compact';
    }

    return {
      posture,
      strategy,
      containerWidth: containerDimensions.width,
      containerHeight: containerDimensions.height,
      forcedBreakpoint,
      deviceInfo,
      dualScreen:
        strategy === 'dual'
          ? {
              primary: { width: Math.floor(width / 2), height },
              secondary: { width: Math.floor(width / 2), height },
            }
          : undefined,
    };
  }, [dimensions, enablePostureDetection, preferredStrategy, minTabletWidth]);

  // Development logging
  useEffect(() => {
    if (__DEV__ && foldableConfig.deviceInfo.isFoldable) {
      // eslint-disable-next-line no-console
      console.log('📱 Foldable Layout:', {
        posture: foldableConfig.posture,
        strategy: foldableConfig.strategy,
        containerWidth: foldableConfig.containerWidth,
        dimensions: `${dimensions.width}x${dimensions.height}`,
        deviceType: foldableConfig.deviceInfo.foldableType,
      });
    }
  }, [foldableConfig, dimensions]);

  // Layout helpers
  const layoutHelpers = useMemo(
    () => ({
      // Check if device is in foldable mode
      isFoldableMode: foldableConfig.deviceInfo.isFoldable,

      // Check specific postures
      isTableTop: foldableConfig.posture === 'table-top',
      isBookMode: foldableConfig.posture === 'book',
      isTentMode: foldableConfig.posture === 'tent',

      // Check specific strategies
      isDualScreen: foldableConfig.strategy === 'dual',
      isTabletMode: foldableConfig.strategy === 'tablet',
      isCompactMode: foldableConfig.strategy === 'compact',

      // Screen calculations
      getScreenWidth: () =>
        foldableConfig.dualScreen?.primary.width ?? dimensions.width,
      getScreenHeight: () =>
        foldableConfig.dualScreen?.primary.height ?? dimensions.height,

      // Container styles
      getContainerStyle: () => ({
        width: foldableConfig.containerWidth,
        height: foldableConfig.containerHeight,
        alignSelf: 'center' as const,
        maxWidth:
          typeof foldableConfig.containerWidth === 'number'
            ? foldableConfig.containerWidth
            : undefined,
      }),

      // Text styles adapted for foldable
      getTextStyle: () => ({
        textAlign:
          foldableConfig.strategy === 'dual'
            ? ('left' as const)
            : ('center' as const),
        fontSize: foldableConfig.strategy === 'compact' ? 0.9 : 1.0, // Scaling factor
      }),

      // Layout measurement for debugging
      measureLayout: (
        callback: (layout: { width: number; height: number }) => void
      ) => {
        // Return current dimensions for immediate measurement
        callback(dimensions);
      },
    }),
    [foldableConfig, dimensions]
  );

  return {
    // Configuration
    ...foldableConfig,

    // Helpers
    ...layoutHelpers,

    // Raw dimensions
    dimensions,

    // Device detection
    deviceInfo: foldableConfig.deviceInfo,
  };
};

export default useFoldableLayout;
