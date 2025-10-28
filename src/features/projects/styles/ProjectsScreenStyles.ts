import { useMemo } from 'react';
import { Platform, StyleSheet } from 'react-native';
import {
  BorderRadius,
  Spacing,
  Typography,
} from '../../../shared/constants/designTokens';
import { TypographyTokens } from '../../../shared/constants/responsiveSystem';
import { useTheme } from '../../../shared/hooks/useTheme';
import { useResponsive } from '../../../shared/hooks/useResponsive';

// Custom Hook for Projects Screen Styles
export const useProjectsScreenStyles = () => {
  const { colors } = useTheme();
  const { scaleFont } = useResponsive();

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
          paddingTop: Spacing[8],
          paddingBottom: Spacing[6],
          paddingHorizontal: Spacing[6],
        },
        headerTitle: {
          fontWeight: Typography.weights.extrabold,
          color: colors.neutral[0],
          textAlign: 'center',
          marginBottom: Spacing[2],
        },
        headerSubtitle: {
          color: colors.primary[100],
          textAlign: 'center',
          lineHeight: TypographyTokens.styles.body.medium * 1.4,
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
          fontWeight: Typography.weights.bold,
          color: colors.primary[600],
          marginBottom: Spacing[1],
        },
        statLabel: {
          color: colors.neutral[600],
          textAlign: 'center',
          fontWeight: Typography.weights.medium,
        },
        content: {
          paddingHorizontal: Spacing[4],
          paddingBottom: Platform.OS === 'android' ? Spacing[20] : Spacing[8], // ANDROID: Spacing[20] per evitare sovrapposizione bottom navigation / iOS: Spacing[8] normale
        },
        sectionTitle: {
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
          fontSize: scaleFont(48),
          marginBottom: Spacing[4],
        },
        emptyStateText: {
          color: colors.neutral[600],
          textAlign: 'center',
        },
      }),

    [colors, scaleFont]
  );
};
