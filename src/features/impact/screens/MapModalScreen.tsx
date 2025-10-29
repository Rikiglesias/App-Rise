import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { PerfectText } from '@/components/ui/PerfectText';

import InteractiveMap, {
  type Location,
} from '@/components/layout/InteractiveMap';
import MapLocationModal from '@/components/layout/MapLocationModal';
import type { MapModalData } from '@/data/mapModalData';
import { getModalData } from '@/data/mapModalData';
import type { ImpactStackParamList } from '@/navigation/types';
import { BorderRadius, Colors, Spacing, Typography } from '@/shared/constants';
import { scaleFont, scaleDimensionLinear } from '@/shared/constants/responsiveSystem';

type MapModalScreenRouteProp = RouteProp<ImpactStackParamList, 'MapModal'>;

const MapModalScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<MapModalScreenRouteProp>();
  const locations = route.params?.locations;

  // State per il modal della location specifica
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [selectedLocationData, setSelectedLocationData] =
    useState<MapModalData | null>(null);

  const handleMarkerPress = useCallback((location: Location) => {
    const modalData = getModalData(location.id);
    if (modalData) {
      setSelectedLocationData(modalData);
      setLocationModalVisible(true);
    }
  }, []);

  const handleLocationModalClose = useCallback(() => {
    setLocationModalVisible(false);
    setSelectedLocationData(null);
  }, []);

  const handleClosePress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  if (!locations) {
    // Handle case where locations are not passed
    return (
      <View style={styles.container}>
        <PerfectText size={16} lines={1} fontWeight="400">
          Caricamento mappa...
        </PerfectText>
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
      {/* Header */}
      <View style={styles.header}>
        <PerfectText size={24} lines={1} fontWeight="400" style={styles.title}>
          Mappa Interattiva
        </PerfectText>
        <PerfectText
          size={16}
          lines={1}
          fontWeight="400"
          style={styles.subtitle}
        >
          Tocca i pin per maggiori dettagli
        </PerfectText>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClosePress}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons 
            name="close" 
            size={scaleDimensionLinear(24)} 
            color={Colors.neutral[0]} 
          />
        </TouchableOpacity>
      </View>

      {/* Modal per le location specifiche */}
      <MapLocationModal
        visible={locationModalVisible}
        data={selectedLocationData}
        onClose={handleLocationModalClose}
      />
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
    width: scaleFont(44),
    height: scaleFont(44),
    borderRadius: scaleFont(22),
    justifyContent: 'center',
    alignItems: 'center',
    // backdropFilter: 'blur(10px)', // For glassmorphism effect if supported
  },
  header: {
    position: 'absolute',
    top: Spacing[12],
    left: Spacing[5],
    right: Spacing[12],
    backgroundColor: `${Colors.neutral[0]}99`,
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[4],
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.neutral[600],
    textAlign: 'center',
  },
});

export default MapModalScreen;
