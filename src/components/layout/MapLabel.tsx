import React, { useCallback, useMemo, useState } from 'react';
import {
  StyleSheet,
  Pressable,
  View,
  type LayoutChangeEvent,
} from 'react-native';

import { PerfectText } from '@/components/ui';
import { BorderRadius, PerfectSpacing, Shadows } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

interface MapLabelProps {
  /** Centro del pin nel viewport (px), dalla proiezione. */
  x: number;
  y: number;
  /** Raggio dell'alone del pin: la label si posa appena sopra. */
  anchorGap: number;
  country: string;
  /** Stat compatta già formattata (es. "570K pasti"); assente/undefined = solo nome. */
  stat?: string | undefined;
  onPress: () => void;
  accessibilityLabel: string;
}

/**
 * MapLabel — etichetta "mission map" ancorata al pin: nome del Paese (+ stat
 * chiave) in una pill brand. Trasforma la mappa da choropleth muto a mappa
 * ANNOTATA (si legge a colpo d'occhio dove operiamo, senza tappare). Overlay come
 * MapPin (non SVG). Si auto-centra su `x` misurando la propria dimensione (RN non
 * supporta translate percentuale) e si posa sopra il pin (`y - anchorGap`).
 */
const MapLabelComponent: React.FC<MapLabelProps> = ({
  x,
  y,
  anchorGap,
  country,
  stat,
  onPress,
  accessibilityLabel,
}) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null
  );

  const handleLayout = useCallback((event: LayoutChangeEvent): void => {
    const { width, height } = event.nativeEvent.layout;
    setSize(prev =>
      prev && prev.width === width && prev.height === height
        ? prev
        : { width, height }
    );
  }, []);

  // Finché non misurata, resta trasparente (evita il "salto" da un angolo).
  const position = size
    ? { left: x - size.width / 2, top: y - anchorGap - size.height, opacity: 1 }
    : { left: x, top: y, opacity: 0 };

  return (
    <Pressable
      onPress={onPress}
      onLayout={handleLayout}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
      style={[styles.pill, position]}
    >
      <PerfectText
        size={12}
        lines={1}
        fontWeight="800"
        style={styles.country}
        immunity
      >
        {country}
      </PerfectText>
      {stat ? (
        <View style={styles.statRow}>
          <View style={styles.dot} />
          <PerfectText
            size={10}
            lines={1}
            fontWeight="600"
            style={styles.stat}
            immunity
          >
            {stat}
          </PerfectText>
        </View>
      ) : null}
    </Pressable>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    pill: {
      position: 'absolute',
      alignItems: 'center',
      backgroundColor: colors.neutral[0],
      borderRadius: BorderRadius.md,
      paddingHorizontal: PerfectSpacing.sm,
      paddingVertical: scale(4),
      borderWidth: scale(1),
      borderColor: colors.neutral[200],
      ...Shadows.md,
    },
    country: {
      color: colors.neutral[900],
      letterSpacing: scale(0.2),
    },
    statRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: scale(1),
    },
    dot: {
      width: scale(5),
      height: scale(5),
      borderRadius: scale(2.5),
      backgroundColor: colors.primary[500],
      marginRight: scale(4),
    },
    stat: {
      color: colors.neutral[600],
    },
  });

const MapLabel = React.memo(MapLabelComponent);
MapLabel.displayName = 'MapLabel';

export default MapLabel;
