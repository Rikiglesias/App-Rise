import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import type { MapModalData } from '../data/mapModalData';
import { getModalData } from '../data/mapModalData';
import {
  PerfectText,
  PerfectContainer,
  PlatformTouchable,
} from '@/components/ui';

import InteractiveMap, {
  type Location,
} from '@/components/layout/InteractiveMap';
import MapLocationModal from '@/components/layout/MapLocationModal';
import type { ImpactStackParamList } from '@/navigation/types';
import { BorderRadius, Colors, PerfectSpacing } from '@/shared/constants';
import { scaleTouch, scaleSpacing } from '@/shared/constants/perfectScale';

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
      <PerfectContainer style={styles.container}>
        <PerfectText size={16} lines={1} fontWeight="400">
          Caricamento mappa...
        </PerfectText>
      </PerfectContainer>
    );
  }

  return (
    <PerfectContainer style={styles.container}>
      <InteractiveMap
        locations={locations}
        onMarkerPress={handleMarkerPress}
        isFullScreen
      />
      {/* Header */}
      <PerfectContainer style={styles.header}>
        <PerfectText size={24} lines={1} fontWeight="700" style={styles.title}>
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

        <PlatformTouchable
          style={styles.closeButton}
          onPress={handleClosePress}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="close"
            size={24}
            color={Colors.neutral[0]}
          />
        </PlatformTouchable>
      </PerfectContainer>

      {/* Modal per le location specifiche */}
      <MapLocationModal
        visible={locationModalVisible}
        data={selectedLocationData}
        onClose={handleLocationModalClose}
      />
    </PerfectContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[100],
  },
  closeButton: {
    position: 'absolute',
    top: PerfectSpacing['3xl'],
    right: scaleSpacing(20),
    backgroundColor: `${Colors.neutral[0]}99`,
    width: scaleTouch(44),
    height: scaleTouch(44),
    borderRadius: /* scaleFont(22) */ 22,
    justifyContent: 'center',
    alignItems: 'center',
    // backdropFilter: 'blur(10px)', // For glassmorphism effect if supported
  },
  header: {
    position: 'absolute',
    top: PerfectSpacing['3xl'],
    left: scaleSpacing(20),
    right: PerfectSpacing['3xl'],
    backgroundColor: `${Colors.neutral[0]}99`,
    paddingVertical: PerfectSpacing.sm,
    paddingHorizontal: PerfectSpacing.base,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: Colors.neutral[900],
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.neutral[600],
    textAlign: 'center',
  },
});

export default MapModalScreen;
