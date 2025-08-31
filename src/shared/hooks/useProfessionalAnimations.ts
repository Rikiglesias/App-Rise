import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export const useProfessionalAnimations = () => {
  const headerFade = useRef(new Animated.Value(0)).current;
  const contentReveal = useRef(new Animated.Value(0)).current;
  const sectionsStagger = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  // Nuova animazione per le statistiche dell'header
  const statsAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Clean professional animation sequence
    void Animated.sequence([
      // Header fade in
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Content reveal
      Animated.timing(contentReveal, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Sections stagger
      Animated.stagger(150, [
        ...sectionsStagger.map(anim =>
          Animated.spring(anim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
          })
        ),
      ]),
    ]).start();

    // Animazione continua di pulsazione per le statistiche
    const startStatsAnimation = () => {
      void Animated.sequence([
        Animated.timing(statsAnimation, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(statsAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => startStatsAnimation());
    };

    setTimeout(startStatsAnimation, 1500);
  }, [contentReveal, headerFade, sectionsStagger, statsAnimation]);

  return {
    headerFade,
    contentReveal,
    sectionsStagger,
    statsAnimation,
  };
};
