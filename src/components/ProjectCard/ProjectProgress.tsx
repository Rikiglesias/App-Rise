import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PerfectText } from '../ui/PerfectText';

import { BorderRadius, Spacing } from '../../shared/constants';
import { TypographyTokens } from '../../shared/constants/responsiveSystem';
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
      fontSize: TypographyTokens.styles.label.small,
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
      <PerfectText
        size={12}
        lines={2}
        fontWeight="400"
        style={styles.progressLabel}
      >
        Progresso: {progress}%
      </PerfectText>
      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>
    </View>
  );
};
