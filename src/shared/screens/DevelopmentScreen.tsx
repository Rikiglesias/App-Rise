import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { PlatformTouchable } from '../../components/ui';
import { ResponsiveText } from '../../components/ui/ResponsiveText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from '../constants/designTokens';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { useResponsive } from '../hooks/useResponsiveDesign';

interface DevelopmentScreenProps {
  navigation: {
    goBack: () => void;
  };
}

const DevelopmentScreen: React.FC<DevelopmentScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { triggerHaptic } = useHapticFeedback();
  const { responsive } = useResponsive();

  // Animazioni
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animazione di entrata
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Animazione di rotazione continua per l'icona
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Animazione di pulsazione per l'icona principale
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, scaleAnim, slideAnim, rotateAnim, pulseAnim]);

  const handleGoBack = useCallback(async () => {
    await triggerHaptic('light');
    navigation.goBack();
  }, [navigation, triggerHaptic]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Dimensioni responsive
  const responsiveStyles = {
    backButtonSize: responsive.getSpacing(48),
    iconSize: responsive.getSpacing(60),
    iconContainerSize: responsive.getSpacing(120),
    floatingIconSizes: {
      large: responsive.getSpacing(24),
      medium: responsive.getSpacing(20),
      small: responsive.getSpacing(22),
    },
    contentPadding: responsive.getSpacing(24),
    verticalSpacing: responsive.getSpacing(16),
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FAFAFA', '#F5F5F5', '#EEEEEE']}
        style={styles.gradientBackground}
      />

      {/* Pulsante Indietro */}
      <PlatformTouchable
        style={[
          styles.backButton,
          {
            top: insets.top + responsiveStyles.verticalSpacing,
            width: responsiveStyles.backButtonSize,
            height: responsiveStyles.backButtonSize,
          },
        ]}
        onPress={handleGoBack}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['#DC2626', '#B91C1C']}
          style={[
            styles.backButtonGradient,
            {
              width: responsiveStyles.backButtonSize,
              height: responsiveStyles.backButtonSize,
              borderRadius: responsiveStyles.backButtonSize / 2,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={responsive.getSpacing(24)}
            color="white"
          />
        </LinearGradient>
      </PlatformTouchable>

      {/* Contenuto Principale */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            paddingHorizontal: responsiveStyles.contentPadding,
            paddingTop:
              Platform.OS === 'ios'
                ? responsive.getSpacing(48)
                : responsive.getSpacing(32),
            paddingBottom: responsive.getSpacing(60), // Responsive bottom padding
          },
        ]}
      >
        {/* Icona Principale Animata */}
        <View
          style={[
            styles.iconContainer,
            {
              marginBottom: responsive.getSpacing(16),
              marginTop:
                Platform.OS === 'ios'
                  ? responsive.getSpacing(32)
                  : responsive.getSpacing(16),
            },
          ]}
        >
          <Animated.View
            style={[
              styles.iconBackground,
              {
                width: responsiveStyles.iconContainerSize,
                height: responsiveStyles.iconContainerSize,
                borderRadius: responsiveStyles.iconContainerSize / 2,
                transform: [
                  { scale: pulseAnim },
                  { rotate: rotateInterpolate },
                ],
              },
            ]}
          >
            <MaterialCommunityIcons
              name="hammer-wrench"
              size={responsiveStyles.iconSize}
              color="#DC2626"
            />
          </Animated.View>

          {/* Icone decorative fluttuanti */}
          <Animated.View
            style={[
              styles.floatingIcon,
              styles.floatingIcon1,
              { padding: responsive.getSpacing(8) },
            ]}
          >
            <MaterialCommunityIcons
              name="code-tags"
              size={responsiveStyles.floatingIconSizes.large}
              color="#059669"
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.floatingIcon,
              styles.floatingIcon2,
              { padding: responsive.getSpacing(8) },
            ]}
          >
            <MaterialCommunityIcons
              name="palette"
              size={responsiveStyles.floatingIconSizes.medium}
              color="#7C3AED"
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.floatingIcon,
              styles.floatingIcon3,
              { padding: responsive.getSpacing(8) },
            ]}
          >
            <MaterialCommunityIcons
              name="rocket"
              size={responsiveStyles.floatingIconSizes.small}
              color="#F59E0B"
            />
          </Animated.View>
        </View>

        {/* Titolo Principale */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              marginBottom: responsive.getSpacing(16),
            },
          ]}
        >
          <ResponsiveText
            style={[{ fontSize: 32 }, styles.mainTitle]}
            numberOfLines={2}
            adjustsFontSizeToFit={true}
          >
            🚧 In Fase di Sviluppo
          </ResponsiveText>
          <ResponsiveText
            style={[{ fontSize: 18 }, styles.subtitle]}
            numberOfLines={2}
            adjustsFontSizeToFit={true}
          >
            Questa sezione sarà presto disponibile
          </ResponsiveText>
        </Animated.View>

        {/* Card Informativa */}
        <Animated.View
          style={[
            styles.infoCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              marginBottom: responsive.getSpacing(16),
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(220, 38, 38, 0.05)', 'rgba(220, 38, 38, 0.02)']}
            style={styles.cardGradient}
          >
            <View
              style={[
                styles.cardContent,
                { padding: responsive.getSpacing(24) },
              ]}
            >
              <MaterialCommunityIcons
                name="information-outline"
                size={responsive.getSpacing(28)}
                color="#DC2626"
                style={[
                  styles.cardIcon,
                  { marginBottom: responsive.getSpacing(8) },
                ]}
              />
              <ResponsiveText
                style={[{ fontSize: 24 }, styles.cardTitle]}
                numberOfLines={2}
                adjustsFontSizeToFit={true}
              >
                Cosa stiamo preparando
              </ResponsiveText>
              <ResponsiveText
                style={[{ fontSize: 16 }, styles.cardDescription]}
                numberOfLines={4}
              >
                Il nostro team sta lavorando duramente per portarti nuove
                funzionalità innovative e un&apos;esperienza utente ancora
                migliore.
              </ResponsiveText>

              <View
                style={[styles.featuresList, { gap: responsive.getSpacing(6) }]}
              >
                <View
                  style={[
                    styles.featureItem,
                    { gap: responsive.getSpacing(12) },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={responsive.getSpacing(16)}
                    color="#059669"
                  />
                  <ResponsiveText
                    style={[{ fontSize: 16 }, styles.featureText]}
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                  >
                    Design migliorato
                  </ResponsiveText>
                </View>
                <View
                  style={[
                    styles.featureItem,
                    { gap: responsive.getSpacing(12) },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={responsive.getSpacing(16)}
                    color="#059669"
                  />
                  <ResponsiveText
                    style={[{ fontSize: 16 }, styles.featureText]}
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                  >
                    Nuove funzionalità
                  </ResponsiveText>
                </View>
                <View
                  style={[
                    styles.featureItem,
                    { gap: responsive.getSpacing(12) },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={responsive.getSpacing(16)}
                    color="#059669"
                  />
                  <ResponsiveText
                    style={[{ fontSize: 16 }, styles.featureText]}
                    numberOfLines={2}
                    adjustsFontSizeToFit={true}
                  >
                    Performance ottimizzate
                  </ResponsiveText>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  backButton: {
    position: 'absolute',
    left: Spacing[4],
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButtonGradient: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
  },
  iconBackground: {
    backgroundColor: Colors.neutral[0],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 3,
    borderColor: 'rgba(220, 38, 38, 0.1)',
  },
  floatingIcon: {
    position: 'absolute',
    backgroundColor: Colors.neutral[0],
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  floatingIcon1: {
    top: -10,
    right: -10,
  },
  floatingIcon2: {
    bottom: 10,
    left: -15,
  },
  floatingIcon3: {
    top: 20,
    left: -20,
  },
  titleContainer: {
    alignItems: 'center',
  },
  mainTitle: {
    fontWeight: Typography.weights.black,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: Spacing[3],
    letterSpacing: -1,
  },
  subtitle: {
    fontWeight: Typography.weights.medium,
    color: '#6B7280',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  infoCard: {
    width: '100%',
    maxWidth: 400,
  },
  cardGradient: {
    borderRadius: BorderRadius.xl,
    padding: 3,
  },
  cardContent: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardIcon: {},
  cardTitle: {
    fontWeight: Typography.weights.bold,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: Spacing[3],
  },
  cardDescription: {
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing[5],
  },
  featuresList: {
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    color: '#374151',
    fontWeight: Typography.weights.medium,
    flex: 1,
  },
});

export default DevelopmentScreen;
