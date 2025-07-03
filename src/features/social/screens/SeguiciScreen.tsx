/* eslint-disable @typescript-eslint/no-explicit-any */
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { PlatformScrollView, PlatformTouchable } from '../../../components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../navigation/types';
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from '../../../shared/constants';
import {
  TypographyTokens,
  DesignTokens,
} from '../../../shared/constants/responsiveSystem';
import { PlatformShadows } from '../../../shared/constants/platformDesignTokens';
import { useHapticFeedback } from '../../../shared/hooks/useHapticFeedback';
import { useLinkHandler } from '../../../shared/hooks/useLinkHandler';
import { useResponsive } from '../../../shared/hooks';
import { isSuccess } from '../../../shared/utils/result';
import { logWarn } from '../../../shared/utils/logger';

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
  readonly gradient: string[];
  readonly onPress: () => Promise<void>;
}

// ANIMAZIONI DISABILITATE - controllo non più necessario

const SeguiciScreen: React.FC<Props> = ({ navigation }) => {
  const { openLink } = useLinkHandler();
  const { triggerHaptic } = useHapticFeedback();
  const insets = useSafeAreaInsets();
  const { scale } = useResponsive();

  // ANIMAZIONI DISABILITATE - valori statici per evitare bordi grigi
  const fadeAnim = useRef(new Animated.Value(1)).current; // Sempre visibile
  const slideAnim = useRef(new Animated.Value(0)).current; // Sempre in posizione
  const scaleAnim = useRef(new Animated.Value(1)).current; // Sempre a scala normale

  // ANIMAZIONI STAGGERED DISABILITATE
  const socialAnimations = useRef([
    new Animated.Value(1), // Sempre visibili
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ] as const).current;

  useEffect(() => {
    // ANIMAZIONI DISABILITATE - nessuna animazione per evitare bordi grigi
    // Tutti i valori sono già impostati staticamente sopra
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
      icon: require('../../../../assets/icons/social/instagram.png') as number,
      gradient: ['#1F2937', '#374151', '#111827'],
      onPress: handleInstagramPress,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      handle: '@RiseAgainstHungerItalia',
      description: 'Eventi e community',
      icon: require('../../../../assets/icons/social/facebook.png') as number,
      gradient: ['#1F2937', '#374151', '#111827'],
      onPress: handleFacebookPress,
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      handle: 'Rise Against Hunger Italia',
      description: 'Partnership e collaborazioni',
      icon: require('../../../../assets/icons/social/linkedin.png'),
      gradient: ['#1F2937', '#374151', '#111827'],
      onPress: handleLinkedInPress,
    },
  ];

  const renderSocialCard = (platform: SocialPlatform, _index: number) => (
    <View key={platform.id}>
      <PlatformTouchable
        style={styles.socialCardWrapper}
        onPress={platform.onPress}
        activeOpacity={0.92}
      >
        {/* GRADIENT CONTAINER PATTERN - Design System Ufficiale */}
        <LinearGradient
          colors={platform.gradient as [string, string, ...string[]]}
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
                  <Text
                    style={[
                      styles.socialIconEmoji,
                      { fontSize: TypographyTokens.styles.headline.medium },
                    ]}
                  >
                    {platform.emoji}
                  </Text>
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
                  size={scale(24)}
                  color={platform.gradient[0]}
                />
              </View>
            </View>
          </View>
        </LinearGradient>
      </PlatformTouchable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* FRECCIA STACCATA - Pattern da Chi Siamo */}
      <PlatformTouchable
        onPress={handleBackPress}
        style={[styles.backButton, { top: insets.top + Spacing[2] }]}
      >
        <MaterialCommunityIcons
          name="arrow-left"
          size={scale(24)}
          color="#000000"
        />
      </PlatformTouchable>

      <PlatformScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER SECTION - Pattern da Chi Siamo */}
        <View style={styles.headerSection}>
          <View style={styles.titleContainer}>
            <Text
              style={[
                styles.categoryTitle,
                { fontSize: TypographyTokens.styles.headline.large },
              ]}
            >
              <Text
                style={[
                  styles.titleAccent,
                  { fontSize: TypographyTokens.styles.headline.large },
                ]}
              >
                Seguici Ovunque
              </Text>
            </Text>
            <Text style={styles.categorySubtitleInline}>
              Resta connesso e scopri come fare la differenza
            </Text>
          </View>
        </View>

        {/* SEPARATORE TRA SEZIONI - IDENTICO CHI SIAMO */}
        <View style={styles.sectionDividerContainer}>
          <View style={styles.sectionDivider} />
          <View style={styles.dividerEmojiContainer}>
            <Text
              style={[
                styles.dividerEmoji,
                { fontSize: TypographyTokens.styles.title.medium },
              ]}
            >
              📱
            </Text>
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
    ...PlatformShadows.lg, // CONVERTITO: da shadow manuale a PlatformShadows per Android ottimizzato
    zIndex: 20,
  },

  // Scroll Content - PADDING AUMENTATO PER FRECCIA
  scrollContent: {
    paddingTop: Spacing[20], // AUMENTATO: più spazio per evitare sovrapposizione freccia
    paddingHorizontal: Spacing[4],
    paddingBottom: Platform.OS === 'android' ? Spacing[24] : Spacing[8], // ANDROID: Spacing[24] per evitare sovrapposizione bottom navigation / iOS: Spacing[8] normale
  },

  // Header Section - Pattern da Chi Siamo IDENTICO
  headerSection: {
    marginBottom: Spacing[2], // IDENTICO CHI SIAMO: chiSiamoSectionStyles.categoryContainer
  },

  // CONTAINER ELEGANTE COLORATO - ANDROID OTTIMIZZATO
  titleContainer: {
    alignItems: 'center' as const,
    backgroundColor:
      Platform.OS === 'android'
        ? '#FEF2F2' // ANDROID: rosso solido equivalente a rgba(220, 38, 38, 0.03)
        : 'rgba(220, 38, 38, 0.03)', // iOS: mantieni rgba originale
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[5],
    borderRadius: 16,
    borderWidth: 1,
    borderColor:
      Platform.OS === 'android'
        ? '#FECACA' // ANDROID: rosso solido equivalente a rgba(220, 38, 38, 0.12)
        : 'rgba(220, 38, 38, 0.12)', // iOS: mantieni rgba originale
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === 'android' ? 0.04 : 0.08, // ANDROID: ombra ridotta per stabilità
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 2 : 3, // ANDROID: elevation ridotta per stabilità
    marginBottom: Spacing[2],
  },

  categoryTitle: {
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
    fontSize: TypographyTokens.styles.body.medium, // INGRANDITO COME ALTRE PAGINE
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
    width: DesignTokens.components.iconSize.xlarge + 16, // 40 + 16 = 56 responsive
    height: DesignTokens.components.iconSize.xlarge + 16, // 40 + 16 = 56 responsive
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
    width: DesignTokens.components.iconSize.large + 2, // 32 + 2 = 34 responsive
    height: DesignTokens.components.iconSize.large + 2, // 32 + 2 = 34 responsive
    resizeMode: 'contain' as const, // Mantiene proporzioni senza distorsione
  },

  // Stile specifico per LinkedIn che è più piccola
  linkedinIcon: {
    width: DesignTokens.components.iconSize.large + 3, // 32 + 3 = 35 responsive
    height: DesignTokens.components.iconSize.large + 3, // 32 + 3 = 35 responsive
  },

  socialIconEmoji: {
    textAlign: 'center' as const,
  },

  socialInfoContainer: {
    flex: 1,
    marginRight: Spacing[3],
  },

  socialName: {
    fontSize: TypographyTokens.styles.body.large,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing[1],
    letterSpacing: -0.3,
  },

  socialHandle: {
    fontSize: TypographyTokens.styles.body.small,
    fontWeight: Typography.weights.semibold,
    color: '#DC2626',
    marginBottom: Spacing[1],
  },

  socialDescription: {
    fontSize: TypographyTokens.styles.label.small,
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
    textAlign: 'center' as const,
  },
});

export default SeguiciScreen;
