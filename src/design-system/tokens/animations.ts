// ===================================================================
// 🎨 DESIGN TOKENS - ANIMATIONS
// ===================================================================

import { Animations as BaseAnimations } from '../../shared/constants';

/**
 * Design Animations - Sistema animazioni centralizzato
 * Animazioni ottimizzate per performance con useNativeDriver
 */
export const DesignAnimations = {
  // Durate
  duration: {
    instant: 0,
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
  },

  // Easing curves
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Animazioni predefinite
  presets: {
    fadeIn: {
      opacity: {
        from: 0,
        to: 1,
      },
      duration: 250,
      useNativeDriver: true,
    },
    fadeOut: {
      opacity: {
        from: 1,
        to: 0,
      },
      duration: 250,
      useNativeDriver: true,
    },
    slideUp: {
      transform: {
        translateY: {
          from: 50,
          to: 0,
        },
      },
      duration: 300,
      useNativeDriver: true,
    },
    slideDown: {
      transform: {
        translateY: {
          from: -50,
          to: 0,
        },
      },
      duration: 300,
      useNativeDriver: true,
    },
    scale: {
      transform: {
        scale: {
          from: 0.9,
          to: 1,
        },
      },
      duration: 200,
      useNativeDriver: true,
    },
  },

  // Animazioni componenti
  component: {
    button: {
      press: {
        scale: 0.95,
        duration: 100,
        useNativeDriver: true,
      },
      release: {
        scale: 1,
        duration: 100,
        useNativeDriver: true,
      },
    },
    modal: {
      enter: {
        opacity: { from: 0, to: 1 },
        scale: { from: 0.9, to: 1 },
        duration: 300,
        useNativeDriver: true,
      },
      exit: {
        opacity: { from: 1, to: 0 },
        scale: { from: 1, to: 0.9 },
        duration: 200,
        useNativeDriver: true,
      },
    },
    tab: {
      switch: {
        duration: 250,
        useNativeDriver: true,
      },
    },
  },
};

// Compatibilità con sistema esistente
export const Animations = {
  ...BaseAnimations,
  ...DesignAnimations,
};

export default DesignAnimations;
