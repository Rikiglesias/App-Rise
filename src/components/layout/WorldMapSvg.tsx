import React, { useCallback, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

import { buildMapGeometry, matchLocationsToCountries } from './worldMapGeo';
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
  fillOpacity?: number;
  stroke: string;
  strokeWidth: number;
}

// Singolo paese (sfondo, non interattivo: il tap vive sul pin). Memoizzato: con
// 177 path il padre re-renderizza solo i pochi con props cambiate (focus/tema).
const CountryPath = React.memo<CountryPathProps>(
  ({ d, fill, fillOpacity, stroke, strokeWidth }) => {
    if (!d) return null;
    return (
      <Path
        d={d}
        fill={fill}
        fillOpacity={fillOpacity ?? 1}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }
);
CountryPath.displayName = 'CountryPath';

interface LocationPinProps {
  x: number;
  y: number;
  haloColor: string;
  pinColor: string;
  ringColor: string;
  radius: number;
  haloRadius: number;
  ringWidth: number;
  onPress: () => void;
  accessibilityLabel: string;
}

// Pin a livello-città: alone tenue (glow brand) + cerchio pieno col bordo bianco.
// È il target tap preciso (i dati sono città, non interi paesi). Memoizzato.
const LocationPin = React.memo<LocationPinProps>(
  ({
    x,
    y,
    haloColor,
    pinColor,
    ringColor,
    radius,
    haloRadius,
    ringWidth,
    onPress,
    accessibilityLabel,
  }) => (
    <>
      <Circle
        cx={x}
        cy={y}
        r={haloRadius}
        fill={haloColor}
        fillOpacity={0.18}
      />
      <Circle
        cx={x}
        cy={y}
        r={radius}
        fill={pinColor}
        stroke={ringColor}
        strokeWidth={ringWidth}
        onPress={onPress}
        accessible
        accessibilityLabel={accessibilityLabel}
      />
    </>
  )
);
LocationPin.displayName = 'LocationPin';

/**
 * WorldMapSvg — mappa vettoriale delle DESTINAZIONI, a livello-città.
 *
 * La proiezione si fitta sui paesi-destinazione passati (zoom sul continente
 * attivo, deciso a monte da MapModalScreen). I paesi-destinazione sono una tinta
 * brand tenue (contesto); sopra, un PIN brand a livello-città marca il punto reale
 * (Harare, Bologna…) ed è il target tap → `onMarkerPress`. I vicini grigi fanno da
 * contesto geografico. Stessa Props interface di InteractiveMap: drop-in.
 *
 * Tap-only (niente pinch-zoom: hitbox iOS inaffidabile, issue react-native-svg #2809).
 * Una lista di chip dei paesi funge da fallback a11y e da target tap robusto per i
 * pin piccoli, difficili da centrare su mobile.
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

  const activeByCountryId = useMemo(
    () => matchLocationsToCountries(locations),
    [locations]
  );

  // Paesi-destinazione attivi = focus della proiezione: la mappa si fitta su di
  // essi (zoom sul continente selezionato). Cambia quando il filtro continente/anno
  // a monte cambia il set di `locations`.
  const focusIds = useMemo(
    () => Array.from(activeByCountryId.keys()),
    [activeByCountryId]
  );

  // geoPath è costoso: ricalcola geometria (paesi + proiettore di punti) solo al
  // cambio di viewport o focus.
  const geometry = useMemo(
    () =>
      size.width > 0 && size.height > 0
        ? buildMapGeometry(size.width, size.height, focusIds)
        : null,
    [size.width, size.height, focusIds]
  );

  const shapes = geometry?.shapes ?? [];

  const createPressHandler = useCallback(
    (location: Location) => () => onMarkerPress(location),
    [onMarkerPress]
  );

  // Pin proiettati a livello-città. `project()` può tornare null per coordinate
  // non proiettabili → escluse dalla mappa (restano raggiungibili dai chip).
  const pins = useMemo(() => {
    if (!geometry) return [];
    return locations
      .map(location => {
        const point = geometry.project(
          location.coordinates.longitude,
          location.coordinates.latitude
        );
        return point ? { location, x: point.x, y: point.y } : null;
      })
      .filter(
        (p): p is { location: Location; x: number; y: number } => p !== null
      );
  }, [geometry, locations]);

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
            const isActive = shape.id ? activeByCountryId.has(shape.id) : false;
            // Il paese-destinazione è una tinta tenue (contesto): il pin sopra
            // è l'elemento forte e il target tap preciso a livello-città.
            return (
              <CountryPath
                key={shape.id || `country-${index}`}
                d={shape.d}
                {...(isActive
                  ? {
                      fill: colors.primary[500],
                      fillOpacity: 0.16,
                      stroke: colors.primary[500],
                      strokeWidth: scale(1),
                    }
                  : {
                      fill: colors.neutral[300],
                      stroke: colors.neutral[100],
                      strokeWidth: scale(0.5),
                    })}
              />
            );
          })}
          {pins.map(({ location, x, y }) => (
            <LocationPin
              key={location.id}
              x={x}
              y={y}
              haloColor={colors.primary[500]}
              haloRadius={scale(15)}
              pinColor={colors.primary[500]}
              ringColor={colors.neutral[0]}
              radius={scale(7)}
              ringWidth={scale(2)}
              onPress={createPressHandler(location)}
              accessibilityLabel={`${location.country}: tocca per i dettagli`}
            />
          ))}
        </Svg>
      ) : null}

      {/* Stato vuoto/caricamento: il calcolo dei 177 path è sincrono ma se la
          geometria non è ancora pronta (o fallisce) evitiamo l'area bianca muta. */}
      {size.width > 0 && shapes.length === 0 ? (
        <View style={styles.mapEmpty} pointerEvents="none">
          <ActivityIndicator color={colors.primary[500]} />
        </View>
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
          {locations.map(location => (
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
    mapEmpty: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
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
      backgroundColor: colors.primary[500],
      borderWidth: scale(1.5),
      borderColor: colors.primary[600],
      marginRight: PerfectSpacing.sm,
    },
    chipText: {
      color: colors.neutral[800],
    },
  });

const WorldMapSvg = React.memo(WorldMapSvgComponent);

export default WorldMapSvg;
