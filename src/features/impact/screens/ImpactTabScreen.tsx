import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import type { ImpactNavigationProp } from '../types/ImpactScreenTypes';
import { convertToMapLocations } from '../utils/mapHelpers';
import {
  ImpactHeader,
  TotalMealsSection,
  Results2024Section,
  CommunitySection,
  MapSection,
} from '../components';
import { PlatformScrollView, PerfectContainer } from '@components/ui';
import { useDeviceType } from '@/shared/hooks/useDeviceType';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@shared/constants/perfectScale';
import { logError } from '@/shared/utils/logger';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

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
  const { isTablet } = useDeviceType();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleMealsPress = useCallback(() => {
    try {
      navigation.navigate('Meals');
    } catch (error) {
      logError(
        'Navigation error to Meals screen',
        error instanceof Error ? error.message : String(error)
      );
    }
  }, [navigation]);

  const handleKitsPress = useCallback(() => {
    try {
      navigation.navigate('Kits');
    } catch (error) {
      logError(
        'Navigation error to Kits screen',
        error instanceof Error ? error.message : String(error)
      );
    }
  }, [navigation]);

  const handleVolunteersPress = useCallback(() => {
    try {
      navigation.navigate('Volunteers');
    } catch (error) {
      logError(
        'Navigation error to Volunteers screen',
        error instanceof Error ? error.message : String(error)
      );
    }
  }, [navigation]);

  const handlePartnersPress = useCallback(() => {
    try {
      navigation.navigate('Partners');
    } catch (error) {
      logError(
        'Navigation error to Partners screen',
        error instanceof Error ? error.message : String(error)
      );
    }
  }, [navigation]);

  const handleMapPress = useCallback(() => {
    try {
      // Apre la mappa fullscreen "Dove operiamo" con i paesi-evento (world map SVG)
      navigation.navigate('MapModal', { locations: convertToMapLocations() });
    } catch (error) {
      logError(
        'Navigation error to MapModal',
        error instanceof Error ? error.message : String(error)
      );
    }
  }, [navigation]);

  const scrollContentPadding =
    Math.max(insets.bottom, scale(BASE_PADDING)) +
    scale(TAB_BAR_HEIGHT) +
    scale(EXTRA_PADDING);

  return (
    <SafeAreaView
      style={styles.container}
      edges={['bottom']}
      accessibilityLabel="Schermata Impatto"
      testID="impact-tab-screen"
    >
      {/* Nessun modal locale: si usa schermata esistente "In Fase di Sviluppo" */}
      <PlatformScrollView
        contentContainerStyle={{
          paddingBottom: scrollContentPadding,
        }}
        accessibilityLabel="Scroll impatto e statistiche"
      >
        <PerfectContainer style={isTablet ? styles.tabletContainer : {}}>
          <ImpactHeader />

          <TotalMealsSection
            onMealsPress={handleMealsPress}
            onKitsPress={handleKitsPress}
          />

          <Results2024Section />

          {/* Linea divisoria tra Dal 2012 e Community */}
          <PerfectContainer style={styles.sectionDividerContainer}>
            <PerfectContainer style={styles.sectionDivider} />
          </PerfectContainer>

          <CommunitySection
            onVolunteersPress={handleVolunteersPress}
            onPartnersPress={handlePartnersPress}
          />

          {/* Linea divisoria tra Community e Mappa */}
          <PerfectContainer style={styles.sectionDividerContainer}>
            <PerfectContainer style={styles.sectionDivider} />
          </PerfectContainer>

          <MapSection onMapPress={handleMapPress} />
        </PerfectContainer>
      </PlatformScrollView>
    </SafeAreaView>
  );
};

const ImpactTabScreen = React.memo(ImpactTabScreenComponent);

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.neutral[50],
    },

    // Scroll Content - PADDING BOTTOM PER NAVIGATION (UNIFORMATO CON AZIONI)
    // scrollContent dinamico calcolato nel componente con safe-area

    // Tablet Container - IDENTICO AD HOME E AZIONI
    tabletContainer: {
      width: '70%',
      maxWidth: 640, // CAP per Landscape
      alignSelf: 'center',
    },

    // Section Dividers - IDENTICHE ALLA PAGINA AZIONI
    sectionDividerContainer: {
      paddingTop: PerfectSpacing.base,
      paddingBottom: PerfectSpacing.base,
      alignItems: 'center',
    },
    sectionDivider: {
      height: scale(2),
      backgroundColor: colors.neutral[200],
      width: scale(314), // Perfect System: 80% di 393px (iPhone 15), identico a linee Azioni
      marginVertical: PerfectSpacing.sm,
      alignSelf: 'center',
    },
  });

export default ImpactTabScreen;
