import React from 'react';
import { StyleSheet } from 'react-native';

import { PerfectText, PerfectContainer } from '../ui';

import { Spacing, Typography } from '../../shared/constants';
import { useTheme } from '../../shared/hooks/useTheme';

import type { ProjectContentProps } from './types';

export const ProjectContent: React.FC<ProjectContentProps> = ({
  description,
  impact,
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    description: {
      color: colors.neutral[700],
      marginBottom: Spacing[4],
    },
    impactContainer: {
      backgroundColor: colors.primary[50],
      borderRadius: 8,
      padding: Spacing[4],
      marginBottom: Spacing[4],
      borderWidth: 1,
      borderColor: colors.primary[200],
    },
    impactLabel: {
      fontWeight: Typography.weights.bold,
      color: colors.primary[700],
      marginBottom: Spacing[1],
      textTransform: 'uppercase',
      letterSpacing: 0.5,
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
          Impatto
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
