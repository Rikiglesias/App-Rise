// ===================================================================
// RESPONSIVE TEXT COMPONENT - MIGRAZIONE AUTOMATICA
// Wrapper che converte automaticamente font hardcoded a responsive
// ===================================================================

import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import {
  migrateFontSize,
  getResponsiveValue,
} from '../../shared/utils/responsiveMigration';
import { Typography } from '../../shared/constants/designTokens';
import { logDebug } from '../../shared/utils/logger';

// ===================================================================
// RESPONSIVE TEXT INTERFACE
// ===================================================================

interface ResponsiveTextProps extends TextProps {
  // Compatibilità completa con Text standard
  children: React.ReactNode;
  style?: TextStyle | TextStyle[] | undefined;

  // Responsive overrides
  responsiveFontSize?: number; // Override automatico font size
  disableResponsive?: boolean; // Disabilita responsive per questo componente
  debugMode?: boolean; // Mostra info migrazione in console

  // Typography system shortcuts
  variant?: 'heading' | 'body' | 'caption' | 'label';
  size?: keyof typeof Typography.sizes;
  weight?: keyof typeof Typography.weights;
}

// ===================================================================
// RESPONSIVE TEXT COMPONENT
// ===================================================================

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  style,
  responsiveFontSize,
  disableResponsive = false,
  debugMode = false,
  variant,
  size,
  weight,
  ...textProps
}) => {
  // Estrai style come array per processamento
  const styleArray = React.useMemo(() => {
    if (!style) return [];
    return Array.isArray(style) ? style : [style];
  }, [style]);

  // Processa ogni style object per migrare font sizes
  const responsiveStyles = React.useMemo(() => {
    if (disableResponsive) return styleArray;

    return styleArray.map(styleObj => {
      if (!styleObj || typeof styleObj !== 'object') return styleObj;

      const processedStyle = { ...styleObj };

      // Migra fontSize se presente
      if (
        'fontSize' in processedStyle &&
        typeof processedStyle.fontSize === 'number'
      ) {
        const originalFontSize = processedStyle.fontSize;
        const migratedFontSize = migrateFontSize(originalFontSize);
        processedStyle.fontSize = getResponsiveValue(migratedFontSize);

        if (debugMode && __DEV__) {
          logDebug(
            'ResponsiveText',
            `fontSize ${originalFontSize} → ${processedStyle.fontSize}`
          );
        }
      }

      // Migra lineHeight se presente e numerico
      if (
        'lineHeight' in processedStyle &&
        typeof processedStyle.lineHeight === 'number'
      ) {
        const originalLineHeight = processedStyle.lineHeight;
        const migratedLineHeight = migrateFontSize(originalLineHeight);
        processedStyle.lineHeight = getResponsiveValue(migratedLineHeight);

        if (debugMode && __DEV__) {
          logDebug(
            'ResponsiveText',
            `lineHeight ${originalLineHeight} → ${processedStyle.lineHeight}`
          );
        }
      }

      return processedStyle;
    });
  }, [styleArray, disableResponsive, debugMode]);

  // Typography system integration
  const typographyStyle = React.useMemo(() => {
    const baseStyle: TextStyle = {};

    // Apply variant styles
    if (variant) {
      switch (variant) {
        case 'heading':
          baseStyle.fontFamily = Typography.families.heading;
          baseStyle.fontWeight = Typography.weights.bold;
          break;
        case 'body':
          baseStyle.fontFamily = Typography.families.body;
          baseStyle.fontWeight = Typography.weights.regular;
          break;
        case 'caption':
          baseStyle.fontFamily = Typography.families.body;
          baseStyle.fontWeight = Typography.weights.regular;
          baseStyle.fontSize = Typography.sizes.sm;
          break;
        case 'label':
          baseStyle.fontFamily = Typography.families.body;
          baseStyle.fontWeight = Typography.weights.medium;
          baseStyle.fontSize = Typography.sizes.xs;
          break;
      }
    }

    // Apply size if specified
    if (size) {
      baseStyle.fontSize = Typography.sizes[size];
    }

    // Apply weight if specified
    if (weight) {
      baseStyle.fontWeight = Typography.weights[weight];
    }

    // Apply responsive fontSize override
    if (responsiveFontSize) {
      if (disableResponsive) {
        baseStyle.fontSize = responsiveFontSize;
      } else {
        const migratedSize = migrateFontSize(responsiveFontSize);
        baseStyle.fontSize = getResponsiveValue(migratedSize);

        if (debugMode && __DEV__) {
          logDebug(
            'ResponsiveText',
            `responsiveFontSize ${responsiveFontSize} → ${baseStyle.fontSize}`
          );
        }
      }
    }

    // Migrate fontSize from typography system if present
    if (baseStyle.fontSize && !disableResponsive) {
      const originalSize = baseStyle.fontSize as number;
      const migratedSize = migrateFontSize(originalSize);
      baseStyle.fontSize = getResponsiveValue(migratedSize);
    }

    return baseStyle;
  }, [variant, size, weight, responsiveFontSize, disableResponsive, debugMode]);

  // Combine all styles
  const finalStyles = [typographyStyle, ...responsiveStyles];

  return (
    <Text style={finalStyles} {...textProps}>
      {children}
    </Text>
  );
};

// ===================================================================
// SHORTCUTS PER COMMON USE CASES
// ===================================================================

export const ResponsiveHeading: React.FC<
  Omit<ResponsiveTextProps, 'variant'>
> = props => <ResponsiveText variant="heading" {...props} />;

export const ResponsiveBody: React.FC<
  Omit<ResponsiveTextProps, 'variant'>
> = props => <ResponsiveText variant="body" {...props} />;

export const ResponsiveCaption: React.FC<
  Omit<ResponsiveTextProps, 'variant'>
> = props => <ResponsiveText variant="caption" {...props} />;

export const ResponsiveLabel: React.FC<
  Omit<ResponsiveTextProps, 'variant'>
> = props => <ResponsiveText variant="label" {...props} />;

// ===================================================================
// COMPATIBILITY ALIAS
// ===================================================================

// Alias per compatibilità con codice esistente
export { ResponsiveText as RText };
export { ResponsiveHeading as RHeading };
export { ResponsiveBody as RBody };
export { ResponsiveCaption as RCaption };
export { ResponsiveLabel as RLabel };

export default ResponsiveText;
