// ===================================================================
// 🎨 DESIGN TOKENS - SEMANTIC
// ===================================================================

import { DesignColors } from './colors';
import { DesignSpacing } from './spacing';
import { DesignShadows } from './shadows';
import { DesignBorders } from './borders';
import { DesignLayout } from './layout';
import { DesignTypography } from './typography';

/**
 * Semantic Tokens - Token semantici per componenti specifici
 * Combinano i token base per creare significati semantici
 */

// Card Tokens
export const getCardTokens = () => ({
  colors: {
    background: {
      default: DesignColors.background.default,
      elevated: DesignColors.background.elevated,
    },
    border: {
      default: DesignColors.border.default,
    },
  },
  spacing: {
    padding: DesignSpacing.component.padding.md,
    margin: DesignSpacing.component.margin.sm,
  },
  shadows: {
    rest: DesignShadows.semantic.card,
    hover: DesignShadows.md,
  },
  borders: {
    radius: DesignBorders.component.card.radius,
    width: DesignBorders.component.card.width,
  },
  layout: {
    minHeight: DesignLayout.component.card.minHeight,
    maxWidth: DesignLayout.component.card.maxWidth,
  },
});

// Button Tokens
export const getButtonTokens = (
  variant: 'primary' | 'secondary' | 'outline' = 'primary'
) => {
  const baseTokens = {
    spacing: {
      padding: {
        horizontal: DesignSpacing.component.padding.md,
        vertical: DesignSpacing.component.padding.sm,
      },
    },
    borders: {
      radius: DesignBorders.component.button.radius,
      width: DesignBorders.component.button.width,
    },
    layout: {
      height: DesignLayout.component.button.height.md,
      minWidth: DesignLayout.component.button.minWidth.md,
    },
    typography: DesignTypography.scale.body.medium,
    shadows: DesignShadows.semantic.button,
  };

  switch (variant) {
    case 'primary':
      return {
        ...baseTokens,
        colors: {
          background: DesignColors.primary[500],
          text: DesignColors.text.inverse,
          border: DesignColors.primary[500],
        },
      };
    case 'secondary':
      return {
        ...baseTokens,
        colors: {
          background: DesignColors.neutral[100],
          text: DesignColors.text.primary,
          border: DesignColors.neutral[200],
        },
      };
    case 'outline':
      return {
        ...baseTokens,
        colors: {
          background: 'transparent',
          text: DesignColors.primary[500],
          border: DesignColors.primary[500],
        },
      };
    default:
      return baseTokens;
  }
};

// Text Tokens
export const getTextTokens = (
  variant: 'heading' | 'body' | 'caption' = 'body'
) => {
  switch (variant) {
    case 'heading':
      return {
        typography: DesignTypography.scale.title.large,
        colors: {
          text: DesignColors.text.primary,
        },
      };
    case 'body':
      return {
        typography: DesignTypography.scale.body.medium,
        colors: {
          text: DesignColors.text.primary,
        },
      };
    case 'caption':
      return {
        typography: DesignTypography.scale.label.medium,
        colors: {
          text: DesignColors.text.secondary,
        },
      };
    default:
      return {
        typography: DesignTypography.scale.body.medium,
        colors: {
          text: DesignColors.text.primary,
        },
      };
  }
};

// Container Tokens
export const getContainerTokens = () => ({
  spacing: {
    padding: DesignSpacing.layout.container,
    margin: DesignSpacing.layout.section,
  },
  layout: {
    maxWidth: DesignLayout.container.xl,
  },
});

// Export all semantic tokens
export const SemanticTokens = {
  getCardTokens,
  getButtonTokens,
  getTextTokens,
  getContainerTokens,
};

export default SemanticTokens;
