import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import {
  BorderRadius,
  Spacing,
  Typography,
} from '../../shared/constants/designTokens';
import { useTheme } from '../../shared/hooks/useTheme';

import type { ProjectProgressProps } from './types';

export const ProjectProgress: React.FC<ProjectProgressProps> = ({
  progress,
  statusColor,
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    progressContainer: {
      marginTop: Spacing[2],
    },
    progressLabel: {
      fontSize: Typography.sizes.xs,
      color: colors.neutral[600],
      marginBottom: Spacing[2],
      textAlign: 'center',
    },
    progressBar: {
      height: 6,
      backgroundColor: colors.neutral[200],
      borderRadius: BorderRadius.full,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: statusColor,
      borderRadius: BorderRadius.full,
      width: `${progress}%`,
    },
  });

  return (
    <View style={styles.progressContainer}>
      <Text style={styles.progressLabel}>Progresso: {progress}%</Text>
      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>
    </View>
  );
};
