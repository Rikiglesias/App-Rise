import React from 'react';
import { StyleSheet, View } from 'react-native';

import { FormattedText } from '../ui';

import { BorderRadius, Spacing, Typography } from '../../shared/constants';
import { TypographyTokens } from '../../shared/constants/responsiveSystem';
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
      fontSize: TypographyTokens.styles.body.large,
      fontWeight: Typography.weights.bold,
      color: colors.neutral[900],
      marginBottom: Spacing[1],
      lineHeight: TypographyTokens.styles.body.large * 1.2,
    },
    location: {
      fontSize: TypographyTokens.styles.body.small,
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
      fontSize: TypographyTokens.styles.label.small,
      fontWeight: Typography.weights.bold,
      color: colors.neutral[0],
    },
  });

  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <FormattedText variant="body-large" style={styles.title}>
          {title}
        </FormattedText>
        <FormattedText variant="body-medium" style={styles.location}>
          {location}
        </FormattedText>
      </View>
      <View style={styles.statusBadge}>
        <FormattedText variant="label-small" style={styles.statusText}>
          {statusText}
        </FormattedText>
      </View>
    </View>
  );
};
