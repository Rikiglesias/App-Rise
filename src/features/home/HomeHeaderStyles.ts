import { StyleSheet } from 'react-native';
import { ADVANCED_CONFIG } from './types/HomeHeaderTypes';
import { Typography, PerfectSpacing } from '@/shared/constants';
import { scale, scaleSpacing } from '@/shared/constants/perfectScale';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
export const createContainerStyles = (
  colors: ReturnType<typeof useThemeColors>
) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.neutral[0],
      overflow: 'visible',
    },
    headerSection: {
      paddingVertical: PerfectSpacing.xs,
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
      zIndex: 1,
    },
  });

export const createTextStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    title: {
      color: colors.neutral[900],
      fontWeight: Typography.weights.bold,
      fontFamily: Typography.families.heading,
      textAlign: 'center',
      lineHeight: scale(37),
      letterSpacing: scale(-0.8),
      marginBottom: PerfectSpacing.base,
    },
    subtitle: {
      color: colors.neutral[600],
      fontWeight: Typography.weights.regular,
      textAlign: 'center',
      lineHeight: scale(24),
      letterSpacing: scale(0.2),
      paddingHorizontal: PerfectSpacing.lg,
    },
  });

export const createImageStyles = () =>
  StyleSheet.create({
    imageSection: {
      height: ADVANCED_CONFIG.imageSection.height * 1.0,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginTop: -scaleSpacing(32),
      marginBottom: scaleSpacing(8),
      paddingHorizontal: PerfectSpacing.base,
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    imageGradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
  });
