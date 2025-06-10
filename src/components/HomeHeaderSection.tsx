import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { BorderRadius, Spacing, Typography } from '../constants/designTokens';
import { useTheme } from '../hooks/useTheme';

const { height: windowHeight, width: windowWidth } = Dimensions.get('window');

// 🚀 CONFIGURAZIONE AVANZATA E INTELLIGENTE
const ADVANCED_CONFIG = {
  // Sezione Header - Design moderno con gradient
  headerSection: {
    paddingVertical: Spacing[6], // Ridotto per più spazio immagine
    paddingHorizontal: Spacing[6],
    minHeight: 80, // Ridotto
  },

  // Sezione Immagine - Ottimizzata per ogni device
  imageSection: {
    height:
      windowWidth < 375
        ? windowHeight * 0.45 // Ridotto per più spazio al testo
        : windowWidth < 414
          ? windowHeight * 0.48
          : windowWidth < 768
            ? windowHeight * 0.52
            : windowHeight * 0.45,
    minHeight: 320, // Ridotto ma mantenuto impact
    maxHeight: 500, // Controllato per UX
  },

  // Sezione Call-to-Action - Nuova sezione
  ctaSection: {
    paddingVertical: Spacing[6],
    paddingHorizontal: Spacing[6],
    minHeight: 80,
  },

  // Typography Avanzata - Responsive e moderna
  typography: {
    title:
      windowWidth < 375
        ? 24 // Ridotto
        : windowWidth < 414
          ? 28
          : windowWidth < 768
            ? 32
            : 36,
    lineHeight:
      windowWidth < 375
        ? 28 // Ridotto
        : windowWidth < 414
          ? 32
          : windowWidth < 768
            ? 36
            : 40,
  },

  // Animazioni Premium - Fluide e performanti
  animations: {
    staggerDelay: 150,
    fadeInDuration: 900,
    parallaxFactor: 0.5,
  },

  // Scroll Effects - Sofisticati ma non eccessivi
  scrollEffects: {
    fadeRange: [0, 150],
    translateRange: [0, 80],
    parallaxRange: [0, 350],
    scaleRange: [1, 1.08],
  },
};

interface HomeHeaderSectionProps {
  scrollY: Animated.Value;
  onJoinPress?: () => void;
}

export const HomeHeaderSection: React.FC<HomeHeaderSectionProps> = ({
  scrollY,
}) => {
  const { colors } = useTheme();

  // Animazioni Premium con stagger
  const titleAnim = useRef(new Animated.Value(0)).current;
  const imageAnim = useRef(new Animated.Value(0)).current;
  const containerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequenza animazione orchestrata
    Animated.sequence([
      Animated.timing(containerAnim, {
        toValue: 1,
        duration: ADVANCED_CONFIG.animations.fadeInDuration * 0.6,
        useNativeDriver: true,
      }),
      Animated.stagger(ADVANCED_CONFIG.animations.staggerDelay, [
        Animated.spring(titleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(imageAnim, {
          toValue: 1,
          duration: ADVANCED_CONFIG.animations.fadeInDuration,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔥 EFFETTI SCROLL AVANZATI
  const titleOpacity = scrollY.interpolate({
    inputRange: ADVANCED_CONFIG.scrollEffects.fadeRange,
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const titleTransform = scrollY.interpolate({
    inputRange: ADVANCED_CONFIG.scrollEffects.translateRange,
    outputRange: [0, -40],
    extrapolate: 'clamp',
  });

  const imageParallax = scrollY.interpolate({
    inputRange: ADVANCED_CONFIG.scrollEffects.parallaxRange,
    outputRange: [0, -100],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: ADVANCED_CONFIG.scrollEffects.scaleRange,
    extrapolate: 'clamp',
  });

  // Gradient overlay dinamico basato su scroll
  const gradientOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0.1, 0.3],
    extrapolate: 'clamp',
  });

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.neutral[50],
      overflow: 'hidden',
    },

    // 🎨 HEADER SECTION MODERNA
    headerSection: {
      paddingVertical: ADVANCED_CONFIG.headerSection.paddingVertical,
      paddingHorizontal: ADVANCED_CONFIG.headerSection.paddingHorizontal,
      minHeight: ADVANCED_CONFIG.headerSection.minHeight,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },

    // Gradient Background per profondità
    gradientBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.05,
    },

    // Container testo con animazione orchestrata
    textContainer: {
      alignItems: 'center',
      zIndex: 2,
    },

    // 🔥 TITOLO PREMIUM
    title: {
      color: colors.primary[800],
      fontSize: ADVANCED_CONFIG.typography.title,
      fontWeight: Typography.weights.black,
      fontFamily: Typography.families.heading,
      textAlign: 'center',
      lineHeight: ADVANCED_CONFIG.typography.lineHeight,
      letterSpacing: -1,
      // Micro shadow per depth
      textShadowColor: colors.primary[200],
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },

    // 🖼️ SEZIONE IMMAGINE AVANZATA
    imageSection: {
      height: ADVANCED_CONFIG.imageSection.height,
      width: '100%',
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      marginVertical: Spacing[4], // Spazio tra titolo e CTA
    },

    // Container immagine con trasformazioni
    imageContainer: {
      width: '100%',
      height: '100%',
      borderRadius: BorderRadius.xl,
      overflow: 'hidden',
      shadowColor: colors.primary[300],
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 8,
    },

    // Immagine ottimizzata
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },

    // Overlay gradiente dinamico
    imageGradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: BorderRadius.xl,
    },

    // Badge decorativo moderno
    decorativeBadge: {
      position: 'absolute',
      top: Spacing[4],
      right: Spacing[4],
      backgroundColor: colors.primary[500],
      paddingHorizontal: Spacing[3],
      paddingVertical: Spacing[1],
      borderRadius: BorderRadius.full,
      shadowColor: colors.primary[500],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },

    badgeText: {
      color: colors.neutral[0],
      fontSize: Typography.sizes.xs,
      fontWeight: Typography.weights.bold,
      letterSpacing: 0.5,
    },
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: containerAnim,
          transform: [{ scale: containerAnim }],
        },
      ]}
    >
      {/* 🎨 HEADER SECTION PREMIUM */}
      <View style={styles.headerSection}>
        {/* Gradient Background */}
        <LinearGradient
          colors={[colors.primary[100], colors.primary[50], colors.neutral[50]]}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <View style={styles.textContainer}>
          {/* Titolo Premium con animazioni */}
          <Animated.View
            style={{
              opacity: Animated.multiply(titleAnim, titleOpacity),
              transform: [
                {
                  translateY: Animated.add(
                    titleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                    titleTransform
                  ),
                },
                { scale: titleAnim },
              ],
            }}
          >
            <Text style={styles.title}>Rise Against Hunger Italia</Text>
          </Animated.View>
        </View>
      </View>

      {/* 🖼️ SEZIONE IMMAGINE AVANZATA */}
      <View style={styles.imageSection}>
        <Animated.View
          style={[
            styles.imageContainer,
            {
              opacity: imageAnim,
              transform: [
                {
                  translateY: Animated.add(
                    imageAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                    imageParallax
                  ),
                },
                { scale: Animated.multiply(imageAnim, imageScale) },
              ],
            },
          ]}
        >
          {/* Immagine Hero */}
          <Animated.Image
            source={require('../../assets/images/hero-banner.png')}
            style={styles.image}
          />

          {/* Overlay Gradiente Dinamico */}
          <Animated.View style={{ opacity: gradientOpacity }}>
            <LinearGradient
              colors={[
                'transparent',
                colors.primary[500] + '10',
                colors.primary[600] + '20',
              ]}
              style={styles.imageGradientOverlay}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>

          {/* Badge Decorativo */}
          <View style={styles.decorativeBadge}>
            <Text style={styles.badgeText}>2024</Text>
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

export default HomeHeaderSection;
