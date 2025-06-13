import { Platform, StyleSheet } from 'react-native';

import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from '../../../shared/constants/designTokens';

// ===================================================================
// CONTAINER STYLES
// ===================================================================
export const createContainerStyles = () =>
  StyleSheet.create({
    container: {
      marginHorizontal: Spacing[6],
      marginVertical: Spacing[4],
    },
    compactContainer: {
      marginHorizontal: Spacing[4],
      marginVertical: Spacing[3],
    },
    standardContainer: {
      marginHorizontal: Spacing[6],
      marginVertical: Spacing[4],
    },
    largeContainer: {
      marginHorizontal: Spacing[8],
      marginVertical: Spacing[6],
    },
  });

// ===================================================================
// BASE BUTTON STYLES
// ===================================================================
export const createBaseButtonStyles = () =>
  StyleSheet.create({
    baseButton: {
      borderRadius: BorderRadius['2xl'],
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    compactButton: {
      paddingVertical: Spacing[4],
      paddingHorizontal: Spacing[6],
      minHeight: 56,
    },
    standardButton: {
      paddingVertical: Spacing[6],
      paddingHorizontal: Spacing[8],
      minHeight: 72,
    },
    largeButton: {
      paddingVertical: Spacing[8],
      paddingHorizontal: Spacing[10],
      minHeight: 88,
    },
    disabledButton: {
      opacity: 0.6,
    },
  });

// ===================================================================
// VARIANT BUTTON STYLES
// ===================================================================
export const createVariantButtonStyles = (colors: typeof Colors) =>
  StyleSheet.create({
    primaryButton: {
      backgroundColor: colors.primary[500],
      borderWidth: 0,
      ...Platform.select({
        ios: Shadows.primary,
        android: {
          shadowColor: colors.primary[500],
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 4,
        },
      }),
    },
    secondaryButton: {
      backgroundColor: colors.neutral[0],
      borderWidth: 2,
      borderColor: colors.primary[500],
    },
    gradientButton: {
      borderWidth: 0,
      position: 'relative',
      ...Platform.select({
        ios: Shadows.xl,
        android: {
          shadowColor: colors.neutral[900],
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.18,
          shadowRadius: 16,
          elevation: 6,
        },
      }),
    },
    shadowBase: {
      ...Platform.select({
        ios: Shadows.md,
        android: {
          shadowColor: colors.neutral[900],
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 6,
          elevation: 3,
        },
      }),
    },
  });

// ===================================================================
// COMBINED BUTTON STYLES
// ===================================================================
export const createButtonStyles = (colors: typeof Colors) => {
  const baseStyles = createBaseButtonStyles();
  const variantStyles = createVariantButtonStyles(colors);

  return {
    ...baseStyles,
    ...variantStyles,
    baseButton: {
      ...baseStyles.baseButton,
      ...variantStyles.shadowBase,
    },
  };
};

// ===================================================================
// CONTENT STYLES
// ===================================================================
export const createContentStyles = (colors: typeof Colors) =>
  StyleSheet.create({
    content: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    description: {
      fontWeight: Typography.weights.medium,
      textAlign: 'center',
      marginBottom: Spacing[2],
      includeFontPadding: false,
    },
    title: {
      fontWeight: Typography.weights.bold,
      textAlign: 'center',
      marginBottom: Spacing[1],
      letterSpacing: Typography.letterSpacing.wide,
      includeFontPadding: false,
    },
    subtitle: {
      fontWeight: Typography.weights.regular,
      textAlign: 'center',
      includeFontPadding: false,
    },
    shimmerOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.neutral[0],
      opacity: 0.1,
      borderRadius: BorderRadius.sm,
    },
    accentLine: {
      height: 2,
      backgroundColor: colors.primary[300],
      marginVertical: Spacing[2],
      borderRadius: BorderRadius.full,
      overflow: 'hidden',
    },
  });

// ===================================================================
// SIZE TYPOGRAPHY STYLES
// ===================================================================
export const createSizeTypographyStyles = () =>
  StyleSheet.create({
    compactDescription: {
      fontSize: Typography.sizes.sm,
      lineHeight: Typography.lineHeights.relaxed,
    },
    standardDescription: {
      fontSize: Typography.sizes.base,
      lineHeight: Typography.lineHeights.relaxed,
    },
    largeDescription: {
      fontSize: Typography.sizes.lg,
      lineHeight: Typography.lineHeights.relaxed,
    },
    compactTitle: {
      fontSize: Typography.sizes.xl,
      lineHeight: Typography.lineHeights.tight,
    },
    standardTitle: {
      fontSize: Typography.sizes['2xl'],
      lineHeight: Typography.lineHeights.tight,
    },
    largeTitle: {
      fontSize: Typography.sizes['3xl'],
      lineHeight: Typography.lineHeights.tight,
    },
    compactSubtitle: {
      fontSize: Typography.sizes.xs,
      lineHeight: Typography.lineHeights.normal,
    },
    standardSubtitle: {
      fontSize: Typography.sizes.sm,
      lineHeight: Typography.lineHeights.normal,
    },
    largeSubtitle: {
      fontSize: Typography.sizes.base,
      lineHeight: Typography.lineHeights.normal,
    },
  });

// ===================================================================
// COLOR TYPOGRAPHY STYLES
// ===================================================================
export const createColorTypographyStyles = (colors: typeof Colors) =>
  StyleSheet.create({
    primaryDescription: { color: colors.neutral[600] },
    secondaryDescription: { color: colors.neutral[700] },
    gradientDescription: { color: colors.neutral[600] },
    primaryTitle: { color: colors.neutral[0] },
    secondaryTitle: { color: colors.primary[600] },
    gradientTitle: { color: colors.neutral[0] },
    primarySubtitle: { color: colors.neutral[100] },
    secondarySubtitle: { color: colors.neutral[500] },
    gradientSubtitle: { color: colors.neutral[100] },
  });

// ===================================================================
// COMBINED TYPOGRAPHY STYLES
// ===================================================================
export const createTypographyStyles = (colors: typeof Colors) => {
  const sizeStyles = createSizeTypographyStyles();
  const colorStyles = createColorTypographyStyles(colors);

  return {
    ...sizeStyles,
    ...colorStyles,
  };
};
