import React from 'react';
import { Dimensions, View } from 'react-native';
import { BorderRadius, Layout, Spacing } from '../constants/designTokens';
import { useTheme } from '../hooks/useTheme';

const { width: screenWidth } = Dimensions.get('window');

interface SectionContainerProps {
  children: React.ReactNode;
  spacing?: 'compact' | 'standard' | 'large' | 'hero' | 'golden';
  horizontal?: boolean;
  variant?: 'default' | 'elevated' | 'glass' | 'premium';
  centerContent?: boolean;
}

export const SectionContainer: React.FC<SectionContainerProps> = ({
  children,
  spacing = 'standard',
  horizontal = true,
  variant = 'default',
  centerContent = false,
}) => {
  const { colors } = useTheme();

  // 🚀 SISTEMA SPACING INTELLIGENTE CON GOLDEN RATIO
  const getSpacingConfig = () => {
    // Responsive spacing basato su device e golden ratio
    const baseSpacing = screenWidth < 375 ? 0.8 : screenWidth < 768 ? 1 : 1.2;

    switch (spacing) {
      case 'compact':
        return {
          vertical: Math.round(Layout.golden.xs * baseSpacing),
          horizontal: Math.round(Spacing[3] * baseSpacing),
        };
      case 'standard':
        return {
          vertical: Math.round(Layout.golden.sm * baseSpacing),
          horizontal: Math.round(Spacing[4] * baseSpacing),
        };
      case 'large':
        return {
          vertical: Math.round(Layout.golden.md * baseSpacing),
          horizontal: Math.round(Spacing[6] * baseSpacing),
        };
      case 'hero':
        return {
          vertical: Math.round(Layout.golden.lg * baseSpacing),
          horizontal: Math.round(Spacing[8] * baseSpacing),
        };
      case 'golden':
        return {
          vertical: Math.round(Layout.golden.xl * baseSpacing),
          horizontal: Math.round(Layout.golden.sm * baseSpacing),
        };
      default:
        return {
          vertical: Layout.golden.sm,
          horizontal: Spacing[4],
        };
    }
  };

  // 🎨 VARIANTI DESIGN AVANZATE
  const getVariantStyles = () => {
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
          borderColor: colors.neutral[100],
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
          borderRadius: BorderRadius['3xl'] || BorderRadius['2xl'], // Fallback
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

  const spacingConfig = getSpacingConfig();
  const variantStyles = getVariantStyles();

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
      padding: screenWidth < 375 ? Spacing[4] : Spacing[6],
      borderRadius:
        'borderRadius' in variantStyles
          ? variantStyles.borderRadius
          : BorderRadius.xl,
      overflow: 'hidden' as const,
    }),
  };

  return (
    <View style={containerStyle}>
      {variant !== 'default' ? (
        <View style={innerWrapperStyle}>{children}</View>
      ) : (
        children
      )}
    </View>
  );
};

export default SectionContainer;
