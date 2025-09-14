// ===================================================================
// DESIGN SYSTEM - TIPOGRAFIA CENTRALIZZATA
// Consolida tutti i pattern tipografici per eliminare duplicazioni
// ===================================================================

import { Typography as BaseTypography } from '../../shared/constants';
import { scaleFont } from '../../shared/constants/responsiveSystem';

// 📝 SISTEMA TIPOGRAFICO ESTESO
export const DesignTypography = {
  // Eredita il sistema base
  ...BaseTypography,

  // 🎯 SCALE TIPOGRAFICHE SEMANTICHE
  scale: {
    // Display - Per titoli molto grandi
    display: {
      large: scaleFont(48),
      medium: scaleFont(40),
      small: scaleFont(32),
    },
    // Headline - Per titoli principali
    headline: {
      large: scaleFont(28),
      medium: scaleFont(24),
      small: scaleFont(20),
    },
    // Title - Per sottotitoli
    title: {
      large: scaleFont(18),
      medium: scaleFont(16),
      small: scaleFont(14),
    },
    // Body - Per testo corpo
    body: {
      large: scaleFont(16),
      medium: scaleFont(14),
      small: scaleFont(12),
    },
    // Label - Per etichette
    label: {
      large: scaleFont(14),
      medium: scaleFont(12),
      small: scaleFont(10),
    },
  },

  // 🎨 STILI TIPOGRAFICI PREDEFINITI
  styles: {
    // Titoli
    h1: {
      fontSize: scaleFont(32),
      fontWeight: BaseTypography.weights.bold,
      fontFamily: BaseTypography.families.heading,
      lineHeight: 1.2,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: scaleFont(28),
      fontWeight: BaseTypography.weights.bold,
      fontFamily: BaseTypography.families.heading,
      lineHeight: 1.25,
      letterSpacing: -0.25,
    },
    h3: {
      fontSize: scaleFont(24),
      fontWeight: BaseTypography.weights.semibold,
      fontFamily: BaseTypography.families.heading,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: scaleFont(20),
      fontWeight: BaseTypography.weights.semibold,
      fontFamily: BaseTypography.families.heading,
      lineHeight: 1.35,
    },
    h5: {
      fontSize: scaleFont(18),
      fontWeight: BaseTypography.weights.medium,
      fontFamily: BaseTypography.families.heading,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: scaleFont(16),
      fontWeight: BaseTypography.weights.medium,
      fontFamily: BaseTypography.families.heading,
      lineHeight: 1.45,
    },

    // Corpo del testo
    bodyLarge: {
      fontSize: scaleFont(16),
      fontWeight: BaseTypography.weights.regular,
      fontFamily: BaseTypography.families.body,
      lineHeight: 1.5,
    },
    body: {
      fontSize: scaleFont(14),
      fontWeight: BaseTypography.weights.regular,
      fontFamily: BaseTypography.families.body,
      lineHeight: 1.5,
    },
    bodySmall: {
      fontSize: scaleFont(12),
      fontWeight: BaseTypography.weights.regular,
      fontFamily: BaseTypography.families.body,
      lineHeight: 1.4,
    },

    // Etichette
    label: {
      fontSize: scaleFont(12),
      fontWeight: BaseTypography.weights.medium,
      fontFamily: BaseTypography.families.body,
      lineHeight: 1.3,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
    },

    // Caption
    caption: {
      fontSize: scaleFont(10),
      fontWeight: BaseTypography.weights.regular,
      fontFamily: BaseTypography.families.body,
      lineHeight: 1.3,
    },

    // Overline
    overline: {
      fontSize: scaleFont(10),
      fontWeight: BaseTypography.weights.medium,
      fontFamily: BaseTypography.families.body,
      lineHeight: 1.3,
      textTransform: 'uppercase' as const,
      letterSpacing: 1,
    },
  },

  // 🎯 VARIANTI SEMANTICHE
  variants: {
    // Testo primario
    primary: {
      color: '#171717', // neutral[900]
    },
    // Testo secondario
    secondary: {
      color: '#404040', // neutral[700]
    },
    // Testo terziario
    tertiary: {
      color: '#737373', // neutral[500]
    },
    // Testo accent
    accent: {
      color: '#DC2626', // primary[500]
      fontWeight: BaseTypography.weights.semibold,
    },
    // Testo inverso
    inverse: {
      color: '#FFFFFF', // neutral[0]
    },
    // Testo disabilitato
    disabled: {
      color: '#A3A3A3', // neutral[400]
    },
  },
};

// 🎯 UTILITY FUNCTIONS
export const getTypographyStyle = (
  variant: keyof typeof DesignTypography.styles
) => DesignTypography.styles[variant];

export const getTypographyVariant = (
  variant: keyof typeof DesignTypography.variants
) => DesignTypography.variants[variant];

export const createTextStyle = (
  style: keyof typeof DesignTypography.styles,
  variant?: keyof typeof DesignTypography.variants
) => ({
  ...DesignTypography.styles[style],
  ...(variant ? DesignTypography.variants[variant] : {}),
});

// 📱 RESPONSIVE TYPOGRAPHY HELPERS
export const ResponsiveTypography = {
  // Calcola font size responsive
  getResponsiveSize: (baseSize: number, scale: number = 1) =>
    scaleFont(baseSize * scale),

  // Calcola line height ottimale
  getOptimalLineHeight: (fontSize: number) => Math.round(fontSize * 1.4),

  // Calcola letter spacing ottimale
  getOptimalLetterSpacing: (fontSize: number) => {
    if (fontSize > 20) {
      return -0.5;
    }
    if (fontSize < 12) {
      return 0.5;
    }
    return 0;
  },
};

// 🎨 PRESET TIPOGRAFICI COMUNI
export const CommonTypographyPresets = {
  // Card title
  cardTitle: {
    ...DesignTypography.styles.h5,
    ...DesignTypography.variants.primary,
  },
  // Card subtitle
  cardSubtitle: {
    ...DesignTypography.styles.body,
    ...DesignTypography.variants.secondary,
  },
  // Button text
  buttonText: {
    fontSize: scaleFont(14),
    fontWeight: BaseTypography.weights.semibold,
    fontFamily: BaseTypography.families.body,
    textAlign: 'center' as const,
  },
  // Input label
  inputLabel: {
    ...DesignTypography.styles.label,
    ...DesignTypography.variants.secondary,
  },
  // Error text
  errorText: {
    ...DesignTypography.styles.bodySmall,
    color: '#DC2626', // error color
  },
  // Success text
  successText: {
    ...DesignTypography.styles.bodySmall,
    color: '#10B981', // success color
  },
};

export default DesignTypography;
