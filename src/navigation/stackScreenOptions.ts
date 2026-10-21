import type { StackNavigationOptions } from '@react-navigation/stack';
import { useMemo } from 'react';

import { Colors } from '@/shared/constants/designTokens';
import { scale } from '@/shared/constants/perfectScale';
import { useReduceMotion } from '@/shared/hooks/useReduceMotion';

/**
 * Aspetto dell'header, condiviso da TUTTI gli stack dell'app.
 * Sta in un modulo suo perché gli alberi di navigazione sono due (quello normale e
 * quello del cancello del profilo) e devono essere indistinguibili all'occhio: una
 * seconda copia di questi valori si scoprirebbe divergente al primo cambio di colore.
 */
export const stackScreenOptions: StackNavigationOptions = {
  headerStyle: {
    backgroundColor: Colors.primary[600],
    elevation: 8,
    shadowColor: Colors.primary[600],
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.3,
    shadowRadius: scale(8),
    borderBottomWidth: 0,
  },
  headerTintColor: Colors.accent.white,
  headerTitleStyle: {
    fontWeight: '700',
    letterSpacing: scale(0.5),
  },
};

/**
 * Le opzioni sopra più la transizione spenta con «Riduci animazioni» (C46): lo stack
 * JavaScript anima con `Animated`, che il telefono non spegne da solo.
 */
export const useStackScreenOptions = (): StackNavigationOptions => {
  const reduceMotion = useReduceMotion();
  return useMemo(
    () =>
      reduceMotion
        ? { ...stackScreenOptions, animation: 'none' }
        : stackScreenOptions,
    [reduceMotion]
  );
};
