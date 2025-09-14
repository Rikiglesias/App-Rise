// ===================================================================
// 🎨 DESIGN TOKENS - SPACING
// ===================================================================

import { Spacing as BaseSpacing } from '../../shared/constants';

/**
 * Design Spacing - Sistema spaziature centralizzato
 * Basato su scala 4px con estensioni responsive
 */
export const DesignSpacing = {
  // Spaziature base (4px scale)
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
  40: 160,
  48: 192,
  56: 224,
  64: 256,

  // Spaziature semantiche
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,

  // Spaziature componenti
  component: {
    padding: {
      xs: 8,
      sm: 12,
      md: 16,
      lg: 24,
    },
    margin: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
    },
    gap: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
    },
  },

  // Spaziature layout
  layout: {
    section: 32,
    container: 24,
    content: 16,
  },
};

// Compatibilità con sistema esistente
export const Spacing = {
  ...BaseSpacing,
  ...DesignSpacing,
};

export default DesignSpacing;
