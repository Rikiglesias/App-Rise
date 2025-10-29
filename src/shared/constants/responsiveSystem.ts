/**
 * RESPONSIVE SYSTEM - CORE MINIMALE
 * SOLO per uso INTERNO Perfect System components
 * 
 * ⚠️ NON IMPORTARE QUESTO FILE NEI FEATURE FILES!
 * ⚠️ USA SOLO PerfectText/PerfectContainer/PerfectImage/PlatformIcon
 */

import { Dimensions } from 'react-native';

// 📱 REFERENCE: iPhone 15
export const LOGICAL_REFERENCE = {
  width: 393,
  height: 852,
  scale: 2,
} as const;

// 📏 GET DIMENSIONS (uso interno)
const getDimensions = () => {
  try {
    // eslint-disable-next-line no-restricted-properties
    const { width, height } = Dimensions.get('window');
    if (width > 0 && height > 0) return { width, height };
  } catch {
    // Fallback
  }
  return { width: LOGICAL_REFERENCE.width, height: LOGICAL_REFERENCE.height };
};

// 🧮 CORE: SCALE FACTOR (uso interno Perfect components)
export const getMillimetricScale = (): number => {
  const { width } = getDimensions();
  return width / LOGICAL_REFERENCE.width;  // Matematica pura
};

// 📐 SCALE DIMENSION (uso interno Perfect components)
export const scaleDimensionLinear = (value: number): number => {
  return value * getMillimetricScale();
};

// 🔤 SCALE FONT (uso interno PerfectText)
export const scaleFont = (size: number): number => {
  const scaled = size * getMillimetricScale();
  const minFont = 12; // Minimo leggibilità
  return Math.max(scaled, minFont);
};

// 📦 EXPORT DEFAULT (uso interno)
export default {
  LOGICAL_REFERENCE,
  getMillimetricScale,
  scaleDimensionLinear,
  scaleFont,
};

// ⚠️ TUTTI GLI ALTRI SISTEMI SONO STATI ELIMINATI
// ⚠️ USA SOLO PERFECT SYSTEM COMPONENTS:
// - PerfectText
// - PerfectContainer
// - PerfectImage
// - PlatformIcon
