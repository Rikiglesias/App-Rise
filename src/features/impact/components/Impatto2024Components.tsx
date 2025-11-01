/**
 * Componenti riutilizzabili per Impatto2024Screen
 */

import React from 'react';
import { StyleSheet } from 'react-native';

import type { StatCardData, ImpactItemData } from '../data/impatto2024Data';
import { PerfectText, PerfectContainer } from '@/components/ui';
import { Colors, BorderRadius, Shadows  } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';

interface StatCardProps {
  readonly data: StatCardData;
}

export const StatCard: React.FC<StatCardProps> = React.memo(({ data }) => (
  <PerfectContainer 
    style={styles.statCard}
    accessibilityLabel={`${data.label}: ${data.number}. ${data.description}`}
    accessibilityRole="text"
  >
    <PerfectText
      size={28}
      lines={1}
      fontWeight="400"
      style={styles.statIcon}
    >
      {data.icon}
    </PerfectText>
    <PerfectText
      size={24}
      lines={1}
      fontWeight="400"
      style={styles.statNumber}
    >
      {data.number}
    </PerfectText>
    <PerfectText
      size={18}
      lines={1}
      fontWeight="400"
      style={styles.statLabel}
    >
      {data.label}
    </PerfectText>
    <PerfectText
      size={14}
      lines={2}
      fontWeight="400"
      style={styles.statDesc}
    >
      {data.description}
    </PerfectText>
  </PerfectContainer>
));

StatCard.displayName = 'StatCard';

interface ImpactItemProps {
  readonly data: ImpactItemData;
}

export const ImpactItem: React.FC<ImpactItemProps> = React.memo(({ data }) => (
  <PerfectContainer 
    style={styles.impactItem}
    accessibilityLabel={data.text}
    accessibilityRole="text"
  >
    <PerfectText
      size={18}
      lines={1}
      fontWeight="400"
      style={styles.impactIcon}
    >
      {data.icon}
    </PerfectText>
    <PerfectText
      size={16}
      lines={1}
      fontWeight="400"
      style={styles.impactText}
    >
      {data.text}
    </PerfectText>
  </PerfectContainer>
));

ImpactItem.displayName = 'ImpactItem';

const styles = StyleSheet.create({
  statCard: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.lg,
    padding: PerfectSpacing.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  statIcon: {
    marginBottom: PerfectSpacing.md,
  },
  statNumber: {
    color: Colors.primary[600],
    textAlign: 'center',
  },
  statLabel: {
    color: Colors.neutral[900],
    textAlign: 'center',
    marginTop: PerfectSpacing.sm,
  },
  statDesc: {
    color: Colors.neutral[600],
    textAlign: 'center',
    marginTop: PerfectSpacing.xs,
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  impactIcon: {
    marginRight: PerfectSpacing.md,
  },
  impactText: {
    color: Colors.neutral[700],
  },
});
