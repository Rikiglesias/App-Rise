import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

import type { ChiSiamoAnimations } from '../types';

// ANIMAZIONI DISABILITATE - controllo non più necessario

export const useChiSiamoAnimations = (): ChiSiamoAnimations => {
  // ANIMAZIONI DISABILITATE - valori statici per evitare bordi grigi
  const fadeAnim = useRef(new Animated.Value(1)).current; // Sempre visibile
  const slideAnim = useRef(new Animated.Value(0)).current; // Sempre in posizione
  const scaleAnim = useRef(new Animated.Value(1)).current; // Sempre a scala normale
  const contactAnimations = useRef([
    new Animated.Value(1), // Sempre visibili
    new Animated.Value(1),
    new Animated.Value(1), // Solo 3 contatti ora
  ] as const).current;

  useEffect(() => {
    // ANIMAZIONI DISABILITATE - nessuna animazione per evitare bordi grigi
    // Tutti i valori sono già impostati staticamente sopra
  }, [fadeAnim, slideAnim, scaleAnim, contactAnimations]);

  return { fadeAnim, slideAnim, scaleAnim, contactAnimations };
};
