import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

// Hook per le animazioni principali del ContributeTabScreen
export const useNewActionsAnimations = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const buttonAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ] as const).current;

  useEffect(() => {
    const sequence = Animated.sequence([
      // Header animation - ULTRA VELOCE
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300, // ULTRA RIDOTTO per massima reattività
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 150, // MASSIMO per velocità istantanea
          friction: 12, // BILANCIATO per stabilità
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 180, // MASSIMO per velocità istantanea
          friction: 12, // BILANCIATO per stabilità
        }),
      ]),
      // Buttons animations staggered - ISTANTANEI
      Animated.delay(50), // MINIMO per apparizione quasi istantanea
      Animated.stagger(
        30, // MINIMO per stagger rapidissimo
        buttonAnimations.map(anim =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 200, // ULTRA RIDOTTO per reattività massima
            useNativeDriver: true,
          })
        )
      ),
    ]);

    sequence.start();

    return () => {
      sequence.stop();
    };
  }, [fadeAnim, slideAnim, scaleAnim, buttonAnimations]);

  return { fadeAnim, slideAnim, scaleAnim, buttonAnimations };
};
