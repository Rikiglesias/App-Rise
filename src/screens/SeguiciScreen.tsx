/* eslint-disable @typescript-eslint/no-explicit-any */
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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

const SeguiciScreen: React.FC<Props> = ({ navigation }) => {
  const { openLink } = useLinkHandler();
  const { triggerHaptic } = useHapticFeedback();

  // Animazioni professionali
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    const animateEntry = () => {
      Animated.stagger(200, [
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    };

    animateEntry();
  }, [fadeAnim, slideAnim, scaleAnim]);

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
      console.warn('[SeguiciScreen] Failed to open website:', result.error);
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
      console.warn('[SeguiciScreen] Failed to open Instagram:', result.error);
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
      console.warn('[SeguiciScreen] Failed to open Facebook:', result.error);
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
      console.warn('[SeguiciScreen] Failed to open LinkedIn:', result.error);
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
      icon: require('../../assets/images/icons/instagram.png') as number,
      gradient: ['#1F2937', '#374151', '#111827'],
      onPress: handleInstagramPress,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      handle: '@RiseAgainstHungerItalia',
      description: 'Eventi e community',
      icon: require('../../assets/images/icons/facebook.png') as number,
      gradient: ['#1F2937', '#374151', '#111827'],
      onPress: handleFacebookPress,
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      handle: 'Rise Against Hunger Italia',
      description: 'Partnership e collaborazioni',
      icon: require('../../assets/images/icons/linkedin.png') as number,
      gradient: ['#1F2937', '#374151', '#111827'],
      onPress: handleLinkedInPress,
    },
  ];

  const renderSocialCard = (platform: SocialPlatform, _index: number) => (
    <Animated.View
      key={platform.id}
      style={[
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.socialCardWrapper}
        onPress={platform.onPress}
        activeOpacity={0.92}
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
                    style={styles.platformIcon}
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
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* FRECCIA STACCATA - Pattern da Chi Siamo */}
      <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
        <MaterialCommunityIcons name="arrow-left" size={24} color="#000000" />
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
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
            <Text style={styles.categoryTitle}>Seguici Ovunque</Text>
          </View>

          {/* Separatore decorativo - Pattern da Chi Siamo */}
          <View style={styles.titleSeparator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorIcon}>📱</Text>
            <View style={styles.separatorLine} />
          </View>

          <Text style={styles.categorySubtitle}>
            Resta connesso e scopri come fare la differenza
          </Text>

          <View style={styles.categoryDivider} />
        </Animated.View>

        {/* SOCIAL PLATFORMS SECTION */}
        <View style={styles.socialSection}>
          {socialPlatforms.map((platform, index) =>
            renderSocialCard(platform, index)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },

  // Back Button - Pattern da Chi Siamo
  backButton: {
    position: 'absolute' as const,
    top: 50,
    left: Spacing[4],
    padding: Spacing[2],
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[0],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: Spacing[4],
    gap: Spacing[3],
    paddingTop: Spacing[8],
    paddingBottom: Spacing[8],
  },

  // Header Section - Pattern da Chi Siamo
  headerSection: {
    marginBottom: Spacing[3],
  },

  titleContainer: {
    alignItems: 'center' as const,
    marginBottom: Spacing[2],
  },

  categoryTitle: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.black,
    color: '#DC2626',
    textAlign: 'center' as const,
    letterSpacing: -1.5,
    // Typography Smart - Text Shadow
    textShadowColor: 'rgba(220, 38, 38, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  // Separatore decorativo - Pattern da Chi Siamo
  titleSeparator: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginVertical: Spacing[4],
  },

  separatorLine: {
    width: 60,
    height: 1,
    backgroundColor: '#DC2626',
  },

  separatorIcon: {
    fontSize: Typography.sizes.xl,
    marginHorizontal: Spacing[3],
  },

  categorySubtitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    textAlign: 'center' as const,
    letterSpacing: 0.3,
    lineHeight: 24,
    marginBottom: Spacing[3],
    paddingHorizontal: Spacing[4],
    fontStyle: 'normal' as const,
    color: '#374151',
    backgroundColor: 'rgba(55, 65, 81, 0.06)',
    paddingVertical: Spacing[3],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.12)',
    shadowColor: '#374151',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  categoryDivider: {
    height: 1,
    backgroundColor: Colors.neutral[200],
    marginTop: Spacing[3],
  },

  // Social Section
  socialSection: {
    gap: Spacing[3],
  },

  socialCardWrapper: {
    marginBottom: Spacing[1],
  },

  // GRADIENT CONTAINER PATTERN - Design System Ufficiale
  socialCardGradientBorder: {
    borderRadius: 24,
    padding: 3, // Border effect
    // Shadow System Professionale
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },

  socialCardWhiteContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 21, // 24-3 per border effect
    overflow: 'hidden' as const,
  },

  socialCardContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: Spacing[4],
  },

  socialIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.neutral[50],
    borderWidth: 2,
    borderColor: '#DC2626',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: Spacing[4],
  },

  platformIcon: {
    width: 28,
    height: 28,
  },

  socialIconEmoji: {
    fontSize: 24,
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
};

export default SeguiciScreen;
