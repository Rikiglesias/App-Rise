import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PlatformTouchable } from '../components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from '../shared/constants/designTokens';
import { useHapticFeedback } from '../shared/hooks/useHapticFeedback';

// Import dimensioni se necessario in futuro

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

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FAFAFA', '#F5F5F5', '#EEEEEE']}
        style={styles.gradientBackground}
      />

      {/* Pulsante Indietro */}
      <PlatformTouchable
        style={[styles.backButton, { top: insets.top + Spacing[2] }]}
        onPress={handleGoBack}
        activeOpacity={0.7}
        rippleColor="rgba(220, 38, 38, 0.2)"
      >
        <LinearGradient
          colors={['#DC2626', '#B91C1C']}
          style={styles.backButtonGradient}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </LinearGradient>
      </PlatformTouchable>

      {/* Contenuto Principale */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
          },
        ]}
      >
        {/* Icona Principale Animata */}
        <View style={styles.iconContainer}>
          <Animated.View
            style={[
              styles.iconBackground,
              {
                transform: [
                  { scale: pulseAnim },
                  { rotate: rotateInterpolate },
                ],
              },
            ]}
          >
            <MaterialCommunityIcons
              name="hammer-wrench"
              size={60}
              color="#DC2626"
            />
          </Animated.View>

          {/* Icone decorative fluttuanti */}
          <Animated.View style={[styles.floatingIcon, styles.floatingIcon1]}>
            <MaterialCommunityIcons
              name="code-tags"
              size={24}
              color="#059669"
            />
          </Animated.View>
          <Animated.View style={[styles.floatingIcon, styles.floatingIcon2]}>
            <MaterialCommunityIcons name="palette" size={20} color="#7C3AED" />
          </Animated.View>
          <Animated.View style={[styles.floatingIcon, styles.floatingIcon3]}>
            <MaterialCommunityIcons name="rocket" size={22} color="#F59E0B" />
          </Animated.View>
        </View>

        {/* Titolo Principale */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.mainTitle}>🚧 In Fase di Sviluppo</Text>
          <Text style={styles.subtitle}>
            Questa sezione sarà presto disponibile
          </Text>
        </Animated.View>

        {/* Card Informativa */}
        <Animated.View
          style={[
            styles.infoCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(220, 38, 38, 0.05)', 'rgba(220, 38, 38, 0.02)']}
            style={styles.cardGradient}
          >
            <View style={styles.cardContent}>
              <MaterialCommunityIcons
                name="information-outline"
                size={28}
                color="#DC2626"
                style={styles.cardIcon}
              />
              <Text style={styles.cardTitle}>Cosa stiamo preparando</Text>
              <Text style={styles.cardDescription}>
                Il nostro team sta lavorando duramente per portarti nuove
                funzionalità innovative e un&apos;esperienza utente ancora
                migliore.
              </Text>

              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={16}
                    color="#059669"
                  />
                  <Text style={styles.featureText}>Design migliorato</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={16}
                    color="#059669"
                  />
                  <Text style={styles.featureText}>Nuove funzionalità</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={16}
                    color="#059669"
                  />
                  <Text style={styles.featureText}>
                    Performance ottimizzate
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Call to Action */}
        <Animated.View
          style={[
            styles.ctaContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.ctaText}>
            💡 Torna presto per scoprire le novità!
          </Text>
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
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing[6],
    paddingTop: Platform.OS === 'ios' ? Spacing[12] : Spacing[8], // Spazio normale sopra
    paddingBottom: Platform.OS === 'ios' ? Spacing[16] : Spacing[12], // Spazio normale sotto
  },
  iconContainer: {
    position: 'relative',
    marginBottom: Spacing[8],
    marginTop: Platform.OS === 'ios' ? Spacing[16] : Spacing[8], // Più spazio sopra l'icona su iOS
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
    padding: Spacing[2],
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
    marginBottom: Spacing[8],
  },
  mainTitle: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.black,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: Spacing[3],
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.medium,
    color: '#6B7280',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  infoCard: {
    width: '100%',
    maxWidth: 400,
    marginBottom: Spacing[8],
  },
  cardGradient: {
    borderRadius: BorderRadius.xl,
    padding: 3,
  },
  cardContent: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.lg,
    padding: Spacing[6],
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardIcon: {
    marginBottom: Spacing[4],
  },
  cardTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: Spacing[3],
  },
  cardDescription: {
    fontSize: Typography.sizes.base,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing[5],
  },
  featuresList: {
    width: '100%',
    gap: Spacing[3],
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  featureText: {
    fontSize: Typography.sizes.base,
    color: '#374151',
    fontWeight: Typography.weights.medium,
  },
  ctaContainer: {
    backgroundColor: 'rgba(220, 38, 38, 0.05)',
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[6],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.1)',
    marginBottom: Platform.OS === 'ios' ? Spacing[12] : Spacing[8], // Spazio bilanciato dopo "Torna presto"
  },
  ctaText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: '#DC2626',
    textAlign: 'center',
  },
});

export default DevelopmentScreen;
