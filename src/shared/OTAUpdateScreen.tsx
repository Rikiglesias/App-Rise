/**
 * OTA Update Screen - Best Practices 2024
 * Rise Against Hunger Italia
 *
 * Design: Minimal, moderno, non invasivo
 * Ispirato a: iOS/Android native update screens
 * Best practices: Progress sempre visibile, messaging chiaro, no heavy animations
 */

import React, { useMemo } from 'react';
import { View, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import i18n from '@/locales';
import { PerfectContainer } from '@/components/ui/PerfectContainer';
import { PerfectText } from '@/components/ui/PerfectText';
import { useUniversalTheme } from '@/shared/theme/UniversalTheme';
import { PerfectImage } from '@/components/ui/PerfectImage';
import { Colors } from '@/shared/constants/designTokens';
import { scale } from '@/shared/constants/perfectScale';
import { scaleText } from '@/shared/utils/textScale';
import { PerfectSpacing } from '@/shared/constants/perfectSpacing';
import { useOtaAnimations } from '@/shared/useOtaAnimations';
import { useAdaptiveColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

interface OTAUpdateScreenProps {
  isChecking: boolean;
  isDownloading: boolean;
  progress?: number; // 0-100
  message?: string;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const OTAUpdateScreen: React.FC<OTAUpdateScreenProps> = ({
  progress = 0,
}) => {
  const { isDark } = useUniversalTheme();
  const colors = useAdaptiveColors(isDark);
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Safe progress clamping
  const safeProgress = React.useMemo(() => {
    const val = Number.isFinite(progress) ? progress : 0;
    return Math.min(Math.max(val, 0), 100);
  }, [progress]);

  const displayProgress = Math.round(safeProgress);
  const isIndeterminate = displayProgress <= 0;
  const {
    progressAnim,
    fadeAnim,
    pulseAnim,
    logoScaleAnim,
    logoBreathAnim,
    completeFadeAnim,
    shimmerAnim,
    glowAnim,
  } = useOtaAnimations(safeProgress);

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
  const ringDashoffset = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [CIRCUMFERENCE, 0],
  });

  const isComplete = safeProgress >= 100;

  // Gradient sfondo: hex custom INVARIATI in LIGHT (byte-identico, zero
  // regressione), scala neutral scura in DARK. Ramo condizionale perché gli hex
  // custom non hanno mapping 1:1 sui token neutral.
  const bgGradient = (
    isDark
      ? ['#0C0C0E', '#161618', '#1F1F22', '#0C0C0E']
      : ['#FAFAFA', '#F5F5F7', '#EEEFF1', '#F8F9FA']
  ) as readonly [string, string, ...string[]];

  return (
    <PerfectContainer preset="page" padding={0} style={styles.container}>
      {/* Gradient background premium - più ricco */}
      <LinearGradient
        colors={bgGradient}
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
              transform: [{ scale: logoScaleAnim }, { scale: logoBreathAnim }],
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
                stroke={colors.neutral[200]}
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
              accessibilityLabel={i18n.t('updates.logo')}
            />
          </View>
        </Animated.View>

        {/* Messaggio principale - Hero */}
        {!isComplete ? (
          <View style={styles.messageContainer}>
            <PerfectText
              size={24}
              lines={2}
              containerWidth={0}
              immunity
              style={styles.mainMessage}
            >
              {i18n.t('updates.message')}
            </PerfectText>
            <PerfectText
              size={15}
              lines={3}
              containerWidth={0}
              immunity
              style={styles.subMessage}
            >
              {i18n.t('updates.subMessage')}
            </PerfectText>
          </View>
        ) : (
          <Animated.View
            style={[styles.completeContainer, { opacity: completeFadeAnim }]}
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
              <PerfectText
                size={38}
                lines={1}
                immunity
                style={styles.checkmark}
                accessible={false}
              >
                ✓
              </PerfectText>
            </Animated.View>
            <PerfectText
              size={22}
              lines={2}
              containerWidth={0}
              immunity
              style={styles.completeMessage}
            >
              {i18n.t('updates.complete')}
            </PerfectText>
          </Animated.View>
        )}

        {/* Progress bar compatta con percentuale inline */}
        {!isComplete && (
          <View
            style={styles.progressContainer}
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={i18n.t('updates.progressLabel')}
            accessibilityValue={
              isIndeterminate
                ? { text: i18n.t('updates.downloading') }
                : { min: 0, max: 100, now: displayProgress }
            }
          >
            {isIndeterminate ? (
              <ActivityIndicator
                size="large"
                color={Colors.primary[500]}
                accessibilityLabel={i18n.t('updates.downloading')}
              />
            ) : (
              <>
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
                      colors={[
                        Colors.primary[400],
                        Colors.primary[500],
                        Colors.primary[600],
                      ]}
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
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <PerfectText
                    size={18}
                    lines={1}
                    immunity
                    style={styles.percentage}
                  >
                    {i18n.t('updates.progressPercent', {
                      progress: displayProgress,
                    })}
                  </PerfectText>
                </Animated.View>
              </>
            )}
          </View>
        )}
      </Animated.View>
    </PerfectContainer>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.neutral[0],
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
      backgroundColor: colors.neutral[0],
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: Colors.primary[500],
      shadowOffset: { width: 0, height: scale(8) },
      shadowOpacity: 0.15,
      shadowRadius: scale(20),
      elevation: 12,
      borderWidth: scale(1),
      borderColor: colors.neutral[100],
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
      color: colors.neutral[900],
      textAlign: 'center',
      marginBottom: PerfectSpacing.sm,
      letterSpacing: scale(-0.5),
    },
    // Sotto-messaggio rassicurante
    subMessage: {
      fontSize: scaleText(15),
      fontWeight: '400',
      color: colors.neutral[600],
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
      backgroundColor: colors.neutral[100],
      borderRadius: scale(4),
      overflow: 'hidden',
      shadowColor: Colors.neutral[900],
      shadowOffset: { width: 0, height: scale(2) },
      shadowOpacity: 0.08,
      shadowRadius: scale(3),
      borderWidth: scale(0.5),
      borderColor: colors.neutral[200],
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
      color: colors.semantic.success.text,
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
      color: Colors.semantic.success.text,
      textAlign: 'center',
    },
  });
