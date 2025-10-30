import React from 'react';
import { View } from 'react-native';

import {
  BorderRadius,
  Spacing,
} from '../../shared/constants/designTokens';
import { useTheme } from '../../shared/hooks/useTheme';

interface SectionContainerProps {
  readonly children: React.ReactNode;
  readonly spacing?: 'compact' | 'standard' | 'large' | 'hero' | 'golden';
  readonly horizontal?: boolean;
  readonly variant?: 'default' | 'elevated' | 'glass' | 'premium';
  readonly centerContent?: boolean;
}

// 🚀 PERFECT SYSTEM SPACING - iPhone 15 reference values
const getSpacingConfig = (spacing: SectionContainerProps['spacing']) => {
  switch (spacing) {
    case 'compact':
      return {
        vertical: Spacing[2], // XS spacing
        horizontal: Spacing[3],
      };
    case 'standard':
      return {
        vertical: Spacing[4], // SM spacing
        horizontal: Spacing[4],
      };
    case 'large':
      return {
        vertical: Spacing[6], // MD spacing
        horizontal: Spacing[6],
      };
    case 'hero':
      return {
        vertical: Spacing[8], // LG spacing
        horizontal: Spacing[8],
      };
    case 'golden':
      return {
        vertical: Spacing[10], // XL spacing
        horizontal: Spacing[4], // SM spacing
      };
    default:
      return {
        vertical: Spacing[4], // SM spacing
        horizontal: Spacing[4],
      };
  }
};

// Helper per evitare nested ternary - border radius premium
const getBorderRadiusForPremium = () => {
  return BorderRadius['3xl'] || BorderRadius['2xl']; // Fallback semplificato
};

// 🎨 VARIANTI DESIGN AVANZATE
const getVariantStyles = (
  variant: SectionContainerProps['variant'],
  colors: ReturnType<typeof useTheme>['colors']
) => {
  switch (variant) {
    case 'elevated':
      return {
        backgroundColor: colors.neutral[0],
        borderRadius: BorderRadius.xl,
        shadowColor: colors.primary[200],
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
        borderWidth: 1,
        borderColor: colors.neutral[200], // Elegant border
      };

    case 'glass':
      return {
        backgroundColor: colors.neutral[0] + 'E6', // 90% opacity
        borderRadius: BorderRadius['2xl'],
        borderWidth: 1,
        borderColor: colors.neutral[200] + '80', // 50% opacity
        shadowColor: colors.primary[300],
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 6,
      };

    case 'premium':
      return {
        backgroundColor: colors.neutral[0],
        borderRadius: getBorderRadiusForPremium(),
        borderLeftWidth: 4,
        borderLeftColor: colors.primary[500],
        shadowColor: colors.primary[400],
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 8,
      };

    default:
      return {};
  }
};

// Helper per evitare nested ternary
const getBorderRadiusForVariant = (
  styles: ReturnType<typeof getVariantStyles>
) => {
  if ('borderRadius' in styles) {
    return styles.borderRadius;
  }
  return BorderRadius.xl;
};

export const SectionContainer: React.FC<SectionContainerProps> = ({
  children,
  spacing = 'standard',
  horizontal = true,
  variant = 'default',
  centerContent = false,
}) => {
  const { colors } = useTheme();

  const spacingConfig = getSpacingConfig(spacing);
  const variantStyles = getVariantStyles(variant, colors);

  // 📐 STILI FINALI COMPOSTI
  const containerStyle = {
    marginTop: spacingConfig.vertical,
    marginBottom: spacingConfig.vertical,
    ...(horizontal && {
      marginHorizontal: spacingConfig.horizontal,
    }),
    ...(centerContent && {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    }),
    ...variantStyles,
  };

  // 🎁 WRAPPER INTERNO PER PADDING
  const innerWrapperStyle = {
    ...(variant !== 'default' && {
      padding: 393 < 375 ? Spacing[4] : Spacing[6], // iPhone 15 width: 393 > 375, so always Spacing[6]
      borderRadius: getBorderRadiusForVariant(variantStyles),
      overflow: 'hidden' as const,
    }),
  };

  return (
    <View style={containerStyle}>
      {variant === 'default' ? (
        children
      ) : (
        <View style={innerWrapperStyle}>{children}</View>
      )}
    </View>
  );
};

export default SectionContainer;
