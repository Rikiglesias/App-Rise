import React from 'react';
import { StyleSheet } from 'react-native';

import type { ProjectProgressProps } from './types';
import { PerfectText } from '@/components/ui/PerfectText';
import { PerfectContainer } from '@/components/ui/PerfectContainer';
import { BorderRadius, Spacing } from '@/shared/constants';
import { useTheme } from '@/shared/hooks/useTheme';

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
    <PerfectContainer style={styles.progressContainer}>
      <PerfectText
        size={12}
        lines={2}
        fontWeight="400"
        style={styles.progressLabel}
      >
        Progresso: {progress}%
      </PerfectText>
      <PerfectContainer style={styles.progressBar}>
        <PerfectContainer style={styles.progressFill} />
      </PerfectContainer>
    </PerfectContainer>
  );
};
