import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

// Hook per le animazioni principali del ContributeTabScreen - DISABILITATE per evitare bordi grigi
export const useNewActionsAnimations = () => {
  // ANIMAZIONI DISABILITATE - valori statici per evitare artefatti su Android
  const fadeAnim = useRef(new Animated.Value(1)).current; // Sempre visibile
  const slideAnim = useRef(new Animated.Value(0)).current; // Sempre in posizione
  const scaleAnim = useRef(new Animated.Value(1)).current; // Sempre a scala normale
  const buttonAnimations = useRef([
    new Animated.Value(1), // Sempre visibili
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ] as const).current;

  useEffect(() => {
    // ANIMAZIONI DISABILITATE - nessuna animazione per evitare bordi grigi
    // Tutti i valori sono già impostati staticamente sopra
  }, [fadeAnim, slideAnim, scaleAnim, buttonAnimations]);

  return { fadeAnim, slideAnim, scaleAnim, buttonAnimations };
};
