import { Platform, StyleSheet } from 'react-native';
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from '../../../shared/constants';

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
      ios: Shadows.sm,
      android: Shadows.sm,
    }),
  },

  textSection: {
    flex: 1,
    paddingRight: Spacing[2],
  },

  arrowSection: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 44,
    minHeight: 44,
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
    fontSize: 16,
  },

  standardIcon: {
    fontSize: 24,
  },

  largeIcon: {
    fontSize: 20,
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
    fontSize: 14,
    lineHeight: 1.25 * 14,
  },

  standardTitle: {
    fontSize: 16,
    lineHeight: 1.25 * 16,
  },

  largeTitle: {
    fontSize: 20,
    lineHeight: 1.25 * 20,
  },

  subtitle: {
    fontWeight: Typography.weights.medium,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  compactSubtitle: {
    fontSize: 10,
    lineHeight: Typography.lineHeights.normal * 10,
  },

  standardSubtitle: {
    fontSize: 12,
    lineHeight: Typography.lineHeights.normal * 12,
  },

  largeSubtitle: {
    fontSize: 14,
    lineHeight: Typography.lineHeights.normal * 14,
  },

  arrow: {
    fontSize: 16,
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
