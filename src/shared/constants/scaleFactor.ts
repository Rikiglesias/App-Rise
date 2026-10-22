/**
 * Fattore di scala del Perfect System: diagonale della finestra (sempre in verticale) rispetto a
 * iPhone 15, col tetto per i tablet e la normalizzazione Display Zoom facoltativa.
 * Privato di perfectScale.ts, che ne espone l'uso (`scale`, `scaleWithDimensions`).
 */

import { getDisplayZoomFactor } from '../services/displayZoom';
import { getExpoExtra } from '../utils/expoExtra';

// REFERENCE: iPhone 15 (device di riferimento)
export const LOGICAL_REFERENCE = {
  width: 393,
  height: 852,
  scale: 2,
} as const;

// Diagonale di riferimento (iPhone 15): √(393² + 852²) ≈ 938.27px.
// Costante calcolata UNA volta a livello modulo invece che ad ogni chiamata di
// scale()/scaleWithDimensions() (primitive invocate in modo pervasivo). Valore identico.
const REFERENCE_DIAGONAL = Math.sqrt(
  LOGICAL_REFERENCE.width * LOGICAL_REFERENCE.width +
    LOGICAL_REFERENCE.height * LOGICAL_REFERENCE.height
);

/**
 * TABLET SCALING CAP
 * Previene scaling eccessivo su iPad mantenendo proporzionalità su phone.
 *
 * PROBLEMA: Scaling basato su diagonale causa ingigantimento su tablet:
 * - iPad Mini: 1.36x (troppo grande)
 * - iPad Pro 12.9": 1.82x (MOLTO troppo grande)
 *
 * SOLUZIONE: Dopo threshold 1.1x, applica cap progressivo:
 * - iPhone: 0.83x-1.07x → nessun cap (comportamento identico)
 * - iPad Mini: 1.36x → ~1.18x (ridotto)
 * - iPad Pro: 1.82x → ~1.30x (ridotto)
 *
 * MATEMATICA: Interpolazione logaritmica per transizione smooth
 */
const TABLET_SCALING_CONFIG = {
  /** Threshold oltre il quale inizia il cap (nessun phone lo supera) */
  threshold: 1.1,
  /** Cap massimo per tablet più grandi */
  maxScale: 1.3,
  /** Fattore di easing per transizione smooth (più alto = più aggressivo) */
  easingFactor: 0.3,
} as const;

/**
 * Applica cap progressivo allo scaling factor per tablet.
 * Phone rimangono inalterati (< threshold).
 *
 * Formula: threshold + (raw - threshold) * easingFactor
 * Questo crea una curva che rallenta la crescita dopo il threshold.
 *
 * @param rawScaleFactor - Fattore di scaling grezzo dalla diagonale
 * @returns Fattore con cap applicato se necessario
 */
const applyTabletScalingCap = (rawScaleFactor: number): number => {
  const { threshold, maxScale, easingFactor } = TABLET_SCALING_CONFIG;

  // Phone e device normali: nessun cap
  if (rawScaleFactor <= threshold) {
    return rawScaleFactor;
  }

  // Tablet: applica cap progressivo con easing
  const excess = rawScaleFactor - threshold;
  const cappedExcess = excess * easingFactor;
  const result = threshold + cappedExcess;

  // Assicura che non superi mai il maxScale
  return Math.min(result, maxScale);
};

/**
 * Feature flag: abilita normalizzazione Display Zoom.
 * Usa env EXPO_PUBLIC_ENABLE_DISPLAY_ZOOM_NORMALIZATION === 'true'.
 * Default: disabilitato per rollout sicuro.
 */
const shouldNormalizeDisplayZoom = (): boolean => {
  try {
    const extra = getExpoExtra();
    const raw =
      extra?.['displayZoomNormalization'] ??
      extra?.features?.['displayZoomNormalization'];
    if (raw !== undefined) {
      return raw === true || String(raw).toLowerCase() === 'true';
    }
    const env = (
      globalThis as unknown as {
        process?: { env?: Record<string, string | undefined> };
      }
    ).process?.env;
    const rawEnv =
      env?.EXPO_PUBLIC_ENABLE_DISPLAY_ZOOM_NORMALIZATION ??
      env?.ENABLE_DISPLAY_ZOOM_NORMALIZATION;
    return String(rawEnv).toLowerCase() === 'true';
  } catch {
    return false;
  }
};

/**
 * Fattore per la finestra data: 1 se la diagonale non è valida o il calcolo fallisce.
 * Normalizza sempre in verticale: girando, la diagonale (e quindi il fattore) non cambia.
 */
export const scaleFactor = (width: number, height: number): number => {
  try {
    const baseWidth = Math.min(width, height);
    const baseHeight = Math.max(width, height);

    // Opzionale: normalizzazione Display Zoom (feature flag via env)
    const normalize = shouldNormalizeDisplayZoom();
    const zoomFactor = normalize ? getDisplayZoomFactor() : 1.0;
    const normWidth = baseWidth * zoomFactor;
    const normHeight = baseHeight * zoomFactor;

    // Diagonale (Pitagora): la «grandezza percepita» dello schermo
    const deviceDiagonal = Math.sqrt(
      normWidth * normWidth + normHeight * normHeight
    );

    if (deviceDiagonal > 0) {
      return applyTabletScalingCap(deviceDiagonal / REFERENCE_DIAGONAL);
    }
  } catch {
    return 1; // Fallback: nessuna scala
  }
  return 1;
};
