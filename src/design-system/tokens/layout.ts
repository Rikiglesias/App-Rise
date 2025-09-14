// ===================================================================
// 🎨 DESIGN TOKENS - LAYOUT
// ===================================================================

import { Layout as BaseLayout } from '../../shared/constants';

/**
 * Design Layout - Sistema layout centralizzato
 * Dimensioni e breakpoint per layout responsive
 */
export const DesignLayout = {
  // Breakpoints
  breakpoints: {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    '2xl': 1400,
  },

  // Container sizes
  container: {
    xs: '100%',
    sm: 540,
    md: 720,
    lg: 960,
    xl: 1140,
    '2xl': 1320,
  },

  // Dimensioni componenti
  component: {
    button: {
      height: {
        sm: 32,
        md: 40,
        lg: 48,
      },
      minWidth: {
        sm: 64,
        md: 80,
        lg: 96,
      },
    },
    input: {
      height: {
        sm: 32,
        md: 40,
        lg: 48,
      },
    },
    card: {
      minHeight: 120,
      maxWidth: 400,
    },
    modal: {
      minWidth: 320,
      maxWidth: 600,
      minHeight: 200,
    },
  },

  // Spaziature layout
  spacing: {
    section: 64,
    container: 32,
    content: 24,
    component: 16,
  },

  // Z-index layers
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
    toast: 1070,
  },

  // Dimensioni icone
  icon: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    '2xl': 48,
  },
};

// Compatibilità con sistema esistente
export const Layout = {
  ...BaseLayout,
  ...DesignLayout,
};

export default DesignLayout;
