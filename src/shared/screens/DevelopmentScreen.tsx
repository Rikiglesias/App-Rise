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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  PlatformTouchable,
  PlatformScrollView,
  PerfectText,
} from '../../components/ui';

import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from '../constants/designTokens';
import { PlatformShadows } from '../constants/platformDesignTokens';
import { useHapticFeedback } from '../hooks/useHapticFeedback';

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

  // Solo animazioni icone (funzionano bene)
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Solo animazioni icone (funzionano perfettamente)
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

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
  }, [rotateAnim, pulseAnim]);

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
        style={[
          styles.backButton,
          {
            top: insets.top + Spacing[4],
            width: 48,
            height: 48,
          },
        ]}
        onPress={handleGoBack}
        activeOpacity={0.7}
      >
        {/* Container per nascondere overflow durante animazioni */}
        <View style={styles.backButtonContainer}>
          <LinearGradient
            colors={['#DC2626', '#B91C1C']}
            style={[
              styles.backButtonGradient,
              {
                width: 48,
                height: 48,
                borderRadius: 24,
              },
            ]}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </LinearGradient>
        </View>
      </PlatformTouchable>

      {/* Contenuto Principale - ScrollView per layout robusto */}
      <PlatformScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.content,
            {
              paddingHorizontal: Spacing[6],
              paddingTop: Platform.OS === 'ios' ? Spacing[12] : Spacing[20],
            },
          ]}
        >
          {/* Icona Principale Animata */}
          <View
            style={[
              styles.iconContainer,
              {
                marginBottom: Spacing[4],
                marginTop: Platform.OS === 'ios' ? Spacing[8] : Spacing[4],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.iconBackground,
                {
                  width: 120,
                  height: 120,
                  borderRadius: 60,
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
            <Animated.View
              style={[
                styles.floatingIcon,
                styles.floatingIcon1,
                { padding: Spacing[2] },
              ]}
            >
              <MaterialCommunityIcons
                name="code-tags"
                size={24}
                color="#059669"
              />
            </Animated.View>
            <Animated.View
              style={[
                styles.floatingIcon,
                styles.floatingIcon2,
                { padding: Spacing[2] },
              ]}
            >
              <MaterialCommunityIcons
                name="palette"
                size={20}
                color="#7C3AED"
              />
            </Animated.View>
            <Animated.View
              style={[
                styles.floatingIcon,
                styles.floatingIcon3,
                { padding: Spacing[2] },
              ]}
            >
              <MaterialCommunityIcons name="rocket" size={22} color="#F59E0B" />
            </Animated.View>
          </View>

          {/* Titolo Principale */}
          <View
            style={[
              styles.titleContainer,
              {
                marginBottom: Spacing[4],
              },
            ]}
          >
            <PerfectText size={32} lines={2} style={styles.mainTitle}>
              🚧 In Fase di Sviluppo
            </PerfectText>
            <PerfectText size={18} lines={2} style={styles.subtitle}>
              Questa sezione sarà presto disponibile
            </PerfectText>
          </View>

          {/* Card Informativa */}
          <View
            style={[
              styles.infoCard,
              {
                marginBottom: Spacing[4],
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(220, 38, 38, 0.05)', 'rgba(220, 38, 38, 0.02)']}
              style={styles.cardGradient}
            >
              <View style={[styles.cardContent, { padding: Spacing[6] }]}>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={28}
                  color="#DC2626"
                  style={[styles.cardIcon, { marginBottom: Spacing[2] }]}
                />
                <PerfectText size={24} lines={2} style={styles.cardTitle}>
                  Cosa stiamo preparando
                </PerfectText>
                <PerfectText size={16} lines={4} style={styles.cardDescription}>
                  Il nostro team sta lavorando duramente per portarti nuove
                  funzionalità innovative e un&apos;esperienza utente ancora
                  migliore.
                </PerfectText>

                <View style={[styles.featuresList, { gap: Spacing[1] }]}>
                  <View style={[styles.featureItem, { gap: Spacing[3] }]}>
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={16}
                      color="#059669"
                    />
                    <PerfectText size={16} lines={1} style={styles.featureText}>
                      Design migliorato
                    </PerfectText>
                  </View>
                  <View style={[styles.featureItem, { gap: Spacing[3] }]}>
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={16}
                      color="#059669"
                    />
                    <PerfectText size={16} lines={1} style={styles.featureText}>
                      Nuove funzionalità
                    </PerfectText>
                  </View>
                  <View style={[styles.featureItem, { gap: Spacing[3] }]}>
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={16}
                      color="#059669"
                    />
                    <PerfectText size={16} lines={2} style={styles.featureText}>
                      Performance ottimizzate
                    </PerfectText>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>
      </PlatformScrollView>
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
  },
  backButtonContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#DC2626',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButtonGradient: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 600,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'android' ? 250 : Spacing[16],
  },
  iconContainer: {
    position: 'relative',
  },
  iconBackground: {
    backgroundColor: Colors.neutral[0],
    justifyContent: 'center',
    alignItems: 'center',
    ...PlatformShadows.primary,
    borderWidth: 3,
    borderColor: 'rgba(220, 38, 38, 0.1)',
  },
  floatingIcon: {
    position: 'absolute',
    backgroundColor: Colors.neutral[0],
    borderRadius: 20,
    ...PlatformShadows.md,
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
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(31, 41, 55, 0.15)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
      },
      android: {},
    }),
  },
  subtitle: {
    fontWeight: Typography.weights.medium,
    color: '#6B7280',
    textAlign: 'center',
    letterSpacing: 0.2,
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(107, 114, 128, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
      },
      android: {},
    }),
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
    ...PlatformShadows.lg,
  },
  cardIcon: {},
  cardTitle: {
    fontWeight: Typography.weights.bold,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: Spacing[3],
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(31, 41, 55, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
      },
      android: {},
    }),
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
