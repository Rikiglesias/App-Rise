/**
 * OTA Update Screen - Best Practices 2024
 * Rise Against Hunger Italia
 *
 * Design: Minimal, moderno, non invasivo
 * Ispirato a: iOS/Android native update screens
 * Best practices: Progress sempre visibile, messaging chiaro, no heavy animations
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { getLocales } from 'expo-localization';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
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

// Traduzioni localizzate
const translations = {
  it: {
    message: 'Stiamo aggiornando l\'app',
    subMessage: 'Grazie della pazienza, ci vorranno solo pochi secondi',
    complete: 'Aggiornamento completato!',
  },
  en: {
    message: 'Updating the app',
    subMessage: 'Thank you for your patience, just a few seconds',
    complete: 'Update complete!',
  },
};

export const OTAUpdateScreen: React.FC<OTAUpdateScreenProps> = ({
  progress = 0,
}) => {
  // Rileva lingua dispositivo con fallback sicuro
  const deviceLanguage = React.useMemo(() => {
    try {
      return getLocales()[0]?.languageCode || 'en';
    } catch (_e) {
      return 'en';
    }
  }, []);
  
  const isItalian = deviceLanguage === 'it';
  const t = isItalian ? translations.it : translations.en;
  
  // Safe progress clamping
  const safeProgress = React.useMemo(() => {
    const val = Number(progress) || 0;
    return Math.min(Math.max(val, 0), 100);
  }, [progress]);

  // Animazioni elite
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const logoScaleAnim = useRef(new Animated.Value(1)).current;
  const logoBreathAnim = useRef(new Animated.Value(1)).current;
  const completeFadeAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const [displayProgress, setDisplayProgress] = useState(0);

  // Fade in iniziale + logo bounce
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, logoScaleAnim]);

  // Shimmer continuo sulla progress bar
  useEffect(() => {
    if (safeProgress > 0 && safeProgress < 100) {
      shimmerAnim.setValue(0);
      const shimmer = Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      shimmer.start();
      return () => shimmer.stop();
    }
    return undefined;
  }, [safeProgress, shimmerAnim]);

  // Glow pulsante sul checkmark completamento
  useEffect(() => {
    if (safeProgress >= 100) {
      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      glow.start();
      return () => glow.stop();
    }
    return undefined;
  }, [safeProgress, glowAnim]);

  // Breathing animation sul logo durante download
  useEffect(() => {
    if (safeProgress > 0 && safeProgress < 100) {
      const breathe = Animated.loop(
        Animated.sequence([
          Animated.timing(logoBreathAnim, {
            toValue: 1.03,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(logoBreathAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      breathe.start();
      return () => breathe.stop();
    }
    return undefined;
  }, [safeProgress, logoBreathAnim]);

  // Pulse subtile per percentuale + effetto completamento
  useEffect(() => {
    if (safeProgress > 0 && safeProgress < 100) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 150,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 150,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }

    // Animazione completamento
    if (safeProgress >= 100) {
      Animated.parallel([
        Animated.spring(pulseAnim, {
          toValue: 1.15,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(completeFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [safeProgress, pulseAnim, completeFadeAnim]);

  // Animazione progresso ultra-smooth + counter animato
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: safeProgress,
      duration: 400,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Cubic bezier premium
      useNativeDriver: false,
    }).start();

    // Counter animato per percentuale
    const start = displayProgress;
    const end = Math.round(safeProgress);
    const duration = 300;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = Easing.out(Easing.ease)(progress);
      const current = Math.round(start + (end - start) * eased);
      
      setDisplayProgress(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    if (start !== end) {
      animate();
    }
  }, [safeProgress, progressAnim, displayProgress]);

  // Calcola larghezza barra
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  // Anello di progresso circolare attorno al logo
  const CIRCLE_SIZE = scale(130);
  const RING_SIZE = scale(146);
  const RING_STROKE = scale(6);
  const RADIUS = (RING_SIZE - RING_STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);
  const ringDashoffset = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [CIRCUMFERENCE, 0],
  });

  const isComplete = safeProgress >= 100;

  return (
    <View style={styles.container}>
      {/* Gradient background premium - più ricco */}
      <LinearGradient
        colors={['#FAFAFA', '#F5F5F7', '#EEEFF1', '#F8F9FA']}
        locations={[0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Contenuto centrato */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Logo App con animazioni multiple */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [
                { scale: logoScaleAnim },
                { scale: logoBreathAnim },
              ],
            },
          ]}
        >
          {/* Anello circolare progressivo */}
          <View
            style={{
              position: 'absolute',
              width: RING_SIZE,
              height: RING_SIZE,
              top: -(RING_SIZE - CIRCLE_SIZE) / 2,
              left: -(RING_SIZE - CIRCLE_SIZE) / 2,
              justifyContent: 'center',
              alignItems: 'center',
              pointerEvents: 'none',
              transform: [{ rotate: '-90deg' }], // Inizia dall'alto
            }}
          >
            <Svg width={RING_SIZE} height={RING_SIZE}>
              <Circle
                stroke={Colors.neutral[200]}
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                strokeWidth={RING_STROKE}
                fill="none"
              />
              <AnimatedCircle
                stroke={Colors.primary[500]}
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                strokeWidth={RING_STROKE}
                strokeLinecap="round"
                strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                strokeDashoffset={ringDashoffset}
                fill="none"
              />
            </Svg>
          </View>
          <View style={styles.logoCircle}>
            <PerfectImage
              source={require('../../assets/icons/app/app-icon.png')}
              width={126}
              aspectRatio={1}
              borderRadius={63}
              shadow={false}
              accessibilityLabel="Logo Rise Against Hunger Italia"
            />
          </View>
        </Animated.View>

        {/* Messaggio principale - Hero */}
        {!isComplete ? (
          <View style={styles.messageContainer}>
            <Text style={styles.mainMessage}>{t.message}</Text>
            <Text style={styles.subMessage}>{t.subMessage}</Text>
          </View>
        ) : (
          <Animated.View
            style={[
              styles.completeContainer,
              { opacity: completeFadeAnim },
            ]}
          >
            <Animated.View
              style={[
                styles.completeCheckmark,
                {
                  transform: [
                    {
                      scale: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.checkmark}>✓</Text>
            </Animated.View>
            <Text style={styles.completeMessage}>{t.complete}</Text>
          </Animated.View>
        )}

        {/* Progress bar compatta con percentuale inline */}
        {!isComplete && (
          <View style={styles.progressContainer}>
            {/* Barra */}
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressWidth,
                  },
                ]}
              >
                <LinearGradient
                  colors={[Colors.primary[400], Colors.primary[500], Colors.primary[600]]}
                  locations={[0, 0.5, 1]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFillObject}
                />
                {/* Shimmer overlay */}
                <Animated.View
                  style={[
                    styles.shimmerOverlay,
                    {
                      opacity: shimmerAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.3, 0.6, 0.3],
                      }),
                      transform: [
                        {
                          translateX: shimmerAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-100, 300],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              </Animated.View>
            </View>
            {/* Percentuale piccola sotto */}
            <Animated.Text
              style={[
                styles.percentage,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              {displayProgress}%
            </Animated.Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: PerfectSpacing.xl * 2,
    maxWidth: scale(440),
    width: '100%',
  },
  // Logo premium - hero element
  logoContainer: {
    marginBottom: PerfectSpacing.xl * 2,
  },
  logoCircle: {
    width: scale(130),
    height: scale(130),
    borderRadius: scale(65),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary[500],
    shadowOffset: { width: 0, height: scale(8) },
    shadowOpacity: 0.15,
    shadowRadius: scale(20),
    elevation: 12,
    borderWidth: scale(1),
    borderColor: Colors.neutral[100],
  },
  // Container messaggio principale
  messageContainer: {
    alignItems: 'center',
    marginBottom: PerfectSpacing.xl * 1.8,
    paddingHorizontal: PerfectSpacing.xl,
  },
  // Messaggio principale GRANDE
  mainMessage: {
    fontSize: scaleText(24),
    fontWeight: '700',
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: PerfectSpacing.sm,
    letterSpacing: scale(-0.5),
  },
  // Sotto-messaggio rassicurante
  subMessage: {
    fontSize: scaleText(15),
    fontWeight: '400',
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: scaleText(22),
    letterSpacing: scale(-0.1),
  },
  // Progress container compatto
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  // Percentuale sotto barra - leggibile
  percentage: {
    fontSize: scaleText(18),
    fontWeight: '700',
    color: Colors.primary[500],
    textAlign: 'center',
    marginTop: PerfectSpacing.sm,
    letterSpacing: scale(-0.4),
  },
  progressTrack: {
    width: '85%',
    height: scale(8),
    backgroundColor: Colors.neutral[100],
    borderRadius: scale(4),
    overflow: 'hidden',
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.08,
    shadowRadius: scale(3),
    borderWidth: scale(0.5),
    borderColor: Colors.neutral[200],
  },
  progressFill: {
    height: '100%',
    borderRadius: scale(4),
    shadowColor: Colors.primary[500],
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.3,
    shadowRadius: scale(4),
    overflow: 'hidden',
  },
  // Shimmer overlay animato
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    width: scale(100),
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{ skewX: '-20deg' }],
  },
  // Container completamento
  completeContainer: {
    alignItems: 'center',
  },
  // Messaggio completamento
  completeMessage: {
    fontSize: scaleText(22),
    fontWeight: '700',
    color: Colors.semantic.success.main,
    textAlign: 'center',
    marginTop: PerfectSpacing.md,
    letterSpacing: scale(-0.4),
  },
  // Checkmark completamento
  completeCheckmark: {
    alignItems: 'center',
    width: scale(70),
    height: scale(70),
    borderRadius: scale(35),
    backgroundColor: Colors.semantic.success.light,
    justifyContent: 'center',
    shadowColor: Colors.semantic.success.main,
    shadowOffset: { width: 0, height: scale(8) },
    shadowOpacity: 0.35,
    shadowRadius: scale(16),
    borderWidth: scale(2.5),
    borderColor: Colors.semantic.success.main,
    marginBottom: PerfectSpacing.sm,
  },
  checkmark: {
    fontSize: scaleText(38),
    fontWeight: '700',
    color: Colors.semantic.success.main,
    textAlign: 'center',
  },
});
