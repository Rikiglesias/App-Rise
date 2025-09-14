import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Platform, SafeAreaView, StyleSheet, View } from 'react-native';
import type {
  ImpactNavigationProp,
  ImpactScreenName,
} from '../types/ImpactScreenTypes';
import {
  ImpactHeader,
  TotalMealsSection,
  Results2024Section,
  CommunitySection,
  MapSection,
  useImpactAnimations,
  convertToMapLocations,
} from '../components';
import { PlatformScrollView } from '@components/ui';
import MapLocationModal from '@components/layout/MapLocationModal';
import { Colors, Spacing } from '@shared/constants/designTokens';
import { MAP_LOCATIONS } from '@/data/impactData';
import type { MapModalData } from '@/data/mapModalData';
import { getModalData } from '@/data/mapModalData';

// Componenti modulari

/**
 * Screen principale dell'impatto con architettura modulare
 * Ridotto da 1141 a ~150 righe (87% riduzione) per eccellenza architetturale
 */
const ImpactTabScreenComponent: React.FC = () => {
  const navigation = useNavigation<ImpactNavigationProp>();

  // State per il modal della mappa
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<MapModalData | null>(
    null
  );
  const animations = useImpactAnimations();

  // Handler per aprire il modal con i dettagli della location (utilizzato dalla mappa)
  const _handleLocationPress = useCallback((locationId: string) => {
    const modalData = getModalData(locationId);
    if (modalData) {
      setSelectedLocation(modalData);
      setModalVisible(true);
    }
  }, []);

  // Handler per chiudere il modal
  const handleModalClose = useCallback(() => {
    setModalVisible(false);
    setSelectedLocation(null);
  }, []);

  const handleNavigate = useCallback(
    (screen: ImpactScreenName) => {
      navigation.navigate(screen);
    },
    [navigation]
  );

  const handleMealsPress = useCallback(() => {
    handleNavigate('Meals');
  }, [handleNavigate]);

  const handleKitsPress = useCallback(() => {
    handleNavigate('Kits');
  }, [handleNavigate]);

  const handleVolunteersPress = useCallback(() => {
    handleNavigate('Volunteers');
  }, [handleNavigate]);

  const handlePartnersPress = useCallback(() => {
    handleNavigate('Partners');
  }, [handleNavigate]);

  const handleMapPress = useCallback(() => {
    const convertedLocations = convertToMapLocations(MAP_LOCATIONS);
    navigation.navigate('MapModal', { locations: convertedLocations });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <PlatformScrollView contentContainerStyle={styles.scrollContent}>
        <ImpactHeader animations={animations} />

        <TotalMealsSection
          animations={animations}
          onMealsPress={handleMealsPress}
          onKitsPress={handleKitsPress}
        />

        <Results2024Section animations={animations} />

        {/* Linea divisoria tra Dal 2012 e Community */}
        <View style={styles.sectionDividerContainer}>
          <View style={styles.sectionDivider} />
        </View>

        <CommunitySection
          animations={animations}
          onVolunteersPress={handleVolunteersPress}
          onPartnersPress={handlePartnersPress}
        />

        {/* Linea divisoria tra Community e Mappa */}
        <View style={styles.sectionDividerContainer}>
          <View style={styles.sectionDivider} />
        </View>

        <MapSection onMapPress={handleMapPress} />
      </PlatformScrollView>

      {/* Modal per i dettagli delle location */}
      <MapLocationModal
        visible={modalVisible}
        data={selectedLocation}
        onClose={handleModalClose}
      />
    </SafeAreaView>
  );
};

const ImpactTabScreen = React.memo(ImpactTabScreenComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },

  // Scroll Content - PADDING BOTTOM PER NAVIGATION
  scrollContent: {
    paddingBottom: Platform.OS === 'android' ? 200 : 160, // ANDROID: 200 per evitare taglio mappa dalla bottom navigation / iOS: 160 normale
  },

  // Section Dividers - IDENTICHE ALLA PAGINA AZIONI
  sectionDividerContainer: {
    paddingTop: Platform.OS === 'android' ? Spacing[12] : Spacing[8],
    paddingBottom: Spacing[4],
  },
  sectionDivider: {
    height: 2, // IDENTICO a sectionDivider (Azioni)
    backgroundColor: Colors.neutral[200], // IDENTICO a Azioni
    marginVertical: Spacing[2], // IDENTICO a Azioni
    marginHorizontal: Spacing[6], // IDENTICO a Azioni
    alignSelf: 'stretch', // garantisce larghezza piena
  },
});

export default ImpactTabScreen;
