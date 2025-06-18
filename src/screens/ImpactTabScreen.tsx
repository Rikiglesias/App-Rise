import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Surface } from 'react-native-paper';

import { formatNumber, IMPACT_DATA, MAP_LOCATIONS } from '../data/impactData';
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from '../shared/constants/designTokens';
import { useHapticFeedback } from '../shared/hooks/useHapticFeedback';
import type {
  ImpactNavigationProp,
  ImpactScreenName,
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

// Modern Header Section
const ModernImpactHeader: React.FC<{
  animations: ReturnType<typeof useImpactAnimations>;
}> = ({ animations }) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        headerContainer: {
          paddingTop: Spacing[12],
          paddingHorizontal: Spacing[6],
          paddingBottom: Spacing[8],
          alignItems: 'center',
        },
        titleText: {
          fontSize: screenWidth > 375 ? 36 : 32,
          fontWeight: Typography.weights.black,
          color: Colors.primary[700],
          textAlign: 'center',
          letterSpacing: -0.8,
          marginBottom: Spacing[3],
        },
        subtitleText: {
          fontSize: Typography.sizes.lg,
          fontWeight: Typography.weights.medium,
          color: Colors.neutral[600],
          textAlign: 'center',
          lineHeight: Typography.lineHeights.relaxed * Typography.sizes.lg,
          paddingHorizontal: Spacing[4],
        },
        glowEffect: {
          position: 'absolute',
          top: -10,
          left: -10,
          right: -10,
          bottom: -10,
          borderRadius: 30,
          opacity: 0.1,
        },
      }),
    []
  );

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
        colors={['rgba(220, 38, 38, 0.1)', 'transparent']}
        style={styles.glowEffect}
      />
      <Text style={styles.titleText}>Il Nostro Impatto</Text>
      <Text style={styles.subtitleText}>
        Risultati concreti nella lotta contro la fame mondiale grazie al tuo
        supporto
      </Text>
    </Animated.View>
  );
};

// Impact Mission Section - SPOSTATA DALLA HOME
const ImpactMissionSection: React.FC<{
  animations: ReturnType<typeof useImpactAnimations>;
}> = ({ animations }) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        // Gradient Container Pattern del Design System
        outerGradientContainer: {
          marginTop: Spacing[4],
          marginHorizontal: Spacing[4],
          borderRadius: 24,
          shadowColor: '#1F2937',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          elevation: 8,
        },
        gradientBorder: {
          borderRadius: 24,
          padding: 3,
        },
        missionContainer: {
          backgroundColor: Colors.neutral[0],
          borderRadius: 21,
          padding: Spacing[5],
        },
        // 🎨 NUOVI STILI GRADIENT TITLE - DESIGN SYSTEM 2025
        titleGradientContainer: {
          alignItems: 'center',
          marginBottom: Spacing[3],
        },
        titleGradientBorder: {
          borderRadius: 20,
          padding: 2.5, // Effetto bordo gradient
          shadowColor: '#DC2626',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          elevation: 8,
        },
        titleContent: {
          backgroundColor: Colors.neutral[0],
          borderRadius: 17.5,
          paddingHorizontal: Spacing[4],
          paddingVertical: Spacing[2] + 2,
        },
        impactTitleGradient: {
          fontSize: Typography.sizes['2xl'],
          fontWeight: Typography.weights.black,
          color: '#DC2626',
          textAlign: 'center',
          letterSpacing: -0.8,
          textShadowColor: 'rgba(220, 38, 38, 0.25)',
          textShadowOffset: { width: 0, height: 3 },
          textShadowRadius: 8,
        },
        // Typography Smart per il testo descrittivo - MIGLIORATO
        missionText: {
          fontSize: Typography.sizes.lg,
          fontWeight: Typography.weights.bold,
          color: '#1F2937', // Grigio scuro più elegante
          textAlign: 'center',
          letterSpacing: 0.4,
          lineHeight: Typography.sizes.lg * 1.3,
          marginBottom: Spacing[2],
          textShadowColor: 'rgba(31, 41, 55, 0.2)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 6,
        },
      }),
    []
  );

  return (
    <Animated.View
      style={{
        opacity: animations.fadeAnim,
        transform: [{ translateY: animations.slideAnim }],
      }}
    >
      <View style={styles.outerGradientContainer}>
        <LinearGradient
          colors={['#1F2937', '#374151', '#111827']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBorder}
        >
          <View style={styles.missionContainer}>
            {/* Titolo principale con GRADIENT */}
            <View style={styles.titleGradientContainer}>
              <LinearGradient
                colors={['#DC2626', '#B91C1C', '#991B1B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.titleGradientBorder}
              >
                <View style={styles.titleContent}>
                  <Text style={styles.impactTitleGradient}>
                    Il nostro impatto sul mondo
                  </Text>
                </View>
              </LinearGradient>
            </View>

            {/* Testo descrittivo con Typography Smart */}
            <Text style={styles.missionText}>
              Ogni pasto confezionato rappresenta una speranza, ogni volontario
              una forza per il cambiamento. Insieme stiamo costruendo un mondo
              dove nessuno deve soffrire la fame.
            </Text>
          </View>
        </LinearGradient>
      </View>
    </Animated.View>
  );
};

// Enhanced Stats Cards
const ImpactStatsSection: React.FC<{
  animations: ReturnType<typeof useImpactAnimations>;
  onNavigate: (screen: ImpactScreenName) => void;
}> = ({ animations, onNavigate }) => {
  const stats = useMemo(
    () => [
      {
        id: 'meals',
        icon: 'silverware-fork-knife',
        value: formatNumber(IMPACT_DATA.mealsDistributed),
        label: 'Pasti Distribuiti',
        subtitle: 'Nutrizione garantita',
        gradient: ['#059669', '#10B981'] as const,
        screen: null,
      },
      {
        id: 'beneficiaries',
        icon: 'account-group',
        value: formatNumber(IMPACT_DATA.livesImpacted),
        label: 'Vite Toccate',
        subtitle: 'Persone aiutate',
        gradient: ['#3B82F6', '#60A5FA'] as const,
        screen: 'Beneficiaries' as ImpactScreenName,
      },
      {
        id: 'volunteers',
        icon: 'heart-multiple',
        value: formatNumber(IMPACT_DATA.volunteers),
        label: 'Volontari Attivi',
        subtitle: 'Forza della comunità',
        gradient: ['#F59E0B', '#FCD34D'] as const,
        screen: 'Volunteers' as ImpactScreenName,
      },
    ],
    []
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        statsContainer: {
          paddingHorizontal: Spacing[4],
          gap: Spacing[4],
        },
        statCard: {
          borderRadius: BorderRadius.xl,
          shadowColor: Colors.neutral[900],
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 8,
        },
        statCardGradient: {
          borderRadius: BorderRadius.xl,
          overflow: 'hidden',
        },
        statContent: {
          padding: Spacing[6],
          alignItems: 'center',
          minHeight: 160,
          justifyContent: 'center',
        },
        statIcon: {
          marginBottom: Spacing[3],
        },
        statValue: {
          fontSize: screenWidth > 375 ? 32 : 28,
          fontWeight: Typography.weights.black,
          color: Colors.neutral[0],
          textAlign: 'center',
          marginBottom: Spacing[1],
          textShadowColor: 'rgba(0,0,0,0.3)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        },
        statLabel: {
          fontSize: Typography.sizes.lg,
          fontWeight: Typography.weights.bold,
          color: Colors.neutral[0],
          textAlign: 'center',
          marginBottom: Spacing[1],
        },
        statSubtitle: {
          fontSize: Typography.sizes.sm,
          fontWeight: Typography.weights.medium,
          color: Colors.neutral[100],
          textAlign: 'center',
          opacity: 0.9,
        },
      }),
    []
  );

  return (
    <View style={styles.statsContainer}>
      {stats.map((stat, index) => (
        <Animated.View
          key={stat.id}
          style={[
            {
              opacity: animations.statsAnimations[index] ?? 0,
              transform: [
                {
                  translateY:
                    animations.statsAnimations[index]?.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }) ?? 0,
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={stat.screen ? 0.8 : 1}
            // eslint-disable-next-line react/jsx-no-bind
            onPress={
              stat.screen
                ? () => onNavigate(stat.screen as ImpactScreenName)
                : undefined
            }
            disabled={!stat.screen}
          >
            <View style={styles.statCard}>
              <LinearGradient
                colors={stat.gradient}
                style={styles.statCardGradient}
              >
                <View style={styles.statContent}>
                  <MaterialCommunityIcons
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    name={stat.icon as any}
                    size={48}
                    color={Colors.neutral[0]}
                    style={styles.statIcon}
                  />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statSubtitle}>{stat.subtitle}</Text>
                </View>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );
};

// Stories Section Enhanced
const StoriesSection: React.FC = () => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        storiesContainer: {
          paddingTop: Spacing[8],
          paddingHorizontal: Spacing[4],
        },
        sectionTitle: {
          fontSize: Typography.sizes['2xl'],
          fontWeight: Typography.weights.bold,
          color: Colors.neutral[900],
          textAlign: 'center',
          marginBottom: Spacing[6],
          letterSpacing: -0.5,
        },
        storiesGrid: {
          gap: Spacing[4],
        },
        storyCard: {
          borderRadius: BorderRadius.xl,
          backgroundColor: Colors.neutral[0],
          shadowColor: Colors.neutral[400],
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 3,
        },
        storyContentWrapper: {
          borderRadius: BorderRadius.xl,
          overflow: 'hidden',
        },
        storyContent: {
          padding: Spacing[5],
        },
        storyHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: Spacing[3],
        },
        storyIcon: {
          marginRight: Spacing[2],
        },
        storyTitle: {
          fontSize: Typography.sizes.lg,
          fontWeight: Typography.weights.bold,
          color: Colors.neutral[900],
          flex: 1,
        },
        storyLocation: {
          fontSize: Typography.sizes.sm,
          fontWeight: Typography.weights.medium,
          color: Colors.primary[600],
        },
        storyText: {
          fontSize: Typography.sizes.base,
          fontWeight: Typography.weights.regular,
          color: Colors.neutral[700],
          lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
        },
      }),
    []
  );

  return (
    <View style={styles.storiesContainer}>
      <Text style={styles.sectionTitle}>Storie di Impatto</Text>
      <View style={styles.storiesGrid}>
        {IMPACT_DATA.stories.map(story => (
          <Surface key={story.id} style={styles.storyCard}>
            <View style={styles.storyContentWrapper}>
              <View style={styles.storyContent}>
                <View style={styles.storyHeader}>
                  <MaterialCommunityIcons
                    name="book-open-variant"
                    size={24}
                    color={Colors.primary[600]}
                    style={styles.storyIcon}
                  />
                  <Text style={styles.storyTitle}>{story.title}</Text>
                  <Text style={styles.storyLocation}>{story.location}</Text>
                </View>
                <Text style={styles.storyText}>{story.text}</Text>
              </View>
            </View>
          </Surface>
        ))}
      </View>
    </View>
  );
};

// Map Section
const MapSection: React.FC<{
  onMapPress: () => void;
}> = ({ onMapPress }) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        mapContainer: {
          paddingTop: Spacing[8],
          paddingHorizontal: Spacing[4],
          paddingBottom: Spacing[8],
        },
        sectionTitle: {
          fontSize: Typography.sizes['2xl'],
          fontWeight: Typography.weights.bold,
          color: Colors.neutral[900],
          textAlign: 'center',
          marginBottom: Spacing[6],
          letterSpacing: -0.5,
        },
        mapButton: {
          borderRadius: BorderRadius.xl,
          shadowColor: Colors.primary[600],
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2,
          shadowRadius: 16,
          elevation: 8,
        },
        mapGradient: {
          borderRadius: BorderRadius.xl,
          overflow: 'hidden',
        },
        mapButtonContent: {
          padding: Spacing[8],
          alignItems: 'center',
          minHeight: 120,
          justifyContent: 'center',
        },
        mapIcon: {
          marginBottom: Spacing[3],
        },
        mapTitle: {
          fontSize: Typography.sizes.xl,
          fontWeight: Typography.weights.bold,
          color: Colors.neutral[0],
          textAlign: 'center',
          marginBottom: Spacing[2],
        },
        mapSubtitle: {
          fontSize: Typography.sizes.base,
          fontWeight: Typography.weights.medium,
          color: Colors.neutral[100],
          textAlign: 'center',
          opacity: 0.9,
        },
      }),
    []
  );

  return (
    <View style={styles.mapContainer}>
      <Text style={styles.sectionTitle}>Dove Operiamo</Text>
      <TouchableOpacity onPress={onMapPress} activeOpacity={0.8}>
        <View style={styles.mapButton}>
          <LinearGradient
            colors={['#DC2626', '#EF4444']}
            style={styles.mapGradient}
          >
            <View style={styles.mapButtonContent}>
              <MaterialCommunityIcons
                name="earth"
                size={48}
                color={Colors.neutral[0]}
                style={styles.mapIcon}
              />
              <Text style={styles.mapTitle}>Esplora la Mappa</Text>
              <Text style={styles.mapSubtitle}>
                Scopri i nostri progetti nel mondo
              </Text>
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </View>
  );
};

// Main Component
const ImpactTabScreen: React.FC = () => {
  const navigation = useNavigation<ImpactNavigationProp>();
  const { triggerHaptic } = useHapticFeedback();
  const animations = useImpactAnimations();

  const handleNavigationPress = useCallback(
    (screen: ImpactScreenName) => {
      triggerHaptic('medium');
      navigation.navigate({ name: screen, params: undefined });
    },
    [navigation, triggerHaptic]
  );

  const handleMapPress = useCallback(() => {
    triggerHaptic('medium');
    navigation.navigate('MapModal', { locations: MAP_LOCATIONS });
  }, [navigation, triggerHaptic]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        // eslint-disable-next-line react-native/no-unused-styles
        container: {
          flex: 1,
          backgroundColor: Colors.neutral[0],
        },
      }),
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Spacing[8] }}
      >
        <ModernImpactHeader animations={animations} />
        <ImpactMissionSection animations={animations} />
        <ImpactStatsSection
          animations={animations}
          onNavigate={handleNavigationPress}
        />
        <StoriesSection />
        <MapSection onMapPress={handleMapPress} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ImpactTabScreen;
