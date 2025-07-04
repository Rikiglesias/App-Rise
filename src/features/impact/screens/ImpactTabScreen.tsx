import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import {
  PlatformScrollView,
  PlatformTouchable,
  FormattedText,
} from '../../../components/ui';

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
import { PlatformShadows } from '../../../shared/constants/platformDesignTokens';
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
        <View style={styles.titleContainer}>
          <FormattedText variant="display-medium" style={styles.titleText}>
            Il Nostro
          </FormattedText>
          <FormattedText variant="display-medium" style={styles.titleAccent}>
            Impatto
          </FormattedText>
        </View>
        <FormattedText variant="body-large" style={styles.mainSubtitle}>
          Risultati concreti nella lotta contro la fame mondiale
        </FormattedText>
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
          <FormattedText variant="headline-small" style={styles.numbersTitle}>
            📊 I Nostri Numeri
          </FormattedText>
          <FormattedText variant="body-large" style={styles.numbersSubtitle}>
            Milioni di vite cambiate, un pasto alla volta
          </FormattedText>
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
                <FormattedText
                  variant="headline-small"
                  style={styles.totalStatValue}
                >
                  15.8M
                </FormattedText>
                <FormattedText
                  variant="body-large"
                  style={styles.totalStatLabel}
                >
                  Pasti Totali
                </FormattedText>
                <FormattedText
                  variant="body-medium"
                  style={styles.totalStatSubtitle}
                >
                  Dal 2012 - Meals
                </FormattedText>
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
                <FormattedText
                  variant="headline-small"
                  style={styles.totalStatValue}
                >
                  142K
                </FormattedText>
                <FormattedText
                  variant="body-large"
                  style={styles.totalStatLabel}
                >
                  Kit Totali
                </FormattedText>
                <FormattedText
                  variant="body-medium"
                  style={styles.totalStatSubtitle}
                >
                  Dal 2020 - Kits
                </FormattedText>
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
          <FormattedText
            variant="headline-small"
            style={styles.results2024Title}
          >
            🎯 Risultati Raggiunti
          </FormattedText>
          <FormattedText
            variant="body-large"
            style={styles.results2024Subtitle}
          >
            I numeri che raccontano il nostro impegno annuale
          </FormattedText>
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
            <FormattedText
              variant="headline-small"
              style={styles.record2024Value}
            >
              3.14M
            </FormattedText>
            <FormattedText
              variant="title-medium"
              style={styles.record2024Label}
              numberOfLines={1}
            >
              Pasti Confezionati
            </FormattedText>
            <FormattedText
              variant="body-medium"
              style={styles.record2024Description}
            >
              Prodotti nel 2024
            </FormattedText>
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
            <FormattedText
              variant="headline-small"
              style={styles.record2024Value}
            >
              16.3K
            </FormattedText>
            <FormattedText
              variant="title-medium"
              style={styles.record2024Label}
              numberOfLines={1}
            >
              Kit Confezionati
            </FormattedText>
            <FormattedText
              variant="body-medium"
              style={styles.record2024Description}
            >
              Creati nel 2024
            </FormattedText>
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
          <FormattedText variant="headline-small" style={styles.communityTitle}>
            🤝 La Nostra Community
          </FormattedText>
          <FormattedText variant="body-large" style={styles.communitySubtitle}>
            Volontari e partner uniti nella missione #famezero
          </FormattedText>
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
                <FormattedText
                  variant="headline-small"
                  style={styles.communityStatValue}
                >
                  13.323
                </FormattedText>
                <FormattedText
                  variant="body-large"
                  style={styles.communityStatLabel}
                >
                  Volontari 2024
                </FormattedText>
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
                <FormattedText
                  variant="headline-small"
                  style={styles.communityStatValue}
                >
                  150+
                </FormattedText>
                <FormattedText
                  variant="body-large"
                  style={styles.communityStatLabel}
                >
                  Partner Attivi
                </FormattedText>
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
          <FormattedText variant="headline-small" style={styles.mapTitle}>
            🌍 Dove Operiamo
          </FormattedText>
          <FormattedText variant="body-large" style={styles.mapSubtitle}>
            Le nostre operazioni nel mondo
          </FormattedText>
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
          <FormattedText variant="label-medium" style={styles.mapClickText}>
            Tocca per mappa completa
          </FormattedText>
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
    paddingTop: Spacing[8], // AUMENTATO: da Spacing[3] a Spacing[8] per abbassare e non tagliare il titolo
    paddingHorizontal: Spacing[2], // RIDOTTO: da Spacing[4] a Spacing[2] per dare più spazio al mainHeaderContainer
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
    backgroundColor:
      Platform.OS === 'android'
        ? '#F5F6F6' // ANDROID: Grigio leggermente più scuro
        : 'rgba(31, 41, 55, 0.03)', // iOS: Mantiene rgba originale
    paddingVertical: Spacing[5], // AUMENTATO: da Spacing[4] a Spacing[5] per dare più spazio verticale al container
    paddingHorizontal: Spacing[6], // AUMENTATO: da Spacing[5] a Spacing[6] per evitare taglio testo
    borderRadius: 16, // MODERNO COME PAGINA AZIONI
    borderWidth: 1,
    borderColor:
      Platform.OS === 'android'
        ? '#E8EAEB' // ANDROID: Bordo grigio leggermente più scuro
        : 'rgba(31, 41, 55, 0.08)', // iOS: Mantiene rgba originale
    shadowColor: '#1F2937', // OMBRA GRIGIA COORDINATA
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: Platform.OS === 'android' ? 1 : 2, // RIDOTTO su Android per stabilità
  },
  // CONTAINER TITOLO - IMPAGINAZIONE ELEGANTE
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[3], // SPAZIO tra titolo e subtitle
  },
  // TIPOGRAFIA POTENTE E MODERNA - BILANCIATA
  titleText: {
    fontSize: 40,
    fontWeight: Typography.weights.black, // RIPRISTINATO: black (900) per massimo grassetto come richiesto
    color: '#1F2937', // NERO per contrasto come richiesto
    textAlign: 'center',
    letterSpacing: -0.8, // RIDOTTO: per bilanciare la dimensione ridotta (era -1.2)
    lineHeight: 45, // RIDOTTO: da 50 a 45 per proporzioni migliori con fontSize 40
    textShadowColor: 'rgba(31, 41, 55, 0.15)', // OMBRA SOTTILE
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    includeFontPadding: false,
  },
  // ACCENTO ROSSO STRATEGICO - IDENTICO A titleText tranne colore
  titleAccent: {
    fontSize: 40,
    fontWeight: Typography.weights.black, // IDENTICO: black (900) per consistenza
    color: '#DC2626', // ROSSO BRAND per accento
    textAlign: 'center', // IDENTICO: per allineamento
    letterSpacing: -0.8, // IDENTICO: per spaziatura caratteri
    lineHeight: 45, // IDENTICO: per altezza linea - ridotto per proporzioni migliori
    textShadowColor: 'rgba(220, 38, 38, 0.15)', // OMBRA COORDINATA
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    includeFontPadding: false, // IDENTICO: per padding font
  },
  // SUBTITLE INLINE INGRANDITO E ELEGANTE
  mainSubtitle: {
    // fontSize rimosso - ora gestito da Text
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
    ...PlatformShadows.xl, // CONVERTITO: da shadow manuale a PlatformShadows per Android ottimizzato
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
    // fontSize rimosso - ora gestito da Text
    fontWeight: Typography.weights.black,
    color: '#1F2937', // NERO invece che rosso
    marginBottom: Spacing[1],
    lineHeight: 28, // AGGIUNTO: lineHeight per headline-small
  },
  totalStatLabel: {
    // fontSize rimosso - ora gestito da Text
    fontWeight: Typography.weights.bold,
    color: '#374151',
    marginBottom: Spacing[2], // AUMENTATO: da Spacing[1] a Spacing[2] per più spazio
    lineHeight: 22, // AGGIUNTO: lineHeight per body-large
  },
  totalStatSubtitle: {
    // fontSize rimosso - ora gestito da Text
    color: '#6B7280',
    lineHeight: 18, // AGGIUNTO: lineHeight per body-medium
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
    ...PlatformShadows.lg, // CONVERTITO: da shadow manuale a PlatformShadows per Android ottimizzato
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
    // fontSize rimosso - ora gestito da Text
    fontWeight: Typography.weights.bold,
    color: '#1F2937',
    marginBottom: Spacing[2], // AUMENTATO: da Spacing[1] a Spacing[2] per più spazio
    lineHeight: 28, // AGGIUNTO: lineHeight per headline-small
  },
  communityStatLabel: {
    // fontSize rimosso - ora gestito da Text
    fontWeight: Typography.weights.semibold,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 22, // AGGIUNTO: lineHeight per body-large
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
    backgroundColor: Colors.neutral[0], // RIPRISTINATO: background per vedere l'immagine
    borderRadius: 20,
    marginTop: Spacing[4],
    marginHorizontal: 0, // RIMOSSO: margini laterali per riempire tutto
    padding: 0, // RIMOSSO: padding per eliminare bordi vuoti
    ...PlatformShadows.lg, // CONVERTITO: da shadow manuale a PlatformShadows per Android ottimizzato
    position: 'relative',
    overflow: 'hidden',
    height: 280, // ALTEZZA FISSA: per container stabile
    // FEEDBACK VISIVO CLICCABILE
    borderWidth: 1,
    borderColor: 'transparent',
  },
  mapImage: {
    width: '100%',
    height: '100%', // RIEMPIE TUTTO: il container
    borderRadius: 20, // UGUALE AL CONTAINER: per bordi perfetti
  },
  // INDICATORE CLICCABILE
  mapClickIndicator: {
    position: 'absolute',
    top: Spacing[2],
    right: Spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA', // UNIFICATO: stesso colore su entrambe le piattaforme per consistenza
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    borderRadius: 12,
    gap: Spacing[1],
    zIndex: 2, // SOPRA l'immagine della mappa
    elevation: 8, // PER ANDROID: assicura che stia sopra
  },
  mapClickText: {
    // fontSize rimosso - ora gestito da Text
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
    gap: Spacing[3],
  },
  record2024Card: {
    flex: 1,
  },
  record2024CardContent: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 16,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[2],
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
    // fontSize rimosso - ora gestito da Text
    fontWeight: Typography.weights.bold,
    color: '#1F2937',
    marginTop: Spacing[1],
    marginBottom: Spacing[1],
    textAlign: 'center',
  },

  record2024Label: {
    // fontSize rimosso - ora gestito da Text
    fontWeight: Typography.weights.semibold,
    color: '#374151',
    marginBottom: Spacing[1],
    textAlign: 'center',
    lineHeight: 22,
    flexWrap: 'wrap',
  },
  record2024Description: {
    // fontSize rimosso - ora gestito da Text
    fontWeight: Typography.weights.medium,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: Spacing[1],
    lineHeight: 18,
    paddingHorizontal: Spacing[1],
  },

  // Scroll Content - PADDING BOTTOM PER NAVIGATION
  scrollContent: {
    paddingBottom: Platform.OS === 'android' ? 200 : 160, // ANDROID: 200 per evitare taglio mappa dalla bottom navigation / iOS: 160 normale
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
    backgroundColor:
      Platform.OS === 'android'
        ? '#F4F5F5' // ANDROID: Grigio leggermente più scuro
        : 'rgba(55, 65, 81, 0.03)', // iOS: Mantiene rgba originale
    borderRadius: 20,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[6],
    borderWidth: 1,
    borderColor:
      Platform.OS === 'android'
        ? '#E6E8EA' // ANDROID: Bordo grigio leggermente più scuro
        : 'rgba(55, 65, 81, 0.08)', // iOS: Mantiene rgba originale
    shadowColor: '#374151',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 1 : 2, // RIDOTTO su Android per stabilità
  },
  numbersTitle: {
    // fontSize rimosso - ora gestito da Text
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
    // fontSize rimosso - ora gestito da Text
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
    backgroundColor:
      Platform.OS === 'android'
        ? '#F4F5F5' // ANDROID: Grigio leggermente più scuro
        : 'rgba(55, 65, 81, 0.03)', // iOS: Mantiene rgba originale
    borderRadius: 20,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[6],
    borderWidth: 1,
    borderColor:
      Platform.OS === 'android'
        ? '#E6E8EA' // ANDROID: Bordo grigio leggermente più scuro
        : 'rgba(55, 65, 81, 0.08)', // iOS: Mantiene rgba originale
    shadowColor: '#374151',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 1 : 2, // RIDOTTO su Android per stabilità
  },
  communityTitle: {
    // fontSize rimosso - ora gestito da Text
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
    // fontSize rimosso - ora gestito da Text
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
    backgroundColor:
      Platform.OS === 'android'
        ? '#F4F5F5' // ANDROID: Grigio leggermente più scuro
        : 'rgba(55, 65, 81, 0.03)', // iOS: Mantiene rgba originale
    borderRadius: 20,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[6],
    borderWidth: 1,
    borderColor:
      Platform.OS === 'android'
        ? '#E6E8EA' // ANDROID: Bordo grigio leggermente più scuro
        : 'rgba(55, 65, 81, 0.08)', // iOS: Mantiene rgba originale
    shadowColor: '#374151',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 1 : 2, // RIDOTTO su Android per stabilità
  },
  mapTitle: {
    // fontSize rimosso - ora gestito da Text
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
    // fontSize rimosso - ora gestito da Text
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
    backgroundColor:
      Platform.OS === 'android'
        ? '#F4F5F5' // ANDROID: Grigio leggermente più scuro
        : 'rgba(55, 65, 81, 0.03)', // iOS: Mantiene rgba originale
    borderRadius: 20,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[6],
    borderWidth: 1,
    borderColor:
      Platform.OS === 'android'
        ? '#E6E8EA' // ANDROID: Bordo grigio leggermente più scuro
        : 'rgba(55, 65, 81, 0.08)', // iOS: Mantiene rgba originale
    shadowColor: '#374151',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 1 : 2, // RIDOTTO su Android per stabilità
  },
  results2024Title: {
    // fontSize rimosso - ora gestito da Text
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
    // fontSize rimosso - ora gestito da Text
    fontWeight: Typography.weights.medium,
    color: '#4B5563', // GRIGIO MEDIO per leggibilità
    textAlign: 'center',
    marginTop: Spacing[3],
    opacity: 0.9,
    letterSpacing: 0.1,
  },
});

export default ImpactTabScreen;
