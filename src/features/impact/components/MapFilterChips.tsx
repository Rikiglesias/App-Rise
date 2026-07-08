import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { PerfectText, PlatformTouchable } from '@/components/ui';
import { BorderRadius, PerfectSpacing, Shadows } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';
import type { Continent } from '@/shared/types/location';

interface ContinentChipProps {
  continent: Continent;
  active: boolean;
  onSelect: (continent: Continent) => void;
}

/** Bottone-continente (segmented): selezione → la mappa zooma su quel continente. */
export const ContinentChip: React.FC<ContinentChipProps> = ({
  continent,
  active,
  onSelect,
}) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createContinentStyles(colors), [colors]);
  const handlePress = useCallback(
    () => onSelect(continent),
    [onSelect, continent]
  );
  return (
    <PlatformTouchable
      onPress={handlePress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`Continente ${continent}`}
      style={[styles.chip, active ? styles.chipActive : null]}
    >
      <PerfectText
        size={14}
        lines={1}
        fontWeight={active ? '800' : '600'}
        style={active ? styles.chipTextActive : styles.chipText}
      >
        {continent}
      </PerfectText>
    </PlatformTouchable>
  );
};

interface YearChipProps {
  label: string;
  value: number | null;
  active: boolean;
  onSelect: (year: number | null) => void;
}

/** Chip di filtro anno (handler stabile, no arrow inline nel prop). */
export const YearChip: React.FC<YearChipProps> = ({
  label,
  value,
  active,
  onSelect,
}) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createYearStyles(colors), [colors]);
  const handlePress = useCallback(() => onSelect(value), [onSelect, value]);
  return (
    <PlatformTouchable
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      style={[styles.chip, active ? styles.chipActive : null]}
    >
      <PerfectText
        size={13}
        lines={1}
        fontWeight="700"
        style={active ? styles.chipTextActive : styles.chipText}
      >
        {label}
      </PerfectText>
    </PlatformTouchable>
  );
};

const createContinentStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    chip: {
      backgroundColor: `${colors.neutral[0]}F2`,
      borderRadius: BorderRadius.full,
      paddingHorizontal: PerfectSpacing.lg,
      paddingVertical: PerfectSpacing.sm,
      borderWidth: scale(1.5),
      borderColor: colors.neutral[200],
      ...Shadows.sm,
    },
    chipActive: {
      backgroundColor: colors.primary[500],
      borderColor: colors.primary[600],
      ...Shadows.primary,
    },
    chipText: {
      color: colors.neutral[800],
    },
    chipTextActive: {
      color: colors.accent.white,
    },
  });

const createYearStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    chip: {
      backgroundColor: `${colors.neutral[0]}F2`,
      borderRadius: BorderRadius.full,
      paddingHorizontal: PerfectSpacing.base,
      paddingVertical: PerfectSpacing.xs,
      borderWidth: scale(1),
      borderColor: colors.neutral[200],
    },
    chipActive: {
      backgroundColor: colors.primary[500],
      borderColor: colors.primary[500],
    },
    chipText: {
      color: colors.neutral[700],
    },
    chipTextActive: {
      color: colors.accent.white,
    },
  });
