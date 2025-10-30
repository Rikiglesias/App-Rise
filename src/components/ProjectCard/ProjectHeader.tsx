import React from 'react';
import { StyleSheet } from 'react-native';

import { PerfectText, PerfectContainer } from '../ui';

import { Spacing, Typography } from '../../shared/constants';
import { useTheme } from '../../shared/hooks/useTheme';

import type { ProjectHeaderProps } from './types';

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
      marginBottom: Spacing[4],
    },
    titleContainer: {
      flex: 1,
      marginRight: Spacing[3],
    },
    title: {
      fontWeight: Typography.weights.bold,
      color: colors.neutral[900],
      marginBottom: Spacing[1],
    },
    location: {
      color: colors.neutral[500],
      fontWeight: Typography.weights.medium,
    },
    statusBadge: {
      backgroundColor: statusColor,
      paddingHorizontal: Spacing[3],
      paddingVertical: Spacing[1],
      borderRadius: 8,
      minWidth: 80,
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
