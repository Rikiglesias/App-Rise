import { useEffect, useRef } from 'react';
import type { Animated } from 'react-native';

/**
 * Hook per gestire il cleanup automatico delle animazioni
 * Previene memory leak e garantisce che le animazioni vengano fermate
 * quando il componente viene smontato
 */
export const useAnimationCleanup = () => {
  const animationsRef = useRef<Animated.CompositeAnimation[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isMountedRef = useRef(true);

  // Registra un'animazione per il cleanup automatico
  const registerAnimation = (animation: Animated.CompositeAnimation) => {
    animationsRef.current.push(animation);
    return animation;
  };

  // Registra un timeout per il cleanup automatico
  const registerTimeout = (timeout: ReturnType<typeof setTimeout>) => {
    timeoutsRef.current.push(timeout);
    return timeout;
  };

  // Verifica se il componente è ancora montato
  const isMounted = () => isMountedRef.current;

  // Cleanup automatico al dismount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;

      // Ferma tutte le animazioni registrate
      animationsRef.current.forEach(animation => {
        void animation.stop();
      });

      // Pulisce tutti i timeout registrati
      timeoutsRef.current.forEach(timeout => {
        clearTimeout(timeout);
      });

      // Reset degli array
      animationsRef.current = [];
      timeoutsRef.current = [];
    };
  }, []);

  return {
    registerAnimation,
    registerTimeout,
    isMounted,
  };
};
