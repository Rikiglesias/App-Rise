import { Spacing } from '@/shared/constants/designTokens';

// 🎨 DESIGN TOKENS CENTRALIZZATI - ELIMINANO DUPLICAZIONI
export const HomeHeaderDesignTokens = {
  // Colori centralizzati
  colors: {
    primary: '#DC2626',
    primaryLight: 'rgba(220, 38, 38, 0.2)',
    primaryShadow: 'rgba(220, 38, 38, 0.25)',
    secondary: '#1F2937',
    secondaryLight: 'rgba(31, 41, 55, 0.2)',
    dark: '#171717',
    transparent: 'transparent',
    modalOverlay: 'rgba(0, 0, 0, 0.5)',
    gradientOverlay: 'rgba(0,0,0,0.1)',
  },

  // Gradient patterns centralizzati
  gradients: {
    dark: ['#1F2937', '#374151', '#111827'] as const,
    primary: ['#DC2626', '#B91C1C', '#991B1B'] as const,
    header: ['transparent', 'rgba(0,0,0,0.1)'] as const,
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
      shadowColor: '#DC2626',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#DC2626',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    large: {
      shadowColor: '#1F2937',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
    },
    card: {
      shadowColor: '#000',
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
      paddingTop: Spacing[8],
      paddingBottom: Spacing[2],
      marginTop: Spacing[2],
    },
    ios: {
      paddingTop: Spacing[6],
      paddingBottom: 0,
    },
  } as const,
};
