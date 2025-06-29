import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useRef, useState } from 'react';
import { Animated, Image, SafeAreaView, StyleSheet, View } from 'react-native';
import { PlatformScrollView, PlatformTouchable } from '../../../components/ui';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';

import type { Location } from '../../../components/layout/InteractiveMap';
import MapLocationModal from '../../../components/layout/MapLocationModal';
import { MAP_LOCATIONS } from '../../../data/impactData';
import type { MapModalData } from '../../../data/mapModalData';
import { getModalData } from '../../../data/mapModalData';
import {
  Colors,
  Spacing,
  Typography,
} from '../../../shared/constants/designTokens';
import type {
  ImpactNavigationProp,
  ImpactScreenName,
} from '../types/ImpactScreenTypes';

// const { width: screenWidth } = Dimensions.get('window'); // Rimosso - non più utilizzato

// Animation Hook - OTTIMIZZATO PERFORMANCE
const useImpactAnimations = () => {
  const fadeAnim = useRef(new Animated.Value(1)).current; // Start visible
  const slideAnim = useRef(new Animated.Value(0)).current; // Start in position
  const scaleAnim = useRef(new Animated.Value(1)).current; // Start at full scale
  const statsAnimations = useRef([
    new Animated.Value(1), // SIMPLIFIED: Start all visible
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ] as const).current;

  // REMOVED COMPLEX ANIMATIONS FOR PERFORMANCE
  // Simply return static values for maximum performance

  return { fadeAnim, slideAnim, scaleAnim, statsAnimations };
};

// Header Section
const ImpactHeader: React.FC<{
  animations: ReturnType<typeof useImpactAnimations>;
}> = ({ animations }) => {
  return (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          opacity: animations.fadeAnim,
          transform: [
            { translateY: animations.slideAnim },
            { scale: animations.scaleAnim },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={['rgba(55, 65, 81, 0.03)', 'transparent']}
        style={styles.backgroundPattern}
      />

      <View style={styles.mainHeaderContainer}>
        <ResponsiveText style={[{ fontSize: 40 }, styles.titleText]}>
          Il Nostro{'\n'}
          <ResponsiveText style={[{ fontSize: 40 }, styles.titleAccent]}>
            Impatto
          </ResponsiveText>
        </ResponsiveText>
        <ResponsiveText style={[{ fontSize: 16 }, styles.mainSubtitle]}>
          Risultati concreti nella lotta contro la fame mondiale
        </ResponsiveText>
      </View>
    </Animated.View>
  );
};

// Total Meals Section
const TotalMealsSection: React.FC<{
  animations: ReturnType<typeof useImpactAnimations>;
  onMealsPress: () => void;
  onKitsPress: () => void;
}> = ({ animations, onMealsPress, onKitsPress }) => {
  return (
    <View style={styles.totalMealsSection}>
      {/* Linea divisoria tra header e sezione Dal 2012 */}
      <View style={styles.titleSeparatorContainer}>
        <View style={styles.titleSeparator} />
      </View>

      {/* Header POTENZIATO con decorazioni eleganti */}
      <Animated.View
        style={[
          styles.numbersHeaderContainer,
          {
            opacity: animations.statsAnimations[0],
            transform: [{ scale: animations.statsAnimations[0] }],
          },
        ]}
      >
        <View style={styles.numbersHeaderBackground}>
          <ResponsiveText style={[{ fontSize: 24 }, styles.numbersTitle]}>
            <ResponsiveText style={{ fontSize: 22 }}>📊</ResponsiveText> I
            Nostri Numeri
          </ResponsiveText>
          <ResponsiveText style={[{ fontSize: 16 }, styles.numbersSubtitle]}>
            Milioni di vite cambiate, un pasto alla volta
          </ResponsiveText>
        </View>
      </Animated.View>

      <View style={styles.totalStatsRow}>
        <Animated.View
          style={[
            styles.totalStatCard,
            {
              opacity: animations.statsAnimations[0],
              transform: [{ scale: animations.statsAnimations[0] }],
            },
          ]}
        >
          <PlatformTouchable onPress={onMealsPress} activeOpacity={0.9}>
            <LinearGradient
              colors={['#DC2626', '#B91C1C', '#991B1B']}
              style={styles.totalGradientContainer}
            >
              <View style={styles.totalCardContent}>
                <MaterialCommunityIcons
                  name="food-apple"
                  size={28} // RIDOTTO: da 32 a 28 per proporzioni migliori
                  color="#DC2626"
                  style={styles.totalCardIcon}
                />
                <ResponsiveText
                  style={[{ fontSize: 26 }, styles.totalStatValue]}
                >
                  15.8M
                </ResponsiveText>
                <ResponsiveText
                  style={[{ fontSize: 16 }, styles.totalStatLabel]}
                >
                  Pasti Totali
                </ResponsiveText>
                <ResponsiveText
                  style={[{ fontSize: 14 }, styles.totalStatSubtitle]}
                >
                  Dal 2012 - Meals
                </ResponsiveText>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#DC2626"
                  style={styles.chevronIcon}
                />
              </View>
            </LinearGradient>
          </PlatformTouchable>
        </Animated.View>

        <Animated.View
          style={[
            styles.totalStatCard,
            {
              opacity: animations.statsAnimations[1],
              transform: [{ scale: animations.statsAnimations[1] }],
            },
          ]}
        >
          <PlatformTouchable onPress={onKitsPress} activeOpacity={0.9}>
            <LinearGradient
              colors={['#1F2937', '#374151', '#111827']}
              style={styles.totalGradientContainer}
            >
              <View style={styles.totalCardContent}>
                <MaterialCommunityIcons
                  name="package-variant"
                  size={28} // RIDOTTO: da 32 a 28 per proporzioni migliori
                  color="#1F2937"
                  style={styles.totalCardIcon}
                />
                <ResponsiveText
                  style={[{ fontSize: 26 }, styles.totalStatValue]}
                >
                  142K
                </ResponsiveText>
                <ResponsiveText
                  style={[{ fontSize: 16 }, styles.totalStatLabel]}
                >
                  Kit Totali
                </ResponsiveText>
                <ResponsiveText
                  style={[{ fontSize: 14 }, styles.totalStatSubtitle]}
                >
                  Dal 2020 - Kits
                </ResponsiveText>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#1F2937"
                  style={styles.chevronIcon}
                />
              </View>
            </LinearGradient>
          </PlatformTouchable>
        </Animated.View>
      </View>
    </View>
  );
};

// Risultati 2024 - RINOMINATA E RIPROGETTATA
const Results2024Section: React.FC<{
  animations: ReturnType<typeof useImpactAnimations>;
}> = ({ animations }) => {
  return (
    <View style={styles.record2024Section}>
      {/* Header DRAMATICALLY ENHANCED */}
      <Animated.View
        style={[
          styles.results2024HeaderContainer,
          {
            opacity: animations.statsAnimations[1],
            transform: [{ scale: animations.statsAnimations[1] }],
          },
        ]}
      >
        <View style={styles.results2024HeaderBackground}>
          <ResponsiveText style={[{ fontSize: 24 }, styles.results2024Title]}>
            <ResponsiveText style={{ fontSize: 22 }}>🎯</ResponsiveText>{' '}
            Risultati Raggiunti
          </ResponsiveText>
          <ResponsiveText
            style={[{ fontSize: 16 }, styles.results2024Subtitle]}
          >
            I numeri che raccontano il nostro impegno annuale
          </ResponsiveText>
        </View>
      </Animated.View>

      {/* Cards informative senza "superato" */}
      <View style={styles.record2024Grid}>
        <Animated.View
          style={[
            styles.record2024Card,
            {
              opacity: animations.statsAnimations[2],
              transform: [{ scale: animations.statsAnimations[2] }],
            },
          ]}
        >
          <View style={styles.record2024CardContent}>
            <MaterialCommunityIcons
              name="food-apple"
              size={28}
              color="#DC2626"
            />
            <ResponsiveText style={[{ fontSize: 24 }, styles.record2024Value]}>
              3.14M
            </ResponsiveText>
            <ResponsiveText
              style={[{ fontSize: 18 }, styles.record2024Label]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >
              Pasti Confezionati
            </ResponsiveText>
            <ResponsiveText
              style={[{ fontSize: 14 }, styles.record2024Description]}
            >
              Prodotti nel 2024
            </ResponsiveText>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.record2024Card,
            {
              opacity: animations.statsAnimations[3],
              transform: [{ scale: animations.statsAnimations[3] }],
            },
          ]}
        >
          <View style={styles.record2024CardContent}>
            <MaterialCommunityIcons
              name="package-variant"
              size={28}
              color="#1F2937"
            />
            <ResponsiveText style={[{ fontSize: 24 }, styles.record2024Value]}>
              16.3K
            </ResponsiveText>
            <ResponsiveText
              style={[{ fontSize: 18 }, styles.record2024Label]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >
              Kit Confezionati
            </ResponsiveText>
            <ResponsiveText
              style={[{ fontSize: 14 }, styles.record2024Description]}
            >
              Creati nel 2024
            </ResponsiveText>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

// Community Section con descrizione
const CommunitySection: React.FC<{
  animations: ReturnType<typeof useImpactAnimations>;
  onVolunteersPress: () => void;
  onPartnersPress: () => void;
}> = ({ animations, onVolunteersPress, onPartnersPress }) => {
  return (
    <View style={styles.communitySection}>
      {/* Header RIVOLUZIONATO con elementi community */}
      <Animated.View
        style={[
          styles.communityHeaderContainer,
          {
            opacity: animations.statsAnimations[2],
            transform: [{ scale: animations.statsAnimations[2] }],
          },
        ]}
      >
        <View style={styles.communityHeaderBackground}>
          <ResponsiveText style={[{ fontSize: 24 }, styles.communityTitle]}>
            <ResponsiveText style={{ fontSize: 22 }}>🤝</ResponsiveText> La
            Nostra Community
          </ResponsiveText>
          <ResponsiveText style={[{ fontSize: 16 }, styles.communitySubtitle]}>
            Volontari e partner uniti nella missione #famezero
          </ResponsiveText>
        </View>
      </Animated.View>

      <View style={styles.communityRow}>
        <Animated.View
          style={[
            styles.communityCard,
            {
              opacity: animations.statsAnimations[2],
              transform: [{ scale: animations.statsAnimations[2] }],
            },
          ]}
        >
          <PlatformTouchable onPress={onVolunteersPress} activeOpacity={0.9}>
            <LinearGradient
              colors={['#10B981', '#059669', '#047857']}
              style={styles.communityGradientContainer}
            >
              <View style={styles.communityCardContent}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={28}
                  color="#10B981"
                  style={styles.communityCardIcon}
                />
                <ResponsiveText
                  style={[{ fontSize: 24 }, styles.communityStatValue]}
                >
                  13.323
                </ResponsiveText>
                <ResponsiveText
                  style={[{ fontSize: 16 }, styles.communityStatLabel]}
                >
                  Volontari 2024
                </ResponsiveText>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#10B981"
                  style={styles.chevronIcon}
                />
              </View>
            </LinearGradient>
          </PlatformTouchable>
        </Animated.View>

        <Animated.View
          style={[
            styles.communityCard,
            {
              opacity: animations.statsAnimations[3],
              transform: [{ scale: animations.statsAnimations[3] }],
            },
          ]}
        >
          <PlatformTouchable onPress={onPartnersPress} activeOpacity={0.9}>
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
              style={styles.communityGradientContainer}
            >
              <View style={styles.communityCardContent}>
                <MaterialCommunityIcons
                  name="handshake"
                  size={28}
                  color="#8B5CF6"
                  style={styles.communityCardIcon}
                />
                <ResponsiveText
                  style={[{ fontSize: 24 }, styles.communityStatValue]}
                >
                  150+
                </ResponsiveText>
                <ResponsiveText
                  style={[{ fontSize: 16 }, styles.communityStatLabel]}
                >
                  Partner Attivi
                </ResponsiveText>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#8B5CF6"
                  style={styles.chevronIcon}
                />
              </View>
            </LinearGradient>
          </PlatformTouchable>
        </Animated.View>
      </View>
    </View>
  );
};

// Map Section - OTTIMIZZATA PERFORMANCE
const MapSection: React.FC<{
  onMapPress: () => void;
}> = React.memo(({ onMapPress }) => {
  const handleMapImagePress = useCallback(() => {
    onMapPress(); // Apre la mappa completa con tutti i pin
  }, [onMapPress]);

  return (
    <View style={styles.mapSection}>
      {/* Header GEOGRAFICO con elementi di location */}
      <View style={styles.mapHeaderContainer}>
        <View style={styles.mapHeaderBackground}>
          <ResponsiveText style={[{ fontSize: 24 }, styles.mapTitle]}>
            <ResponsiveText style={{ fontSize: 22 }}>🌍</ResponsiveText> Dove
            Operiamo
          </ResponsiveText>
          <ResponsiveText style={[{ fontSize: 16 }, styles.mapSubtitle]}>
            Le nostre operazioni nel mondo
          </ResponsiveText>
        </View>
      </View>

      {/* CONTAINER MAPPA CLICCABILE - RIEMPIE TUTTO */}
      <PlatformTouchable
        style={styles.mapImageContainer}
        onPress={handleMapImagePress} // Mostra i dettagli dell'Italia per default
        activeOpacity={0.85}
      >
        <Image
          source={require('../../../../assets/images/mappa.png')}
          style={styles.mapImage}
          resizeMode="cover"
        />

        {/* INDICATORE CLICCABILE */}
        <View style={styles.mapClickIndicator}>
          <MaterialCommunityIcons
            name="fullscreen"
            size={20}
            color={Colors.neutral[600]}
          />
          <ResponsiveText style={[{ fontSize: 12 }, styles.mapClickText]}>
            Tocca per mappa completa
          </ResponsiveText>
        </View>
      </PlatformTouchable>
    </View>
  );
});

MapSection.displayName = 'MapSection';

// Funzione per convertire MAP_LOCATIONS nel formato per InteractiveMap
const convertToMapLocations = (locations: typeof MAP_LOCATIONS): Location[] => {
  return locations.map(location => ({
    id: location.id,
    name: location.name,
    country: location.country,
    coordinates: {
      latitude: location.latitude,
      longitude: location.longitude,
    },
    projects: 1, // Ogni location ha almeno un progetto
    beneficiaries: location.stats.beneficiaries.toLocaleString(),
    status: location.id === 'ukraine' ? 'emergency' : 'active',
    description: location.description,
    image: `https://picsum.photos/400/200?random=${location.id}`, // Placeholder image
    ...(location.stats.meals && { meals: location.stats.meals }),
    ...(location.stats.kits && { kits: location.stats.kits }),
    ...(location.id === 'italy' &&
      location.stats.beneficiaries && {
        volunteers: location.stats.beneficiaries,
      }),
  }));
};

// Main Component
const ImpactTabScreen: React.FC = () => {
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

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  // Header - IDENTICO PAGINA AZIONI
  headerContainer: {
    paddingTop: Spacing[3], // AGGIUNTO: stessa altezza di "Fai la differenza"
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[6], // AUMENTATO: più spazio sotto il titolo principale
    alignItems: 'center',
    position: 'relative',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.02, // RIDOTTO per sottilità
  },
  // CONTAINER ELEGANTE COLORATO COME PAGINA AZIONI
  mainHeaderContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.03)', // BACKGROUND COLORATO ELEGANTE
    paddingVertical: Spacing[3], // COME PAGINA AZIONI
    paddingHorizontal: Spacing[5], // COME PAGINA AZIONI
    borderRadius: 16, // MODERNO COME PAGINA AZIONI
    borderWidth: 1,
    borderColor: 'rgba(31, 41, 55, 0.08)', // BORDO GRIGIO SOTTILE
    shadowColor: '#1F2937', // OMBRA GRIGIA COORDINATA
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  // TIPOGRAFIA POTENTE E MODERNA - INGRANDITA
  titleText: {
    // fontSize rimosso - ora gestito da ResponsiveText
    fontWeight: Typography.weights.black, // MASSIMO peso per autorità
    color: '#1F2937', // NERO per contrasto come richiesto
    textAlign: 'center',
    letterSpacing: -1.2, // LEGGERMENTE AUMENTATO per bilanciare la dimensione
    lineHeight: 42, // AUMENTATO per proporzioni
    marginBottom: Spacing[2], // SPAZIO per separazione
    textShadowColor: 'rgba(31, 41, 55, 0.15)', // OMBRA SOTTILE
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    includeFontPadding: false,
  },
  // ACCENTO ROSSO STRATEGICO
  titleAccent: {
    color: '#DC2626', // ROSSO BRAND per accento
    textShadowColor: 'rgba(220, 38, 38, 0.15)', // OMBRA COORDINATA
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  // SUBTITLE INLINE INGRANDITO E ELEGANTE
  mainSubtitle: {
    // fontSize rimosso - ora gestito da ResponsiveText
    fontWeight: Typography.weights.medium, // MEDIUM COME PAGINA AZIONI
    color: '#374151', // GRIGIO COORDINATO COME PAGINA AZIONI
    textAlign: 'center',
    letterSpacing: 0.2, // RIDOTTO PER ELEGANZA
    marginTop: Spacing[1], // SPACING COORDINATO
    opacity: 0.8, // TRASPARENZA ELEGANTE
  },
  // Header Divider - ALLARGATO PER COMPENSARE
  titleSeparator: {
    height: 3, // PIÙ GROSSA: prima linea più prominente (IDENTICO PAGINA AZIONI)
    backgroundColor: Colors.neutral[300], // PIÙ SOFT per eleganza (IDENTICO PAGINA AZIONI)
    width: '90%', // ALLARGATO: da 80% a 90% per compensare eventuali padding extra
    borderRadius: 1, // IDENTICO PAGINA AZIONI
    opacity: 0.8, // SOTTILE trasparenza per delicatezza (IDENTICO PAGINA AZIONI)
    alignSelf: 'center',
    // OMBRA ELEGANTE per profondità sottile (IDENTICA PAGINA AZIONI)
    shadowColor: Colors.neutral[400],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  // Container divisorio IDENTICO PAGINA AZIONI
  titleSeparatorContainer: {
    paddingHorizontal: Spacing[4], // IDENTICO PAGINA AZIONI
    paddingVertical: Spacing[4], // IDENTICO PAGINA AZIONI: stesso spacing del HeaderDivider (16px)
    alignItems: 'center', // IDENTICO PAGINA AZIONI
  },

  // Total Meals Section - SPAZIATURE IDENTICHE PAGINA AZIONI
  totalMealsSection: {
    paddingHorizontal: Spacing[4],
    marginBottom: Spacing[2], // RIDOTTO: sezioni più compatte IDENTICO PAGINA AZIONI
  },

  totalStatsRow: {
    flexDirection: 'row',
    gap: Spacing[4],
  },
  totalStatCard: {
    flex: 1,
  },
  totalGradientContainer: {
    borderRadius: 24,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  totalCardContent: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 21,
    paddingVertical: Spacing[3], // RIDOTTO: da Spacing[5] a Spacing[3] per bottoni più compatti
    alignItems: 'center',
  },
  totalCardIcon: {
    marginBottom: Spacing[3],
  },
  totalStatValue: {
    // fontSize rimosso - ora gestito da ResponsiveText
    fontWeight: Typography.weights.black,
    color: '#1F2937', // NERO invece che rosso
    marginBottom: Spacing[1],
  },
  totalStatLabel: {
    // fontSize rimosso - ora gestito da ResponsiveText
    fontWeight: Typography.weights.bold,
    color: '#374151',
    marginBottom: Spacing[1],
  },
  totalStatSubtitle: {
    // fontSize rimosso - ora gestito da ResponsiveText
    color: '#6B7280',
  },

  // Community Section
  communitySection: {
    paddingHorizontal: Spacing[4],
    marginTop: Spacing[6], // AGGIUNTO: spazio generoso tra linea e titolo "La Nostra Community"
    marginBottom: Spacing[6],
  },

  communityRow: {
    flexDirection: 'row',
    gap: Spacing[4],
  },
  communityCard: {
    flex: 1,
  },
  communityGradientContainer: {
    borderRadius: 20,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  communityCardContent: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 17,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[3],
    alignItems: 'center',
    position: 'relative',
  },
  communityCardIcon: {
    marginBottom: Spacing[3],
  },
  communityStatValue: {
    // fontSize rimosso - ora gestito da ResponsiveText
    fontWeight: Typography.weights.bold,
    color: '#1F2937',
    marginBottom: Spacing[1],
  },
  communityStatLabel: {
    // fontSize rimosso - ora gestito da ResponsiveText
    fontWeight: Typography.weights.semibold,
    color: '#374151',
    textAlign: 'center',
  },
  chevronIcon: {
    position: 'absolute',
    top: Spacing[2],
    right: Spacing[2],
  },

  // Map Section - SENZA CONTAINER GRIGIO
  mapSection: {
    paddingHorizontal: Spacing[4],
    marginTop: Spacing[6], // AGGIUNTO: spazio generoso tra linea e titolo "Dove Operiamo"
  },

  // MAP CONTAINER CLICCABILE - RIEMPIE TUTTO SENZA BORDI
  mapImageContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 20,
    marginTop: Spacing[4],
    marginHorizontal: 0, // RIMOSSO: margini laterali per riempire tutto
    padding: 0, // RIMOSSO: padding per eliminare bordi vuoti
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
    height: 280, // ALTEZZA FISSA: per container stabile
    // FEEDBACK VISIVO CLICCABILE
    borderWidth: 1,
    borderColor: 'transparent',
  },
  mapImage: {
    width: '100%',
    height: '100%', // RIEMPIE TUTTO: il container senza bordi
    borderRadius: 20, // UGUALE AL CONTAINER: per bordi perfetti
    marginTop: -30, // OTTIMIZZATO: per mostrare parte inferiore
  },
  // INDICATORE CLICCABILE
  mapClickIndicator: {
    position: 'absolute',
    top: Spacing[2],
    right: Spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    borderRadius: 12,
    gap: Spacing[1],
  },
  mapClickText: {
    // fontSize rimosso - ora gestito da ResponsiveText
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[600],
  },

  // Record 2024 Section - INGRANDITA
  record2024Section: {
    paddingHorizontal: Spacing[4],
    marginTop: Spacing[6],
    marginBottom: Spacing[8],
  },
  record2024Grid: {
    flexDirection: 'row',
    gap: Spacing[4],
  },
  record2024Card: {
    flex: 1,
  },
  record2024CardContent: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 16,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[3],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  record2024Value: {
    // fontSize rimosso - ora gestito da ResponsiveText
    fontWeight: Typography.weights.bold,
    color: '#1F2937',
    marginTop: Spacing[2],
    marginBottom: Spacing[1],
  },

  record2024Label: {
    // fontSize rimosso - ora gestito da ResponsiveText
    fontWeight: Typography.weights.semibold,
    color: '#374151',
    marginBottom: Spacing[1],
    textAlign: 'center',
  },
  record2024Description: {
    // fontSize rimosso - ora gestito da ResponsiveText
    fontWeight: Typography.weights.medium,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: Spacing[1],
  },

  // Scroll Content - PADDING BOTTOM PER NAVIGATION
  scrollContent: {
    paddingBottom: 120, // AGGIUNTO: spazio più ampio per evitare sovrapposizione bottom navigation
  },

  // Section Dividers - IDENTICHE ALLA PAGINA AZIONI
  sectionDividerContainer: {
    paddingTop: Spacing[8], // AUMENTATO: da Spacing[6] a Spacing[8] - maggiore respiro tra titoli sezioni e linee
    paddingBottom: Spacing[4], // AUMENTATO: da Spacing[2] a Spacing[4] - spazio equilibrato sotto
  },
  sectionDivider: {
    height: 2, // STANDARD: spessore normale per separazioni
    backgroundColor: Colors.neutral[200], // CORRETTO: stesso colore delle linee tra sezioni nella pagina Azioni
    marginHorizontal: Spacing[10], // CORRETTO: 40px = 16px (container Azioni) + 24px (margine Azioni)
  },

  // Total Meals Section - SPAZIATURE IDENTICHE PAGINA AZIONI
  numbersHeaderContainer: {
    alignItems: 'center',
    marginTop: Spacing[6], // AGGIUNTO: spazio generoso tra linea principale e titolo "I Nostri Numeri"
    marginBottom: Spacing[10], // ULTERIORMENTE AUMENTATO: spazio ottimale tra titolo e bottoni IDENTICO PAGINA AZIONI
  },
  numbersHeaderBackground: {
    backgroundColor: 'rgba(55, 65, 81, 0.03)', // GRIGIO MOLTO SOTTILE
    borderRadius: 20,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[6],
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.08)',
    shadowColor: '#374151',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  numbersTitle: {
    // fontSize rimosso - ora gestito da ResponsiveText
    fontWeight: Typography.weights.bold, // BOLD normale
    color: '#374151', // GRIGIO ELEGANTE
    textAlign: 'center',
    letterSpacing: -0.4,
    includeFontPadding: false,
    textShadowColor: 'rgba(55, 65, 81, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  numbersSubtitle: {
    // fontSize rimosso - ora gestito da ResponsiveText
    color: '#4B5563', // GRIGIO MEDIO per leggibilità
    textAlign: 'center',
    marginTop: Spacing[3],
    opacity: 0.9,
    letterSpacing: 0.1,
  },

  // Community Section - RIVOLUZIONATO
  communityHeaderContainer: {
    alignItems: 'center',
    marginBottom: Spacing[6],
  },
  communityHeaderBackground: {
    backgroundColor: 'rgba(55, 65, 81, 0.03)', // GRIGIO MOLTO SOTTILE
    borderRadius: 20,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[6],
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.08)',
    shadowColor: '#374151',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  communityTitle: {
    // fontSize rimosso - ora gestito da ResponsiveText
    fontWeight: Typography.weights.bold, // BOLD normale
    color: '#374151', // GRIGIO ELEGANTE
    textAlign: 'center',
    letterSpacing: -0.4,
    includeFontPadding: false,
    textShadowColor: 'rgba(55, 65, 81, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  communitySubtitle: {
    // fontSize rimosso - ora gestito da ResponsiveText
    color: '#4B5563', // GRIGIO MEDIO per leggibilità
    textAlign: 'center',
    marginTop: Spacing[3],
    opacity: 0.9,
    letterSpacing: 0.1,
  },

  // Map Section - GEOGRAFICO
  mapHeaderContainer: {
    alignItems: 'center',
    marginBottom: Spacing[6],
  },

  mapHeaderBackground: {
    backgroundColor: 'rgba(55, 65, 81, 0.03)', // GRIGIO MOLTO SOTTILE
    borderRadius: 20,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[6],
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.08)',
    shadowColor: '#374151',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mapTitle: {
    // fontSize rimosso - ora gestito da ResponsiveText
    fontWeight: Typography.weights.bold, // BOLD normale
    color: '#374151', // GRIGIO ELEGANTE
    textAlign: 'center',
    letterSpacing: -0.4,
    includeFontPadding: false,
    textShadowColor: 'rgba(55, 65, 81, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  mapSubtitle: {
    // fontSize rimosso - ora gestito da ResponsiveText
    color: '#4B5563', // GRIGIO MEDIO per leggibilità
    textAlign: 'center',
    marginTop: Spacing[3],
    opacity: 0.9,
    letterSpacing: 0.1,
  },

  // Results 2024 Section - DRAMATICALLY ENHANCED
  results2024HeaderContainer: {
    alignItems: 'center',
    marginBottom: Spacing[6],
  },

  results2024HeaderBackground: {
    backgroundColor: 'rgba(55, 65, 81, 0.03)', // GRIGIO MOLTO SOTTILE
    borderRadius: 20,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[6],
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.08)',
    shadowColor: '#374151',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  results2024Title: {
    // fontSize rimosso - ora gestito da ResponsiveText
    fontWeight: Typography.weights.bold, // BOLD normale
    color: '#374151', // GRIGIO ELEGANTE
    textAlign: 'center',
    letterSpacing: -0.4,
    includeFontPadding: false,
    textShadowColor: 'rgba(55, 65, 81, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  results2024Subtitle: {
    // fontSize rimosso - ora gestito da ResponsiveText
    fontWeight: Typography.weights.medium,
    color: '#4B5563', // GRIGIO MEDIO per leggibilità
    textAlign: 'center',
    marginTop: Spacing[3],
    opacity: 0.9,
    letterSpacing: 0.1,
  },
});

export default ImpactTabScreen;
