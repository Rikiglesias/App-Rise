import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  PerfectContainer,
  PerfectText,
  PlatformTouchable,
  PlatformScrollView,
} from '@/components/ui';
import { BorderRadius, PerfectSpacing, Shadows } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';
import type { Location } from '@/shared/types/location';

interface MapLegendProps {
  locations: Location[];
  onSelect: (location: Location) => void;
  isFullScreen?: boolean;
}

interface LegendChipProps {
  location: Location;
  styles: ReturnType<typeof createStyles>;
  onSelect: (location: Location) => void;
}

const LegendChip: React.FC<LegendChipProps> = ({
  location,
  styles,
  onSelect,
}) => {
  const handlePress = useCallback(
    () => onSelect(location),
    [onSelect, location]
  );
  return (
    <PlatformTouchable
      style={styles.chip}
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${location.country}: tocca per i dettagli`}
    >
      <PerfectContainer style={styles.chipDot} />
      <PerfectText size={13} lines={1} fontWeight="600" style={styles.chipText}>
        {location.country}
      </PerfectText>
    </PlatformTouchable>
  );
};

/**
 * MapLegend — lista orizzontale dei paesi-destinazione: fallback a11y e target tap
 * robusto per i pin piccoli (difficili da centrare su mobile). Resta FUORI dal layer
 * di zoom/pan (fissa in basso), così è sempre raggiungibile.
 */
const MapLegend: React.FC<MapLegendProps> = ({
  locations,
  onSelect,
  isFullScreen = false,
}) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View
      style={[styles.legend, isFullScreen ? styles.legendFullScreen : null]}
      pointerEvents="box-none"
    >
      <PlatformScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.legendContent}
        accessibilityLabel="Paesi dove operiamo"
      >
        {locations.map(location => (
          <LegendChip
            key={location.id}
            location={location}
            styles={styles}
            onSelect={onSelect}
          />
        ))}
      </PlatformScrollView>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    legend: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: PerfectSpacing.base,
    },
    legendFullScreen: {
      bottom: PerfectSpacing['2xl'],
    },
    legendContent: {
      paddingHorizontal: PerfectSpacing.base,
      gap: PerfectSpacing.sm,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.neutral[0],
      borderRadius: BorderRadius.lg,
      paddingHorizontal: PerfectSpacing.base,
      paddingVertical: PerfectSpacing.sm,
      borderWidth: scale(1),
      borderColor: colors.neutral[200],
      ...Shadows.sm,
    },
    chipDot: {
      width: scale(10),
      height: scale(10),
      borderRadius: scale(5),
      backgroundColor: colors.primary[500],
      borderWidth: scale(1.5),
      borderColor: colors.primary[600],
      marginRight: PerfectSpacing.sm,
    },
    chipText: {
      color: colors.neutral[800],
    },
  });

const MapLegendMemo = React.memo(MapLegend);
MapLegendMemo.displayName = 'MapLegend';

export default MapLegendMemo;
