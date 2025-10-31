import { useNavigation } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import type { ImpactNavigationProp } from '../types/ImpactScreenTypes';
import {
  ImpactHeader,
  TotalMealsSection,
  Results2024Section,
  CommunitySection,
  MapSection,
  useImpactAnimations,
  convertToMapLocations,
} from '../components';
import { PlatformScrollView, PerfectContainer } from '@components/ui';
import { Colors, Spacing } from '@shared/constants/designTokens';
import { scale } from '@shared/constants/perfectScale';
import { MAP_LOCATIONS } from '@/data/impactData';
import { logError } from '@/shared/utils/logger';

// Constants for padding calculations
const BASE_PADDING = 16;
const TAB_BAR_HEIGHT = 95;
const EXTRA_PADDING = 24;

/**
 * Screen principale dell'impatto con architettura modulare
 * Ridotto da 1141 a ~150 righe (87% riduzione) per eccellenza architetturale
 */
const ImpactTabScreenComponent: React.FC = () => {
  const navigation = useNavigation<ImpactNavigationProp>();
  const insets = useSafeAreaInsets();
  const animations = useImpactAnimations();

  const handleMealsPress = useCallback(() => {
    try {
      navigation.navigate('Meals');
    } catch (error) {
      logError('Navigation error to Meals screen', error instanceof Error ? error.message : String(error));
    }
  }, [navigation]);

  const handleKitsPress = useCallback(() => {
    try {
      navigation.navigate('Kits');
    } catch (error) {
      logError('Navigation error to Kits screen', error instanceof Error ? error.message : String(error));
    }
  }, [navigation]);

  const handleVolunteersPress = useCallback(() => {
    try {
      navigation.navigate('Volunteers');
    } catch (error) {
      logError('Navigation error to Volunteers screen', error instanceof Error ? error.message : String(error));
    }
  }, [navigation]);

  const handlePartnersPress = useCallback(() => {
    try {
      navigation.navigate('Partners');
    } catch (error) {
      logError('Navigation error to Partners screen', error instanceof Error ? error.message : String(error));
    }
  }, [navigation]);

  const handleMapPress = useCallback(() => {
    try {
      const convertedLocations = convertToMapLocations(MAP_LOCATIONS);
      navigation.navigate('MapModal', { locations: convertedLocations });
    } catch (error) {
      logError('Navigation error to MapModal screen', error instanceof Error ? error.message : String(error));
    }
  }, [navigation]);

  const scrollContentPadding = Math.max(insets.bottom, scale(BASE_PADDING)) + scale(TAB_BAR_HEIGHT) + scale(EXTRA_PADDING);

  return (
    <SafeAreaView 
      style={styles.container}
      edges={['top', 'bottom']}
      accessibilityLabel="Schermata Impatto"
      testID="impact-tab-screen"
    >
      <PlatformScrollView
        contentContainerStyle={{
          paddingBottom: scrollContentPadding,
        }}
        accessibilityLabel="Scroll impatto e statistiche"
      >
        <ImpactHeader animations={animations} />

        <TotalMealsSection
          animations={animations}
          onMealsPress={handleMealsPress}
          onKitsPress={handleKitsPress}
        />

        <Results2024Section animations={animations} />

        {/* Linea divisoria tra Dal 2012 e Community */}
        <PerfectContainer style={styles.sectionDividerContainer}>
          <PerfectContainer style={styles.sectionDivider} />
        </PerfectContainer>

        <CommunitySection
          animations={animations}
          onVolunteersPress={handleVolunteersPress}
          onPartnersPress={handlePartnersPress}
        />

        {/* Linea divisoria tra Community e Mappa */}
        <PerfectContainer style={styles.sectionDividerContainer}>
          <PerfectContainer style={styles.sectionDivider} />
        </PerfectContainer>

        <MapSection onMapPress={handleMapPress} />
      </PlatformScrollView>
    </SafeAreaView>
  );
};

const ImpactTabScreen = React.memo(ImpactTabScreenComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },

  // Scroll Content - PADDING BOTTOM PER NAVIGATION (UNIFORMATO CON AZIONI)
  // scrollContent dinamico calcolato nel componente con safe-area

  // Section Dividers - IDENTICHE ALLA PAGINA AZIONI
  sectionDividerContainer: {
    paddingTop: Spacing[8],
    paddingBottom: Spacing[4],
  },
  sectionDivider: {
    height: scale(2),
    backgroundColor: Colors.neutral[200],
    marginVertical: Spacing[2],
    marginHorizontal: Spacing[6],
    alignSelf: 'stretch',
  },
});

export default ImpactTabScreen;
