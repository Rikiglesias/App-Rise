/**
 * SISTEMA MILLIMETRICO UNIVERSALE UNIFICATO
 *
 * iPhone 15 (393px) come riferimento ASSOLUTO per tutto:
 * - Testi: fontSize identico proporzionalmente
 * - Immagini: dimensioni identiche proporzionalmente
 * - Container: larghezze identiche proporzionalmente
 * - Spacing: padding/margin identici proporzionalmente
 *
 * RISULTATO: App visivamente IDENTICA su qualsiasi dispositivo
 */

import { Dimensions } from 'react-native';
import { findDeviceByWidth } from '../constants/deviceResolutionsDatabase';

// 📱 RIFERIMENTO ASSOLUTO - iPhone 15 (CORREZIONE CRITICA 414→393px)
const UNIVERSAL_REFERENCE = {
  width: 393,
  height: 852,
  name: 'iPhone 15',
} as const;

// 🧮 ALGORITMO MILLIMETRICO UNIVERSALE + DATABASE INTEGRATION
export const calculateMillimetricSize = (referenceValue: number): number => {
  const { width: currentWidth } = Dimensions.get('window');

  // 🎯 RICERCA DISPOSITIVO NEL DATABASE
  const matchingDevices = findDeviceByWidth(currentWidth);
  const deviceInfo = matchingDevices?.[0]; // Primo match più accurato

  // 📊 UTILIZZA SCALE FACTOR DAL DATABASE SE DISPONIBILE
  let finalScale: number;
  if (deviceInfo?.scaleFactor) {
    // Usa il scale factor preciso dal database
    finalScale = deviceInfo.scaleFactor;
  } else {
    // Fallback al calcolo classico se dispositivo non trovato
    const proportion = referenceValue / UNIVERSAL_REFERENCE.width;
    const scaledValue = currentWidth * proportion;
    finalScale = scaledValue / referenceValue;
  }

  // 🛡️ LIMITI DI SICUREZZA UNIVERSALI
  const minScale = 0.75; // 75% minimo (dispositivi molto piccoli)
  const maxScale = 2.0; // 200% massimo (tablet molto grandi)

  const safeScale = Math.max(minScale, Math.min(maxScale, finalScale));
  return Math.round(referenceValue * safeScale * 100) / 100; // Precisione decimale
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

// 🔍 FUNZIONE DIAGNOSTICA - VERIFICA CONNESSIONE DATABASE
export const getDatabaseDeviceInfo = () => {
  const { width: currentWidth } = Dimensions.get('window');
  const matchingDevices = findDeviceByWidth(currentWidth);

  return {
    currentWidth,
    matchingDevices: matchingDevices?.slice(0, 3), // Top 3 matches
    isConnectedToDatabase: matchingDevices && matchingDevices.length > 0,
    referenceWidth: UNIVERSAL_REFERENCE.width,
  };
};

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
