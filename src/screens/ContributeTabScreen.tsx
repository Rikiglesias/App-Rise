/* eslint-disable react-native/no-unused-styles */
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
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

import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from '../shared/constants/designTokens';
import { useHapticFeedback } from '../shared/hooks/useHapticFeedback';
import type { ContributeTabScreenProps } from '../types/ContributeScreenTypes';

const { width: screenWidth } = Dimensions.get('window');

// Modern Animation Hook
const useActionsAnimations = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const cardAnimations = useRef([
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
      // Cards animations staggered
      Animated.delay(300),
      Animated.stagger(
        200,
        cardAnimations.map(anim =>
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
  }, [fadeAnim, slideAnim, scaleAnim, cardAnimations]);

  return { fadeAnim, slideAnim, scaleAnim, cardAnimations };
};

// Modern Header Section
const ModernActionsHeader: React.FC<{
  animations: ReturnType<typeof useActionsAnimations>;
}> = ({ animations }) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        headerContainer: {
          paddingTop: Spacing[12],
          paddingHorizontal: Spacing[6],
          paddingBottom: Spacing[8],
          alignItems: 'center',
          position: 'relative',
        },
        backgroundPattern: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05,
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
          marginBottom: Spacing[6],
        },
        statsRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing[8],
        },
        statItem: {
          alignItems: 'center',
        },
        statNumber: {
          fontSize: Typography.sizes.xl,
          fontWeight: Typography.weights.bold,
          color: Colors.primary[600],
          marginBottom: Spacing[1],
        },
        statLabel: {
          fontSize: Typography.sizes.sm,
          fontWeight: Typography.weights.medium,
          color: Colors.neutral[500],
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
        colors={['rgba(220, 38, 38, 0.05)', 'transparent']}
        style={styles.backgroundPattern}
      />
      <Text style={styles.titleText}>Come Puoi Aiutare</Text>
      <Text style={styles.subtitleText}>
        Scegli il modo migliore per contribuire alla lotta contro la fame
        mondiale
      </Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>€25</Text>
          <Text style={styles.statLabel}>100 pasti</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>€50</Text>
          <Text style={styles.statLabel}>200 pasti</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>€100</Text>
          <Text style={styles.statLabel}>400 pasti</Text>
        </View>
      </View>
    </Animated.View>
  );
};

// Action Cards Section
const ActionsCardsSection: React.FC<{
  animations: ReturnType<typeof useActionsAnimations>;
  navigation: ContributeTabScreenProps['navigation'];
}> = ({ animations, navigation }) => {
  const { triggerHaptic } = useHapticFeedback();

  const actionCards = useMemo(
    () => [
      {
        id: 'donate',
        title: 'Dona Ora',
        subtitle: 'Contribuisci direttamente ai nostri progetti',
        description:
          'Ogni donazione viene convertita direttamente in pasti nutritivi per chi ne ha bisogno',
        icon: 'heart',
        gradient: ['#DC2626', '#EF4444'] as const,
        onPress: () => navigation.navigate('Progetti'),
      },
      {
        id: 'volunteer',
        title: 'Diventa Volontario',
        subtitle: 'Unisciti agli eventi di confezionamento',
        description:
          'Partecipa agli eventi locali di confezionamento pasti e sensibilizzazione',
        icon: 'account-group',
        gradient: ['#059669', '#10B981'] as const,
        onPress: () =>
          navigation.navigate('Calendario', {
            title: 'Eventi Volontariato',
            subtitle: 'Unisciti a noi negli eventi',
          }),
      },
      {
        id: 'spread',
        title: 'Diffondi la Missione',
        subtitle: 'Condividi la nostra causa',
        description:
          'Aiutaci a sensibilizzare più persone possibili sulla fame nel mondo',
        icon: 'share-variant',
        gradient: ['#3B82F6', '#60A5FA'] as const,
        onPress: () => navigation.navigate('Seguici'),
      },
    ],
    [navigation]
  );

  const handleCardPress = useCallback(
    async (action: (typeof actionCards)[0]) => {
      await triggerHaptic('medium');
      action.onPress();
    },
    [triggerHaptic]
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        cardsContainer: {
          paddingHorizontal: Spacing[4],
          gap: Spacing[6],
        },
        actionCard: {
          borderRadius: BorderRadius.xl,
          shadowColor: Colors.neutral[900],
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 8,
        },
        actionCardGradient: {
          borderRadius: BorderRadius.xl,
          overflow: 'hidden',
        },
        cardContent: {
          padding: Spacing[6],
        },
        cardHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: Spacing[4],
        },
        cardIcon: {
          marginRight: Spacing[4],
        },
        cardTitleContainer: {
          flex: 1,
        },
        cardTitle: {
          fontSize: Typography.sizes.xl,
          fontWeight: Typography.weights.bold,
          color: Colors.neutral[0],
          marginBottom: Spacing[1],
        },
        cardSubtitle: {
          fontSize: Typography.sizes.base,
          fontWeight: Typography.weights.medium,
          color: Colors.neutral[100],
          opacity: 0.9,
        },
        cardDescription: {
          fontSize: Typography.sizes.base,
          fontWeight: Typography.weights.regular,
          color: Colors.neutral[100],
          lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
          opacity: 0.8,
        },
        actionArrow: {
          opacity: 0.7,
        },
      }),
    []
  );

  return (
    <View style={styles.cardsContainer}>
      {actionCards.map((card, index) => (
        <Animated.View
          key={card.id}
          style={[
            {
              opacity: animations.cardAnimations[index] ?? 0,
              transform: [
                {
                  translateY:
                    animations.cardAnimations[index]?.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }) ?? 0,
                },
                {
                  scale:
                    animations.cardAnimations[index]?.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1],
                    }) ?? 1,
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            // eslint-disable-next-line react/jsx-no-bind
            onPress={() => handleCardPress(card)}
          >
            <View style={styles.actionCard}>
              <LinearGradient
                colors={card.gradient}
                style={styles.actionCardGradient}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <MaterialCommunityIcons
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      name={card.icon as any}
                      size={32}
                      color={Colors.neutral[0]}
                      style={styles.cardIcon}
                    />
                    <View style={styles.cardTitleContainer}>
                      <Text style={styles.cardTitle}>{card.title}</Text>
                      <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                    </View>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={24}
                      color={Colors.neutral[0]}
                      style={styles.actionArrow}
                    />
                  </View>
                  <Text style={styles.cardDescription}>{card.description}</Text>
                </View>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );
};

// CTA Section
const CallToActionSection: React.FC = () => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        ctaContainer: {
          paddingHorizontal: Spacing[4],
          paddingTop: Spacing[8],
          paddingBottom: Spacing[8],
        },
        ctaCard: {
          borderRadius: BorderRadius.xl,
          backgroundColor: Colors.neutral[0],
          shadowColor: Colors.neutral[400],
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 3,
        },
        ctaContent: {
          padding: Spacing[6],
          alignItems: 'center',
        },
        ctaIcon: {
          marginBottom: Spacing[4],
        },
        ctaTitle: {
          fontSize: Typography.sizes['2xl'],
          fontWeight: Typography.weights.bold,
          color: Colors.neutral[900],
          textAlign: 'center',
          marginBottom: Spacing[3],
          letterSpacing: -0.5,
        },
        ctaText: {
          fontSize: Typography.sizes.base,
          fontWeight: Typography.weights.regular,
          color: Colors.neutral[600],
          textAlign: 'center',
          lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
        },
      }),
    []
  );

  return (
    <View style={styles.ctaContainer}>
      <Surface style={styles.ctaCard}>
        <View style={styles.ctaContent}>
          <MaterialCommunityIcons
            name="earth"
            size={48}
            color={Colors.primary[600]}
            style={styles.ctaIcon}
          />
          <Text style={styles.ctaTitle}>Insieme Possiamo Farcela</Text>
          <Text style={styles.ctaText}>
            Ogni piccolo gesto conta nella lotta contro la fame mondiale.
            Unisciti a migliaia di persone che stanno già facendo la differenza.
          </Text>
        </View>
      </Surface>
    </View>
  );
};

// Main Component
export const ContributeTabScreen: React.FC<ContributeTabScreenProps> = ({
  navigation,
}) => {
  const animations = useActionsAnimations();

  const styles = useMemo(
    () =>
      StyleSheet.create({
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
        <ModernActionsHeader animations={animations} />
        <ActionsCardsSection animations={animations} navigation={navigation} />
        <CallToActionSection />
      </ScrollView>
    </SafeAreaView>
  );
};
