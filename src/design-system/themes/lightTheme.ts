// ===================================================================
// 🎨 DESIGN SYSTEM - LIGHT THEME
// ===================================================================

import { DesignColors } from '../tokens/colors';
import { DesignSpacing } from '../tokens/spacing';
import { DesignShadows } from '../tokens/shadows';
import { DesignBorders } from '../tokens/borders';
import { DesignLayout } from '../tokens/layout';
import { DesignTypography } from '../tokens/typography';
import { DesignAnimations } from '../tokens/animations';

/**
 * Light Theme - Tema chiaro predefinito
 * Combina tutti i token in un tema coerente
 */
export const lightTheme = {
  // Identificativo tema
  name: 'light',

  // Token base
  colors: DesignColors,
  spacing: DesignSpacing,
  shadows: DesignShadows,
  borders: DesignBorders,
  layout: DesignLayout,
  typography: DesignTypography,
  animations: DesignAnimations,

  // Configurazioni tema-specifiche
  config: {
    isDark: false,
    statusBarStyle: 'dark-content' as const,
    navigationBarStyle: 'light' as const,
  },

  // Override per componenti specifici nel tema chiaro
  components: {
    Screen: {
      backgroundColor: DesignColors.background.default,
    },
    StatusBar: {
      backgroundColor: DesignColors.background.default,
      barStyle: 'dark-content' as const,
    },
    NavigationBar: {
      backgroundColor: DesignColors.background.default,
      tintColor: DesignColors.primary[500],
    },
    TabBar: {
      backgroundColor: DesignColors.background.default,
      activeTintColor: DesignColors.primary[500],
      inactiveTintColor: DesignColors.text.secondary,
    },
  },
};

export default lightTheme;

// Type per il tema
export type Theme = typeof lightTheme;
