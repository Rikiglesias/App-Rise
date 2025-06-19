/* eslint-disable react-native/no-unused-styles */
import type { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Surface } from 'react-native-paper';

import { Colors, Spacing, Typography } from '../shared/constants/designTokens';
import { useHapticFeedback } from '../shared/hooks/useHapticFeedback';

const { width: screenWidth } = Dimensions.get('window');

interface HomeTabScreenProps {
  navigation: StackNavigationProp<Record<string, object | undefined>>;
}

export type { HomeTabScreenProps };

// Modern Animation Hook
const useModernAnimations = () => {
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(-30)).current;
  const descriptionFade = useRef(new Animated.Value(0)).current;
  const descriptionSlide = useRef(new Animated.Value(20)).current;
  const buttonsFade = useRef(new Animated.Value(0)).current;
  const buttonsSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const sequence = Animated.sequence([
      // Prima il titolo con effetto drammatico
      Animated.parallel([
        Animated.timing(titleFade, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(titleSlide, {
          toValue: 0,
          useNativeDriver: true,
          tension: 40,
          friction: 8,
        }),
      ]),
      // Poi la descrizione
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(descriptionFade, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(descriptionSlide, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
      ]),
      // Infine i bottoni
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(buttonsFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(buttonsSlide, {
          toValue: 0,
          useNativeDriver: true,
          tension: 60,
          friction: 8,
        }),
      ]),
    ]);

    sequence.start();

    return () => {
      sequence.stop();
    };
  }, [
    titleFade,
    titleSlide,
    descriptionFade,
    descriptionSlide,
    buttonsFade,
    buttonsSlide,
  ]);

  return {
    titleFade,
    titleSlide,
    descriptionFade,
    descriptionSlide,
    buttonsFade,
    buttonsSlide,
  };
};

// Modern Header Section con titolo avanzato
const ModernHeaderSection: React.FC<{
  animations: ReturnType<typeof useModernAnimations>;
}> = ({ animations }) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        headerContainer: {
          paddingTop: Spacing[16],
          paddingHorizontal: Spacing[2], // Ridotto per più spazio al titolo
          paddingBottom: Spacing[8],
          backgroundColor: Colors.neutral[0],
          alignItems: 'center',
        },
        titleContainer: {
          alignItems: 'center',
          marginBottom: Spacing[6],
          position: 'relative',
          width: '100%',
          paddingHorizontal: Spacing[2],
        },
        // Effetto glow MASSIVO e ultra-visibile
        titleGlowContainer: {
          position: 'absolute',
          top: -40, // MOLTO più ampio
          left: -60, // Estende molto di più
          right: -60,
          bottom: -40,
          borderRadius: 80, // Super morbido
          backgroundColor: 'rgba(220, 38, 38, 0.15)', // MOLTO più visibile
          shadowColor: '#DC2626',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.4, // Shadow molto pronunciata
          shadowRadius: 32, // Alone gigante
          elevation: 16,
          // Bordo più visibile
          borderWidth: 2,
          borderColor: 'rgba(220, 38, 38, 0.2)',
        },
        titleText: {
          fontSize: screenWidth > 375 ? 64 : 56, // MOLTO più grande!
          fontWeight: Typography.weights.black,
          color: '#DC2626',
          textAlign: 'center',
          letterSpacing: -2.0, // Ultra-compresso per modernità
          lineHeight: screenWidth > 375 ? 68 : 60,
          // Text shadow DRASTICAMENTE potenziato
          textShadowColor: 'rgba(220, 38, 38, 0.4)',
          textShadowOffset: { width: 0, height: 6 },
          textShadowRadius: 16,
          // Aggiunta di profondità tipografica
          includeFontPadding: false,
          textAlignVertical: 'center',
          // Padding per respirazione
          paddingHorizontal: Spacing[2],
        },
        // Separatore decorativo AMPIO e morbido
        titleSeparator: {
          marginTop: Spacing[4],
          alignItems: 'center',
          width: '100%',
        },
        separatorLine: {
          width: 200, // MASSIMO larghezza
          height: 6, // Molto più spesso
          backgroundColor: '#DC2626',
          borderRadius: 12, // Super morbido
          shadowColor: '#DC2626',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.6, // Shadow molto pronunciata
          shadowRadius: 12,
          elevation: 8,
          // Effetto glow anche per il separatore
          marginHorizontal: 'auto',
        },
        // Separatore glow MOLTO più ampio
        separatorGlow: {
          position: 'absolute',
          width: 240, // Ancora più largo
          height: 12, // Più spesso
          backgroundColor: 'rgba(220, 38, 38, 0.2)', // Più visibile
          borderRadius: 16,
          top: -3,
        },

        subtitleText: {
          fontSize: Typography.sizes.lg,
          fontWeight: Typography.weights.medium,
          color: Colors.neutral[600],
          textAlign: 'center',
          marginTop: Spacing[2],
          letterSpacing: 0.3,
        },
      }),
    []
  );

  return (
    <View style={styles.headerContainer}>
      <Animated.View
        style={[
          styles.titleContainer,
          {
            opacity: animations.titleFade,
            transform: [{ translateY: animations.titleSlide }],
          },
        ]}
      >
        {/* Effetto glow MASSIVO con LinearGradient */}
        <LinearGradient
          colors={[
            'rgba(220, 38, 38, 0.25)', // MOLTO più visibile
            'rgba(220, 38, 38, 0.20)',
            'rgba(220, 38, 38, 0.15)',
            'rgba(220, 38, 38, 0.08)',
            'transparent',
          ]}
          style={styles.titleGlowContainer}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />

        {/* Titolo principale potenziato */}
        <Text style={styles.titleText}>Rise Against{'\n'}Hunger Italia</Text>

        {/* Separatore decorativo AMPIO con effetto glow */}
        <View style={styles.titleSeparator}>
          <LinearGradient
            colors={[
              'transparent',
              'rgba(220, 38, 38, 0.30)', // MOLTO più visibile
              'rgba(220, 38, 38, 0.25)',
              'rgba(220, 38, 38, 0.20)',
              'rgba(220, 38, 38, 0.15)',
              'transparent',
            ]}
            style={styles.separatorGlow}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
          />
          <View style={styles.separatorLine} />
        </View>
      </Animated.View>
    </View>
  );
};

// Sezione descrizione dell'app
const AppDescriptionSection: React.FC<{
  animations: ReturnType<typeof useModernAnimations>;
}> = ({ animations }) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        descriptionContainer: {
          paddingHorizontal: Spacing[6],
          paddingVertical: Spacing[8],
          backgroundColor: Colors.neutral[50],
          marginHorizontal: Spacing[4],
          borderRadius: 24,
          shadowColor: Colors.neutral[400],
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 3,
        },
        descriptionTitle: {
          fontSize: Typography.sizes.xl,
          fontWeight: Typography.weights.bold,
          color: Colors.neutral[900],
          textAlign: 'center',
          marginBottom: Spacing[4],
          letterSpacing: -0.5,
        },
        descriptionText: {
          fontSize: Typography.sizes.base,
          fontWeight: Typography.weights.regular,
          color: Colors.neutral[700],
          textAlign: 'center',
          lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
          marginBottom: Spacing[4],
        },
        navigationHint: {
          fontSize: Typography.sizes.sm,
          fontWeight: Typography.weights.medium,
          color: Colors.primary[600],
          textAlign: 'center',
          fontStyle: 'italic',
        },
      }),
    []
  );

  return (
    <Animated.View
      style={[
        styles.descriptionContainer,
        {
          opacity: animations.descriptionFade,
          transform: [{ translateY: animations.descriptionSlide }],
        },
      ]}
    >
      <Text style={styles.descriptionTitle}>Come funziona l&apos;app</Text>
      <Text style={styles.descriptionText}>
        Scopri il nostro impatto nella lotta contro la fame mondiale e unisciti
        alle nostre azioni concrete per fare la differenza.
      </Text>
      <Text style={styles.navigationHint}>
        Naviga tra le sezioni per esplorare tutte le funzionalità
      </Text>
    </Animated.View>
  );
};

// Sezione bottoni di navigazione
const NavigationButtonsSection: React.FC<{
  animations: ReturnType<typeof useModernAnimations>;
  onImpactPress: () => void;
  onActionsPress: () => void;
}> = ({ animations, onImpactPress, onActionsPress }) => {
  const { triggerHaptic } = useHapticFeedback();

  const handleImpactPress = async () => {
    await triggerHaptic('medium');
    onImpactPress();
  };

  const handleActionsPress = async () => {
    await triggerHaptic('medium');
    onActionsPress();
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        buttonsContainer: {
          paddingHorizontal: Spacing[4],
          paddingVertical: Spacing[8],
          gap: Spacing[4],
        },
        buttonRow: {
          flexDirection: 'row',
          gap: Spacing[4],
        },
        button: {
          flex: 1,
        },
        impactButton: {
          backgroundColor: '#059669', // Green per impatto
          borderRadius: 20,
          shadowColor: '#059669',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 4,
        },
        actionsButton: {
          backgroundColor: '#DC2626', // Rosso per azioni
          borderRadius: 20,
          shadowColor: '#DC2626',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 4,
        },
        buttonContent: {
          paddingVertical: Spacing[6],
          paddingHorizontal: Spacing[4],
          alignItems: 'center',
        },
        buttonIcon: {
          fontSize: 32,
          marginBottom: Spacing[2],
        },
        buttonTitle: {
          fontSize: Typography.sizes.lg,
          fontWeight: Typography.weights.bold,
          color: Colors.neutral[0],
          textAlign: 'center',
          marginBottom: Spacing[1],
        },
        buttonSubtitle: {
          fontSize: Typography.sizes.sm,
          fontWeight: Typography.weights.medium,
          color: Colors.neutral[100],
          textAlign: 'center',
          opacity: 0.9,
        },
      }),
    []
  );

  return (
    <Animated.View
      style={[
        styles.buttonsContainer,
        {
          opacity: animations.buttonsFade,
          transform: [{ translateY: animations.buttonsSlide }],
        },
      ]}
    >
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.button}
          // eslint-disable-next-line react/jsx-no-bind
          onPress={handleImpactPress}
          activeOpacity={0.8}
        >
          <Surface style={[styles.impactButton]}>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonIcon}>📊</Text>
              <Text style={styles.buttonTitle}>Impatto</Text>
              <Text style={styles.buttonSubtitle}>I nostri risultati</Text>
            </View>
          </Surface>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          // eslint-disable-next-line react/jsx-no-bind
          onPress={handleActionsPress}
          activeOpacity={0.8}
        >
          <Surface style={[styles.actionsButton]}>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonIcon}>🚀</Text>
              <Text style={styles.buttonTitle}>Azioni</Text>
              <Text style={styles.buttonSubtitle}>Cosa puoi fare</Text>
            </View>
          </Surface>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// Main Component
export const HomeTabScreen: React.FC<HomeTabScreenProps> = ({ navigation }) => {
  const animations = useModernAnimations();

  const handleImpactPress = () => {
    navigation.navigate('Impact');
  };

  const handleActionsPress = () => {
    navigation.navigate('Contribute');
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: Colors.neutral[0],
        },
        content: {
          flex: 1,
          justifyContent: 'space-between',
        },
      }),
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ModernHeaderSection animations={animations} />
        <AppDescriptionSection animations={animations} />
        <NavigationButtonsSection
          animations={animations}
          // eslint-disable-next-line react/jsx-no-bind
          onImpactPress={handleImpactPress}
          // eslint-disable-next-line react/jsx-no-bind
          onActionsPress={handleActionsPress}
        />
      </View>
    </SafeAreaView>
  );
};
