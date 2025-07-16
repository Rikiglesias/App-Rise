/**
 * 🚀 MICRO-INTERACTION ENGINE 2025 - SIMPLIFIED
 * Sistema semplificato di microinterazioni per esperienza utente premium
 */

import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';

import { logWarn } from '../shared/utils/logger';

// ===================================================================
// TIPI E CONFIGURAZIONI
// ===================================================================

export type MicroInteractionType =
  | 'tap'
  | 'hover'
  | 'success'
  | 'error'
  | 'press';

export type FeedbackIntensity = 'light' | 'medium' | 'heavy';

export interface MicroInteractionConfig {
  type: MicroInteractionType;
  duration?: number;
  delay?: number;
  scale?: [number, number];
  translate?: { x?: [number, number]; y?: [number, number] };
  opacity?: [number, number];
  haptic?: {
    enabled: boolean;
    intensity: FeedbackIntensity;
  };
  useNativeDriver?: boolean;
}

// ===================================================================
// PRESET CONFIGURAZIONI
// ===================================================================

export const MicroInteractionPresets: Record<string, MicroInteractionConfig> = {
  buttonTap: {
    type: 'tap',
    scale: [1, 0.95],
    duration: 100,
    haptic: { enabled: true, intensity: 'medium' },
    useNativeDriver: true,
  },

  cardHover: {
    type: 'hover',
    scale: [1, 1.02],
    translate: { y: [0, -2] },
    duration: 200,
    haptic: { enabled: true, intensity: 'light' },
    useNativeDriver: true,
  },

  successPulse: {
    type: 'success',
    scale: [1, 1.1],
    duration: 300,
    haptic: { enabled: true, intensity: 'heavy' },
    useNativeDriver: true,
  },

  errorShake: {
    type: 'error',
    translate: { x: [-5, 5] },
    duration: 400,
    haptic: { enabled: true, intensity: 'heavy' },
    useNativeDriver: true,
  },

  premiumGlow: {
    type: 'hover',
    scale: [1, 1.03],
    opacity: [1, 0.9],
    duration: 350,
    haptic: { enabled: true, intensity: 'medium' },
    useNativeDriver: true,
  },
};

// ===================================================================
// HAPTIC FEEDBACK ENGINE
// ===================================================================

export class HapticEngine {
  private static isEnabled = true;

  static async triggerFeedback(intensity: FeedbackIntensity): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const hapticType = this.getHapticType(intensity);
      await Haptics.impactAsync(hapticType);
    } catch (error) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        logWarn('HapticEngine', 'Feedback failed', error);
      }
    }
  }

  private static getHapticType(
    intensity: FeedbackIntensity
  ): Haptics.ImpactFeedbackStyle {
    switch (intensity) {
      case 'light':
        return Haptics.ImpactFeedbackStyle.Light;
      case 'medium':
        return Haptics.ImpactFeedbackStyle.Medium;
      case 'heavy':
        return Haptics.ImpactFeedbackStyle.Heavy;
      default:
        return Haptics.ImpactFeedbackStyle.Medium;
    }
  }

  static setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
}

// ===================================================================
// MICRO-INTERACTION HOOK
// ===================================================================

export const useMicroInteraction = (
  config: MicroInteractionConfig | string
) => {
  const resolvedConfig =
    typeof config === 'string' ? MicroInteractionPresets[config] : config;

  if (!resolvedConfig) {
    throw new Error(`MicroInteraction preset "${config}" not found`);
  }

  // Animation values
  const scaleValue = useRef(
    new Animated.Value(resolvedConfig.scale?.[0] ?? 1)
  ).current;
  const translateXValue = useRef(
    new Animated.Value(resolvedConfig.translate?.x?.[0] ?? 0)
  ).current;
  const translateYValue = useRef(
    new Animated.Value(resolvedConfig.translate?.y?.[0] ?? 0)
  ).current;
  const opacityValue = useRef(
    new Animated.Value(resolvedConfig.opacity?.[0] ?? 1)
  ).current;

  // State
  const [isAnimating, setIsAnimating] = useState(false);
  const currentAnimation = useRef<Animated.CompositeAnimation | null>(null);

  // Execute animation
  const executeAnimation = useCallback(
    async (direction: 'forward' | 'reverse' = 'forward') => {
      if (isAnimating) return;

      if (currentAnimation.current) {
        currentAnimation.current.stop();
      }

      setIsAnimating(true);

      // Trigger haptic feedback
      if (resolvedConfig.haptic?.enabled) {
        await HapticEngine.triggerFeedback(resolvedConfig.haptic.intensity);
      }

      const animations: Animated.CompositeAnimation[] = [];

      // Scale animation
      if (resolvedConfig.scale) {
        const targetValue =
          direction === 'forward'
            ? resolvedConfig.scale[1]
            : resolvedConfig.scale[0];

        animations.push(
          Animated.timing(scaleValue, {
            toValue: targetValue,
            duration: resolvedConfig.duration ?? 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: resolvedConfig.useNativeDriver ?? true,
          })
        );
      }

      // Translate X animation
      if (resolvedConfig.translate?.x) {
        const targetValue =
          direction === 'forward'
            ? resolvedConfig.translate.x[1]
            : resolvedConfig.translate.x[0];

        animations.push(
          Animated.timing(translateXValue, {
            toValue: targetValue,
            duration: resolvedConfig.duration ?? 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: resolvedConfig.useNativeDriver ?? true,
          })
        );
      }

      // Translate Y animation
      if (resolvedConfig.translate?.y) {
        const targetValue =
          direction === 'forward'
            ? resolvedConfig.translate.y[1]
            : resolvedConfig.translate.y[0];

        animations.push(
          Animated.timing(translateYValue, {
            toValue: targetValue,
            duration: resolvedConfig.duration ?? 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: resolvedConfig.useNativeDriver ?? true,
          })
        );
      }

      // Opacity animation
      if (resolvedConfig.opacity) {
        const targetValue =
          direction === 'forward'
            ? resolvedConfig.opacity[1]
            : resolvedConfig.opacity[0];

        animations.push(
          Animated.timing(opacityValue, {
            toValue: targetValue,
            duration: resolvedConfig.duration ?? 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: resolvedConfig.useNativeDriver ?? true,
          })
        );
      }

      // Execute animation
      if (animations.length > 0) {
        const compositeAnimation = Animated.parallel(animations);
        currentAnimation.current = compositeAnimation;

        return new Promise<void>(resolve => {
          compositeAnimation.start(() => {
            setIsAnimating(false);
            currentAnimation.current = null;
            resolve();
          });
        });
      }
    },
    [
      resolvedConfig,
      isAnimating,
      scaleValue,
      translateXValue,
      translateYValue,
      opacityValue,
    ]
  );

  // Convenience methods
  const trigger = useCallback(
    () => executeAnimation('forward'),
    [executeAnimation]
  );
  const reverse = useCallback(
    () => executeAnimation('reverse'),
    [executeAnimation]
  );

  const reset = useCallback(() => {
    if (currentAnimation.current) {
      currentAnimation.current.stop();
    }

    scaleValue.setValue(resolvedConfig.scale?.[0] ?? 1);
    translateXValue.setValue(resolvedConfig.translate?.x?.[0] ?? 0);
    translateYValue.setValue(resolvedConfig.translate?.y?.[0] ?? 0);
    opacityValue.setValue(resolvedConfig.opacity?.[0] ?? 1);

    setIsAnimating(false);
  }, [
    resolvedConfig,
    scaleValue,
    translateXValue,
    translateYValue,
    opacityValue,
  ]);

  // Generate animated style
  const animatedStyle = {
    transform: [
      { scale: scaleValue },
      { translateX: translateXValue },
      { translateY: translateYValue },
    ],
    opacity: opacityValue,
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentAnimation.current) {
        currentAnimation.current.stop();
      }
    };
  }, []);

  return {
    isAnimating,
    trigger,
    reverse,
    reset,
    executeAnimation,
    animatedStyle,
    values: {
      scale: scaleValue,
      translateX: translateXValue,
      translateY: translateYValue,
      opacity: opacityValue,
    },
  };
};

// ===================================================================
// EXPORT PRINCIPALI
// ===================================================================

export default {
  useMicroInteraction,
  HapticEngine,
  MicroInteractionPresets,
};
