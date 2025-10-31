// ===================================================================
// 🎨 DESIGN SYSTEM UTILS - TOKEN HELPERS
// ===================================================================

import { DesignColors } from '../tokens/colors';
import { DesignSpacing } from '../tokens/spacing';
import { DesignBorders } from '../tokens/borders';
import { scale as scaleSize } from '../../shared/constants/perfectScale';

/**
 * Token Helpers - Utility per lavorare con i design tokens
 * Funzioni helper per composizione e manipolazione token
 */

// Helper per spacing responsivo
export const getResponsiveSpacing = (
  baseSpacing: number,
  scaleFactor: number = 1
) => {
  return scaleSize(baseSpacing * scaleFactor);
};

// Helper per colori con opacità
export const getColorWithOpacity = (color: string, opacity: number) => {
  // Se il colore è già in formato rgba, estrai i valori RGB
  if (color.startsWith('rgba')) {
    const rgbaMatch = color.match(
      /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/
    );
    if (rgbaMatch) {
      const [, r, g, b] = rgbaMatch;
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
  }

  // Se il colore è in formato hex, convertilo in rgba
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // Fallback: ritorna il colore originale
  return color;
};

// Helper per combinare ombre
export const combineShadows = (...shadows: Record<string, unknown>[]) => {
  return shadows.reduce(
    (combined, shadow) => {
      return {
        ...combined,
        ...shadow,
        elevation: Math.max(
          (combined.elevation as number) || 0,
          (shadow.elevation as number) || 0
        ),
      };
    },
    {} as Record<string, unknown>
  );
};

// Helper per spacing composto
export const getSpacingComposition = ({
  top = 0,
  right = 0,
  bottom = 0,
  left = 0,
}: {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}) => {
  const spacingMap = DesignSpacing as unknown as Record<string, number>;
  const lookup = (value: number): number => spacingMap[String(value)] ?? value;

  return {
    paddingTop: lookup(top),
    paddingRight: lookup(right),
    paddingBottom: lookup(bottom),
    paddingLeft: lookup(left),
  };
};

// Helper per bordi composti
export const getBorderComposition = ({
  width = 1,
  style = 'solid',
  color = DesignColors.border.default,
  radius = 0,
}: {
  width?: number;
  style?: string;
  color?: string;
  radius?: number;
}) => {
  return {
    borderWidth: width,
    borderStyle: style,
    borderColor: color,
    borderRadius:
      typeof radius === 'string'
        ? DesignBorders.radius[radius as keyof typeof DesignBorders.radius] || 0
        : radius,
  };
};

// Helper per tipografia responsiva
export const getResponsiveTypography = (
  baseSize: number,
  scale: number = 1
) => {
  return {
    fontSize: scaleSize(baseSize * scale),
    lineHeight: scaleSize(baseSize * scale * 1.4),
  };
};

// Helper per layout responsive
export const getResponsiveLayout = ({
  width,
  height,
  maxWidth,
  maxHeight,
}: {
  width?: number;
  height?: number;
  maxWidth?: number;
  maxHeight?: number;
}) => {
  return {
    width: width ? scaleSize(width) : undefined,
    height: height ? scaleSize(height) : undefined,
    maxWidth: maxWidth ? scaleSize(maxWidth) : undefined,
    maxHeight: maxHeight ? scaleSize(maxHeight) : undefined,
  };
};

// Helper per animazioni con durata responsiva
export const getResponsiveAnimation = (
  baseDuration: number,
  scale: number = 1
) => {
  return {
    duration: Math.max(100, baseDuration * scale), // Minimo 100ms
    useNativeDriver: true,
  };
};

// Helper per tema scuro (placeholder)
export const getDarkModeVariant = (lightColor: string) => {
  // Placeholder per future implementazioni tema scuro
  return lightColor;
};

// Export di tutti gli helper
export const TokenHelpers = {
  getResponsiveSpacing,
  getColorWithOpacity,
  combineShadows,
  getSpacingComposition,
  getBorderComposition,
  getResponsiveTypography,
  getResponsiveLayout,
  getResponsiveAnimation,
  getDarkModeVariant,
};

export default TokenHelpers;
