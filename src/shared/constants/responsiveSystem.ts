/**
 * RESPONSIVE SYSTEM - MATEMATICA PURA
 * UNA SOLA FUNZIONE - MASSIMA SEMPLICITÀ
 * 
 * ⚠️ SOLO per uso INTERNO Perfect System components
 * ⚠️ NON importare nei features/ - USA Perfect components
 */

import { Dimensions } from 'react-native';

// 📱 REFERENCE: iPhone 15
export const LOGICAL_REFERENCE = {
  width: 393,
  height: 852,
  scale: 2,
} as const;

/**
 * SCALE - Unica funzione di scaling
 * Scala qualsiasi valore proporzionalmente alla larghezza schermo
 * 
 * @param value - Valore da scalare (font size, padding, icon size, ecc)
 * @returns Valore scalato proporzionalmente
 * 
 * @example
 * scale(16)  // Font 16pt → scala su tutti device
 * scale(24)  // Icon 24px → scala su tutti device
 * scale(20)  // Padding 20px → scala su tutti device
 */
export const scale = (value: number): number => {
  try {
    // eslint-disable-next-line no-restricted-properties
    const { width } = Dimensions.get('window');
    if (width > 0) {
      return value * (width / LOGICAL_REFERENCE.width);
    }
  } catch {
    // Fallback se Dimensions non disponibile
  }
  return value; // Fallback: nessuno scaling
};

// 📦 EXPORT DEFAULT
export default {
  LOGICAL_REFERENCE,
  scale,
};

// ⚠️ ALIAS per compatibilità (deprecati - usare scale())
export const scaleFont = scale;
export const scaleDimensionLinear = scale;
export const getMillimetricScale = (): number => {
  try {
    // eslint-disable-next-line no-restricted-properties
    const { width } = Dimensions.get('window');
    return width / LOGICAL_REFERENCE.width;
  } catch {
    return 1;
  }
};
