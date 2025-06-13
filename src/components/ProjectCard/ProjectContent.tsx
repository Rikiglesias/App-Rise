import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  BorderRadius,
  Spacing,
  Typography,
} from '../../shared/constants/designTokens';
import { useTheme } from '../../shared/hooks/useTheme';

import type { ProjectContentProps } from './types';

export const ProjectContent: React.FC<ProjectContentProps> = ({
  description,
  impact,
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    description: {
      fontSize: Typography.sizes.base,
      color: colors.neutral[700],
      lineHeight: Typography.sizes.base * 1.4,
      marginBottom: Spacing[4],
    },
    impactContainer: {
      backgroundColor: colors.primary[50],
      borderRadius: BorderRadius.lg,
      padding: Spacing[4],
      marginBottom: Spacing[4],
      borderWidth: 1,
      borderColor: colors.primary[200],
    },
    impactLabel: {
      fontSize: Typography.sizes.xs,
      fontWeight: Typography.weights.bold,
      color: colors.primary[700],
      marginBottom: Spacing[1],
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    impactText: {
      fontSize: Typography.sizes.sm,
      color: colors.primary[800],
      fontWeight: Typography.weights.medium,
    },
  });

  return (
    <>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.impactContainer}>
        <Text style={styles.impactLabel}>Impatto</Text>
        <Text style={styles.impactText}>{impact}</Text>
      </View>
    </>
  );
};
