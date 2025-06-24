/* eslint-disable @typescript-eslint/no-explicit-any */
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PlatformScrollView, PlatformTouchable } from '../components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../navigation/types';
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from '../shared/constants/designTokens';
import { useHapticFeedback } from '../shared/hooks/useHapticFeedback';
import { useLinkHandler } from '../shared/hooks/useLinkHandler';
import { isSuccess } from '../shared/utils/result';
import { logWarn } from '../shared/utils/logger';

type SeguiciScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Seguici'
>;

interface Props {
  readonly navigation: SeguiciScreenNavigationProp;
}

interface SocialPlatform {
  readonly id: string;
  readonly name: string;
  readonly handle: string;
  readonly description: string;
  readonly icon?: number;
  readonly emoji?: string;
  readonly gradient: readonly string[];
  readonly onPress: () => Promise<void>;
}

const { width: screenWidth } = Dimensions.get('window');

// CONTROLLO GLOBALE PRIMA VOLTA - PERSISTE TUTTA LA SESSIONE
let seguiciHasAnimated = false;

const SeguiciScreen: React.FC<Props> = ({ navigation }) => {
  const { openLink } = useLinkHandler();
  const { triggerHaptic } = useHapticFeedback();
  const insets = useSafeAreaInsets();

  // Animazioni veloci come altre pagine
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current; // AUMENTATO per coerenza
  const scaleAnim = useRef(new Animated.Value(0.95)).current; // REGOLATO per coerenza

  // ANIMAZIONI STAGGERED PER BOTTONI SOCIAL
  const socialAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ] as const).current;

  useEffect(() => {
    // ANIMAZIONI SOLO ALLA PRIMA VISUALIZZAZIONE
    if (seguiciHasAnimated) {
      // Imposta immediatamente i valori finali se già animato
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
      scaleAnim.setValue(1);
      socialAnimations.forEach(anim => anim.setValue(1));
      return;
    }

    // Marca come già animato
    seguiciHasAnimated = true;
    const sequence = Animated.sequence([
      // Header animation - VELOCE
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300, // VELOCE: ridotto da 800 a 300
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 120, // VELOCE: aumentato da 50 a 120
          friction: 10, // OTTIMIZZATO per velocità
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 140, // VELOCE: aumentato da 60 a 140
          friction: 10, // OTTIMIZZATO per velocità
        }),
      ]),
      // Social animations staggered VELOCE
      Animated.delay(100), // VELOCE: ridotto da 300 a 100
      Animated.stagger(
        80, // VELOCE: ridotto da 200 a 80
        socialAnimations.map(anim =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 250, // VELOCE: ridotto da 600 a 250
            useNativeDriver: true,
          })
        )
      ),
    ]);

    sequence.start();

    return () => {
      sequence.stop();
    };
  }, [fadeAnim, slideAnim, scaleAnim, socialAnimations]);

  const handleBackPress = useCallback(async () => {
    await triggerHaptic('medium');
    navigation.goBack();
  }, [navigation, triggerHaptic]);

  const handleWebsitePress = useCallback(async () => {
    await triggerHaptic('light');
    const result = await openLink(
      'https://italy.riseagainsthunger.org/',
      'website',
      'Impossibile aprire il sito web.'
    );

    if (!isSuccess(result) && __DEV__) {
      // eslint-disable-next-line no-console
      logWarn('SeguiciScreen', 'Failed to open website', result.error);
    }
  }, [openLink, triggerHaptic]);

  const handleInstagramPress = useCallback(async () => {
    await triggerHaptic('light');
    const result = await openLink(
      'https://www.instagram.com/riseagainsthungeritalia/',
      'instagram',
      'Impossibile aprire Instagram.'
    );

    if (!isSuccess(result) && __DEV__) {
      // eslint-disable-next-line no-console
      logWarn('SeguiciScreen', 'Failed to open Instagram', result.error);
    }
  }, [openLink, triggerHaptic]);

  const handleFacebookPress = useCallback(async () => {
    await triggerHaptic('light');
    const result = await openLink(
      'https://www.facebook.com/RiseAgainstHungerItalia',
      'facebook',
      'Impossibile aprire Facebook.'
    );

    if (!isSuccess(result) && __DEV__) {
      // eslint-disable-next-line no-console
      logWarn('SeguiciScreen', 'Failed to open Facebook', result.error);
    }
  }, [openLink, triggerHaptic]);

  const handleLinkedInPress = useCallback(async () => {
    await triggerHaptic('light');
    const result = await openLink(
      'https://www.linkedin.com/company/rise-against-hunger-italia/mycompany/',
      'linkedin',
      'Impossibile aprire LinkedIn.'
    );

    if (!isSuccess(result) && __DEV__) {
      // eslint-disable-next-line no-console
      logWarn('SeguiciScreen', 'Failed to open LinkedIn', result.error);
    }
  }, [openLink, triggerHaptic]);

  const socialPlatforms: SocialPlatform[] = [
    {
      id: 'website',
      name: 'Sito Ufficiale',
      handle: 'italy.riseagainsthunger.org',
      description: 'Tutto sulla nostra missione',
      emoji: '🌐',
      gradient: ['#DC2626', '#B91C1C', '#991B1B'],
      onPress: handleWebsitePress,
    },
    {
      id: 'instagram',
      name: 'Instagram',
      handle: '@riseagainsthungeritalia',
      description: 'Storie e foto dal campo',
      icon: require('../../assets/icons/social/instagram.png') as number,
      gradient: ['#1F2937', '#374151', '#111827'],
      onPress: handleInstagramPress,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      handle: '@RiseAgainstHungerItalia',
      description: 'Eventi e community',
      icon: require('../../assets/icons/social/facebook.png') as number,
      gradient: ['#1F2937', '#374151', '#111827'],
      onPress: handleFacebookPress,
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      handle: 'Rise Against Hunger Italia',
      description: 'Partnership e collaborazioni',
      icon: require('../../assets/icons/social/linkedin.png'),
      gradient: ['#1F2937', '#374151', '#111827'],
      onPress: handleLinkedInPress,
    },
  ];

  const renderSocialCard = (platform: SocialPlatform, index: number) => (
    <Animated.View
      key={platform.id}
      style={[
        {
          opacity: socialAnimations[index] ?? fadeAnim, // USA ANIMAZIONE STAGGERED INDIVIDUALE
          transform: [
            {
              translateY: (socialAnimations[index] ?? fadeAnim).interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0], // MOVIMENTO COORDINATO
              }),
            },
            {
              scale: (socialAnimations[index] ?? fadeAnim).interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1], // SCALING COORDINATO
              }),
            },
          ],
        },
      ]}
    >
      <PlatformTouchable
        style={styles.socialCardWrapper}
        onPress={platform.onPress}
        activeOpacity={0.92}
        rippleColor="rgba(220, 38, 38, 0.2)"
      >
        {/* GRADIENT CONTAINER PATTERN - Design System Ufficiale */}
        <LinearGradient
          colors={platform.gradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.socialCardGradientBorder}
        >
          <View style={styles.socialCardWhiteContainer}>
            <View style={styles.socialCardContent}>
              {/* Icon Section */}
              <View style={styles.socialIconContainer}>
                {platform.icon ? (
                  <Image
                    source={platform.icon}
                    style={[
                      styles.platformIcon,
                      platform.id === 'linkedin' && styles.linkedinIcon, // Stilie speciale per LinkedIn
                    ]}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={styles.socialIconEmoji}>{platform.emoji}</Text>
                )}
              </View>

              {/* Content Section */}
              <View style={styles.socialInfoContainer}>
                <Text style={styles.socialName}>{platform.name}</Text>
                <Text style={styles.socialHandle}>{platform.handle}</Text>
                <Text style={styles.socialDescription}>
                  {platform.description}
                </Text>
              </View>

              {/* Arrow Icon */}
              <View style={styles.arrowContainer}>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={24}
                  color={platform.gradient[0]}
                />
              </View>
            </View>
          </View>
        </LinearGradient>
      </PlatformTouchable>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* FRECCIA STACCATA - Pattern da Chi Siamo */}
      <PlatformTouchable
        onPress={handleBackPress}
        style={[styles.backButton, { top: insets.top + Spacing[2] }]}
        rippleColor="rgba(220, 38, 38, 0.2)"
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#000000" />
      </PlatformTouchable>

      <PlatformScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER SECTION - Pattern da Chi Siamo */}
        <Animated.View
          style={[
            styles.headerSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.titleContainer}>
            <Text style={styles.categoryTitle}>
              <Text style={styles.titleAccent}>Seguici Ovunque</Text>
            </Text>
            <Text style={styles.categorySubtitleInline}>
              Resta connesso e scopri come fare la differenza
            </Text>
          </View>
        </Animated.View>

        {/* SEPARATORE TRA SEZIONI - IDENTICO CHI SIAMO */}
        <View style={styles.sectionDividerContainer}>
          <View style={styles.sectionDivider} />
          <View style={styles.dividerEmojiContainer}>
            <Text style={styles.dividerEmoji}>📱</Text>
          </View>
        </View>

        {/* SOCIAL PLATFORMS SECTION */}
        <View style={styles.socialSection}>
          {socialPlatforms.map((platform, index) =>
            renderSocialCard(platform, index)
          )}
        </View>
      </PlatformScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },

  // Back Button - SAFE AREA DINAMICO
  backButton: {
    position: 'absolute' as const,
    left: Spacing[4],
    padding: Spacing[2],
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[0],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 20,
  },

  // Scroll Content - PADDING PER FRECCIA
  scrollContent: {
    paddingTop: Spacing[16], // AGGIUNTO: spazio sufficiente per evitare sovrapposizione freccia
    paddingHorizontal: Spacing[4], // AGGIUNTO: margini laterali per non schiacciare contro i bordi
    paddingBottom: Spacing[8], // AGGIUNTO: spazio bottom per navigazione
  },

  // Header Section - Pattern da Chi Siamo IDENTICO
  headerSection: {
    marginBottom: Spacing[2], // IDENTICO CHI SIAMO: chiSiamoSectionStyles.categoryContainer
  },

  // CONTAINER ELEGANTE COLORATO COME ALTRE PAGINE
  titleContainer: {
    alignItems: 'center' as const,
    backgroundColor: 'rgba(220, 38, 38, 0.03)', // BACKGROUND COLORATO ELEGANTE
    paddingVertical: Spacing[3], // COME PAGINE AZIONI
    paddingHorizontal: Spacing[5], // COME PAGINE AZIONI
    borderRadius: 16, // MODERNO COME PAGINE AZIONI
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.12)', // BORDO ROSSO SOTTILE
    shadowColor: '#DC2626', // OMBRA ROSSA COORDINATA
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: Spacing[2], // RIDOTTO: da Spacing[4] a Spacing[2] per avvicinare alla linea
  },

  categoryTitle: {
    fontSize: screenWidth > 375 ? 36 : 30, // IDENTICO CHI SIAMO: responsive sizing
    fontWeight: Typography.weights.black,
    color: Colors.neutral[900], // IDENTICO CHI SIAMO: titolo base nero
    textAlign: 'center' as const,
    letterSpacing: -1.0, // IDENTICO CHI SIAMO: bilanciato per leggibilità
    includeFontPadding: false,
    // TEXT SHADOW ELEGANTE IDENTICO CHI SIAMO
    textShadowColor: 'rgba(0, 0, 0, 0.10)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  // ACCENTO ROSSO IDENTICO CHI SIAMO
  titleAccent: {
    color: '#DC2626',
    // TEXT SHADOW ROSSO coordinato IDENTICO CHI SIAMO
    textShadowColor: 'rgba(220, 38, 38, 0.25)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },

  // SUBTITLE INLINE ELEGANTE COME PAGINE AZIONI
  categorySubtitleInline: {
    fontSize: Typography.sizes.base, // INGRANDITO COME ALTRE PAGINE
    fontWeight: Typography.weights.medium,
    color: '#B91C1C', // ROSSO PIÙ SCURO COORDINATO
    textAlign: 'center' as const,
    letterSpacing: 0.2,
    marginTop: Spacing[1],
    opacity: 0.8,
  },

  // Social Section - Pattern da Chi Siamo IDENTICO
  socialSection: {
    marginTop: Spacing[6], // AGGIUNTO: spazio tra linea e bottoni
    marginBottom: Spacing[1], // IDENTICO CHI SIAMO: contactSectionStyles.categoryContainer
    gap: Spacing[4], // IDENTICO CHI SIAMO: contactsGrid spacing bilanciato
    paddingHorizontal: 0, // RIMOSSO: margini laterali per usare quelli del scrollContent
  },

  socialCardWrapper: {
    marginBottom: Spacing[1],
  },

  // GRADIENT CONTAINER PATTERN - ANDROID OTTIMIZZATO
  socialCardGradientBorder: {
    borderRadius: 20, // RIDOTTO per Android
    padding: 2, // RIDOTTO per evitare artefatti
    // Shadow System Professionale
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 6 }, // RIDOTTO
    shadowOpacity: 0.15, // RIDOTTO
    shadowRadius: 10, // RIDOTTO
    elevation: 6, // RIDOTTO
  },

  socialCardWhiteContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 18, // 20-2 per border effect
    overflow: 'hidden' as const,
  },

  socialCardContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: Spacing[4],
  },

  socialIconContainer: {
    width: 56, // AUMENTATO: più presenza e spazio per icone
    height: 56, // AUMENTATO: proporzioni migliori
    borderRadius: 28, // AGGIORNATO: mantiene forma circolare perfetta
    backgroundColor: Colors.neutral[0], // MIGLIORATO: bianco puro per più contrasto
    borderWidth: 3, // AUMENTATO: bordo più definito
    borderColor: '#DC2626',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: Spacing[4],
    // SHADOW POTENZIATO per più eleganza
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },

  platformIcon: {
    width: 34, // OTTIMIZZATO: perfetto per container 56x56 con bordo 3px
    height: 34, // OTTIMIZZATO: lascia spazio adeguato dai bordi
    resizeMode: 'contain' as const, // Mantiene proporzioni senza distorsione
  },

  // Stile specifico per LinkedIn che è più piccola
  linkedinIcon: {
    width: 35, // PERFETTO: pochissimo più piccolo per non toccare i bordi
    height: 35, // PERFETTO: margine sicuro dal container
  },

  socialIconEmoji: {
    fontSize: 28, // AUMENTATO: più grande e visibile nel container più ampio
    textAlign: 'center' as const,
  },

  socialInfoContainer: {
    flex: 1,
    marginRight: Spacing[3],
  },

  socialName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing[1],
    letterSpacing: -0.3,
  },

  socialHandle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: '#DC2626',
    marginBottom: Spacing[1],
  },

  socialDescription: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[600],
    lineHeight: 16,
  },

  arrowContainer: {
    padding: Spacing[1],
  },

  // SEPARATORE TRA SEZIONI - IDENTICO CHI SIAMO
  sectionDividerContainer: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4], // IDENTICO CHI SIAMO: spazio equilibrato per separazione
    alignItems: 'center' as const,
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
  },

  // LINEA SEPARATRICE - IDENTICA CHI SIAMO
  sectionDivider: {
    height: 2, // IDENTICO CHI SIAMO: altezza bilanciata
    backgroundColor: Colors.neutral[300], // IDENTICO CHI SIAMO: più soft per eleganza
    width: '60%', // IDENTICO CHI SIAMO: bilanciato per proporzioni migliori
    borderRadius: 1, // IDENTICO CHI SIAMO
    opacity: 0.8, // IDENTICO CHI SIAMO: sottile trasparenza per delicatezza
    // OMBRA ELEGANTE IDENTICA CHI SIAMO
    shadowColor: Colors.neutral[400],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
    position: 'absolute' as const,
  },

  dividerEmojiContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    // Shadow elegante
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },

  dividerEmoji: {
    fontSize: 20,
    textAlign: 'center' as const,
  },
});

export default SeguiciScreen;
