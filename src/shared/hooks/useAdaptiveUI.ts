import { useMemo } from 'react';
import { Platform, Dimensions, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  PlatformTypography,
  PlatformTouch,
  PlatformAnimations,
  PlatformColors,
} from '../constants/platformDesignTokens';

/**
 * Hook avanzato che fornisce tutte le configurazioni UI adattive
 * Gestisce automaticamente differenze tra iOS e Android + dispositivi specifici
 */
export const useAdaptiveUI = () => {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // ===================================================================
  // PLATFORM DETECTION & DEVICE INFO AVANZATA (SENZA DIPENDENZE)
  // ===================================================================

  const platformInfo = useMemo(() => {
    const isIOS = Platform.OS === 'ios';
    const isAndroid = Platform.OS === 'android';

    // 🔍 DETECTION INTELLIGENTE DISPOSITIVI ANDROID (senza dipendenze)
    let deviceType = 'unknown';
    let headerPaddingAdjustment = 0;

    if (isAndroid) {
      const aspectRatio = screenHeight / screenWidth;
      const dpi = Dimensions.get('window').scale * 160; // Calcola DPI approssimativo

      // 📱 DETECTION BASATA SU SCREEN METRICS + SAFE AREAS
      // Ogni produttore ha pattern riconoscibili dalle dimensioni

      if (insets.top >= 48) {
        // Samsung Galaxy S23/S24 Ultra o simili (notch molto alto)
        deviceType = 'samsung_flagship';
        headerPaddingAdjustment = 20;
      } else if (insets.top >= 35 && insets.top < 48) {
        // Samsung Galaxy serie S o Note (notch medio-alto)
        deviceType = 'samsung_premium';
        headerPaddingAdjustment = 30;
      } else if (insets.top >= 28 && insets.top < 35 && aspectRatio > 2.1) {
        // Xiaomi Mi/Redmi con MIUI (aspect ratio molto lungo)
        deviceType = 'xiaomi_miui';
        headerPaddingAdjustment = 25;
      } else if (
        insets.top >= 24 &&
        insets.top < 32 &&
        screenWidth === 392.72
      ) {
        // Google Pixel (dimensioni caratteristiche)
        deviceType = 'google_pixel';
        headerPaddingAdjustment = 40;
      } else if (insets.top >= 30 && aspectRatio > 2.2) {
        // OnePlus (aspect ratio estremo + safe area alta)
        deviceType = 'oneplus';
        headerPaddingAdjustment = 25;
      } else if (insets.top >= 20 && insets.top < 30) {
        // Android moderni generici
        deviceType = 'android_modern';
        headerPaddingAdjustment = 35;
      } else if (insets.top < 20) {
        // Android vecchi o senza notch
        deviceType = 'android_legacy';
        headerPaddingAdjustment = 25;
      } else {
        // Fallback
        deviceType = 'android_generic';
        headerPaddingAdjustment = 30;
      }

      // 📱 Debug avanzato device detection
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('🔍 SMART DEVICE DETECTION:', {
          screenWidth,
          screenHeight,
          aspectRatio: aspectRatio.toFixed(2),
          safeAreaTop: insets.top,
          safeAreaBottom: insets.bottom,
          dpi: Math.round(dpi),
          deviceType,
          headerPaddingAdjustment,
          platformVersion: Platform.Version,
        });
      }
    }

    return {
      isIOS,
      isAndroid,
      isTablet: screenWidth >= 768,
      isSmallScreen: screenWidth < 375,
      isLargeScreen: screenWidth >= 414,
      hasNotch: insets.top > 20,
      aspectRatio: screenHeight / screenWidth,
      isLongPhone: screenHeight / screenWidth > 2,

      // 🚀 NUOVE PROPRIETÀ DEVICE-SPECIFIC
      deviceType,
      headerPaddingAdjustment,

      // 🎯 CALCOLATORE INTELLIGENTE PADDING
      getSmartHeaderPadding: () => {
        if (isIOS) return insets.top + 60;

        // Android: usa detection specifica + safe area + extra adjustment
        const intelligentPadding = Math.max(
          insets.top + headerPaddingAdjustment,
          5 // Padding minimo assoluto
        );

        return intelligentPadding;
      },

      // 🔧 UTILITY FUNCTIONS
      getDeviceInfo: () => ({
        type: deviceType,
        screenSize: `${screenWidth}x${screenHeight}`,
        safeAreas: `${insets.top}/${insets.bottom}`,
        isModern: insets.top > 20,
      }),
    };
  }, [screenWidth, screenHeight, insets]);

  // ===================================================================
  // TYPOGRAPHY ADAPTIVE
  // ===================================================================

  const typography = useMemo(() => {
    const baseTypography = PlatformTypography;

    return {
      ...baseTypography,
      // Adaptive sizes based on screen size
      adaptiveSize: (baseSize: number) => {
        if (platformInfo.isSmallScreen) return baseSize * 0.9;
        if (platformInfo.isLargeScreen) return baseSize * 1.05;
        return baseSize;
      },
      // Get platform-specific font weight
      getPlatformWeight: (
        weight: 'light' | 'regular' | 'medium' | 'semibold' | 'bold'
      ) => {
        const weightMap = {
          ios: {
            light: '300',
            regular: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
          },
          android: {
            light: '300',
            regular: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
          },
        };
        return Platform.OS === 'ios'
          ? weightMap.ios[weight]
          : weightMap.android[weight];
      },
    };
  }, [platformInfo]);

  // ===================================================================
  // SPACING & LAYOUT ADAPTIVE
  // ===================================================================

  const spacing = useMemo(
    () => ({
      // Safe area aware spacing
      topSafe: insets.top,
      bottomSafe: Math.max(insets.bottom, platformInfo.isIOS ? 34 : 16),
      horizontalSafe: Math.max(insets.left, insets.right),

      // Platform-specific content padding
      contentPadding: {
        horizontal: platformInfo.isTablet ? 32 : 16,
        vertical: platformInfo.isIOS ? 20 : 16,
      },

      // Adaptive spacing based on screen size
      adaptive: (baseSpacing: number) => {
        if (platformInfo.isSmallScreen) return baseSpacing * 0.8;
        if (platformInfo.isTablet) return baseSpacing * 1.2;
        return baseSpacing;
      },

      // Touch target spacing
      touchTarget: PlatformTouch,
    }),
    [insets, platformInfo]
  );

  // ===================================================================
  // COLORS ADAPTIVE (Dark Mode)
  // ===================================================================

  const colors = useMemo(() => {
    const isDark = colorScheme === 'dark';

    if (isDark) {
      return {
        isDark: true,
        ...PlatformColors,
        // Adaptive opacity based on platform
        getAdaptiveOpacity: (baseOpacity: number) => {
          return platformInfo.isIOS ? baseOpacity * 0.9 : baseOpacity;
        },
      };
    }

    return {
      isDark: false,
      background: {
        primary: platformInfo.isIOS ? '#FFFFFF' : '#FAFAFA',
        secondary: platformInfo.isIOS ? '#F2F2F7' : '#F5F5F5',
        tertiary: platformInfo.isIOS ? '#E5E5EA' : '#EEEEEE',
      },
      text: {
        primary: platformInfo.isIOS ? '#000000' : '#212121',
        secondary: platformInfo.isIOS ? '#3C3C43' : '#757575',
        tertiary: platformInfo.isIOS ? '#8E8E93' : '#9E9E9E',
      },
      surface: {
        primary: platformInfo.isIOS ? '#FFFFFF' : '#FFFFFF',
        secondary: platformInfo.isIOS ? '#F2F2F7' : '#F8F9FA',
        elevated: platformInfo.isIOS ? '#FFFFFF' : '#FFFFFF',
      },
      getAdaptiveOpacity: (baseOpacity: number) => baseOpacity,
    };
  }, [colorScheme, platformInfo]);

  // ===================================================================
  // ANIMATION CONFIGS
  // ===================================================================

  const animations = useMemo(
    () => ({
      // Platform-optimized durations
      duration: {
        ultraFast: platformInfo.isIOS ? 100 : 150,
        fast: platformInfo.isIOS ? 200 : 250,
        normal: platformInfo.isIOS ? 300 : 350,
        slow: platformInfo.isIOS ? 400 : 500,
      },

      // Adaptive easing based on platform
      easing: platformInfo.isIOS ? 'ease-out' : 'ease-in-out',

      // Reduced motion support
      respectsReducedMotion: platformInfo.isIOS,
    }),
    [platformInfo]
  );

  // ===================================================================
  // COMPONENT VARIANTS
  // ===================================================================

  const components = useMemo(
    () => ({
      // Button variants
      button: {
        height: platformInfo.isIOS ? 44 : 48,
        borderRadius: platformInfo.isIOS ? 8 : 4,
        minWidth: PlatformTouch.minSize,
      },

      // Input variants
      input: {
        height: platformInfo.isIOS ? 44 : 56,
        borderRadius: platformInfo.isIOS ? 8 : 4,
        borderWidth: platformInfo.isIOS ? 1 : 2,
      },

      // Card variants
      card: {
        borderRadius: platformInfo.isIOS ? 12 : 8,
        padding: platformInfo.isIOS ? 16 : 16,
        elevation: platformInfo.isAndroid ? 2 : 0,
      },

      // Navigation
      navigation: PlatformAnimations,
    }),
    [platformInfo]
  );

  // ===================================================================
  // ACCESSIBILITY HELPERS
  // ===================================================================

  const accessibility = useMemo(
    () => ({
      // Platform-specific accessibility labels
      getLabel: (label: string) => {
        return platformInfo.isIOS ? label : `${label}, button`;
      },

      // Touch target requirements
      minTouchTarget: PlatformTouch.minSize,

      // Semantic hints
      getHint: (action: string) => {
        return platformInfo.isIOS
          ? `Double tap to ${action}`
          : `Touch to ${action}`;
      },
    }),
    [platformInfo]
  );

  // ===================================================================
  // RETURN INTERFACE
  // ===================================================================

  return {
    // Platform info
    platform: platformInfo,

    // Design system
    typography,
    spacing,
    colors,
    animations,
    components,
    accessibility,

    // Utility functions
    isIOS: platformInfo.isIOS,
    isAndroid: platformInfo.isAndroid,
    isDark: colors.isDark,

    // Quick helpers
    getPlatformValue: <T>(iosValue: T, androidValue: T): T => {
      return platformInfo.isIOS ? iosValue : androidValue;
    },

    getAdaptiveValue: <T>(smallValue: T, normalValue: T, largeValue: T): T => {
      if (platformInfo.isSmallScreen) return smallValue;
      if (platformInfo.isLargeScreen) return largeValue;
      return normalValue;
    },
  };
};

export default useAdaptiveUI;
