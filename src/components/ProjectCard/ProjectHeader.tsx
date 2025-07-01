import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import {
  BorderRadius,
  Spacing,
  Typography,
} from '../../shared/constants/designTokens';
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
      fontSize: Typography.sizes.lg,
      fontWeight: Typography.weights.bold,
      color: colors.neutral[900],
      marginBottom: Spacing[1],
      lineHeight: Typography.sizes.lg * 1.2,
    },
    location: {
      fontSize: Typography.sizes.sm,
      color: colors.neutral[500],
      fontWeight: Typography.weights.medium,
    },
    statusBadge: {
      backgroundColor: statusColor,
      paddingHorizontal: Spacing[3],
      paddingVertical: Spacing[1],
      borderRadius: BorderRadius.full,
      minWidth: 80,
      alignItems: 'center',
    },
    statusText: {
      fontSize: Typography.sizes.xs,
      fontWeight: Typography.weights.bold,
      color: colors.neutral[0],
    },
  });

  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.location}>{location}</Text>
      </View>
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>
    </View>
  );
};
