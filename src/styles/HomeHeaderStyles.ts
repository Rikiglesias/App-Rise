import { Dimensions, StyleSheet } from 'react-native';
import {
  BorderRadius,
  Spacing,
  Typography,
} from '../shared/constants/designTokens';
import { useTheme } from '../shared/hooks/useTheme';
import { ADVANCED_CONFIG } from '../types/HomeHeaderTypes';

const { width: windowWidth } = Dimensions.get('window');

// Style factories split for max-lines-per-function compliance
export const createContainerStyles = (
  colors: ReturnType<typeof useTheme>['colors']
) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.neutral[50],
      overflow: 'hidden',
    },
    headerSection: {
      paddingVertical: ADVANCED_CONFIG.headerSection.paddingVertical,
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
      fontSize: windowWidth < 375 ? 32 : 36,
      fontWeight: Typography.weights.bold,
      fontFamily: Typography.families.heading,
      textAlign: 'center',
      lineHeight: windowWidth < 375 ? 38 : 42,
      letterSpacing: -0.8,
      marginBottom: Spacing[4],
    },
    subtitle: {
      color: colors.neutral[600],
      fontSize: Typography.sizes.lg,
      fontWeight: Typography.weights.regular,
      textAlign: 'center',
      lineHeight: Typography.lineHeights.relaxed * Typography.sizes.lg,
      letterSpacing: 0.2,
      paddingHorizontal: Spacing[6],
    },
  });

export const createImageStyles = (
  colors: ReturnType<typeof useTheme>['colors']
) =>
  /* eslint-disable react-native/no-unused-styles */
  StyleSheet.create({
    // Tutti questi stili sono utilizzati nel componente HeaderImageSection
    // ma ESLint non riesce a rilevarlo perché vengono passati tramite props
    imageSection: {
      height: ADVANCED_CONFIG.imageSection.height,
      width: '100%',
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      marginVertical: Spacing[4],
    },
    imageContainer: {
      width: '100%',
      height: '100%',
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
      shadowColor: colors.neutral[400],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
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
    // Stile estratto per evitare inline style warning
    flexOne: {
      flex: 1,
    },
  });
/* eslint-enable react-native/no-unused-styles */

export const createMissionStyles = (
  colors: ReturnType<typeof useTheme>['colors']
) =>
  /* eslint-disable react-native/no-unused-styles */
  StyleSheet.create({
    // Tutti questi stili sono utilizzati nel componente HeaderMissionSection
    // ma ESLint non riesce a rilevarlo perché vengono passati tramite props
    missionSection: {
      paddingHorizontal: Spacing[4],
      paddingVertical: Spacing[6],
    },
    missionCard: {
      backgroundColor: colors.neutral[0],
      borderRadius: BorderRadius.lg,
      padding: Spacing[4],
      shadowColor: colors.neutral[400],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.neutral[100],
    },
    missionTitle: {
      fontSize: Typography.sizes.xl,
      fontWeight: Typography.weights.bold,
      color: colors.neutral[900],
      textAlign: 'center',
      marginBottom: Spacing[3],
    },
    missionDescription: {
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.regular,
      color: colors.neutral[700],
      textAlign: 'center',
      lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
      marginBottom: Spacing[4],
    },
    missionStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: Typography.sizes['2xl'],
      fontWeight: Typography.weights.bold,
      color: colors.primary[600],
      marginBottom: Spacing[1],
    },
    statLabel: {
      fontSize: Typography.sizes.sm,
      fontWeight: Typography.weights.medium,
      color: colors.neutral[600],
      textAlign: 'center',
    },
  });
/* eslint-enable react-native/no-unused-styles */
