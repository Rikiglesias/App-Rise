import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';

// 🎨 DESIGN TOKENS CENTRALIZZATI - ELIMINANO DUPLICAZIONI
export const HomeHeaderDesignTokens = {
  // Colori centralizzati - usa Colors tokens globali
  colors: {
    primary: Colors.primary[500],
    // rgba necessari per overlay semi-trasparenti
    primaryLight: 'rgba(220, 38, 38, 0.2)',
    primaryShadow: 'rgba(220, 38, 38, 0.25)',
    secondary: Colors.neutral[800],
    secondaryLight: 'rgba(31, 41, 55, 0.2)',
    dark: Colors.neutral[900],
    transparent: 'transparent',
    modalOverlay: 'rgba(0, 0, 0, 0.5)',
    gradientOverlay: 'rgba(0, 0, 0, 0.1)',
  },

  // Gradient patterns - usa Colors.gradients centrali
  gradients: {
    dark: Colors.gradients.community, // Dark gray gradient
    primary: Colors.gradients.primary,
    // rgba necessario per gradient overlay trasparente su immagini
    header: ['transparent', 'rgba(0, 0, 0, 0.1)'] as const,
  },

  // Border radius centralizzato
  borderRadius: {
    small: 16,
    medium: 21,
    large: 24,
    round: 20,
  },

  // Shadow patterns centralizzati
  shadows: {
    light: {
      shadowColor: Colors.primary[500],
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: Colors.primary[500],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    large: {
      shadowColor: Colors.neutral[800],
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
    },
    card: {
      shadowColor: Colors.black.pure,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
  },

  // Dimensioni centralizzate
  dimensions: {
    logoSmall: 40,
    logoMedium: 56,
    separatorWidth: 80,
    separatorLineWidth: 110,
    separatorHeight: 2,
    modalMaxWidth: 340,
  },

  // Gradient configuration centralizzata
  gradientConfig: {
    diagonal: {
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
  },

  // Platform-specific styles centralizzati
  platformStyles: {
    android: {
      paddingTop: PerfectSpacing.xl,
      paddingBottom: PerfectSpacing.sm,
      marginTop: PerfectSpacing.sm,
    },
    ios: {
      paddingTop: PerfectSpacing.lg,
      paddingBottom: 0,
    },
  } as const,
};
