/**
 * Animazioni della schermata di aggiornamento OTA (`OTAUpdateScreen`).
 *
 * Con «Riduci animazioni» (C46 del contratto android-play) ogni valore va subito allo
 * stato finale: niente cicli (luccichio, respiro del logo, bagliore), niente molle,
 * durate a 0. La barra e l'anello seguono comunque il progresso, che è informazione.
 */
import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

import {
  motionDuration,
  useReduceMotion,
} from '@/shared/hooks/useReduceMotion';

/** Battito del logo a ogni avanzamento; al completamento ingrandisce e mostra la spunta. */
const progressPulse = (
  pulseAnim: Animated.Value,
  completeFadeAnim: Animated.Value,
  complete: boolean,
  reduceMotion: boolean
): Animated.CompositeAnimation => {
  if (complete) {
    const fadeIn = Animated.timing(completeFadeAnim, {
      toValue: 1,
      duration: motionDuration(400, reduceMotion),
      useNativeDriver: true,
    });
    // Senza animazioni la forma finale arriva subito, senza molla.
    const grow = reduceMotion
      ? Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 0,
          useNativeDriver: true,
        })
      : Animated.spring(pulseAnim, {
          toValue: 1.15,
          friction: 6,
          useNativeDriver: true,
        });
    return Animated.parallel([grow, fadeIn]);
  }
  return Animated.sequence([
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
  ]);
};

export const useOtaAnimations = (safeProgress: number) => {
  const reduceMotion = useReduceMotion();
  // Animazioni elite
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const logoScaleAnim = useRef(new Animated.Value(1)).current;
  const logoBreathAnim = useRef(new Animated.Value(1)).current;
  const completeFadeAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Fade in iniziale + logo bounce
  useEffect(() => {
    const fadeIn = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: motionDuration(500, reduceMotion),
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    });
    const animation = reduceMotion
      ? fadeIn
      : Animated.parallel([
          fadeIn,
          Animated.spring(logoScaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]);
    animation.start();
    return () => animation.stop();
  }, [fadeAnim, logoScaleAnim, reduceMotion]);

  // Shimmer continuo sulla progress bar
  useEffect(() => {
    if (!reduceMotion && safeProgress > 0 && safeProgress < 100) {
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
  }, [safeProgress, shimmerAnim, reduceMotion]);

  // Glow pulsante sul checkmark completamento
  useEffect(() => {
    if (!reduceMotion && safeProgress >= 100) {
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
  }, [safeProgress, glowAnim, reduceMotion]);

  // Breathing animation sul logo durante download
  useEffect(() => {
    if (!reduceMotion && safeProgress > 0 && safeProgress < 100) {
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
  }, [safeProgress, logoBreathAnim, reduceMotion]);

  useEffect(() => {
    if (safeProgress <= 0) return undefined;
    // Senza animazioni il battito durante il download sparisce.
    if (reduceMotion && safeProgress < 100) return undefined;
    const animation = progressPulse(
      pulseAnim,
      completeFadeAnim,
      safeProgress >= 100,
      reduceMotion
    );
    animation.start();
    return () => animation.stop();
  }, [safeProgress, pulseAnim, completeFadeAnim, reduceMotion]);

  // Solo la barra interpola: il testo mostra subito il progresso nativo.
  useEffect(() => {
    const animation = Animated.timing(progressAnim, {
      toValue: safeProgress,
      duration: motionDuration(400, reduceMotion),
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [safeProgress, progressAnim, reduceMotion]);

  return {
    progressAnim,
    fadeAnim,
    pulseAnim,
    logoScaleAnim,
    logoBreathAnim,
    completeFadeAnim,
    shimmerAnim,
    glowAnim,
  };
};
