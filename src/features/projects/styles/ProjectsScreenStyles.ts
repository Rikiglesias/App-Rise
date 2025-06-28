import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import {
  BorderRadius,
  Spacing,
  Typography,
} from '../../../shared/constants/designTokens';
import { useTheme } from '../../../shared/hooks/useTheme';

// Custom Hook for Projects Screen Styles
export const useProjectsScreenStyles = () => {
  const { colors } = useTheme();

  return useMemo(
    () =>
      /* eslint-disable react-native/no-unused-styles */
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.neutral[50],
        },
        scrollView: {
          flex: 1,
        },
        header: {
          backgroundColor: colors.primary[500],
          paddingTop: Spacing[8],
          paddingBottom: Spacing[6],
          paddingHorizontal: Spacing[6],
        },
        headerTitle: {
          fontSize: Typography.sizes['3xl'],
          fontWeight: Typography.weights.extrabold,
          color: colors.neutral[0],
          textAlign: 'center',
          marginBottom: Spacing[2],
        },
        headerSubtitle: {
          fontSize: Typography.sizes.base,
          color: colors.primary[100],
          textAlign: 'center',
          lineHeight: Typography.sizes.base * 1.4,
        },
        statsSurface: {
          borderRadius: BorderRadius.xl,
          backgroundColor: colors.neutral[0],
          padding: Spacing[6],
          shadowColor: colors.neutral[900],
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          borderWidth: 1,
          borderColor: colors.neutral[100],
        },
        statsTitle: {
          fontSize: Typography.sizes.lg,
          fontWeight: Typography.weights.bold,
          color: colors.neutral[900],
          textAlign: 'center',
          marginBottom: Spacing[4],
        },
        statsRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        statItem: {
          alignItems: 'center',
          flex: 1,
        },
        statNumber: {
          fontSize: Typography.sizes['2xl'],
          fontWeight: Typography.weights.bold,
          color: colors.primary[600],
          marginBottom: Spacing[1],
        },
        statLabel: {
          fontSize: Typography.sizes.xs,
          color: colors.neutral[600],
          textAlign: 'center',
          fontWeight: Typography.weights.medium,
        },
        content: {
          paddingHorizontal: Spacing[4],
          paddingBottom: Spacing[8],
        },
        sectionTitle: {
          fontSize: Typography.sizes.xl,
          fontWeight: Typography.weights.bold,
          color: colors.neutral[900],
          marginBottom: Spacing[2],
          paddingHorizontal: Spacing[2],
        },
        emptyState: {
          alignItems: 'center',
          paddingVertical: Spacing[8],
        },
        emptyStateIcon: {
          fontSize: 48,
          marginBottom: Spacing[4],
        },
        emptyStateText: {
          fontSize: Typography.sizes.base,
          color: colors.neutral[600],
          textAlign: 'center',
        },
      }),
    /* eslint-enable react-native/no-unused-styles */
    [colors]
  );
};
