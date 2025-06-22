import { useEffect, useMemo } from 'react';
import { Platform, InteractionManager, DeviceEventEmitter } from 'react-native';
import {
  PlatformAnimations,
  PlatformShadows,
} from '../constants/platformDesignTokens';

/**
 * Hook avanzato per ottimizzazioni platform-specific
 * Ottimizza automaticamente performance, animazioni e interazioni
 */
export const usePlatformOptimizations = () => {
  // ===================================================================
  // OTTIMIZZAZIONI PERFORMANCE
  // ===================================================================

  const performanceConfig = useMemo(
    () => ({
      // Android: ottimizzazioni aggressive
      android: {
        enableNativeAnimations: true,
        useRippleEffects: true,
        optimizeScrolling: true,
        reducedMotion: false,
        batchUpdates: true,
        useElevation: true,

        // Memory optimizations
        removeClippedSubviews: true,
        initialNumToRender: 10,
        maxToRenderPerBatch: 5,
        windowSize: 10,

        // Gesture optimizations
        enableHardwareAcceleration: true,
        useNativeDriver: true,
      },

      // iOS: mantiene comportamento esistente
      ios: {
        enableNativeAnimations: true,
        useRippleEffects: false, // iOS non ha ripple
        optimizeScrolling: false, // iOS scroll già ottimo
        reducedMotion: false,
        batchUpdates: false,
        useElevation: false, // iOS usa shadows

        // iOS-specific optimizations
        preserveScrollPosition: true,
        enableBouncing: true,
        useBlurEffects: true,
      },
    }),
    []
  );

  const currentConfig =
    Platform.OS === 'android'
      ? performanceConfig.android
      : performanceConfig.ios;

  // ===================================================================
  // INTERACTION MANAGER OPTIMIZATION
  // ===================================================================

  useEffect(() => {
    if (Platform.OS === 'android') {
      // Ottimizza timing delle interazioni per Android
      const optimizeInteractions = () => {
        InteractionManager.setDeadline?.(16); // 60fps target
      };

      optimizeInteractions();
    }
  }, []);

  // ===================================================================
  // GESTURE OPTIMIZATIONS
  // ===================================================================

  const gestureConfig = useMemo(
    () => ({
      // Configurazioni gesture platform-specific
      android: {
        rippleRadius: 150,
        rippleDuration: 300,
        pressDelay: 0,
        longPressDelay: 500,
        hitSlop: { top: 8, bottom: 8, left: 8, right: 8 },
      },
      ios: {
        activeOpacity: 0.7,
        pressDelay: 0,
        longPressDelay: 500,
        hitSlop: { top: 12, bottom: 12, left: 12, right: 12 },
      },
    }),
    []
  );

  // ===================================================================
  // ANIMATION HELPERS
  // ===================================================================

  const getOptimizedAnimationConfig = useMemo(
    () => ({
      // Spring animations ottimizzate
      spring: PlatformAnimations.spring,

      // Timing animations
      timing: {
        duration: PlatformAnimations.duration.normal,
        useNativeDriver: currentConfig.enableNativeAnimations,
      },

      // Scale animations
      scale: PlatformAnimations.scale,

      // Layout animations (Android only)
      layoutAnimation:
        Platform.OS === 'android'
          ? {
              duration: 200,
              type: 'easeInEaseOut',
              property: 'scaleXY',
            }
          : null,
    }),
    [currentConfig.enableNativeAnimations]
  );

  // ===================================================================
  // SHADOW/ELEVATION HELPERS
  // ===================================================================

  const getOptimizedShadow = useMemo(
    () =>
      (level: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md') => {
        return PlatformShadows[level] ?? {};
      },
    []
  );

  // ===================================================================
  // SCROLL OPTIMIZATIONS
  // ===================================================================

  const getScrollOptimizations = useMemo(() => {
    if (Platform.OS === 'android') {
      const androidConfig = performanceConfig.android;
      return {
        removeClippedSubviews: androidConfig.removeClippedSubviews,
        scrollEventThrottle: 16,
        showsVerticalScrollIndicator: true,
        overScrollMode: 'auto',
        nestedScrollEnabled: true,
        // Performance optimizations
        initialNumToRender: androidConfig.initialNumToRender,
        maxToRenderPerBatch: androidConfig.maxToRenderPerBatch,
        windowSize: androidConfig.windowSize,
        updateCellsBatchingPeriod: 100,
        getItemLayout: null, // Let FlatList calculate
      };
    }

    // iOS optimizations
    return {
      showsVerticalScrollIndicator: false,
      bounces: true,
      bouncesZoom: false,
      alwaysBounceVertical: true,
      decelerationRate: 'normal',
      scrollToOverflowEnabled: true,
    };
  }, [performanceConfig.android]);

  // ===================================================================
  // MEMORY OPTIMIZATION
  // ===================================================================

  useEffect(() => {
    let memoryWarningListener: ReturnType<
      typeof DeviceEventEmitter.addListener
    > | null = null;

    if (Platform.OS === 'android') {
      // Android memory optimization
      memoryWarningListener = DeviceEventEmitter.addListener(
        'memoryWarning',
        () => {
          // Trigger garbage collection optimizations
          // Note: Memory warning received - optimizing
        }
      );
    }

    return () => {
      if (memoryWarningListener) {
        memoryWarningListener.remove();
      }
    };
  }, []);

  // ===================================================================
  // RETURN INTERFACE
  // ===================================================================

  return {
    // Platform info
    isAndroid: Platform.OS === 'android',
    isIOS: Platform.OS === 'ios',

    // Configuration
    config: currentConfig,

    // Helpers
    getOptimizedAnimationConfig,
    getOptimizedShadow,
    getScrollOptimizations,
    gestureConfig:
      Platform.OS === 'android' ? gestureConfig.android : gestureConfig.ios,

    // Quick utilities
    shouldUseRipple: Platform.OS === 'android',
    shouldUseBlur: Platform.OS === 'ios',
    shouldUseElevation: Platform.OS === 'android',

    // Performance utilities
    batchUpdates: (callback: () => void) => {
      if (currentConfig.batchUpdates) {
        InteractionManager.runAfterInteractions(callback);
      } else {
        callback();
      }
    },

    // Animation presets
    animations: {
      fadeIn: {
        opacity: [0, 1],
        duration: PlatformAnimations.duration.normal,
        useNativeDriver: true,
      },
      slideUp: {
        translateY: [50, 0],
        opacity: [0, 1],
        duration: PlatformAnimations.duration.normal,
        useNativeDriver: true,
      },
      scale: {
        scale: Platform.OS === 'android' ? [0.97, 1] : [0.95, 1],
        duration: PlatformAnimations.duration.fast,
        useNativeDriver: true,
      },
    },
  };
};

export default usePlatformOptimizations;
