import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { Colors, Spacing, Typography } from '../../shared/constants';
import { TypographyTokens } from '../../shared/constants/responsiveSystem';

import AnimatedNumber from './AnimatedNumber';
import { ProgressRing } from './ProgressRing';

interface ProgressStatProps {
  readonly current: number;
  readonly target: number;
  readonly label: string;
  readonly sublabel?: string;
  readonly color: string;
  readonly size?: 'compact' | 'standard';
  readonly startAnimation?: boolean;
  readonly formatter?: (value: number) => string;
  readonly accessibilityLabel?: string;
}

// Sub-components for max-lines-per-function compliance
interface ProgressRingSectionProps {
  readonly progress: number;
  readonly ringSize: number;
  readonly color: string;
  readonly startAnimation: boolean;
  readonly progressPercentage: number;
  readonly textSize: number;
}

const ProgressRingSection: React.FC<ProgressRingSectionProps> = React.memo(
  ({
    progress,
    ringSize,
    color,
    startAnimation,
    progressPercentage,
    textSize,
  }) => (
    <ProgressRing
      progress={progress}
      size={ringSize}
      color={color}
      startAnimation={startAnimation}
    >
      <View style={styles.centerContent}>
        <Text
          style={[styles.percentage, { fontSize: textSize, color }]}
          accessible
          accessibilityLabel={`Progresso: ${progressPercentage} percento`}
        >
          {progressPercentage}%
        </Text>
      </View>
    </ProgressRing>
  )
);

ProgressRingSection.displayName = 'ProgressRingSection';

interface ProgressTextSectionProps {
  readonly current: number;
  readonly target: number;
  readonly label: string;
  readonly sublabel: string | undefined;
  readonly color: string;
  readonly startAnimation: boolean;
  readonly formatter: (value: number) => string;
}

const ProgressTextSection: React.FC<ProgressTextSectionProps> = React.memo(
  ({ current, target, label, sublabel, color, startAnimation, formatter }) => (
    <View style={styles.textSection}>
      <View
        style={styles.currentValueRow}
        accessible
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

      <Text style={styles.label} accessible accessibilityRole="text">
        {label}
      </Text>

      {sublabel !== undefined && sublabel !== null && sublabel !== '' && (
        <Text style={styles.sublabel} accessible accessibilityRole="text">
          {sublabel}
        </Text>
      )}
    </View>
  )
);

ProgressTextSection.displayName = 'ProgressTextSection';

// Main component - Now under 60 lines
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
    compact: { ring: 60, text: TypographyTokens.styles.body.small },
    standard: { ring: 80, text: TypographyTokens.styles.body.large },
  };

  const { ring: ringSize, text: textSize } = sizes[size];

  // Generate default accessibility label if not provided
  const defaultAccessibilityLabel = `${label}: ${formatter(
    current
  )} su ${formatter(target)}, progresso ${progressPercentage} percento`;

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel ?? defaultAccessibilityLabel}
      accessibilityValue={{
        min: 0,
        max: target,
        now: current,
      }}
    >
      <ProgressRingSection
        progress={progress}
        ringSize={ringSize}
        color={color}
        startAnimation={startAnimation}
        progressPercentage={progressPercentage}
        textSize={textSize}
      />

      <ProgressTextSection
        current={current}
        target={target}
        label={label}
        sublabel={sublabel}
        color={color}
        startAnimation={startAnimation}
        formatter={formatter}
      />
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
    fontSize: TypographyTokens.styles.title.medium,
    fontWeight: Typography.weights.bold,
    fontFamily: Typography.families.mono,
  },
  targetValue: {
    fontSize: TypographyTokens.styles.body.small,
    color: Colors.neutral[500],
    marginLeft: Spacing[1],
  },
  label: {
    fontSize: TypographyTokens.styles.body.medium,
    color: Colors.neutral[700],
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
  sublabel: {
    fontSize: TypographyTokens.styles.label.small,
    color: Colors.neutral[500],
    textAlign: 'center',
    marginTop: Spacing[1],
  },
});

export default ProgressStat;
