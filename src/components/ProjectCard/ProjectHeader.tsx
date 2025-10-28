import React from 'react';
import { StyleSheet, View } from 'react-native';

import { PerfectText } from '../ui';

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
        <PerfectText
          size={18}
          lines={1}
          fontWeight="400"
          immunity={true}
          style={styles.title}
        >
          {title}
        </PerfectText>
        <PerfectText
          size={14}
          lines={1}
          fontWeight="400"
          immunity={true}
          style={styles.location}
        >
          {location}
        </PerfectText>
      </View>
      <View style={styles.statusBadge}>
        <PerfectText
          size={12}
          lines={1}
          fontWeight="400"
          immunity={true}
          style={styles.statusText}
        >
          {statusText}
        </PerfectText>
      </View>
    </View>
  );
};
