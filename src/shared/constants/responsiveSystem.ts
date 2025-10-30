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
 * SCALE - Scaling basato su DIAGONALE dello schermo
 *
 * PERCHÉ DIAGONALE invece di width?
 * - Considera ENTRAMBE le dimensioni (width + height)
 * - Bilancia naturalmente aspect ratio diversi (phone 2.17:1 vs tablet 1.33:1)
 * - Più contenuto visibile su tablet (7 card invece di 5)
 * - Testo leggibile ma non gigante (21px invece di 31px su iPad)
 * - Come si misurano realmente gli schermi (6.1", 8.3", 12.9")
 *
 * GESTISCE ROTAZIONE: Usa sempre portrait orientation
 * per calcolare diagonale consistente.
 *
 * Esempi scaling:
 * - iPhone SE: 0.83x (leggerm. più piccolo)
 * - iPhone 15: 1.00x (reference)
 * - iPhone Pro Max: 1.07x (leggerm. più grande)
 * - iPad Mini: 1.36x (bilanciato, non 1.95x!)
 * - iPad Pro 12.9": 1.82x (grande ma non 2.60x!)
 *
 * @param value - Valore da scalare (riferimento iPhone 15 portrait)
 * @returns Valore scalato proporzionalmente alla diagonale
 */
export const scale = (value: number): number => {
  try {
    // eslint-disable-next-line no-restricted-properties
    const { width, height } = Dimensions.get('window');

    // Normalizza sempre a portrait orientation
    const baseWidth = Math.min(width, height);
    const baseHeight = Math.max(width, height);

    // Calcola diagonale usando Teorema di Pitagora
    // Questo rappresenta la "grandezza percepita" dello schermo
    const deviceDiagonal = Math.sqrt(
      baseWidth * baseWidth + baseHeight * baseHeight
    );

    // Diagonale di riferimento (iPhone 15)
    const referenceDiagonal = Math.sqrt(
      LOGICAL_REFERENCE.width * LOGICAL_REFERENCE.width +
        LOGICAL_REFERENCE.height * LOGICAL_REFERENCE.height
    );
    // = √(393² + 852²) = √(154449 + 725904) = √880353 ≈ 938.27px

    if (deviceDiagonal > 0) {
      return value * (deviceDiagonal / referenceDiagonal);
    }
  } catch {
    // Fallback se Dimensions non disponibile
  }
  return value;
};

// EXPORT DEFAULT
export default {
  LOGICAL_REFERENCE,
  scale,
};

// NESSUN ALIAS - SOLO scale()!
