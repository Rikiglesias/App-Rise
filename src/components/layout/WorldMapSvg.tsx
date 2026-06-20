import React, { useCallback, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { buildCountryShapes, matchLocationsToCountries } from './worldMapGeo';
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

interface Props {
  locations: Location[];
  onMarkerPress: (location: Location) => void;
  style?: StyleProp<ViewStyle>;
  isFullScreen?: boolean;
}

interface CountryPathProps {
  d: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
  onPress?: () => void;
  accessibilityLabel?: string;
}

// Singolo paese. Memoizzato: con 177 path il padre re-renderizza solo i pochi
// attivi (onPress cambia ref), gli inattivi hanno props stabili e vengono saltati.
const CountryPath = React.memo<CountryPathProps>(
  ({ d, fill, stroke, strokeWidth, onPress, accessibilityLabel }) => {
    if (!d) return null;
    return (
      <Path
        d={d}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        {...(onPress
          ? {
              onPress,
              accessible: true,
              accessibilityRole: 'button' as const,
              accessibilityLabel,
            }
          : {})}
      />
    );
  }
);
CountryPath.displayName = 'CountryPath';

/**
 * WorldMapSvg — world map vettoriale interattiva (paesi-evento cliccabili).
 *
 * Tutti i paesi sono grigi; quelli con eventi sono colorati col brand e bordo
 * marcato (secondo canale non-cromatico, WCAG 1.4.1) e cliccabili → `onMarkerPress`.
 * Stessa Props interface di InteractiveMap: drop-in in MapModalScreen.
 *
 * Tap-only (niente pinch-zoom: hitbox iOS inaffidabile, issue react-native-svg #2809).
 * Una lista di chip dei paesi-evento funge da fallback a11y e da target tap robusto
 * per i poligoni piccoli, difficili da centrare su mobile.
 */
const WorldMapSvgComponent: React.FC<Props> = ({
  locations,
  onMarkerPress,
  style,
  isFullScreen = false,
}) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize(prev =>
      prev.width === width && prev.height === height ? prev : { width, height }
    );
  }, []);

  // geoPath è costoso: ricalcola solo quando cambia il viewport.
  const shapes = useMemo(
    () =>
      size.width > 0 && size.height > 0
        ? buildCountryShapes(size.width, size.height)
        : [],
    [size.width, size.height]
  );

  const activeByCountryId = useMemo(
    () => matchLocationsToCountries(locations),
    [locations]
  );

  const createPressHandler = useCallback(
    (location: Location) => () => onMarkerPress(location),
    [onMarkerPress]
  );

  const activeLocations = useMemo(
    () => Array.from(activeByCountryId.values()),
    [activeByCountryId]
  );

  return (
    <View
      style={[styles.container, style]}
      onLayout={handleLayout}
      testID="world-map-svg"
    >
      {shapes.length > 0 ? (
        <Svg width={size.width} height={size.height}>
          <Rect
            x={0}
            y={0}
            width={size.width}
            height={size.height}
            fill={colors.neutral[100]}
          />
          {shapes.map((shape, index) => {
            // Alcune feature Natural Earth non hanno id ISO (es. Somaliland, N. Cyprus):
            // mai attive, ma servono comunque una key univoca e stabile.
            const location = shape.id
              ? activeByCountryId.get(shape.id)
              : undefined;
            return (
              <CountryPath
                key={shape.id || `country-${index}`}
                d={shape.d}
                {...(location
                  ? {
                      fill: colors.primary[600],
                      stroke: colors.primary[800],
                      strokeWidth: scale(1.2),
                      onPress: createPressHandler(location),
                      accessibilityLabel: `${location.country}: tocca per i dettagli`,
                    }
                  : {
                      fill: colors.neutral[300],
                      stroke: colors.neutral[100],
                      strokeWidth: scale(0.5),
                    })}
              />
            );
          })}
        </Svg>
      ) : null}

      {/* Fallback a11y + target tap robusto per i poligoni piccoli */}
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
          {activeLocations.map(location => (
            <PlatformTouchable
              key={location.id}
              style={styles.chip}
              onPress={createPressHandler(location)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`${location.country}: tocca per i dettagli`}
            >
              <PerfectContainer style={styles.chipDot} />
              <PerfectText
                size={13}
                lines={1}
                fontWeight="600"
                style={styles.chipText}
              >
                {location.country}
              </PerfectText>
            </PlatformTouchable>
          ))}
        </PlatformScrollView>
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.neutral[100],
      overflow: 'hidden',
    },
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
      backgroundColor: colors.primary[600],
      borderWidth: scale(1.5),
      borderColor: colors.primary[800],
      marginRight: PerfectSpacing.sm,
    },
    chipText: {
      color: colors.neutral[800],
    },
  });

const WorldMapSvg = React.memo(WorldMapSvgComponent);

export default WorldMapSvg;
