/**
 * SISTEMA MILLIMETRICO UNIVERSALE UNIFICATO
 *
 * iPhone 15 (414px) come riferimento ASSOLUTO per tutto:
 * - Testi: fontSize identico proporzionalmente
 * - Immagini: dimensioni identiche proporzionalmente
 * - Container: larghezze identiche proporzionalmente
 * - Spacing: padding/margin identici proporzionalmente
 *
 * RISULTATO: App visivamente IDENTICA su qualsiasi dispositivo
 */

import { Dimensions } from 'react-native';

// 📱 RIFERIMENTO ASSOLUTO - iPhone 15
const UNIVERSAL_REFERENCE = {
  width: 414,
  height: 896,
  name: 'iPhone 15',
} as const;

// 🧮 ALGORITMO MILLIMETRICO UNIVERSALE
export const calculateMillimetricSize = (referenceValue: number): number => {
  const { width: currentWidth } = Dimensions.get('window');

  // Formula millimetrica universale
  const proportion = referenceValue / UNIVERSAL_REFERENCE.width;
  const scaledValue = currentWidth * proportion;

  // Limiti di sicurezza per leggibilità
  const minScale = 0.75; // 75% minimo (dispositivi molto piccoli)
  const maxScale = 2.0; // 200% massimo (tablet molto grandi)

  const finalScale = Math.max(
    minScale,
    Math.min(maxScale, scaledValue / referenceValue)
  );
  return Math.round(referenceValue * finalScale * 100) / 100; // Precisione decimale
};

// 🎯 FUNZIONI SPECIFICHE PER OGNI TIPO
export const universalFont = (fontSize: number): number =>
  calculateMillimetricSize(fontSize);
export const universalSpacing = (spacing: number): number =>
  calculateMillimetricSize(spacing);
export const universalWidth = (width: number): number =>
  calculateMillimetricSize(width);
export const universalHeight = (height: number): number =>
  calculateMillimetricSize(height);

// 📊 INFO DISPOSITIVO CORRENTE
export const getDeviceInfo = () => {
  const { width, height } = Dimensions.get('window');
  const scale = width / UNIVERSAL_REFERENCE.width;

  return {
    width,
    height,
    scale,
    scalePercentage: Math.round(scale * 100),
    reference: UNIVERSAL_REFERENCE,
    isReference: width === UNIVERSAL_REFERENCE.width,
  };
};

// 🎯 SISTEMA UNIFICATO - Una funzione per tutto
export const universal = {
  font: universalFont,
  spacing: universalSpacing,
  width: universalWidth,
  height: universalHeight,
  info: getDeviceInfo,

  // Helper per debugging
  debug: (_name: string, originalValue: number) => {
    const scaled = calculateMillimetricSize(originalValue);
    const _info = getDeviceInfo();

    if (__DEV__) {
      // Debug info removed for production
    }

    return scaled;
  },
};
