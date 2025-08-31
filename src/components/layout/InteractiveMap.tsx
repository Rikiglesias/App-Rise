import React, { useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';

import { TypographyTokens } from '../../shared/constants/responsiveSystem';
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from '../../shared/constants';

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
    return '#DC2626'; // Rosso per emergenze
  }

  if (location.volunteers && location.volunteers > 0) {
    return '#10B981'; // Verde per volontari
  }

  if (location.meals && location.meals > 0) {
    return '#F59E0B'; // Arancione per pasti
  }

  if (location.kits && location.kits > 0) {
    return '#8B5CF6'; // Viola per kit
  }

  return '#6B7280'; // Grigio default
};

// Componente per il marker semplice ma bello
const SimpleMarker: React.FC<{ location: Location }> = React.memo(
  ({ location }) => {
    const markerColor = useMemo(() => getMarkerColor(location), [location]);

    return (
      <View style={styles.markerContainer}>
        {/* Pin principale semplice */}
        <View style={[styles.simpleMarker, { backgroundColor: markerColor }]}>
          <View style={styles.markerInner} />
        </View>

        {/* Etichetta del paese */}
        <View style={styles.countryLabel}>
          <Text
            style={styles.countryText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {location.country}
          </Text>
        </View>
      </View>
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
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.neutral[0],
    ...Shadows.md,
  },
  markerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.neutral[0],
  },
  countryLabel: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    marginTop: Spacing[1],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    ...Shadows.sm,
  },
  countryText: {
    fontSize: TypographyTokens.styles.label.small,
    fontWeight: Typography.weights.bold,
    color: '#374151',
    textAlign: 'center',
    maxWidth: 80,
  },
});

const InteractiveMap = React.memo(InteractiveMapComponent);

export default InteractiveMap;
