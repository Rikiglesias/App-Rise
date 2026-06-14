import React from 'react';
import { StyleSheet } from 'react-native';

import type { ProjectProgressProps } from './types';
import { PerfectText } from '@/components/ui/PerfectText';
import { PerfectContainer } from '@/components/ui/PerfectContainer';
import { BorderRadius, PerfectSpacing } from '@/shared/constants';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

export const ProjectProgress: React.FC<ProjectProgressProps> = ({
  progress,
  statusColor,
}) => {
  const colors = useThemeColors();

  // Clamp [0,100]: un progress fuori range romperebbe la width della barra
  // (es. "150%" sfora, "-10%" è invalido) e mostrerebbe una percentuale assurda.
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const styles = StyleSheet.create({
    progressContainer: {
      marginTop: PerfectSpacing.sm,
    },
    progressLabel: {
      color: colors.neutral[600],
      marginBottom: PerfectSpacing.sm,
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
      width: `${clampedProgress}%`,
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
        Progresso: {clampedProgress}%
      </PerfectText>
      <PerfectContainer style={styles.progressBar}>
        <PerfectContainer style={styles.progressFill} />
      </PerfectContainer>
    </PerfectContainer>
  );
};
