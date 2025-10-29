/**
 * PERFECT SHADOW - Sistema Ombre Scalate Proporzionalmente
 *
 * GARANTISCE:
 * - Ombre scalano proporzionalmente alla dimensione schermo
 * - Consistency visiva su tutti i device
 * - iOS e Android unified (stesso visual effect)
 */

import { Platform } from 'react-native';
import { scaleDimensionLinear } from './responsiveSystem';

export type ShadowType = 'light' | 'medium' | 'strong';

// 📊 BASE SHADOWS (riferimento iPhone 15)
const SHADOW_BASE = {
  light: {
    offset: { width: 0, height: 2 },
    radius: 4,
    opacity: 0.08,
    elevation: 2,
  },
  medium: {
    offset: { width: 0, height: 4 },
    radius: 8,
    opacity: 0.12,
    elevation: 4,
  },
  strong: {
    offset: { width: 0, height: 8 },
    radius: 16,
    opacity: 0.16,
    elevation: 8,
  },
} as const;

/**
 * Ottiene shadow style scalato per device corrente
 * @param type - Tipo shadow (light, medium, strong)
 * @returns Shadow style object con dimensioni scalate
 */
export const getPerfectShadow = (type: ShadowType) => {
  const base = SHADOW_BASE[type];

  // Scala offset, radius e elevation proporzionalmente
  const scaledOffsetHeight = scaleDimensionLinear(base.offset.height);
  const scaledOffsetWidth = scaleDimensionLinear(base.offset.width);
  const scaledRadius = scaleDimensionLinear(base.radius);
  const scaledElevation = scaleDimensionLinear(base.elevation);

  return {
    shadowColor: '#000',
    shadowOffset: {
      width: scaledOffsetWidth,
      height: scaledOffsetHeight,
    },
    shadowOpacity: base.opacity, // Opacity non scala (è percentuale)
    shadowRadius: scaledRadius,
    // Android elevation
    elevation: Platform.OS === 'android' ? scaledElevation : undefined,
  };
};

/**
 * Shortcuts per shadow types comuni
 */
export const PerfectShadows = {
  light: () => getPerfectShadow('light'),
  medium: () => getPerfectShadow('medium'),
  strong: () => getPerfectShadow('strong'),
  none: () => ({}),
} as const;

/**
 * Helper per debug shadow values
 */
export const debugShadow = (type: ShadowType) => {
  if (!__DEV__) return;

  const _shadow = getPerfectShadow(type);
  // Debug info removed for production
};
