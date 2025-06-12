import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { BorderRadius, Colors, Shadows } from '../constants/designTokens';

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
}

interface Props {
  locations: Location[];
  onMarkerPress: (location: Location) => void;
  style?: object;
}

const InteractiveMap: React.FC<Props> = ({
  locations,
  onMarkerPress,
  style,
}) => {
  const createMarkerPressHandler = useCallback(
    (location: Location) => () => onMarkerPress(location),
    [onMarkerPress]
  );

  return (
    <MapView
      style={[styles.map, style]}
      provider={PROVIDER_GOOGLE}
      initialRegion={{
        latitude: 20,
        longitude: 0,
        latitudeDelta: 100,
        longitudeDelta: 100,
      }}
      showsUserLocation={false}
      showsMyLocationButton={false}
      scrollEnabled={true}
      zoomEnabled={true}
      pitchEnabled={false}
      rotateEnabled={false}
      mapType="standard"
    >
      {locations.map(location => (
        <Marker
          key={location.id}
          coordinate={location.coordinates}
          title={location.name}
          description={`${location.projects} progetti • ${location.beneficiaries} beneficiari`}
          onPress={createMarkerPressHandler(location)}
        >
          <View style={styles.customMarker}>
            <Text style={styles.markerText}>📍</Text>
          </View>
        </Marker>
      ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  customMarker: {
    backgroundColor: Colors.primary[600],
    borderRadius: BorderRadius.full,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.neutral[0],
    ...Shadows.md,
  },
  markerText: {
    fontSize: 16,
    color: Colors.neutral[0],
  },
});

export default InteractiveMap;
