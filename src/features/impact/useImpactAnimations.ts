import { useRef } from 'react';
import { Animated } from 'react-native';

/**
 * Hook per gestire le animazioni della schermata Impact
 * Ottimizzato per performance - animazioni semplificate
 */
export const useImpactAnimations = () => {
  const fadeAnim = useRef(new Animated.Value(1)).current; // Start visible
  const slideAnim = useRef(new Animated.Value(0)).current; // Start in position
  const scaleAnim = useRef(new Animated.Value(1)).current; // Start at full scale
  const statsAnimations = useRef([
    new Animated.Value(1), // SIMPLIFIED: Start all visible
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ] as const).current;

  // REMOVED COMPLEX ANIMATIONS FOR PERFORMANCE
  // Simply return static values for maximum performance

  return { fadeAnim, slideAnim, scaleAnim, statsAnimations };
};
