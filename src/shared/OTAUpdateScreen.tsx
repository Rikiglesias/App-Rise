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

  // Pulse animation per icona
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

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

  return (
    <View style={styles.container}>
      {/* Sfondo gradient premium */}
      <LinearGradient
        colors={[Colors.black.pure, Colors.black.medium, Colors.primary[900]]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Blur overlay per depth */}
      <BlurView intensity={20} style={StyleSheet.absoluteFillObject} />

      {/* Contenuto centrato */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Logo / Icona animata */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <View style={styles.iconCircle}>
            <ActivityIndicator
              size="large"
              color={Colors.primary[500]}
              style={styles.spinner}
            />
          </View>
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
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: PerfectSpacing.lg,
    maxWidth: scale(400),
  },
  iconContainer: {
    marginBottom: PerfectSpacing.xl,
  },
  iconCircle: {
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    backgroundColor: Colors.black.medium,
    borderWidth: scale(2),
    borderColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary[500],
    shadowOffset: { width: 0, height: scale(8) },
    shadowOpacity: 0.4,
    shadowRadius: scale(20),
    elevation: 10,
  },
  spinner: {
    transform: [{ scale: 1.5 }],
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
