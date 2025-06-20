import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import type { Location as MapLocation } from '../components/layout/InteractiveMap';
import InteractiveMap from '../components/layout/InteractiveMap';
import { formatNumber, IMPACT_DATA, MAP_LOCATIONS } from '../data/impactData';
import { Colors, Spacing, Typography } from '../shared/constants/designTokens';
import type {
  ImpactNavigationProp,
  ImpactScreenName,
  ImpactStory,
} from '../types/ImpactScreenTypes';

const { width: screenWidth } = Dimensions.get('window');

// Modern Animation Hook
const useImpactAnimations = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const statsAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ] as const).current;

  useEffect(() => {
    const sequence = Animated.sequence([
      // Header animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 60,
          friction: 8,
        }),
      ]),
      // Stats animations staggered
      Animated.delay(300),
      Animated.stagger(
        150,
        statsAnimations.map(anim =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          })
        )
      ),
    ]);

    sequence.start();

    return () => {
      sequence.stop();
    };
  }, [fadeAnim, slideAnim, scaleAnim, statsAnimations]);

  return { fadeAnim, slideAnim, scaleAnim, statsAnimations };
};

// 🎨 HEADER SECTION - DESIGN SYSTEM COMPLIANT
// 🎨 MODERN IMPACT HEADER STYLES - Estratti per evitare falsi positivi ESLint
const modernImpactHeaderStyles = StyleSheet.create({
  headerContainer: {
    paddingTop: Spacing[8],
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[6],
    alignItems: 'center',
  },
  titleGradientContainer: {
    alignSelf: 'stretch',
    marginHorizontal: Spacing[2],
    marginBottom: Spacing[4],
  },
  titleGradientBorder: {
    borderRadius: 24,
    padding: 3,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  titleContent: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 21,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    alignItems: 'center',
  },
  titleText: {
    fontSize: screenWidth > 375 ? 36 : 30,
    fontWeight: Typography.weights.black,
    color: '#DC2626',
    textAlign: 'center',
    letterSpacing: -0.8,
    textShadowColor: 'rgba(220, 38, 38, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    includeFontPadding: false,
  },
  subtitleContainer: {
    marginHorizontal: Spacing[3],
    backgroundColor: 'rgba(31, 41, 55, 0.05)',
    borderRadius: 18,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderWidth: 1,
    borderColor: 'rgba(31, 41, 55, 0.1)',
  },
  subtitleText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: '#374151',
    textAlign: 'center',
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
    letterSpacing: 0.2,
  },
});

const ModernImpactHeader: React.FC<{
  animations: ReturnType<typeof useImpactAnimations>;
}> = ({ animations }) => {
  return (
    <Animated.View
      style={[
        modernImpactHeaderStyles.headerContainer,
        {
          opacity: animations.fadeAnim,
          transform: [
            { translateY: animations.slideAnim },
            { scale: animations.scaleAnim },
          ],
        },
      ]}
    >
      <View style={modernImpactHeaderStyles.titleGradientContainer}>
        <LinearGradient
          colors={['#DC2626', '#B91C1C', '#991B1B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={modernImpactHeaderStyles.titleGradientBorder}
        >
          <View style={modernImpactHeaderStyles.titleContent}>
            <Text style={modernImpactHeaderStyles.titleText}>
              Il Nostro Impatto
            </Text>
          </View>
        </LinearGradient>
      </View>

      <View style={modernImpactHeaderStyles.subtitleContainer}>
        <Text style={modernImpactHeaderStyles.subtitleText}>
          Risultati concreti nella lotta contro la fame mondiale grazie al
          supporto di volontari, aziende e cittadini
        </Text>
      </View>
    </Animated.View>
  );
};

// 🎨 IMPACT STATS SECTION STYLES - Estratti per evitare falsi positivi ESLint
const impactStatsStyles = StyleSheet.create({
  statsSection: {
    marginHorizontal: Spacing[4],
    marginBottom: Spacing[6],
  },
  sectionTitle: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.black,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: Spacing[4],
    letterSpacing: -0.8,
    textShadowColor: 'rgba(220, 38, 38, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  statsGrid: {
    gap: Spacing[4],
  },
});

// 📊 STATISTICHE PRINCIPALI - MEALS E KIT SEPARATI
const ImpactStatsSection: React.FC<{
  animations: ReturnType<typeof useImpactAnimations>;
  onNavigate: (screen: ImpactScreenName) => void;
}> = ({ animations, onNavigate }) => {
  const handleStatPress = useCallback(
    (screen: ImpactScreenName) => {
      onNavigate(screen);
    },
    [onNavigate]
  );

  // Handlers specifici per ogni sezione - risolve jsx-no-bind
  const handleBeneficiariesPress = useCallback(() => {
    handleStatPress('Beneficiaries');
  }, [handleStatPress]);

  const handlePartnersPress = useCallback(() => {
    handleStatPress('Partners');
  }, [handleStatPress]);

  const handleVolunteersPress = useCallback(() => {
    handleStatPress('Volunteers');
  }, [handleStatPress]);

  return (
    <View style={impactStatsStyles.statsSection}>
      <Text style={impactStatsStyles.sectionTitle}>
        2024: Un Anno d&apos;Impatto
      </Text>
      <View style={impactStatsStyles.statsGrid}>
        <MealsKitsRow
          animations={animations}
          onBeneficiariesPress={handleBeneficiariesPress}
          onPartnersPress={handlePartnersPress}
        />
        <HistoricalCard
          animations={animations}
          onPress={handleBeneficiariesPress}
        />
        <SocialImpactSection
          animations={animations}
          onVolunteersPress={handleVolunteersPress}
          onBeneficiariesPress={handleBeneficiariesPress}
        />
      </View>
    </View>
  );
};

// 🎨 MEALS KITS ROW STYLES - Estratti per evitare falsi positivi ESLint
const mealsKitsRowStyles = StyleSheet.create({
  mealsKitsRow: {
    flexDirection: 'row',
    gap: Spacing[3],
    marginBottom: Spacing[4],
  },
  mealsKitsCard: {
    flex: 1,
  },
  mainGradientContainer: {
    borderRadius: 22,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  mainCardContent: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 19,
    padding: Spacing[5],
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
  },
  cardIcon: {
    marginBottom: Spacing[3],
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  mainCardValue: {
    fontSize: screenWidth > 375 ? 42 : 36,
    fontWeight: Typography.weights.black,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: Spacing[2],
    letterSpacing: -1.0,
    textShadowColor: 'rgba(220, 38, 38, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  mainCardValueGray: {
    fontSize: screenWidth > 375 ? 42 : 36,
    fontWeight: Typography.weights.black,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: Spacing[2],
    letterSpacing: -1.0,
    textShadowColor: 'rgba(31, 41, 55, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  mainCardLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.black,
    color: Colors.neutral[800],
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: Spacing[2],
  },
  mainCardSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    textAlign: 'center',
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing[1],
  },
  mainCardExplanation: {
    fontSize: Typography.sizes.xs,
    color: Colors.neutral[500],
    textAlign: 'center',
    fontWeight: Typography.weights.medium,
    fontStyle: 'italic',
    paddingHorizontal: Spacing[2],
  },
});

// 🍽️ ROW PASTI E KIT - Sottofunzione estratta
const MealsKitsRow: React.FC<{
  animations: ReturnType<typeof useImpactAnimations>;
  onBeneficiariesPress: () => void;
  onPartnersPress: () => void;
}> = ({ animations, onBeneficiariesPress, onPartnersPress }) => {
  return (
    <View style={mealsKitsRowStyles.mealsKitsRow}>
      {/* PASTI 2024 */}
      <Animated.View
        style={[
          mealsKitsRowStyles.mealsKitsCard,
          {
            opacity: animations.statsAnimations[0],
            transform: [{ scale: animations.statsAnimations[0] }],
          },
        ]}
      >
        <TouchableOpacity onPress={onBeneficiariesPress} activeOpacity={0.9}>
          <LinearGradient
            colors={['#DC2626', '#B91C1C', '#991B1B']}
            style={mealsKitsRowStyles.mainGradientContainer}
          >
            <View style={mealsKitsRowStyles.mainCardContent}>
              <MaterialCommunityIcons
                name="food"
                size={32}
                color="#DC2626"
                style={mealsKitsRowStyles.cardIcon}
              />
              <Text style={mealsKitsRowStyles.mainCardValue}>
                {formatNumber(IMPACT_DATA.mealsDistributed)}
              </Text>
              <Text style={mealsKitsRowStyles.mainCardLabel}>PASTI 2024</Text>
              <Text style={mealsKitsRowStyles.mainCardSubtitle}>
                {formatNumber(IMPACT_DATA.livesImpactedMeals)} persone servite
              </Text>
              <Text style={mealsKitsRowStyles.mainCardExplanation}>
                Pasti nutrienti confezionati da volontari
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* KIT 2024 */}
      <Animated.View
        style={[
          mealsKitsRowStyles.mealsKitsCard,
          {
            opacity: animations.statsAnimations[1],
            transform: [{ scale: animations.statsAnimations[1] }],
          },
        ]}
      >
        <TouchableOpacity onPress={onPartnersPress} activeOpacity={0.9}>
          <LinearGradient
            colors={['#1F2937', '#374151', '#111827']}
            style={mealsKitsRowStyles.mainGradientContainer}
          >
            <View style={mealsKitsRowStyles.mainCardContent}>
              <MaterialCommunityIcons
                name="package-variant"
                size={32}
                color="#1F2937"
                style={mealsKitsRowStyles.cardIcon}
              />
              <Text style={mealsKitsRowStyles.mainCardValueGray}>
                {formatNumber(IMPACT_DATA.kitPackages)}
              </Text>
              <Text style={mealsKitsRowStyles.mainCardLabel}>KIT 2024</Text>
              <Text style={mealsKitsRowStyles.mainCardSubtitle}>
                {formatNumber(IMPACT_DATA.livesImpactedKits)} persone aiutate
              </Text>
              <Text style={mealsKitsRowStyles.mainCardExplanation}>
                Kit di emergenza per situazioni critiche
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// 🎨 HISTORICAL CARD STYLES - Estratti per evitare falsi positivi ESLint
const historicalCardStyles = StyleSheet.create({
  historicalCard: {
    alignSelf: 'stretch',
    marginBottom: Spacing[4],
  },
  historicalGradientContainer: {
    borderRadius: 22,
    padding: 3,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  historicalCardContent: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 19,
    padding: Spacing[5],
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  historicalValue: {
    fontSize: screenWidth > 375 ? 48 : 42,
    fontWeight: Typography.weights.black,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: Spacing[2],
    letterSpacing: -1.2,
    textShadowColor: 'rgba(220, 38, 38, 0.2)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  historicalLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.black,
    color: Colors.neutral[800],
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: Spacing[1],
  },
  historicalSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    textAlign: 'center',
    fontWeight: Typography.weights.semibold,
    fontStyle: 'italic',
  },
  cardIcon: {
    marginBottom: Spacing[3],
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
});

// 🏆 CARD STORICA - Sottofunzione estratta
const HistoricalCard: React.FC<{
  animations: ReturnType<typeof useImpactAnimations>;
  onPress: () => void;
}> = ({ animations, onPress }) => {
  return (
    <Animated.View
      style={[
        historicalCardStyles.historicalCard,
        {
          opacity: animations.statsAnimations[4],
          transform: [{ scale: animations.statsAnimations[4] }],
        },
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <LinearGradient
          colors={['#DC2626', '#B91C1C', '#991B1B']}
          style={historicalCardStyles.historicalGradientContainer}
        >
          <View style={historicalCardStyles.historicalCardContent}>
            <MaterialCommunityIcons
              name="trophy"
              size={24}
              color="#DC2626"
              style={historicalCardStyles.cardIcon}
            />
            <Text style={historicalCardStyles.historicalValue}>22,3M</Text>
            <Text style={historicalCardStyles.historicalLabel}>
              Pasti Totali dal 2005
            </Text>
            <Text style={historicalCardStyles.historicalSubtitle}>
              19 anni di lotta contro la fame
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// 🎨 SOCIAL IMPACT STYLES - Estratti per evitare falsi positivi ESLint
const socialImpactStyles = StyleSheet.create({
  socialImpactSection: {
    marginTop: Spacing[2],
    marginBottom: Spacing[6],
  },
  socialSectionTitle: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.black,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: Spacing[4],
    letterSpacing: -0.8,
    textShadowColor: 'rgba(31, 41, 55, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  socialStatsRow: {
    flexDirection: 'row',
    gap: Spacing[3],
    marginBottom: Spacing[4],
  },
  socialStatCard: {
    flex: 1,
  },
  socialGradientContainer: {
    borderRadius: 22,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
  socialCardContent: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 19,
    padding: Spacing[5],
    alignItems: 'center',
    minHeight: 160,
    justifyContent: 'center',
  },
  socialStatValue: {
    fontSize: screenWidth > 375 ? 38 : 32,
    fontWeight: Typography.weights.black,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: Spacing[2],
    letterSpacing: -0.8,
    textShadowColor: 'rgba(31, 41, 55, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  socialStatValueRed: {
    fontSize: screenWidth > 375 ? 38 : 32,
    fontWeight: Typography.weights.black,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: Spacing[2],
    letterSpacing: -0.8,
    textShadowColor: 'rgba(220, 38, 38, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  socialStatLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.black,
    color: Colors.neutral[700],
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.0,
  },
  cardIcon: {
    marginBottom: Spacing[3],
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
});

// 👥 SEZIONE COMUNITÀ - Sottofunzione estratta
const SocialImpactSection: React.FC<{
  animations: ReturnType<typeof useImpactAnimations>;
  onVolunteersPress: () => void;
  onBeneficiariesPress: () => void;
}> = ({ animations, onVolunteersPress, onBeneficiariesPress }) => {
  return (
    <View style={socialImpactStyles.socialImpactSection}>
      <Text style={socialImpactStyles.socialSectionTitle}>
        La Nostra Comunità
      </Text>

      <View style={socialImpactStyles.socialStatsRow}>
        {/* VOLONTARI 2024 */}
        <Animated.View
          style={[
            socialImpactStyles.socialStatCard,
            {
              opacity: animations.statsAnimations[2],
              transform: [{ scale: animations.statsAnimations[2] }],
            },
          ]}
        >
          <TouchableOpacity onPress={onVolunteersPress} activeOpacity={0.9}>
            <LinearGradient
              colors={['#1F2937', '#374151', '#111827']}
              style={socialImpactStyles.socialGradientContainer}
            >
              <View style={socialImpactStyles.socialCardContent}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={28}
                  color="#1F2937"
                  style={socialImpactStyles.cardIcon}
                />
                <Text style={socialImpactStyles.socialStatValue}>
                  {formatNumber(IMPACT_DATA.volunteers)}
                </Text>
                <Text style={socialImpactStyles.socialStatLabel}>
                  Volontari 2024
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* VITE TOTALI IMPATTATE */}
        <Animated.View
          style={[
            socialImpactStyles.socialStatCard,
            {
              opacity: animations.statsAnimations[3],
              transform: [{ scale: animations.statsAnimations[3] }],
            },
          ]}
        >
          <TouchableOpacity onPress={onBeneficiariesPress} activeOpacity={0.9}>
            <LinearGradient
              colors={['#DC2626', '#B91C1C', '#991B1B']}
              style={socialImpactStyles.socialGradientContainer}
            >
              <View style={socialImpactStyles.socialCardContent}>
                <MaterialCommunityIcons
                  name="heart-multiple"
                  size={28}
                  color="#DC2626"
                  style={socialImpactStyles.cardIcon}
                />
                <Text style={socialImpactStyles.socialStatValueRed}>
                  {formatNumber(IMPACT_DATA.livesImpacted)}
                </Text>
                <Text style={socialImpactStyles.socialStatLabel}>
                  Vite Impattate 2024
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

// 📖 SEZIONE STORIE REALI
const StoriesSection: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = React.useState(0);

  // Auto-scroll delle storie
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStoryIndex(prev =>
        prev === IMPACT_DATA.stories.length - 1 ? 0 : prev + 1
      );
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Handler per lo scroll - risolve jsx-no-bind
  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const contentOffset = event.nativeEvent.contentOffset.x;
      const index = Math.round(contentOffset / (screenWidth - Spacing[4]));
      setCurrentStoryIndex(index);
    },
    []
  );

  return (
    <View style={storiesStyles.storiesSection}>
      <StoriesSectionHeader />
      <StoriesScrollView
        scrollViewRef={scrollViewRef}
        onMomentumScrollEnd={handleMomentumScrollEnd}
      />
      <StoriesIndicators currentStoryIndex={currentStoryIndex} />
    </View>
  );
};

// 📝 HEADER STORIE - Sottofunzione estratta
const StoriesSectionHeader: React.FC = () => (
  <>
    <Text style={storiesStyles.sectionTitle}>Storie di Impatto</Text>
    <Text style={storiesStyles.sectionSubtitle}>
      Testimonianze reali dalle persone che abbiamo aiutato nel 2024
    </Text>
  </>
);

// 📱 SCROLL VIEW STORIE - Sottofunzione estratta
const StoriesScrollView: React.FC<{
  scrollViewRef: React.RefObject<ScrollView | null>;
  onMomentumScrollEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}> = ({ scrollViewRef, onMomentumScrollEnd }) => (
  <ScrollView
    ref={scrollViewRef}
    horizontal
    showsHorizontalScrollIndicator={false}
    style={storiesStyles.storiesScrollView}
    decelerationRate="fast"
    snapToInterval={screenWidth - Spacing[4]}
    snapToAlignment="start"
    onMomentumScrollEnd={onMomentumScrollEnd}
  >
    {IMPACT_DATA.stories.map(story => (
      <StoryCard key={story.id} story={story} />
    ))}
  </ScrollView>
);

// Helper function per evitare nested ternary
const getCategoryLabel = (category: ImpactStory['category']): string => {
  if (category === 'meals') return 'Pasti';
  if (category === 'kits') return 'Kit';
  return 'Sociale';
};

// 🎯 STORY CARD - Sottofunzione estratta
const StoryCard: React.FC<{ story: ImpactStory }> = ({ story }) => (
  <View style={storiesStyles.storyCard}>
    <Image
      source={{ uri: story.image }}
      style={storiesStyles.storyImage}
      resizeMode="cover"
    />
    <View style={storiesStyles.storyContent}>
      <Text style={storiesStyles.storyLocation}>📍 {story.location}</Text>
      <Text style={storiesStyles.storyTitle}>{story.title}</Text>
      <Text style={storiesStyles.storyText}>{story.text}</Text>
      <View style={storiesStyles.categoryBadge}>
        <Text style={storiesStyles.categoryText}>
          {getCategoryLabel(story.category)}
        </Text>
      </View>
    </View>
  </View>
);

// 🔘 INDICATORI - Sottofunzione estratta
const StoriesIndicators: React.FC<{ currentStoryIndex: number }> = ({
  currentStoryIndex,
}) => (
  <View style={storiesStyles.indicatorsContainer}>
    {IMPACT_DATA.stories.map((story, index) => (
      <View
        key={story.id}
        style={[
          storiesStyles.indicator,
          index === currentStoryIndex && storiesStyles.indicatorActive,
        ]}
      />
    ))}
  </View>
);

// 🎨 STYLES STORIES - Estratti per riutilizzo
const storiesStyles = StyleSheet.create({
  storiesSection: {
    marginVertical: Spacing[6],
  },
  sectionTitle: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.black,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: Spacing[1],
    marginHorizontal: Spacing[4],
    letterSpacing: -0.8,
  },
  sectionSubtitle: {
    fontSize: Typography.sizes.base,
    color: '#374151',
    textAlign: 'center',
    marginBottom: Spacing[4],
    marginHorizontal: Spacing[4],
    backgroundColor: 'rgba(55, 65, 81, 0.06)',
    borderRadius: 12,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  storiesScrollView: {
    paddingLeft: Spacing[4],
  },
  storyCard: {
    width: screenWidth - Spacing[8],
    marginRight: Spacing[4],
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.neutral[0],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  storyImage: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.neutral[100],
  },
  storyContent: {
    padding: Spacing[4],
  },
  storyLocation: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: '#DC2626',
    marginBottom: Spacing[1],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  storyTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing[2],
    letterSpacing: -0.3,
  },
  storyText: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[700],
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    marginTop: Spacing[3],
  },
  categoryText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutral[0],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Indicatori
  indicatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing[4],
    gap: Spacing[2],
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neutral[300],
  },
  indicatorActive: {
    backgroundColor: '#DC2626',
    width: 24,
  },
});

// 🗺️ SEZIONE MAPPA
const MapSection: React.FC<{
  onMapPress: () => void;
}> = ({ onMapPress }) => {
  const handleMapPress = useCallback(() => {
    onMapPress();
  }, [onMapPress]);

  const handleLocationPress = useCallback((_location: MapLocation) => {
    // Removed console.log for production - use proper logging if needed
    // TODO: Implement proper analytics tracking for location press
  }, []);

  return (
    <View style={mapStyles.mapSection}>
      <MapSectionHeader />
      <MapContainer onLocationPress={handleLocationPress} />
      <MapExpandButton onPress={handleMapPress} />
    </View>
  );
};

// 📝 HEADER MAPPA - Sottofunzione estratta
const MapSectionHeader: React.FC = () => (
  <>
    <Text style={mapStyles.sectionTitle}>Dove Operiamo</Text>
    <Text style={mapStyles.sectionSubtitle}>
      I nostri progetti nel mondo per combattere fame e povertà
    </Text>
  </>
);

// 🌍 CONTAINER MAPPA - Sottofunzione estratta
const MapContainer: React.FC<{
  onLocationPress: (location: MapLocation) => void;
}> = ({ onLocationPress }) => (
  <View style={mapStyles.mapContainer}>
    <InteractiveMap
      locations={MAP_LOCATIONS}
      onMarkerPress={onLocationPress}
      isFullScreen={false}
    />
  </View>
);

// 🔄 BOTTONE ESPANSIONE - Sottofunzione estratta
const MapExpandButton: React.FC<{
  onPress: () => void;
}> = ({ onPress }) => (
  <TouchableOpacity
    style={mapStyles.expandButton}
    onPress={onPress}
    activeOpacity={0.9}
  >
    <LinearGradient
      colors={['#DC2626', '#B91C1C', '#991B1B']}
      style={mapStyles.expandGradientContainer}
    >
      <View style={mapStyles.expandButtonContent}>
        <MaterialCommunityIcons name="map-search" size={20} color="#DC2626" />
        <Text style={mapStyles.expandButtonText}>Esplora Mappa Completa</Text>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

// 🎨 STYLES MAPPA - Estratti per riutilizzo
const mapStyles = StyleSheet.create({
  mapSection: {
    marginHorizontal: Spacing[4],
    marginBottom: Spacing[8],
  },
  sectionTitle: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.black,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: Spacing[1],
    letterSpacing: -0.8,
  },
  sectionSubtitle: {
    fontSize: Typography.sizes.base,
    color: '#374151',
    textAlign: 'center',
    marginBottom: Spacing[4],
    backgroundColor: 'rgba(55, 65, 81, 0.06)',
    borderRadius: 12,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  mapContainer: {
    height: 300,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  expandButton: {
    marginTop: Spacing[3],
    alignSelf: 'center',
  },
  // GRADIENT CONTAINER PATTERN PER EXPAND BUTTON
  expandGradientContainer: {
    borderRadius: 16,
    padding: 3,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  expandButtonContent: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 14,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  expandButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: '#DC2626',
  },
});

// 🎨 STYLES PRINCIPALI - Estratti per evitare falsi positivi ESLint
const mainStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Spacing[12], // Extra space per bottom tab
  },
});

// 🎯 COMPONENTE PRINCIPALE
const ImpactTabScreen: React.FC = () => {
  const navigation = useNavigation<ImpactNavigationProp>();
  const animations = useImpactAnimations();

  const handleNavigate = useCallback(
    (screen: ImpactScreenName) => {
      navigation.navigate(screen);
    },
    [navigation]
  );

  const handleMapPress = useCallback(() => {
    // TODO: Implement full map modal opening
    // navigation.navigate('MapModal');
  }, []);

  return (
    <SafeAreaView style={mainStyles.container}>
      <ScrollView
        style={mainStyles.scrollView}
        contentContainerStyle={mainStyles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <ModernImpactHeader animations={animations} />
        <ImpactStatsSection
          animations={animations}
          onNavigate={handleNavigate}
        />
        <StoriesSection />
        <MapSection onMapPress={handleMapPress} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ImpactTabScreen;
