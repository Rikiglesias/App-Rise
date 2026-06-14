import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import {
  PerfectIcon,
  PerfectText,
  PlatformTouchable,
  PerfectContainer,
} from '@/components/ui';
import { BorderRadius } from '@/shared/constants/designTokens';
import { PerfectSpacing, IconClamps } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

interface StatCardProps {
  icon: string;
  iconColor: string;
  value: string;
  label: string;
  subtitle: string;
  gradientColors: [string, string];
  onPress?: () => void;
  /** Se false, la card non è cliccabile */
  pressable?: boolean;
  /** Mostra la freccia in alto a destra */
  showChevron?: boolean;
  /** Mostra il bordo/effetto gradiente */
  withGradientBorder?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  iconColor,
  value,
  label,
  subtitle,
  gradientColors,
  onPress,
  pressable = true,
  showChevron = true,
  withGradientBorder = true,
}) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <PerfectContainer style={styles.card} testID="stat-card">
      <PlatformTouchable
        onPress={onPress}
        activeOpacity={0.9}
        disabled={!pressable}
        accessibilityRole="button"
        accessibilityState={{ disabled: !pressable }}
      >
        {withGradientBorder ? (
          <LinearGradient
            colors={gradientColors}
            style={styles.gradientContainer}
          >
            <PerfectContainer style={styles.cardContent}>
              <PerfectIcon
                name={icon}
                size={28}
                color={iconColor}
                style={styles.icon}
              />
              <PerfectText
                size={22}
                lines={1}
                fontWeight="900"
                style={styles.value}
                testID="stat-card-value"
              >
                {value}
              </PerfectText>
              <PerfectText
                size={16}
                lines={1}
                fontWeight="700"
                style={styles.label}
                testID="stat-card-label"
              >
                {label}
              </PerfectText>
              <PerfectText size={14} lines={1} style={styles.subtitle}>
                {subtitle}
              </PerfectText>
              {showChevron ? (
                <PerfectIcon
                  name="chevron-right"
                  size={20}
                  {...IconClamps.chevron}
                  color={colors.neutral[400]}
                  style={styles.chevron}
                />
              ) : null}
            </PerfectContainer>
          </LinearGradient>
        ) : (
          <PerfectContainer style={styles.cardContentPlain}>
            <PerfectIcon
              name={icon}
              size={28}
              color={iconColor}
              style={styles.icon}
            />
            <PerfectText
              size={22}
              lines={1}
              fontWeight="900"
              style={styles.value}
            >
              {value}
            </PerfectText>
            <PerfectText
              size={16}
              lines={1}
              fontWeight="700"
              style={styles.label}
            >
              {label}
            </PerfectText>
            <PerfectText size={14} lines={1} style={styles.subtitle}>
              {subtitle}
            </PerfectText>
            {showChevron ? (
              <PerfectIcon
                name="chevron-right"
                size={20}
                {...IconClamps.chevron}
                color={colors.neutral[400]}
                style={styles.chevron}
              />
            ) : null}
          </PerfectContainer>
        )}
      </PlatformTouchable>
    </PerfectContainer>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      flex: 1,
    },
  gradientContainer: {
    borderRadius: BorderRadius.xl,
    padding: scale(2),
  },
  cardContent: {
    backgroundColor: colors.neutral[0],
    borderRadius: BorderRadius.xl - scale(2),
    paddingVertical: PerfectSpacing.md,
    alignItems: 'center',
  },
  cardContentPlain: {
    backgroundColor: colors.neutral[0],
    borderRadius: BorderRadius.xl,
    paddingVertical: PerfectSpacing.md,
    alignItems: 'center',
  },
  icon: {
    marginBottom: PerfectSpacing.md,
  },
  value: {
    color: colors.neutral[800],
    marginBottom: PerfectSpacing.xs,
  },
  label: {
    color: colors.neutral[700],
    marginBottom: PerfectSpacing.sm,
  },
  subtitle: {
    color: colors.neutral[500],
  },
  chevron: {
    position: 'absolute',
    top: PerfectSpacing.sm,
    right: PerfectSpacing.sm,
  },
});
