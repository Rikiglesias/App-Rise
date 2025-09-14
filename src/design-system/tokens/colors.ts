// ===================================================================
// 🎨 DESIGN TOKENS - COLORS
// ===================================================================

// import { scaleColor } from '../../shared/constants/responsiveSystem';

/**
 * Design Colors - Sistema colori centralizzato
 * Basato sui colori esistenti con estensioni per design system
 */
export const DesignColors = {
  // Colori primari
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Primary main
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },

  // Colori neutri
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Colori semantici
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  // Colori di background
  background: {
    default: '#ffffff',
    elevated: '#f9fafb',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Colori di testo
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    disabled: '#9ca3af',
    inverse: '#ffffff',
  },

  // Colori di bordo
  border: {
    default: '#e5e7eb',
    focus: '#3b82f6',
    error: '#ef4444',
  },
};

// Compatibilità con sistema esistente
export const Colors = {
  // ...BaseColors,
  ...DesignColors,
};

export default DesignColors;
