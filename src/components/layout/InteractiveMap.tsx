import React, { useCallback, useMemo } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';
import { PerfectContainer } from '../ui/PerfectContainer';

import { BorderRadius, Colors, Shadows, PerfectSpacing } from '../../shared/constants';
import { scale } from '../../shared/constants/perfectScale';
import { PerfectText } from '../ui/PerfectText';

export interface Location {
  id: string;
  name: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  projects: number;
  beneficiaries: string;
  status: string;
  description: string;
  image: string;
  meals?: number;
  kits?: number;
  volunteers?: number;
}

interface Props {
  locations: Location[];
  onMarkerPress: (location: Location) => void;
  style?: StyleProp<ViewStyle>;
  isFullScreen?: boolean;
}

// Funzione per determinare il colore del marker in base al tipo di progetto
const getMarkerColor = (location: Location) => {
  if (location.status === 'emergency') {
    return Colors.primary[600]; // Rosso per emergenze
  }

  if (location.volunteers && location.volunteers > 0) {
    return Colors.primary[400]; // Colore più chiaro per volontari
  }

  if (location.meals && location.meals > 0) {
    return Colors.primary[500]; // Colore medio per pasti
  }

  if (location.kits && location.kits > 0) {
    return Colors.primary[700]; // Colore più scuro per kit
  }

  return Colors.neutral[500]; // Grigio default
};

// Componente per il marker semplice ma bello
const SimpleMarker: React.FC<{ location: Location }> = React.memo(
  ({ location }) => {
    const markerColor = getMarkerColor(location);

    return (
      <PerfectContainer style={styles.markerContainer}>
        {/* Pin principale semplice */}
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
  }
);

SimpleMarker.displayName = 'SimpleMarker';

const InteractiveMapComponent: React.FC<Props> = ({
  locations,
  onMarkerPress,
  style,
  isFullScreen = false,
}) => {
  const createMarkerPressHandler = useCallback(
    (location: Location) => () => {
      onMarkerPress(location);
    },
    [onMarkerPress]
  );

  const initialRegion: Region = useMemo(() => {
    return isFullScreen
      ? {
          latitude: 25,
          longitude: 15,
          latitudeDelta: 80,
          longitudeDelta: 80,
        }
      : {
          latitude: 20,
          longitude: 0,
          latitudeDelta: 100,
          longitudeDelta: 100,
        };
  }, [isFullScreen]);

  const generateTitle = useCallback((location: Location) => {
    return `${location.name} - ${location.country}`;
  }, []);

  const generateDescription = useCallback((location: Location) => {
    const parts: string[] = [];

    if (location.meals && location.meals > 0) {
      parts.push(`${location.meals.toLocaleString()} pasti distribuiti`);
    }

    if (location.kits && location.kits > 0) {
      parts.push(`${location.kits.toLocaleString()} kit forniti`);
    }

    if (location.volunteers && location.volunteers > 0) {
      parts.push(`${location.volunteers.toLocaleString()} volontari attivi`);
    }

    if (parts.length === 0) {
      parts.push(`${location.projects} progetti attivi`);
    }

    if (location.status === 'emergency') {
      parts.unshift('🚨 EMERGENZA');
    }

    return parts.join('\n');
  }, []);

  return (
    <MapView
      style={[styles.map, style]}
      provider="google"
      initialRegion={initialRegion}
      showsUserLocation={false}
      showsMyLocationButton={isFullScreen}
      scrollEnabled={isFullScreen}
      zoomEnabled={isFullScreen}
      pitchEnabled={isFullScreen}
      rotateEnabled={isFullScreen}
      mapType="standard"
      toolbarEnabled={isFullScreen}
      moveOnMarkerPress={false}
      // OTTIMIZZAZIONI PERFORMANCE
      maxZoomLevel={isFullScreen ? 20 : 8} // Limita zoom su preview mappa
      minZoomLevel={isFullScreen ? 2 : 3} // Limita zoom minimo
      loadingEnabled={false} // Rimuove loading spinner
      loadingIndicatorColor="transparent" // Nasconde indicatori
      loadingBackgroundColor="transparent" // Sfondo trasparente
      showsBuildings={isFullScreen} // 3D buildings solo fullscreen
      showsTraffic={false} // Disabilita traffico
      showsIndoors={false} // Disabilita mappe indoor
      showsCompass={isFullScreen} // Bussola solo fullscreen
      showsScale={false} // Disabilita scala
    >
      {locations.map(location => (
        <Marker
          key={location.id}
          coordinate={location.coordinates}
          title={generateTitle(location)}
          description={generateDescription(location)}
          onPress={createMarkerPressHandler(location)}
        >
          <SimpleMarker location={location} />
        </Marker>
      ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
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
    borderColor: Colors.neutral[0],
    ...Shadows.md,
  },
  markerInner: {
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
    backgroundColor: Colors.neutral[0],
  },
  countryLabel: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.sm,
    paddingHorizontal: PerfectSpacing.sm,
    paddingVertical: PerfectSpacing.xs,
    marginTop: PerfectSpacing.xs,
    borderWidth: scale(1),
    borderColor: Colors.neutral[200],
    ...Shadows.sm,
  },
  countryText: {
    color: Colors.neutral[700],
    textAlign: 'center',
    maxWidth: scale(80),
  },
});

const InteractiveMap = React.memo(InteractiveMapComponent);

export default InteractiveMap;
