import type { StackNavigationOptions } from '@react-navigation/stack';

import { Colors } from '@/shared/constants/designTokens';
import { scale } from '@/shared/constants/perfectScale';

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
