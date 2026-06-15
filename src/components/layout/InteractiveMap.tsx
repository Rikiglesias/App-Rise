import React, { useCallback, useMemo } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Map, Camera, Marker } from '@maplibre/maplibre-react-native';
import { PerfectContainer } from '../ui/PerfectContainer';

import { BorderRadius, Shadows, PerfectSpacing } from '../../shared/constants';
import { scale } from '../../shared/constants/perfectScale';
import { PerfectText } from '../ui/PerfectText';
import { getMapStyleURL } from './mapStyle';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { useUniversalTheme } from '@/shared/theme/UniversalTheme';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';
import type { Location } from '@/shared/types/location';

interface Props {
  locations: Location[];
  onMarkerPress: (location: Location) => void;
  style?: StyleProp<ViewStyle>;
  isFullScreen?: boolean;
}

// Colore del marker in base al tipo di progetto (dark-aware: riceve i token del tema).
const getMarkerColor = (location: Location, colors: ThemeColors): string => {
  if (location.status === 'emergency') {
    return colors.primary[600]; // Rosso per emergenze
  }
  if (location.volunteers && location.volunteers > 0) {
    return colors.primary[400]; // Più chiaro per volontari
  }
  if (location.meals && location.meals > 0) {
    return colors.primary[500]; // Medio per pasti
  }
  if (location.kits && location.kits > 0) {
    return colors.primary[700]; // Più scuro per kit
  }
  return colors.neutral[500]; // Grigio default
};

// Marker custom: pin circolare brand + etichetta paese (dark-aware via Pattern A).
const SimpleMarker: React.FC<{ location: Location; colors: ThemeColors }> =
  React.memo(({ location, colors }) => {
    const styles = useMemo(() => createStyles(colors), [colors]);
    const markerColor = getMarkerColor(location, colors);

    return (
      <PerfectContainer
        style={styles.markerContainer}
        accessibilityRole="button"
        accessibilityLabel={`${location.country}: tocca per i dettagli`}
      >
        {/* Pin principale */}
        <PerfectContainer
          style={[styles.simpleMarker, { backgroundColor: markerColor }]}
        >
          <PerfectContainer style={styles.markerInner} />
        </PerfectContainer>

        {/* Etichetta del paese */}
        <PerfectContainer style={styles.countryLabel}>
          <PerfectText
            size={10}
            lines={1}
            fontWeight="700"
            style={styles.countryText}
          >
            {location.country}
          </PerfectText>
        </PerfectContainer>
      </PerfectContainer>
    );
  });

SimpleMarker.displayName = 'SimpleMarker';

const InteractiveMapComponent: React.FC<Props> = ({
  locations,
  onMarkerPress,
  style,
  isFullScreen = false,
}) => {
  const colors = useThemeColors();
  const { isDark } = useUniversalTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const styleURL = useMemo(() => getMapStyleURL(isDark), [isDark]);

  const createMarkerPressHandler = useCallback(
    (location: Location) => () => {
      onMarkerPress(location);
    },
    [onMarkerPress]
  );

  // Vista iniziale (mondiale). lngLat = [longitude, latitude] (ordine MapLibre).
  const initialViewState = useMemo(
    () => ({
      center: (isFullScreen ? [15, 25] : [0, 20]) as [number, number],
      zoom: isFullScreen ? 1.2 : 0.5,
    }),
    [isFullScreen]
  );

  return (
    <Map
      style={[styles.map, style]}
      mapStyle={styleURL}
      // Attribution MapTiler/OSM obbligatoria per licenza free tier.
      attribution
      attributionPosition={{ bottom: scale(8), right: scale(8) }}
      logo={false}
      compass={isFullScreen}
      scaleBar={false}
      // Interazioni: preview statica, fullscreen navigabile (no rotate/pitch).
      dragPan={isFullScreen}
      touchZoom={isFullScreen}
      doubleTapZoom={isFullScreen}
      touchRotate={false}
      touchPitch={false}
    >
      <Camera
        initialViewState={initialViewState}
        minZoom={isFullScreen ? 1 : 0.5}
        maxZoom={isFullScreen ? 12 : 4}
      />
      {locations.map(location => (
        <Marker
          key={location.id}
          id={location.id}
          lngLat={[
            location.coordinates.longitude,
            location.coordinates.latitude,
          ]}
          anchor="center"
          onPress={createMarkerPressHandler(location)}
        >
          <SimpleMarker location={location} colors={colors} />
        </Marker>
      ))}
    </Map>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    map: {
      flex: 1,
    },
    markerContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    simpleMarker: {
      width: scale(32),
      height: scale(32),
      borderRadius: scale(16),
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: scale(3),
      borderColor: colors.neutral[0],
      ...Shadows.md,
    },
    markerInner: {
      width: scale(12),
      height: scale(12),
      borderRadius: scale(6),
      backgroundColor: colors.neutral[0],
    },
    countryLabel: {
      backgroundColor: colors.neutral[0],
      borderRadius: BorderRadius.sm,
      paddingHorizontal: PerfectSpacing.sm,
      paddingVertical: PerfectSpacing.xs,
      marginTop: PerfectSpacing.xs,
      borderWidth: scale(1),
      borderColor: colors.neutral[200],
      ...Shadows.sm,
    },
    countryText: {
      color: colors.neutral[700],
      textAlign: 'center',
      maxWidth: scale(80),
    },
  });

const InteractiveMap = React.memo(InteractiveMapComponent);

export default InteractiveMap;
