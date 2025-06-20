import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export const useImpactAnimations = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const statsAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
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
      // Stats animations staggered
      Animated.delay(300),
      Animated.stagger(
        150,
        statsAnimations.map(anim =>
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
  }, [fadeAnim, slideAnim, scaleAnim, statsAnimations]);

  return { fadeAnim, slideAnim, scaleAnim, statsAnimations };
};
