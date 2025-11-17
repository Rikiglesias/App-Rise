import React from 'react';
import { StyleSheet } from 'react-native';

import type { ProjectHeaderProps } from './types';
import { PerfectText, PerfectContainer } from '@/components/ui';
import { PerfectSpacing, Typography } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useTheme } from '@/shared/hooks/useTheme';

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  title,
  location,
  statusColor,
  statusText,
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: PerfectSpacing.base,
    },
    titleContainer: {
      flex: 1,
      marginRight: PerfectSpacing.md,
    },
    title: {
      fontWeight: Typography.weights.bold,
      color: colors.neutral[900],
      marginBottom: PerfectSpacing.xs,
    },
    location: {
      color: colors.neutral[500],
      fontWeight: Typography.weights.medium,
    },
    statusBadge: {
      backgroundColor: statusColor,
      paddingHorizontal: PerfectSpacing.md,
      paddingVertical: PerfectSpacing.xs,
      borderRadius: scale(8),
      minWidth: scale(80),
      alignItems: 'center',
    },
    statusText: {
      fontWeight: Typography.weights.bold,
      color: colors.neutral[0],
    },
  });

  return (
    <PerfectContainer style={styles.header}>
      <PerfectContainer style={styles.titleContainer}>
        <PerfectText
          size={18}
          lines={1}
          fontWeight="400"
          immunity={true}
          style={styles.title}
        >
          {title}
        </PerfectText>
        <PerfectText
          size={14}
          lines={1}
          fontWeight="400"
          immunity={true}
          style={styles.location}
        >
          {location}
        </PerfectText>
      </PerfectContainer>
      <PerfectContainer style={styles.statusBadge}>
        <PerfectText
          size={12}
          lines={1}
          fontWeight="400"
          immunity={true}
          style={styles.statusText}
        >
          {statusText}
        </PerfectText>
      </PerfectContainer>
    </PerfectContainer>
  );
};
