/**
 * PERFECT SCALE - Sistema Scaling Proporzionale
 *
 * Parte del Perfect System per garantire UI consistente su tutti i device.
 * Usa scaling basato sulla diagonale dello schermo per bilanciare
 * naturalmente aspect ratio diversi (phone vs tablet).
 */

import { Dimensions } from 'react-native';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { getDisplayZoomFactor } from '../services/displayZoom';

// REFERENCE: iPhone 15 (device di riferimento)
export const LOGICAL_REFERENCE = {
  width: 393,
  height: 852,
  scale: 2,
} as const;

/**
 * Feature flag: abilita normalizzazione Display Zoom.
 * Usa env EXPO_PUBLIC_ENABLE_DISPLAY_ZOOM_NORMALIZATION === 'true'.
 * Default: disabilitato per rollout sicuro.
 */
const shouldNormalizeDisplayZoom = (): boolean => {
  try {
    const extra =
      (Constants.expoConfig?.extra as Record<string, unknown> | undefined) ??
      ((Updates as unknown as { manifest?: { extra?: Record<string, unknown> } }).manifest
        ?.extra);
    const raw = (extra as any)?.displayZoomNormalization ?? (extra as any)?.features?.displayZoomNormalization;
    if (raw !== undefined) {
      return raw === true || String(raw).toLowerCase() === 'true';
    }
    const env = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } })
      .process?.env;
    const rawEnv = env?.EXPO_PUBLIC_ENABLE_DISPLAY_ZOOM_NORMALIZATION ?? env?.ENABLE_DISPLAY_ZOOM_NORMALIZATION;
    return String(rawEnv).toLowerCase() === 'true';
  } catch {
    return false;
  }
};

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

    // Opzionale: normalizzazione Display Zoom (feature flag via env)
    const normalize = shouldNormalizeDisplayZoom();
    const zoomFactor = normalize ? getDisplayZoomFactor() : 1.0;
    const normWidth = baseWidth * zoomFactor;
    const normHeight = baseHeight * zoomFactor;

    // Calcola diagonale usando Teorema di Pitagora
    // Questo rappresenta la "grandezza percepita" dello schermo
    const deviceDiagonal = Math.sqrt(
      normWidth * normWidth + normHeight * normHeight
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

/**
 * SCALE WITH CUSTOM DIMENSIONS - Per hook e casi speciali
 *
 * Usa questa funzione quando hai già le dimensioni (es. da useResponsiveDimensions)
 * invece di leggerle nuovamente da Dimensions.get().
 *
 * QUANDO USARE:
 * - In componenti con useResponsiveDimensions() hook
 * - Quando vuoi evitare multiple letture di Dimensions
 * - Per testing con dimensioni mockate
 *
 * @param value - Valore da scalare
 * @param width - Larghezza schermo
 * @param height - Altezza schermo
 * @returns Valore scalato
 */
export const scaleWithDimensions = (
  value: number,
  width: number,
  height: number
): number => {
  try {
    // Normalizza a portrait
    const baseWidth = Math.min(width, height);
    const baseHeight = Math.max(width, height);

    // Opzionale: normalizzazione Display Zoom (feature flag via env)
    const normalize = shouldNormalizeDisplayZoom();
    const zoomFactor = normalize ? getDisplayZoomFactor() : 1.0;
    const normWidth = baseWidth * zoomFactor;
    const normHeight = baseHeight * zoomFactor;

    // Calcola diagonale
    const deviceDiagonal = Math.sqrt(
      normWidth * normWidth + normHeight * normHeight
    );

    const referenceDiagonal = Math.sqrt(
      LOGICAL_REFERENCE.width * LOGICAL_REFERENCE.width +
        LOGICAL_REFERENCE.height * LOGICAL_REFERENCE.height
    );

    if (deviceDiagonal > 0) {
      return value * (deviceDiagonal / referenceDiagonal);
    }
  } catch {
    // Fallback
  }
  return value;
};

/**
 * DEVICE TYPE DETECTION
 * Rileva il tipo di device per applicare limiti solo dove necessario
 */
const DEVICE_BREAKPOINTS = {
  small: 380, // iPhone SE, mini → limiti MINIMI
  normal: 600, // iPhone standard, Android → scale() PURO
  large: 1024, // iPad, tablet → limiti MASSIMI
} as const;

export const getDeviceType = (): 'small' | 'normal' | 'large' => {
  // eslint-disable-next-line no-restricted-properties
  const width = Dimensions.get('window').width;

  if (width < DEVICE_BREAKPOINTS.small) return 'small';
  if (width < DEVICE_BREAKPOINTS.normal) return 'normal';
  return 'large';
};

// Export statici per uso diretto
// ⚠️ DEPRECATO: Queste costanti sono calcolate 1 SOLA VOLTA all'avvio app
// NON si aggiornano con rotazione o resize!
// Usa getDeviceType() dinamico se hai bisogno di logica condizionale aggiornata
export const DEVICE_TYPE = getDeviceType();
export const IS_SMALL_DEVICE = DEVICE_TYPE === 'small';
export const IS_LARGE_DEVICE = DEVICE_TYPE === 'large';

/**
 * SCALE TOUCH - Per touch targets accessibili
 *
 * Applica limite MINIMO di 44px SOLO su device piccoli.
 * Su device normali e grandi: scale() puro.
 *
 * QUANDO USARE:
 * - Button height/width
 * - Touch target minimi
 * - Elementi interattivi
 *
 * @param value - Valore touch target (base iPhone 15)
 * @returns Valore scalato con minimo 44px su device piccoli
 *
 * @example
 * height: scaleTouch(44)  // iPhone SE: 44px (min), iPhone 15: scale(44), iPad: scale(44)
 */
export const scaleTouch = (value: number): number => {
  const scaled = scale(value);

  // Calcola device type DINAMICAMENTE (non usa costante statica)
  const deviceType = getDeviceType();

  // Solo su device piccoli applica minimo Apple (44px)
  if (deviceType === 'small') {
    return Math.max(scaled, 44);
  }

  // Device normali e grandi: scale() puro
  return scaled;
};

/**
 * SCALE SPACING - Per spacing su tablet
 *
 * Applica limite MASSIMO di 1.5x SOLO su device grandi.
 * Su device piccoli e normali: scale() puro.
 *
 * QUANDO USARE:
 * - Padding/margin su sezioni
 * - Gap tra elementi
 * - Spacing che potrebbe diventare eccessivo su tablet
 *
 * @param value - Valore spacing (base iPhone 15)
 * @returns Valore scalato con massimo 1.5x su tablet
 *
 * @example
 * padding: scaleSpacing(16)  // iPhone: scale(16), iPad: max 24px (16*1.5)
 */
export const scaleSpacing = (value: number): number => {
  const scaled = scale(value);

  // Calcola device type DINAMICAMENTE (non usa costante statica)
  const deviceType = getDeviceType();

  // Solo su tablet/device grandi limita a 1.5x
  if (deviceType === 'large') {
    return Math.min(scaled, value * 1.5);
  }

  // Device piccoli e normali: scale() puro
  return scaled;
};

/**
 * SCALE TEXT - Per dimensioni testo proporzionali
 *
 * Usa scale() PURO senza limiti per garantire:
 * - Wrapping identico su tutti i dispositivi
 * - Proporzionalità perfetta font/container
 * - Consistenza visiva assoluta
 *
 * NOTA IMPORTANTE:
 * - SystemImmunity già limita fontScale utente a 1.3x (maxFontSizeMultiplier)
 * - Questo è SUFFICIENTE per accessibilità e protezione layout
 * - NO limiti device-specific = wrapping uniforme garantito
 *
 * QUANDO USARE:
 * - Automatico in PerfectText
 * - Font size custom (quando non usi PerfectText)
 * - Line height basato su font size
 *
 * @param value - Valore font size (base iPhone 15)
 * @returns Valore scalato proporzionalmente (scale puro)
 *
 * @example
 * fontSize: scaleText(14)  // iPhone SE: 11.6px, iPhone 15: 14px, iPad: 19.1px
 */
export const scaleText = (value: number): number => {
  // Scale puro - proporzionalità perfetta per wrapping identico
  return scale(value);
};

/**
 * Clamp helpers (centralizzati) – per coerenza cross-device
 *
 * - clamp: utility di base
 * - scaleClamp: applica scale() e poi limita tra min/max
 * - scaleIcon: pensato per icone, con limiti stretti default
 * - scaleBadge: per badge/bottoni circolari (es. pulsante info)
 */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const scaleClamp = (
  value: number,
  min: number,
  max: number
): number => clamp(scale(value), min, max);

export const scaleIcon = (
  base: number,
  opts?: { min?: number; max?: number }
): number => {
  const min = opts?.min ?? 12;
  const max = opts?.max ?? 28;
  return scaleClamp(base, min, max);
};

export const scaleBadge = (
  base: number,
  opts?: { min?: number; max?: number }
): number => {
  // Badge/touch piccoli non devono scendere sotto ~22–24
  const min = opts?.min ?? 22;
  const max = opts?.max ?? 36;
  return scaleClamp(base, min, max);
};
