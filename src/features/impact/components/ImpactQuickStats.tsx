import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { PerfectText } from '../../../components/ui';

// TypographyTokens non più usato qui
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from '../../../shared/constants';

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
            <PerfectText size={22} lines={1} style={styles.statValue}>
              {stat.value}
            </PerfectText>
            <PerfectText size={12} lines={1} style={styles.statLabel}>
              {stat.label}
            </PerfectText>
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
    // 2 card per riga con gap coerente su ogni device (millimetrico)
    // Larghezza calcolata dal container (flex basis) per evitare percentuali
    flexBasis: '48%',
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    borderLeftWidth: 4,
    ...Shadows.md,
  },
  statValue: {
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing[1],
  },
  statLabel: {
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
