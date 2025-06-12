import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import InteractiveMap, { type Location } from '../components/InteractiveMap';

import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from '../constants/designTokens';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import type { ImpactStackParamList } from '../navigation/types';

// Dati reali da Rise Against Hunger Italia (Report 2024)
const IMPACT_DATA = {
  mealsDistributed: 3136968,
  volunteers: 13323,
  livesImpacted: 103307, // Solo vite impattate dai pasti
  stories: [
    {
      id: 'zimbabwe',
      title: 'La storia di Vitale',
      location: 'Zimbabwe',
      text: 'Vitale, 12 anni, va a scuola solo nei giorni in cui viene servito un pasto. Questo gli garantisce di mangiare almeno due volte al giorno, altrimenti lavorerebbe per aiutare la famiglia, mangiando una sola volta la sera.',
      image:
        'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
    },
    {
      id: 'ukraine',
      title: 'La speranza di Maria',
      location: 'Ucraina',
      text: "Maria, 75 anni, ha perso tutto a causa della guerra. 'Ho 75 anni e ora non ho nulla', dice. Gli aiuti ricevuti, come i nostri kit alimentari, sono stati fondamentali per ritrovare la speranza.",
      image:
        'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
    },
  ],
  milestones: [
    {
      id: 'paladozza',
      title: 'PalaDozza, Bologna',
      value: '+50.000 Pasti',
      icon: 'stadium-variant',
    },
    {
      id: 'monza',
      title: 'GP di Monza',
      value: '+60.000 Pasti',
      icon: 'flag-checkered',
    },
    {
      id: 'roma',
      title: 'Primo Maggio, Roma',
      value: "Partner dell'evento",
      icon: 'microphone-variant',
    },
  ],
} as const;

// Dati per la mappa interattiva
const MAP_LOCATIONS: Location[] = [
  {
    id: 'zimbabwe',
    name: 'Progetti in Zimbabwe',
    country: 'Zimbabwe',
    coordinates: { latitude: -19.0154, longitude: 29.1549 },
    projects: 5,
    beneficiaries: '15,000+',
    status: 'active',
    description:
      'Supporto alimentare e programmi scolastici per bambini come Vitale.',
    image:
      'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 'ukraine',
    name: 'Aiuti in Ucraina',
    country: 'Ucraina',
    coordinates: { latitude: 48.3794, longitude: 31.1656 },
    projects: 3,
    beneficiaries: '25,000+',
    status: 'emergency',
    description:
      'Fornitura di kit alimentari di emergenza per le famiglie colpite dalla guerra.',
    image:
      'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 'italy',
    name: 'Eventi in Italia',
    country: 'Italia',
    coordinates: { latitude: 41.9028, longitude: 12.4964 }, // Rome
    projects: 10,
    beneficiaries: 'Volontari e comunità locali',
    status: 'events',
    description:
      'Eventi di confezionamento pasti e sensibilizzazione in tutta Italia.',
    image:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
  },
];

// Formattatore di numeri
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('it-IT').format(num);
};

type ImpactNavigationProp = StackNavigationProp<ImpactStackParamList, 'Impact'>;

const ImpactTabScreen: React.FC = () => {
  const navigation = useNavigation<ImpactNavigationProp>();
  const { triggerHaptic } = useHapticFeedback();

  const handleNavigationPress = useCallback(
    (screen: keyof ImpactStackParamList) => () => {
      triggerHaptic('medium');
      navigation.navigate(screen);
    },
    [navigation, triggerHaptic]
  );

  const handleMarkerPress = useCallback((location: Location) => {
    // eslint-disable-next-line no-console
    console.log('Marker pressed:', location.name);
    // TODO: Navigate to a detail screen
  }, []);

  return (
    <LinearGradient
      colors={[Colors.neutral[0], Colors.neutral[50], Colors.neutral[100]]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View entering={FadeIn.duration(800)}>
          <Text style={styles.headerTitle}>Il Nostro Impatto</Text>
          <Text style={styles.headerSubtitle}>
            Risultati raggiunti nel 2024 grazie al tuo supporto
          </Text>
        </Animated.View>

        {/* Card Pasti Distribuiti */}
        <Animated.View entering={FadeInDown.delay(200).duration(800)}>
          <LinearGradient
            colors={Colors.gradients.primary}
            style={styles.mainStatCard}
          >
            <MaterialCommunityIcons
              name="food-apple-outline"
              size={48}
              color={Colors.neutral[0]}
              style={styles.mainIcon}
            />
            <Text style={styles.mainStatValue}>
              {formatNumber(IMPACT_DATA.mealsDistributed)}
            </Text>
            <Text style={styles.mainStatLabel}>Pasti Distribuiti</Text>
          </LinearGradient>
        </Animated.View>

        {/* Sezione Quick Stats */}
        <Animated.View
          style={styles.quickStatsContainer}
          entering={FadeInDown.delay(400).duration(800)}
        >
          <StatButton
            icon="account-group-outline"
            label="Beneficiari"
            value={formatNumber(IMPACT_DATA.livesImpacted)}
            onPress={handleNavigationPress('Beneficiaries')}
            color={Colors.semantic.info.main}
          />
          <StatButton
            icon="hand-heart-outline"
            label="Volontari"
            value={formatNumber(IMPACT_DATA.volunteers)}
            onPress={handleNavigationPress('Volunteers')}
            color={Colors.semantic.success.main}
          />
          <StatButton
            icon="handshake-outline"
            label="Partner"
            value="Oltre 50" // Dato qualitativo
            onPress={handleNavigationPress('Partners')}
            color={Colors.semantic.warning.main}
          />
        </Animated.View>

        {/* Storie di Impatto */}
        <Animated.View
          style={styles.section}
          entering={FadeInDown.delay(600).duration(800)}
        >
          <Text style={styles.sectionTitle}>Storie di Impatto</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storiesScroll}
          >
            {IMPACT_DATA.stories.map(story => (
              <StoryCard key={story.id} {...story} />
            ))}
          </ScrollView>
        </Animated.View>

        {/* Traguardi Principali */}
        <Animated.View
          style={styles.section}
          entering={FadeInDown.delay(800).duration(800)}
        >
          <Text style={styles.sectionTitle}>Traguardi 2024</Text>
          <View style={styles.milestonesContainer}>
            {IMPACT_DATA.milestones.map(milestone => (
              <MilestoneCard key={milestone.id} {...milestone} />
            ))}
          </View>
        </Animated.View>

        {/* Mappa Interattiva */}
        <Animated.View
          style={styles.section}
          entering={FadeInDown.delay(1000).duration(800)}
        >
          <Text style={styles.sectionTitle}>Dove Operiamo</Text>
          <View style={styles.mapContainer}>
            <InteractiveMap
              locations={MAP_LOCATIONS}
              onMarkerPress={handleMarkerPress}
            />
          </View>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

// =================================================================
// ✨ SUB-COMPONENTS
// =================================================================

interface StatButtonProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  onPress: () => void;
  color: string;
}

const StatButton: React.FC<StatButtonProps> = ({
  icon,
  label,
  value,
  onPress,
  color,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={styles.statButton}
    activeOpacity={0.8}
  >
    <View style={styles.statButtonContent}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <MaterialCommunityIcons
          name={icon}
          size={28}
          color={Colors.neutral[0]}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={24}
        color={Colors.neutral[400]}
      />
    </View>
  </TouchableOpacity>
);

const StoryCard: React.FC<(typeof IMPACT_DATA.stories)[number]> = ({
  title,
  location,
  text,
  image,
}) => (
  <View style={styles.storyCard}>
    <Image source={{ uri: image }} style={styles.storyImage} />
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.7)']}
      style={styles.storyGradient}
    />
    <View style={styles.storyContent}>
      <Text style={styles.storyLocation}>{location}</Text>
      <Text style={styles.storyTitle}>{title}</Text>
      <Text style={styles.storyText}>{text}</Text>
    </View>
  </View>
);

const MilestoneCard: React.FC<(typeof IMPACT_DATA.milestones)[number]> = ({
  title,
  value,
  icon,
}) => (
  <View style={styles.milestoneCard}>
    <MaterialCommunityIcons name={icon} size={24} color={Colors.primary[600]} />
    <View style={styles.milestoneContent}>
      <Text style={styles.milestoneTitle}>{title}</Text>
      <Text style={styles.milestoneValue}>{value}</Text>
    </View>
  </View>
);

// =================================================================
// 🎨 MODERN STYLES
// =================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: Spacing[6],
    paddingTop: Spacing[12],
  },
  headerTitle: {
    fontSize: Typography.sizes['4xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: Spacing[2],
  },
  headerSubtitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: Spacing[8],
  },
  mainStatCard: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[6],
    alignItems: 'center',
    ...Shadows.lg,
    marginBottom: Spacing[6],
  },
  mainIcon: {
    marginBottom: Spacing[3],
    opacity: 0.8,
  },
  mainStatValue: {
    fontSize: Typography.sizes['5xl'],
    fontWeight: Typography.weights.black,
    color: Colors.neutral[0],
  },
  mainStatLabel: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[0],
    opacity: 0.9,
    marginTop: Spacing[1],
  },
  quickStatsContainer: {
    gap: Spacing[4],
  },
  statButton: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    ...Shadows.md,
  },
  statButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing[4],
  },
  textContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
  },
  statLabel: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
  },
  section: { marginTop: Spacing[8] },
  sectionTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
    marginBottom: Spacing[4],
    paddingHorizontal: Spacing[2],
  },
  storiesScroll: {
    paddingHorizontal: Spacing[2],
    paddingBottom: Spacing[4],
    gap: Spacing[4],
  },
  storyCard: {
    width: 280,
    height: 360,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.xl,
    ...Shadows.lg,
    overflow: 'hidden',
  },
  storyImage: { width: '100%', height: '100%', position: 'absolute' },
  storyGradient: { width: '100%', height: '100%', position: 'absolute' },
  storyContent: { flex: 1, justifyContent: 'flex-end', padding: Spacing[4] },
  storyLocation: {
    color: Colors.neutral[200],
    fontWeight: Typography.weights.semibold,
    fontSize: Typography.sizes.sm,
    textTransform: 'uppercase',
  },
  storyTitle: {
    color: Colors.neutral[0],
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes['2xl'],
    marginTop: Spacing[1],
  },
  storyText: {
    color: Colors.neutral[100],
    fontSize: Typography.sizes.sm,
    marginTop: Spacing[2],
    lineHeight: Typography.lineHeights.snug,
  },
  milestonesContainer: { gap: Spacing[3] },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.lg,
    padding: Spacing[4],
    ...Shadows.sm,
  },
  mapContainer: {
    height: 400,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.md,
  },
  milestoneContent: { marginLeft: Spacing[4], flex: 1 },
  milestoneTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutral[800],
  },
  milestoneValue: { fontSize: Typography.sizes.sm, color: Colors.neutral[600] },
});

export default ImpactTabScreen;
