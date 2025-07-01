import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  SafeAreaView,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { PlatformTouchable, PlatformScrollView } from '../../components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from '../constants/designTokens';
import { PlatformShadows } from '../constants/platformDesignTokens';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { useResponsive } from '../hooks/useResponsive';

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
  const { scaleFont } = useResponsive();

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
            <Text
              style={[styles.mainTitle, { fontSize: scaleFont(32) }]}
              numberOfLines={2}
              adjustsFontSizeToFit={true}
            >
              🚧 In Fase di Sviluppo
            </Text>
            <Text
              style={[styles.subtitle, { fontSize: scaleFont(18) }]}
              numberOfLines={2}
              adjustsFontSizeToFit={true}
            >
              Questa sezione sarà presto disponibile
            </Text>
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
                <Text
                  style={[styles.cardTitle, { fontSize: scaleFont(24) }]}
                  numberOfLines={2}
                  adjustsFontSizeToFit={true}
                >
                  Cosa stiamo preparando
                </Text>
                <Text
                  style={[styles.cardDescription, { fontSize: scaleFont(16) }]}
                  numberOfLines={4}
                >
                  Il nostro team sta lavorando duramente per portarti nuove
                  funzionalità innovative e un&apos;esperienza utente ancora
                  migliore.
                </Text>

                <View style={[styles.featuresList, { gap: Spacing[1] }]}>
                  <View style={[styles.featureItem, { gap: Spacing[3] }]}>
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={16}
                      color="#059669"
                    />
                    <Text
                      style={[styles.featureText, { fontSize: scaleFont(16) }]}
                      numberOfLines={1}
                      adjustsFontSizeToFit={true}
                    >
                      Design migliorato
                    </Text>
                  </View>
                  <View style={[styles.featureItem, { gap: Spacing[3] }]}>
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={16}
                      color="#059669"
                    />
                    <Text
                      style={[styles.featureText, { fontSize: scaleFont(16) }]}
                      numberOfLines={1}
                      adjustsFontSizeToFit={true}
                    >
                      Nuove funzionalità
                    </Text>
                  </View>
                  <View style={[styles.featureItem, { gap: Spacing[3] }]}>
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={16}
                      color="#059669"
                    />
                    <Text
                      style={[styles.featureText, { fontSize: scaleFont(16) }]}
                      numberOfLines={2}
                      adjustsFontSizeToFit={true}
                    >
                      Performance ottimizzate
                    </Text>
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
    // PULITO: Zero decorazioni su container per evitare conflitti con LinearGradient
  },
  backButtonContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden', // CRITICO: nasconde i bordi durante le animazioni su Android
    // OMBRA SUL CONTAINER - più stabile durante animazioni
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
    // GRADIENT PULITO - senza ombra per evitare conflitti
  },
  content: {
    flex: 1,
    justifyContent: 'center', // RIPRISTINATO: con ScrollView il centramento funziona correttamente
    alignItems: 'center',
    minHeight: 600, // MINIMA altezza per garantire il centramento quando c'è poco contenuto
  },
  scrollContent: {
    flexGrow: 1, // Permette al contenuto di crescere e centrarsi
    paddingBottom: Platform.OS === 'android' ? 250 : Spacing[16], // ANDROID: 250 per evitare taglio dalla bottom navigation / iOS: normale
  },
  iconContainer: {
    position: 'relative',
  },
  iconBackground: {
    backgroundColor: Colors.neutral[0],
    justifyContent: 'center',
    alignItems: 'center',
    ...PlatformShadows.primary, // CONVERTITO: shadow rossa ottimizzata per entrambe le piattaforme
    borderWidth: 3,
    borderColor: 'rgba(220, 38, 38, 0.1)',
  },
  floatingIcon: {
    position: 'absolute',
    backgroundColor: Colors.neutral[0],
    borderRadius: 20,
    ...PlatformShadows.md, // CONVERTITO: da shadow manuale a PlatformShadows per Android ottimizzato
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
    // ANDROID: Zero text shadow per evitare bordi grigi durante animazioni
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(31, 41, 55, 0.15)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
      },
      android: {
        // Nessuna text shadow per animazioni pulite
      },
    }),
  },
  subtitle: {
    fontWeight: Typography.weights.medium,
    color: '#6B7280',
    textAlign: 'center',
    letterSpacing: 0.2,
    // ANDROID: Zero text shadow per evitare bordi grigi durante animazioni
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(107, 114, 128, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
      },
      android: {
        // Nessuna text shadow per animazioni pulite
      },
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
    ...PlatformShadows.lg, // CONVERTITO: da shadow manuale a PlatformShadows per Android ottimizzato
  },
  cardIcon: {},
  cardTitle: {
    fontWeight: Typography.weights.bold,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: Spacing[3],
    // ANDROID: Zero text shadow per evitare bordi grigi durante animazioni
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(31, 41, 55, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
      },
      android: {
        // Nessuna text shadow per animazioni pulite
      },
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
