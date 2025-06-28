import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

import type { ChiSiamoAnimations } from '../types';

// CONTROLLO GLOBALE PRIMA VOLTA - PERSISTE TUTTA LA SESSIONE
let chiSiamoHasAnimated = false;

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
    // ANIMAZIONI SOLO ALLA PRIMA VISUALIZZAZIONE
    if (chiSiamoHasAnimated) {
      // Imposta immediatamente i valori finali se già animato
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
      scaleAnim.setValue(1);
      contactAnimations.forEach(anim => anim.setValue(1));
      return;
    }

    // Marca come già animato
    chiSiamoHasAnimated = true;
    const sequence = Animated.sequence([
      // Header animation - VELOCE
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300, // VELOCE: ridotto da 1000 a 300
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 120, // VELOCE: aumentato da 50 a 120
          friction: 10, // OTTIMIZZATO per velocità
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 140, // VELOCE: aumentato da 60 a 140
          friction: 10, // OTTIMIZZATO per velocità
        }),
      ]),
      // Contact animations staggered - VELOCE
      Animated.delay(100), // VELOCE: ridotto da 300 a 100
      Animated.stagger(
        80, // VELOCE: ridotto da 200 a 80
        contactAnimations.map(anim =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 250, // VELOCE: ridotto da 800 a 250
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
