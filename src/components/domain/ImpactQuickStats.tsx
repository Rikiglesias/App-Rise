import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from '../../shared/constants/designTokens';

interface StatItem {
  id: string;
  value: string;
  label: string;
  icon: string;
  color: string;
  progress: number;
}

interface Props {
  fadeAnim: Animated.Value;
  stats: StatItem[];
}

const ImpactQuickStats: React.FC<Props> = ({ fadeAnim, stats }) => {
  return (
    <Animated.View style={[styles.quickStatsSection, { opacity: fadeAnim }]}>
      <View style={styles.statsGrid}>
        {stats.map(stat => (
          <View
            key={stat.id}
            style={[styles.statCard, { borderLeftColor: stat.color }]}
          >
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <View style={styles.statProgress}>
              <Animated.View
                style={[
                  styles.statProgressBar,
                  {
                    backgroundColor: stat.color,
                    width: `${stat.progress * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  quickStatsSection: {
    paddingHorizontal: Spacing[4],
    marginTop: -Spacing[6],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    borderLeftWidth: 4,
    ...Shadows.md,
  },
  statValue: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing[1],
  },
  statLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    marginBottom: Spacing[2],
  },
  statProgress: {
    height: 4,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  statProgressBar: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
});

export default ImpactQuickStats;
