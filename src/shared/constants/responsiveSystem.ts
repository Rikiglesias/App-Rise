/**
 * RESPONSIVE SYSTEM - ZERO RIDONDANZA
 * UNA SOLA FUNZIONE - MASSIMA SEMPLICITÀ
 */

import { Dimensions } from 'react-native';

// REFERENCE: iPhone 15
export const LOGICAL_REFERENCE = {
  width: 393,
  height: 852,
  scale: 2,
} as const;

/**
 * SCALE - Unica funzione scaling
 * @param value - Valore da scalare
 * @returns Valore * (larghezza_device / 393)
 */
export const scale = (value: number): number => {
  try {
    // eslint-disable-next-line no-restricted-properties
    const { width } = Dimensions.get('window');
    if (width > 0) {
      return value * (width / LOGICAL_REFERENCE.width);
    }
  } catch {
    // Fallback
  }
  return value;
};

// EXPORT DEFAULT
export default {
  LOGICAL_REFERENCE,
  scale,
};

// NESSUN ALIAS - SOLO scale()!
