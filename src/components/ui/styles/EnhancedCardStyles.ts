import { Platform, StyleSheet } from 'react-native';
import {
  Accessibility,
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from '../../../shared/constants';
import { TypographyTokens } from '../../../shared/constants/responsiveSystem';

/* eslint-disable react-native/no-unused-styles */
export const enhancedCardStyles = StyleSheet.create({
  baseCard: {
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing[4],
    overflow: 'hidden',
    ...Platform.select({
      ios: Shadows.sm,
      android: Shadows.sm,
    }),
  },

  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconSection: {
    marginRight: Spacing[4],
  },

  iconContainer: {
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: Shadows.xs,
      android: Shadows.xs,
    }),
  },

  textSection: {
    flex: 1,
    paddingRight: Spacing[2],
  },

  arrowSection: {
    justifyContent: 'center',
    alignItems: 'center',
    ...Accessibility.touchTarget,
  },

  compactCard: {
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
  },

  standardCard: {
    paddingVertical: Spacing[5],
    paddingHorizontal: Spacing[6],
  },

  largeCard: {
    paddingVertical: Spacing[6],
    paddingHorizontal: Spacing[8],
  },

  // Icon Styles
  icon: {
    textAlign: 'center',
  },

  compactIcon: {
    fontSize: TypographyTokens.styles.body.large,
  },

  standardIcon: {
    fontSize: TypographyTokens.styles.title.large,
  },

  largeIcon: {
    fontSize: TypographyTokens.styles.headline.small,
  },

  compactIconContainer: {
    width: 32,
    height: 32,
  },

  standardIconContainer: {
    width: 48,
    height: 48,
  },

  largeIconContainer: {
    width: 56,
    height: 56,
  },

  // Typography Styles
  title: {
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing[1],
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  compactTitle: {
    fontSize: TypographyTokens.styles.body.medium,
    lineHeight:
      Typography.lineHeights.snug * TypographyTokens.styles.body.medium,
  },

  standardTitle: {
    fontSize: TypographyTokens.styles.body.large,
    lineHeight:
      Typography.lineHeights.snug * TypographyTokens.styles.body.large,
  },

  largeTitle: {
    fontSize: TypographyTokens.styles.title.medium,
    lineHeight:
      Typography.lineHeights.snug * TypographyTokens.styles.title.medium,
  },

  subtitle: {
    fontWeight: Typography.weights.medium,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  compactSubtitle: {
    fontSize: TypographyTokens.styles.label.small,
    lineHeight:
      Typography.lineHeights.normal * TypographyTokens.styles.label.small,
  },

  standardSubtitle: {
    fontSize: TypographyTokens.styles.body.small,
    lineHeight:
      Typography.lineHeights.normal * TypographyTokens.styles.body.small,
  },

  largeSubtitle: {
    fontSize: TypographyTokens.styles.body.medium,
    lineHeight:
      Typography.lineHeights.normal * TypographyTokens.styles.body.medium,
  },

  arrow: {
    fontSize: TypographyTokens.styles.body.large,
    fontWeight: Typography.weights.semibold,
  },

  // Default Variant
  defaultCard: {
    backgroundColor: Colors.neutral[0],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },

  defaultIconContainer: {
    backgroundColor: Colors.neutral[100],
  },

  defaultIcon: {
    color: Colors.neutral[700],
  },

  defaultTitle: {
    color: Colors.neutral[900],
  },

  defaultSubtitle: {
    color: Colors.neutral[600],
  },

  defaultArrow: {
    color: Colors.primary[500],
  },

  // Primary Variant
  primaryCard: {
    backgroundColor: Colors.primary[500],
    borderWidth: 0,
    ...Platform.select({
      ios: Shadows.primary,
      android: Shadows.primary,
    }),
  },

  primaryIconContainer: {
    backgroundColor: Colors.primary[600],
  },

  primaryIcon: {
    color: Colors.neutral[0],
  },

  primaryTitle: {
    color: Colors.neutral[0],
  },

  primarySubtitle: {
    color: Colors.primary[100],
  },

  primaryArrow: {
    color: Colors.neutral[0],
  },

  // Elevated Variant
  elevatedCard: {
    backgroundColor: Colors.neutral[0],
    borderWidth: 0,
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: Colors.neutral[900],
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        }
      : {}),
    ...(Platform.OS === 'android' ? { elevation: 6 } : {}),
  },

  elevatedIconContainer: {
    backgroundColor: Colors.primary[50],
  },

  elevatedIcon: {
    color: Colors.primary[600],
  },

  elevatedTitle: {
    color: Colors.neutral[900],
  },

  elevatedSubtitle: {
    color: Colors.neutral[600],
  },

  elevatedArrow: {
    color: Colors.primary[500],
  },

  // Disabled State
  disabledCard: {
    opacity: 0.6,
  },
});
