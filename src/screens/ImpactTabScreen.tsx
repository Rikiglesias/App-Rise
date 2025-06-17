import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback } from 'react';
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import {
  MilestoneCard,
  StatButton,
  StoryCard,
} from '../components/domain/ImpactStatComponents';
import { formatNumber, IMPACT_DATA, MAP_LOCATIONS } from '../data/impactData';
import { Colors } from '../shared/constants/designTokens';
import { useHapticFeedback } from '../shared/hooks/useHapticFeedback';
import { impactScreenStyles } from '../styles/ImpactScreenStyles';
import type {
  ImpactNavigationProp,
  ImpactScreenName,
} from '../types/ImpactScreenTypes';

const ImpactTabScreen: React.FC = () => {
  const navigation = useNavigation<ImpactNavigationProp>();
  const { triggerHaptic } = useHapticFeedback();

  const handleNavigationPress = useCallback(
    (screen: ImpactScreenName) => () => {
      triggerHaptic('medium');
      navigation.navigate({ name: screen, params: undefined });
    },
    [navigation, triggerHaptic]
  );

  const handleMapPress = useCallback(() => {
    navigation.navigate('MapModal', { locations: MAP_LOCATIONS });
  }, [navigation]);

  const renderStoryItem = useCallback(
    ({ item }: { item: (typeof IMPACT_DATA.stories)[number] }) => (
      <StoryCard {...item} />
    ),
    []
  );

  const extractStoryKey = useCallback(
    (item: (typeof IMPACT_DATA.stories)[number]) => item.id,
    []
  );

  return (
    <LinearGradient
      colors={[Colors.neutral[0], Colors.neutral[50], Colors.neutral[100]]}
      style={impactScreenStyles.container}
    >
      <ScrollView contentContainerStyle={impactScreenStyles.scrollContainer}>
        {/* Header Section */}
        <Animated.View entering={FadeIn.duration(800)}>
          <Text style={impactScreenStyles.headerTitle}>Il Nostro Impatto</Text>
          <Text style={impactScreenStyles.headerSubtitle}>
            Risultati raggiunti nel 2024 grazie al tuo supporto
          </Text>
        </Animated.View>

        {/* Main Stat Card - Pasti Distribuiti */}
        <Animated.View entering={FadeInDown.delay(200).duration(800)}>
          <LinearGradient
            colors={Colors.gradients.primary}
            style={impactScreenStyles.mainStatCard}
          >
            <MaterialCommunityIcons
              name="food-apple-outline"
              size={48}
              color={Colors.neutral[0]}
              style={impactScreenStyles.mainIcon}
            />
            <Text style={impactScreenStyles.mainStatValue}>
              {formatNumber(IMPACT_DATA.mealsDistributed)}
            </Text>
            <Text style={impactScreenStyles.mainStatLabel}>
              Pasti Distribuiti
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Quick Stats Navigation */}
        <Animated.View
          style={impactScreenStyles.quickStatsContainer}
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
            value="Oltre 50"
            onPress={handleNavigationPress('Partners')}
            color={Colors.semantic.warning.main}
          />
        </Animated.View>

        {/* Stories Section */}
        <Animated.View
          style={impactScreenStyles.section}
          entering={FadeInDown.delay(600).duration(800)}
        >
          <Text style={impactScreenStyles.sectionTitle}>Storie dal campo</Text>
          <FlatList
            data={IMPACT_DATA.stories}
            renderItem={renderStoryItem}
            keyExtractor={extractStoryKey}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={impactScreenStyles.storiesScroll}
          />
        </Animated.View>

        {/* Milestones Section */}
        <Animated.View
          style={impactScreenStyles.section}
          entering={FadeInDown.delay(800).duration(800)}
        >
          <Text style={impactScreenStyles.sectionTitle}>Traguardi 2024</Text>
          <View style={impactScreenStyles.milestonesContainer}>
            {IMPACT_DATA.milestones.map(milestone => (
              <MilestoneCard key={milestone.id} {...milestone} />
            ))}
          </View>
        </Animated.View>

        {/* Interactive Map Section */}
        <Animated.View
          style={impactScreenStyles.mapSection}
          entering={FadeInDown.delay(1000).duration(800)}
        >
          <Text style={impactScreenStyles.sectionTitle}>Dove operiamo</Text>
          <TouchableOpacity
            onPress={handleMapPress}
            style={impactScreenStyles.mapPreview}
            activeOpacity={0.8}
          >
            <View style={impactScreenStyles.mapOverlay}>
              <MaterialCommunityIcons
                name="map-search-outline"
                size={40}
                color={Colors.neutral[0]}
              />
              <Text style={impactScreenStyles.mapPreviewText}>
                Apri la Mappa Interattiva
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

export default ImpactTabScreen;
