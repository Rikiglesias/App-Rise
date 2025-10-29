/**
 * PERFECT ANIMATIONS - Animation Helpers Scalati
 *
 * GARANTISCE:
 * - Distanze animazioni scalano proporzionalmente
 * - Durate standardizzate (non scalano - percezione tempo uguale)
 * - Preset comuni per consistenza
 */

import { scale } from './responsiveSystem';

/**
 * DURATE STANDARDIZZATE (NON scalano - OK!)
 * Percezione del tempo è uguale su tutti device
 */
export const AnimationDurations = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 800,
} as const;

/**
 * EASING CURVES
 * Standard Material Design
 */
export const AnimationEasings = {
  standard: [0.4, 0.0, 0.2, 1] as const,
  decelerate: [0.0, 0.0, 0.2, 1] as const,
  accelerate: [0.4, 0.0, 1, 1] as const,
  sharp: [0.4, 0.0, 0.6, 1] as const,
} as const;

/**
 * DISTANZE SCALATE (riferimento iPhone 15)
 * Questi valori DEVONO scalare per sembrare identici
 */
export const AnimationDistances = {
  small: (value = 20) => scale(value),
  medium: (value = 50) => scale(value),
  large: (value = 100) => scale(value),
  xlarge: (value = 200) => scale(value),
} as const;

/**
 * Helper per translateY scalato
 * @param distance - Distanza riferimento iPhone 15
 * @returns Distanza scalata per device corrente
 */
export const perfectTranslateY = (distance: number): number => {
  return scale(distance);
};

/**
 * Helper per translateX scalato
 * @param distance - Distanza riferimento iPhone 15
 * @returns Distanza scalata per device corrente
 */
export const perfectTranslateX = (distance: number): number => {
  return scale(distance);
};

/**
 * PRESET ANIMAZIONI COMUNI
 */
export const PerfectAnimationPresets = {
  /**
   * Slide Up (dal basso verso alto)
   */
  slideUp: (distance = 50) => ({
    from: {
      translateY: perfectTranslateY(distance),
      opacity: 0,
    },
    to: {
      translateY: 0,
      opacity: 1,
    },
    duration: AnimationDurations.normal,
  }),

  /**
   * Slide Down (dall'alto verso basso)
   */
  slideDown: (distance = 50) => ({
    from: {
      translateY: -perfectTranslateY(distance),
      opacity: 0,
    },
    to: {
      translateY: 0,
      opacity: 1,
    },
    duration: AnimationDurations.normal,
  }),

  /**
   * Slide Left (da destra verso sinistra)
   */
  slideLeft: (distance = 50) => ({
    from: {
      translateX: perfectTranslateX(distance),
      opacity: 0,
    },
    to: {
      translateX: 0,
      opacity: 1,
    },
    duration: AnimationDurations.normal,
  }),

  /**
   * Slide Right (da sinistra verso destra)
   */
  slideRight: (distance = 50) => ({
    from: {
      translateX: -perfectTranslateX(distance),
      opacity: 0,
    },
    to: {
      translateX: 0,
      opacity: 1,
    },
    duration: AnimationDurations.normal,
  }),

  /**
   * Fade In semplice
   */
  fadeIn: () => ({
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: AnimationDurations.fast,
  }),

  /**
   * Fade Out semplice
   */
  fadeOut: () => ({
    from: { opacity: 1 },
    to: { opacity: 0 },
    duration: AnimationDurations.fast,
  }),

  /**
   * Scale In (crescita da piccolo)
   */
  scaleIn: () => ({
    from: {
      scale: 0.8,
      opacity: 0,
    },
    to: {
      scale: 1,
      opacity: 1,
    },
    duration: AnimationDurations.normal,
  }),

  /**
   * Scale Out (riduzione a piccolo)
   */
  scaleOut: () => ({
    from: {
      scale: 1,
      opacity: 1,
    },
    to: {
      scale: 0.8,
      opacity: 0,
    },
    duration: AnimationDurations.fast,
  }),
} as const;

/**
 * Helper per creare animazioni custom con distanze scalate
 */
export const createPerfectAnimation = (config: {
  fromY?: number;
  fromX?: number;
  toY?: number;
  toX?: number;
  fromOpacity?: number;
  toOpacity?: number;
  duration?: number;
}) => ({
  from: {
    ...(config.fromY !== undefined && {
      translateY: perfectTranslateY(config.fromY),
    }),
    ...(config.fromX !== undefined && {
      translateX: perfectTranslateX(config.fromX),
    }),
    ...(config.fromOpacity !== undefined && { opacity: config.fromOpacity }),
  },
  to: {
    ...(config.toY !== undefined && {
      translateY: perfectTranslateY(config.toY),
    }),
    ...(config.toX !== undefined && {
      translateX: perfectTranslateX(config.toX),
    }),
    ...(config.toOpacity !== undefined && { opacity: config.toOpacity }),
  },
  duration: config.duration ?? AnimationDurations.normal,
});
