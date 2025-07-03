import type { DimensionValue } from 'react-native';
import { StyleSheet } from 'react-native';
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from '../../../shared/constants/designTokens';
import { TypographyTokens } from '../../../shared/constants/responsiveSystem';
import { getLayoutConfig } from '../types/HomeActionsTypes';

// ===================================================================
// STYLE FACTORIES - Split for max-lines-per-function compliance
// ===================================================================
export const createContainerStyles = () =>
  StyleSheet.create({
    bentoContainer: {},
    headerSection: {
      alignItems: 'center',
      marginBottom: Spacing[6],
    },
    bentoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: getLayoutConfig().justifyContent,
      gap: getLayoutConfig().gap,
    },
  });

export const createTypographyStyles = (colors: typeof Colors) =>
  StyleSheet.create({
    bentoTitle: {
      fontSize: TypographyTokens.styles.headline.medium,
      fontWeight: Typography.weights.black,
      color: colors.primary[800],
      textAlign: 'center',
      marginBottom: Spacing[2],
      letterSpacing: Typography.letterSpacing.tight,
      lineHeight:
        Typography.lineHeights.tight * TypographyTokens.styles.headline.medium,
    },
    bentoSubtitle: {
      fontSize: TypographyTokens.styles.body.medium,
      fontWeight: Typography.weights.medium,
      color: colors.neutral[600],
      textAlign: 'center',
      lineHeight:
        Typography.lineHeights.normal * TypographyTokens.styles.body.medium,
      letterSpacing: Typography.letterSpacing.normal,
    },
  });

export const createCardBaseStyles = (colors: typeof Colors) => {
  const layout = getLayoutConfig();
  return StyleSheet.create({
    bentoCard: {
      width: layout.cardWidth as DimensionValue,
      minHeight: 120,
    },
    cardSurface: {
      flex: 1,
      borderRadius: BorderRadius.xl,
      backgroundColor: colors.neutral[0],
      shadowColor: colors.neutral[900],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    cardContentWrapper: {
      flex: 1,
      borderRadius: BorderRadius.xl,
      overflow: 'hidden',
    },
    gradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.04,
    },
    cardContent: {
      flex: 1,
      padding: Spacing[4],
      position: 'relative',
      zIndex: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing[2],
    },
  });
};

// Split into smaller functions for max-lines-per-function compliance
export const createIconStyles = (
  colors: typeof Colors,
  scaleFont: (size: number) => number
) =>
  StyleSheet.create({
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: BorderRadius.lg,
      backgroundColor: colors.neutral[100],
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing[3],
      borderWidth: 1,
      borderColor: colors.neutral[200],
    },
    iconText: {
      fontSize: scaleFont(16),
      lineHeight: 18,
    },
  });

export const createTextStyles = (colors: typeof Colors) =>
  /* eslint-disable react-native/no-unused-styles */
  StyleSheet.create({
    textContainer: {
      flex: 1,
    },
    cardTitle: {
      fontSize: TypographyTokens.styles.body.medium,
      fontWeight: Typography.weights.bold,
      color: colors.neutral[900],
      marginBottom: 1,
      letterSpacing: Typography.letterSpacing.tight,
      lineHeight:
        Typography.lineHeights.tight * TypographyTokens.styles.body.medium,
    },
    cardSubtitle: {
      fontSize: TypographyTokens.styles.body.small,
      fontWeight: Typography.weights.semibold,
      color: colors.neutral[500],
      textTransform: 'uppercase',
      letterSpacing: Typography.letterSpacing.wide,
    },
    cardDescription: {
      fontSize: TypographyTokens.styles.body.small,
      fontWeight: Typography.weights.regular,
      color: colors.neutral[600],
      lineHeight:
        Typography.lineHeights.snug * TypographyTokens.styles.body.small,
      letterSpacing: Typography.letterSpacing.normal,
    },
  });
/* eslint-enable react-native/no-unused-styles */

export const createOverlayStyles = (colors: typeof Colors) =>
  StyleSheet.create({
    accentBorder: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 2,
      zIndex: 3,
    },
    pressOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.neutral[900],
      opacity: 0,
      zIndex: 1,
    },
  });

export const createCardContentStyles = (
  colors: typeof Colors,
  scaleFont: (size: number) => number
) => ({
  ...createIconStyles(colors, scaleFont),
  ...createTextStyles(colors),
  ...createOverlayStyles(colors),
});

export const createCardStyles = (
  colors: typeof Colors,
  scaleFont: (size: number) => number
) => ({
  ...createCardBaseStyles(colors),
  ...createCardContentStyles(colors, scaleFont),
});
