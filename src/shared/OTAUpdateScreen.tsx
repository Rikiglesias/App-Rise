/**
 * OTA Update Screen - Schermata Aggiornamento Moderna
 * Rise Against Hunger Italia
 *
 * Design: Minimalista, elegante, con animazioni fluide
 * Coerente con il design system dell'app (rosso brand + nero premium)
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { PerfectImage } from '@/components/ui/PerfectImage';
import { Colors } from '@/shared/constants/designTokens';
import { scale, scaleText } from '@/shared/constants/perfectScale';
import { PerfectSpacing } from '@/shared/constants/perfectSpacing';

interface OTAUpdateScreenProps {
  isChecking: boolean;
  isDownloading: boolean;
  progress?: number; // 0-100
  message?: string;
}

export const OTAUpdateScreen: React.FC<OTAUpdateScreenProps> = ({
  isChecking,
  isDownloading,
  progress = 0,
  message,
}) => {
  // Animazioni
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const circleAnim1 = useRef(new Animated.Value(0)).current;
  const circleAnim2 = useRef(new Animated.Value(0)).current;

  // Pulse animation per icona
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  // Shimmer effect
  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    shimmer.start();

    return () => shimmer.stop();
  }, [shimmerAnim]);

  // Cerchi animati sfondo
  useEffect(() => {
    const circle1 = Animated.loop(
      Animated.sequence([
        Animated.timing(circleAnim1, {
          toValue: 1,
          duration: 8000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(circleAnim1, {
          toValue: 0,
          duration: 8000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const circle2 = Animated.loop(
      Animated.sequence([
        Animated.timing(circleAnim2, {
          toValue: 1,
          duration: 10000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(circleAnim2, {
          toValue: 0,
          duration: 10000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    circle1.start();
    circle2.start();

    return () => {
      circle1.stop();
      circle2.stop();
    };
  }, [circleAnim1, circleAnim2]);

  // Fade in all'apertura
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Animazione progresso
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  // Calcola larghezza barra progresso
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  // Determina messaggio da mostrare
  const displayMessage =
    message ||
    (isDownloading
      ? 'Download aggiornamento in corso...'
      : isChecking
        ? 'Controllo aggiornamenti...'
        : 'Preparazione in corso...');

  // Interpolazioni cerchi animati
  const circle1Translate = circleAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  const circle2Translate = circleAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [100, -100],
  });

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-400, 400],
  });

  return (
    <View style={styles.container}>
      {/* Sfondo gradient premium */}
      <LinearGradient
        colors={[
          Colors.black.pure,
          Colors.black.medium,
          Colors.primary[900],
          Colors.black.medium,
        ]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Cerchi animati sfondo */}
      <Animated.View
        style={[
          styles.animatedCircle,
          styles.circle1,
          {
            transform: [
              { translateX: circle1Translate },
              { translateY: circle1Translate },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.animatedCircle,
          styles.circle2,
          {
            transform: [
              { translateX: circle2Translate },
              { translateY: circle2Translate },
            ],
          },
        ]}
      />

      {/* Blur overlay per depth - con fallback Android */}
      <BlurView
        intensity={30}
        tint="dark"
        style={StyleSheet.absoluteFillObject}
      />

      {/* Contenuto centrato */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Logo App Animato */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <View style={styles.iconCircle}>
            {/* Logo app */}
            <PerfectImage
              source={require('../../assets/icons/app/app-icon.png')}
              preset="avatar"
              width={scale(90)}
              accessibilityLabel="Logo Rise Against Hunger Italia"
            />

            {/* Shimmer effect sopra */}
            <Animated.View
              style={[
                styles.shimmer,
                {
                  transform: [{ translateX: shimmerTranslate }],
                },
              ]}
            />

            {/* Ring esterno animato */}
            <Animated.View
              style={[
                styles.outerRing,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
          </View>

          {/* Activity indicator sotto il logo */}
          <ActivityIndicator
            size="small"
            color={Colors.primary[400]}
            style={styles.spinner}
          />
        </Animated.View>

        {/* Titolo */}
        <Text style={styles.title}>Aggiornamento in corso</Text>

        {/* Messaggio descrittivo */}
        <Text style={styles.message}>{displayMessage}</Text>

        {/* Barra di progresso (solo se download) */}
        {isDownloading && (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressWidth,
                  },
                ]}
              >
                <LinearGradient
                  colors={[Colors.primary[600], Colors.primary[400]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFillObject}
                />
              </Animated.View>
            </View>

            {/* Percentuale */}
            <Text style={styles.percentage}>{Math.round(progress)}%</Text>
          </View>
        )}

        {/* Sottotitolo rassicurante */}
        <Text style={styles.subtitle}>
          L&apos;app si riavvierà automaticamente tra pochi istanti
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.black.pure,
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: PerfectSpacing.lg,
    maxWidth: scale(400),
    zIndex: 10,
  },
  // Cerchi animati sfondo
  animatedCircle: {
    position: 'absolute',
    width: scale(300),
    height: scale(300),
    borderRadius: scale(150),
    opacity: 0.03,
  },
  circle1: {
    backgroundColor: Colors.primary[500],
    top: '10%',
    left: '10%',
  },
  circle2: {
    backgroundColor: Colors.primary[700],
    bottom: '10%',
    right: '10%',
    width: scale(250),
    height: scale(250),
    borderRadius: scale(125),
  },
  iconContainer: {
    marginBottom: PerfectSpacing.xl,
    alignItems: 'center',
  },
  iconCircle: {
    width: scale(140),
    height: scale(140),
    borderRadius: scale(70),
    backgroundColor: Colors.neutral[0],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary[500],
    shadowOffset: { width: 0, height: scale(12) },
    shadowOpacity: 0.5,
    shadowRadius: scale(24),
    elevation: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '200%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    transform: [{ skewX: '-20deg' }],
    zIndex: 3,
  },
  outerRing: {
    position: 'absolute',
    width: scale(140),
    height: scale(140),
    borderRadius: scale(70),
    borderWidth: scale(3),
    borderColor: Colors.primary[500],
    zIndex: 1,
  },
  spinner: {
    marginTop: PerfectSpacing.sm,
  },
  title: {
    fontSize: scaleText(24),
    fontWeight: '700',
    color: Colors.neutral[0],
    textAlign: 'center',
    marginBottom: PerfectSpacing.md,
    letterSpacing: scale(0.5),
  },
  message: {
    fontSize: scaleText(16),
    fontWeight: '500',
    color: Colors.neutral[300],
    textAlign: 'center',
    marginBottom: PerfectSpacing.xl,
    lineHeight: scaleText(24),
  },
  progressContainer: {
    width: '100%',
    marginBottom: PerfectSpacing.lg,
  },
  progressTrack: {
    height: scale(8),
    backgroundColor: Colors.black.light,
    borderRadius: scale(4),
    overflow: 'hidden',
    marginBottom: PerfectSpacing.sm,
  },
  progressBar: {
    height: '100%',
    borderRadius: scale(4),
    overflow: 'hidden',
  },
  percentage: {
    fontSize: scaleText(14),
    fontWeight: '600',
    color: Colors.primary[400],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: scaleText(13),
    fontWeight: '400',
    color: Colors.neutral[500],
    textAlign: 'center',
    lineHeight: scaleText(20),
    marginTop: PerfectSpacing.md,
  },
});
