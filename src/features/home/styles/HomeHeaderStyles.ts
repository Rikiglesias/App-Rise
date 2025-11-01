import { Platform, StyleSheet } from 'react-native';
import { ADVANCED_CONFIG } from '../types/HomeHeaderTypes';
import {
  BorderRadius,
  Spacing,
  Typography,
} from '@/shared/constants';
import { getPerfectShadow } from '@/shared/constants/perfectShadow';
import { scale } from '@/shared/constants/perfectScale';
import { useTheme } from '@/shared/hooks/useTheme';

// Removed hardcoded windowWidth - now using responsive typography

// Style factories split for max-lines-per-function compliance
export const createContainerStyles = (
  colors: ReturnType<typeof useTheme>['colors']
) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.neutral[0], // Sfondo bianco per continuità
      overflow: 'hidden',
    },
    headerSection: {
      paddingVertical: Spacing[1],
      paddingHorizontal: ADVANCED_CONFIG.headerSection.paddingHorizontal,
      minHeight: ADVANCED_CONFIG.headerSection.minHeight,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    gradientBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.05,
    },
    textContainer: {
      alignItems: 'center',
      zIndex: 2,
    },
  });

export const createTextStyles = (
  colors: ReturnType<typeof useTheme>['colors']
) =>
  StyleSheet.create({
    title: {
      color: colors.neutral[900],
      fontWeight: Typography.weights.bold,
      fontFamily: Typography.families.heading,
      textAlign: 'center',
      lineHeight: scale(37),
      letterSpacing: scale(-0.8),
      marginBottom: Spacing[4],
    },
    subtitle: {
      color: colors.neutral[600],
      fontWeight: Typography.weights.regular,
      textAlign: 'center',
      lineHeight: scale(24),
      letterSpacing: scale(0.2),
      paddingHorizontal: Spacing[6],
    },
  });

export const createImageStyles = (
  colors: ReturnType<typeof useTheme>['colors']
) =>
  StyleSheet.create({
    imageSection: {
      height: ADVANCED_CONFIG.imageSection.height * 1.0,
      width: '100%',
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      marginTop: Spacing[1],
      marginBottom: Spacing[3],
      borderRadius: scale(24),
      ...(Platform.OS === 'ios' ? getPerfectShadow('strong') : {}),
    },

    imageContainer: {
      width: '100%',
      height: '100%',
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: colors.neutral[400],
          shadowOffset: { width: 0, height: scale(4) },
          shadowOpacity: 0.08,
          shadowRadius: scale(12),
        },
        android: {},
      }),
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover', // Copre l'intero container senza distorsioni
    },
    imageGradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    // Utility style per flex: 1
    flexOne: {
      flex: 1,
    },
  });
/* eslint-enable react-native/no-unused-styles */
