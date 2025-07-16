import React from 'react';
import { StyleSheet, View } from 'react-native';

import { FormattedText } from '../ui';

import { BorderRadius, Spacing, Typography } from '../../shared/constants';
import { TypographyTokens } from '../../shared/constants/responsiveSystem';
import { useTheme } from '../../shared/hooks/useTheme';

import type { ProjectContentProps } from './types';

export const ProjectContent: React.FC<ProjectContentProps> = ({
  description,
  impact,
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    description: {
      fontSize: TypographyTokens.styles.body.medium,
      color: colors.neutral[700],
      lineHeight: TypographyTokens.styles.body.medium * 1.4,
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
      fontSize: TypographyTokens.styles.label.small,
      fontWeight: Typography.weights.bold,
      color: colors.primary[700],
      marginBottom: Spacing[1],
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    impactText: {
      fontSize: TypographyTokens.styles.body.small,
      color: colors.primary[800],
      fontWeight: Typography.weights.medium,
    },
  });

  return (
    <>
      <FormattedText variant="body-medium" style={styles.description}>
        {description}
      </FormattedText>
      <View style={styles.impactContainer}>
        <FormattedText variant="label-small" style={styles.impactLabel}>
          Impatto
        </FormattedText>
        <FormattedText variant="body-medium" style={styles.impactText}>
          {impact}
        </FormattedText>
      </View>
    </>
  );
};
