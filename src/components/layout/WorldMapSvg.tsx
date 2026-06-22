import React, { useCallback, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import Animated from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';

import { buildMapGeometry, matchLocationsToCountries } from './worldMapGeo';
import MapPin from './MapPin';
import MapLegend from './MapLegend';
import { useMapZoom } from './useMapZoom';
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

/**
 * WorldMapSvg — mappa vettoriale delle DESTINAZIONI, a livello-città.
 *
 * La proiezione si fitta sui paesi-destinazione passati (zoom sul continente
 * attivo, deciso a monte da MapModalScreen). I paesi-destinazione sono una tinta
 * brand tenue (contesto, nell'<Svg>); sopra, un PIN brand pulsante (MapPin, overlay
 * animato) marca il punto reale (Harare, Bologna…) ed è il target tap → `onMarkerPress`.
 *
 * Pinch-zoom + pan: la trasformazione si applica all'Animated.View wrapper esterno
 * all'<Svg> (incluso i pin, così restano allineati), via `useMapZoom`. Il livello di
 * zoom si azzera al cambio continente. Una lista di chip dei paesi resta come fallback
 * a11y e target tap robusto. Stessa Props interface di InteractiveMap: drop-in.
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

  // Pinch-zoom + pan, azzerato quando cambia il continente (set di paesi-focus).
  const { gesture, animatedStyle } = useMapZoom(focusIds.join(','));

  return (
    <View
      style={[styles.container, style]}
      onLayout={handleLayout}
      testID="world-map-svg"
    >
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.zoomLayer, animatedStyle]}>
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
                // Alcune feature Natural Earth non hanno id ISO (es. Somaliland,
                // N. Cyprus): mai attive, ma serve una key univoca e stabile.
                const isActive = shape.id
                  ? activeByCountryId.has(shape.id)
                  : false;
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
            </Svg>
          ) : null}

          {/* Pin overlay (animati): allineati all'<Svg> e trasformati con esso. */}
          {pins.map(({ location, x, y }) => (
            <MapPin
              key={location.id}
              x={x}
              y={y}
              dotSize={scale(13)}
              haloSize={scale(40)}
              color={colors.primary[500]}
              ringColor={colors.neutral[0]}
              onPress={createPressHandler(location)}
              accessibilityLabel={`${location.country}: tocca per i dettagli`}
            />
          ))}
        </Animated.View>
      </GestureDetector>

      {/* Stato vuoto/caricamento: il calcolo dei 177 path è sincrono ma se la
          geometria non è ancora pronta (o fallisce) evitiamo l'area bianca muta. */}
      {size.width > 0 && shapes.length === 0 ? (
        <View style={styles.mapEmpty} pointerEvents="none">
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      ) : null}

      {/* Fallback a11y + target tap robusto, fuori dal layer di zoom/pan */}
      <MapLegend
        locations={locations}
        onSelect={onMarkerPress}
        isFullScreen={isFullScreen}
      />
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
    // Layer trasformato da pinch-zoom/pan: contiene <Svg> + pin overlay.
    zoomLayer: {
      ...StyleSheet.absoluteFillObject,
    },
    mapEmpty: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

const WorldMapSvg = React.memo(WorldMapSvgComponent);

export default WorldMapSvg;
