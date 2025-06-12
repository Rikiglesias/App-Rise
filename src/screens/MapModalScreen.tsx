import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import InteractiveMap, { type Location } from '../components/InteractiveMap';
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from '../constants/designTokens';
import type { ImpactStackParamList } from '../navigation/types';

type MapModalScreenRouteProp = RouteProp<ImpactStackParamList, 'MapModal'>;

const MapModalScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<MapModalScreenRouteProp>();
  const locations = route.params?.locations;

  const handleMarkerPress = useCallback((location: Location) => {
    // eslint-disable-next-line no-console
    console.log('Marker pressed:', location.name);
    // Future enhancement: show location details in a bottom sheet
  }, []);

  const handleClosePress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  if (!locations) {
    // Handle case where locations are not passed
    return (
      <View style={styles.container}>
        <Text>Caricamento mappa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <InteractiveMap
        locations={locations}
        onMarkerPress={handleMarkerPress}
        isFullScreen
      />
      <TouchableOpacity
        style={styles.closeButton}
        onPress={handleClosePress}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name="close"
          size={28}
          color={Colors.neutral[800]}
        />
      </TouchableOpacity>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Mappa Interattiva</Text>
        <Text style={styles.subtitle}>Esplora il nostro impatto nel mondo</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[100],
  },
  closeButton: {
    position: 'absolute',
    top: Spacing[12],
    right: Spacing[5],
    backgroundColor: `${Colors.neutral[0]}99`,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    // backdropFilter: 'blur(10px)', // For glassmorphism effect if supported
  },
  titleContainer: {
    position: 'absolute',
    top: Spacing[12],
    left: Spacing[5],
    right: Spacing[12],
    backgroundColor: `${Colors.neutral[0]}99`,
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[4],
    borderRadius: BorderRadius.lg,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
});

export default MapModalScreen;
