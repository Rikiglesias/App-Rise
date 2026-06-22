import React from 'react';
import { StyleSheet } from 'react-native';

import type { ProjectContentProps } from './types';
import { PerfectText, PerfectContainer } from '@/components/ui';
import { PerfectSpacing, Typography } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { useTranslation } from '@/shared/hooks/useTranslation';

export const ProjectContent: React.FC<ProjectContentProps> = ({
  description,
  impact,
}) => {
  const colors = useThemeColors();
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    description: {
      color: colors.neutral[700],
      marginBottom: PerfectSpacing.base,
    },
    impactContainer: {
      backgroundColor: colors.primary[50],
      borderRadius: scale(8),
      padding: PerfectSpacing.base,
      marginBottom: PerfectSpacing.base,
      borderWidth: scale(1),
      borderColor: colors.primary[200],
    },
    impactLabel: {
      fontWeight: Typography.weights.bold,
      color: colors.primary[700],
      marginBottom: PerfectSpacing.xs,
      textTransform: 'uppercase',
      letterSpacing: scale(0.5),
    },
    impactText: {
      color: colors.primary[800],
      fontWeight: Typography.weights.medium,
    },
  });

  return (
    <>
      <PerfectText
        size={15}
        lines={3}
        fontWeight="400"
        immunity={true}
        style={styles.description}
      >
        {description}
      </PerfectText>
      <PerfectContainer style={styles.impactContainer}>
        <PerfectText
          size={12}
          lines={1}
          fontWeight="400"
          immunity={true}
          style={styles.impactLabel}
        >
          {t('projects.impact')}
        </PerfectText>
        <PerfectText
          size={14}
          lines={1}
          fontWeight="400"
          immunity={true}
          style={styles.impactText}
        >
          {impact}
        </PerfectText>
      </PerfectContainer>
    </>
  );
};
