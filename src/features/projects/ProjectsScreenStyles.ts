import { useMemo } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { BorderRadius, Typography } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

export const useProjectsScreenStyles = () => {
  const colors = useThemeColors();

  return useMemo(
    () =>
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
          paddingTop: PerfectSpacing.xl,
          paddingBottom: PerfectSpacing.lg,
          paddingHorizontal: PerfectSpacing.lg,
        },
        headerTitle: {
          fontWeight: Typography.weights.extrabold,
          color: colors.neutral[0],
          textAlign: 'center',
          marginBottom: PerfectSpacing.sm,
        },
        headerSubtitle: {
          color: colors.primary[100],
          textAlign: 'center',
          lineHeight: scale(20),
        },
        statsSurface: {
          borderRadius: BorderRadius.xl,
          backgroundColor: colors.neutral[0],
          padding: PerfectSpacing.lg,
          shadowColor: colors.neutral[900],
          shadowOffset: { width: 0, height: scale(4) },
          shadowOpacity: 0.08,
          shadowRadius: scale(12),
          borderWidth: scale(1),
          borderColor: colors.neutral[100],
        },
        statsTitle: {
          fontWeight: Typography.weights.bold,
          color: colors.neutral[900],
          textAlign: 'center',
          marginBottom: PerfectSpacing.base,
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
          fontWeight: Typography.weights.bold,
          color: colors.primary[600],
          marginBottom: PerfectSpacing.xs,
        },
        statLabel: {
          color: colors.neutral[600],
          textAlign: 'center',
          fontWeight: Typography.weights.medium,
        },
        content: {
          paddingHorizontal: PerfectSpacing.base,
          paddingBottom:
            Platform.OS === 'android'
              ? PerfectSpacing['5xl']
              : PerfectSpacing.xl,
        },
        sectionTitle: {
          fontWeight: Typography.weights.bold,
          color: colors.neutral[900],
          marginBottom: PerfectSpacing.sm,
          paddingHorizontal: PerfectSpacing.sm,
        },
        emptyState: {
          alignItems: 'center',
          paddingVertical: PerfectSpacing.xl,
        },
        emptyStateIcon: {
          marginBottom: PerfectSpacing.base,
        },
        emptyStateText: {
          color: colors.neutral[600],
          textAlign: 'center',
        },
      }),

    [colors]
  );
};
