import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

import type { ChiSiamoAnimations } from '../types';

export const useChiSiamoAnimations = (): ChiSiamoAnimations => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const contactAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0), // Solo 3 contatti ora
  ] as const).current;

  useEffect(() => {
    const sequence = Animated.sequence([
      // Header animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 60,
          friction: 8,
        }),
      ]),
      // Contact animations staggered
      Animated.delay(300),
      Animated.stagger(
        200,
        contactAnimations.map(anim =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          })
        )
      ),
    ]);

    sequence.start();

    return () => {
      sequence.stop();
    };
  }, [fadeAnim, slideAnim, scaleAnim, contactAnimations]);

  return { fadeAnim, slideAnim, scaleAnim, contactAnimations };
};
