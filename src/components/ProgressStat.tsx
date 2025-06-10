import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Colors, Spacing, Typography } from '../constants/designTokens';
import AnimatedNumber from './AnimatedNumber';
import { ProgressRing } from './ProgressRing';

interface ProgressStatProps {
  current: number;
  target: number;
  label: string;
  sublabel?: string;
  color: string;
  size?: 'compact' | 'standard';
  startAnimation?: boolean;
  formatter?: (value: number) => string;
  accessibilityLabel?: string;
}

export const ProgressStat: React.FC<ProgressStatProps> = ({
  current,
  target,
  label,
  sublabel,
  color,
  size = 'standard',
  startAnimation = false,
  formatter = value => value.toLocaleString('it-IT'),
  accessibilityLabel,
}) => {
  const progress = Math.min(current / target, 1); // Cap at 100%
  const progressPercentage = Math.round(progress * 100);

  const sizes = {
    compact: { ring: 60, text: Typography.sizes.sm },
    standard: { ring: 80, text: Typography.sizes.lg },
  };

  const { ring: ringSize, text: textSize } = sizes[size];

  // Generate default accessibility label if not provided
  const defaultAccessibilityLabel = `${label}: ${formatter(
    current
  )} su ${formatter(target)}, progresso ${progressPercentage} percento`;

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel || defaultAccessibilityLabel}
      accessibilityValue={{
        min: 0,
        max: target,
        now: current,
      }}
    >
      <ProgressRing
        progress={progress}
        size={ringSize}
        color={color}
        startAnimation={startAnimation}
      >
        <View style={styles.centerContent}>
          <Text
            style={[styles.percentage, { fontSize: textSize, color }]}
            accessible={true}
            accessibilityLabel={`Progresso: ${progressPercentage} percento`}
          >
            {progressPercentage}%
          </Text>
        </View>
      </ProgressRing>

      <View style={styles.textSection}>
        <View
          style={styles.currentValueRow}
          accessible={true}
          accessibilityLabel={`Valore attuale: ${formatter(
            current
          )} su ${formatter(target)}`}
        >
          <AnimatedNumber
            value={current}
            style={[styles.currentValue, { color }]}
            startAnimation={startAnimation}
          />
          <Text style={styles.targetValue}>/ {formatter(target)}</Text>
        </View>

        <Text style={styles.label} accessible={true} accessibilityRole="text">
          {label}
        </Text>

        {sublabel && (
          <Text
            style={styles.sublabel}
            accessible={true}
            accessibilityRole="text"
          >
            {sublabel}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: Spacing[3],
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    fontWeight: Typography.weights.bold,
    fontFamily: Typography.families.mono,
  },
  textSection: {
    alignItems: 'center',
    marginTop: Spacing[3],
  },
  currentValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing[1],
  },
  currentValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    fontFamily: Typography.families.mono,
  },
  targetValue: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[500],
    marginLeft: Spacing[1],
  },
  label: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[700],
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
  sublabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.neutral[500],
    textAlign: 'center',
    marginTop: Spacing[1],
  },
});

export default ProgressStat;
