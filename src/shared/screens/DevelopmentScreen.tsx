import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import {
  BorderRadius,
  Colors,
  Shadows,
  Typography,
} from '../constants/designTokens';
import { scale } from '../constants/perfectScale';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import {
  PerfectIcon,
  PlatformTouchable,
  PlatformScrollView,
  PerfectText,
} from '@/components/ui';
import { PerfectSpacing } from '@/shared/constants';

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
        colors={[Colors.neutral[50], Colors.neutral[100], Colors.neutral[200]]}
        style={styles.gradientBackground}
      />

      {/* Pulsante Indietro */}
      <PlatformTouchable
        style={[
          styles.backButton,
          {
            top: insets.top + PerfectSpacing.base,
            width: scale(48),
            height: scale(48),
          },
        ]}
        onPress={handleGoBack}
        activeOpacity={0.7}
      >
        {/* Container per nascondere overflow durante animazioni */}
        <View style={styles.backButtonContainer}>
          <LinearGradient
            colors={[Colors.primary[600], Colors.primary[700]]}
            style={[
              styles.backButtonGradient,
              {
                width: scale(48),
                height: scale(48),
                borderRadius: scale(24),
              },
            ]}
          >
            <PerfectIcon
              name="arrow-left"
              size={24}
              color={Colors.neutral[0]}
            />
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
              paddingHorizontal: PerfectSpacing.lg,
              paddingTop:
                Platform.OS === 'ios'
                  ? PerfectSpacing['3xl']
                  : PerfectSpacing['5xl'],
            },
          ]}
        >
          {/* Icona Principale Animata */}
          <View
            style={[
              styles.iconContainer,
              {
                marginBottom: PerfectSpacing.base,
                marginTop:
                  Platform.OS === 'ios'
                    ? PerfectSpacing.xl
                    : PerfectSpacing.base,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.iconBackground,
                {
                  width: scale(120),
                  height: scale(120),
                  borderRadius: scale(60),
                  transform: [
                    { scale: pulseAnim },
                    { rotate: rotateInterpolate },
                  ],
                },
              ]}
            >
              <PerfectIcon
                name="hammer-wrench"
                size={60}
                color={Colors.primary[600]}
              />
            </Animated.View>

            {/* Icone decorative fluttuanti */}
            <Animated.View
              style={[
                styles.floatingIcon,
                styles.floatingIcon1,
                { padding: PerfectSpacing.sm },
              ]}
            >
              <PerfectIcon
                name="code-tags"
                size={24}
                color={Colors.semantic.success.dark}
              />
            </Animated.View>
            <Animated.View
              style={[
                styles.floatingIcon,
                styles.floatingIcon2,
                { padding: PerfectSpacing.sm },
              ]}
            >
              <PerfectIcon
                name="palette"
                size={20}
                color={Colors.primary[500]}
              />
            </Animated.View>
            <Animated.View
              style={[
                styles.floatingIcon,
                styles.floatingIcon3,
                { padding: PerfectSpacing.sm },
              ]}
            >
              <PerfectIcon
                name="rocket"
                size={22}
                color={Colors.primary[400]}
              />
            </Animated.View>
          </View>

          {/* Titolo Principale */}
          <View
            style={[
              styles.titleContainer,
              {
                marginBottom: PerfectSpacing.base,
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
                marginBottom: PerfectSpacing.base,
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(220, 38, 38, 0.05)', 'rgba(220, 38, 38, 0.02)']}
              style={styles.cardGradient}
            >
              <View
                style={[styles.cardContent, { padding: PerfectSpacing.lg }]}
              >
                <PerfectIcon
                  name="information-outline"
                  size={28}
                  color={Colors.primary[600]}
                  style={[styles.cardIcon, { marginBottom: PerfectSpacing.sm }]}
                />
                <PerfectText size={24} lines={2} style={styles.cardTitle}>
                  Cosa stiamo preparando
                </PerfectText>
                <PerfectText size={16} lines={4} style={styles.cardDescription}>
                  Il nostro team sta lavorando duramente per portarti nuove
                  funzionalità innovative e un&apos;esperienza utente ancora
                  migliore.
                </PerfectText>

                <View style={[styles.featuresList, { gap: PerfectSpacing.xs }]}>
                  <View
                    style={[styles.featureItem, { gap: PerfectSpacing.md }]}
                  >
                    <PerfectIcon
                      name="check-circle"
                      size={16}
                      color={Colors.semantic.success.dark}
                    />
                    <PerfectText size={16} lines={1} style={styles.featureText}>
                      Design migliorato
                    </PerfectText>
                  </View>
                  <View
                    style={[styles.featureItem, { gap: PerfectSpacing.md }]}
                  >
                    <PerfectIcon
                      name="check-circle"
                      size={16}
                      color={Colors.semantic.success.dark}
                    />
                    <PerfectText size={16} lines={1} style={styles.featureText}>
                      Nuove funzionalità
                    </PerfectText>
                  </View>
                  <View
                    style={[styles.featureItem, { gap: PerfectSpacing.md }]}
                  >
                    <PerfectIcon
                      name="check-circle"
                      size={16}
                      color={Colors.semantic.success.dark}
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
    left: PerfectSpacing.base,
    zIndex: 10,
  },
  backButtonContainer: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    overflow: 'hidden',
    ...Shadows.md,
  },
  backButtonGradient: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: scale(600),
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom:
      Platform.OS === 'android' ? scale(250) : PerfectSpacing['4xl'],
  },
  iconContainer: {
    position: 'relative',
  },
  iconBackground: {
    backgroundColor: Colors.neutral[0],
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
    borderWidth: scale(3),
    borderColor: Colors.primary[100],
  },
  floatingIcon: {
    position: 'absolute',
    backgroundColor: Colors.neutral[0],
    borderRadius: scale(20),
    ...Shadows.sm,
  },
  floatingIcon1: {
    top: scale(-10),
    right: scale(-10),
  },
  floatingIcon2: {
    bottom: scale(10),
    left: scale(-15),
  },
  floatingIcon3: {
    top: scale(20),
    left: scale(-20),
  },
  titleContainer: {
    alignItems: 'center',
  },
  mainTitle: {
    fontWeight: Typography.weights.black,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: PerfectSpacing.md,
    letterSpacing: scale(-1),
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
    color: Colors.neutral[500],
    textAlign: 'center',
    letterSpacing: scale(0.2),
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
    maxWidth: scale(400),
  },
  cardGradient: {
    borderRadius: BorderRadius.xl,
    padding: scale(3),
  },
  cardContent: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.lg,
  },
  cardIcon: {},
  cardTitle: {
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: PerfectSpacing.md,
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
    color: Colors.neutral[500],
    textAlign: 'center',
    lineHeight: scale(24),
    marginBottom: scale(20),
  },
  featuresList: {
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    color: Colors.neutral[700],
    fontWeight: Typography.weights.medium,
    flex: 1,
  },
});

export default DevelopmentScreen;
