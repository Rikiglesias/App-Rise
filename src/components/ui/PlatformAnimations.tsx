import { Platform } from 'react-native';

/**
 * Configurazioni animazioni ottimizzate per piattaforma
 */
export const PlatformAnimations = {
  // Durata animazioni
  duration: {
    ultraFast: Platform.OS === 'ios' ? 100 : 150,
    fast: Platform.OS === 'ios' ? 150 : 200,
    normal: Platform.OS === 'ios' ? 250 : 300,
    slow: Platform.OS === 'ios' ? 350 : 400,
  },

  // Configurazioni spring
  spring: {
    // iOS: configurazione esistente (più fluida)
    ios: {
      tension: 100,
      friction: 8,
    },
    // Android: più controllata per performance
    android: {
      tension: 80,
      friction: 10,
    },
    // Getter intelligente
    get current() {
      return Platform.OS === 'ios' ? this.ios : this.android;
    },
  },

  // Scale animations
  scale: {
    // iOS: può gestire animazioni più complesse
    ios: {
      pressIn: 0.95,
      pressOut: 1.0,
      bounce: 1.1,
    },
    // Android: più conservative per performance
    android: {
      pressIn: 0.97,
      pressOut: 1.0,
      bounce: 1.05,
    },
    get current() {
      return Platform.OS === 'ios' ? this.ios : this.android;
    },
  },

  // Easing ottimizzato
  easing: {
    // iOS: usa curve più complesse
    ios: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    // Android: standard Material Design
    android: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    get current() {
      return Platform.OS === 'ios' ? this.ios : this.android;
    },
  },
};

/**
 * Hook per ottenere configurazioni animate platform-aware
 */
export const usePlatformAnimations = () => {
  return {
    duration: PlatformAnimations.duration,
    spring: PlatformAnimations.spring.current,
    scale: PlatformAnimations.scale.current,
    easing: PlatformAnimations.easing.current,
  };
};

export default PlatformAnimations;
