// ===================================================================
// 🎨 DESIGN TOKENS - BORDERS
// ===================================================================

// import { Borders as BaseBorders } from '../../shared/constants';

/**
 * Design Borders - Sistema bordi centralizzato
 * Bordi consistenti per tutti i componenti
 */
export const DesignBorders = {
  // Larghezze bordi
  width: {
    none: 0,
    thin: 1,
    normal: 2,
    thick: 4,
  },

  // Raggi di curvatura
  radius: {
    none: 0,
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
  },

  // Stili bordi
  style: {
    solid: 'solid',
    dashed: 'dashed',
    dotted: 'dotted',
  },

  // Bordi semantici
  semantic: {
    default: {
      width: 1,
      style: 'solid',
      color: '#e5e7eb',
    },
    focus: {
      width: 2,
      style: 'solid',
      color: '#3b82f6',
    },
    error: {
      width: 1,
      style: 'solid',
      color: '#ef4444',
    },
    success: {
      width: 1,
      style: 'solid',
      color: '#10b981',
    },
  },

  // Bordi componenti
  component: {
    button: {
      radius: 8,
      width: 1,
    },
    card: {
      radius: 12,
      width: 1,
    },
    input: {
      radius: 6,
      width: 1,
    },
    modal: {
      radius: 16,
      width: 0,
    },
  },
};

// Compatibilità con sistema esistente
export const Borders = {
  // ...BaseBorders,
  ...DesignBorders,
};

export default DesignBorders;
