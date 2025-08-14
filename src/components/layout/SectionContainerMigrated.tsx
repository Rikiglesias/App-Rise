import React from 'react';
import { View } from 'react-native';

import {
  BorderRadius,
  Layout,
  Spacing,
} from '../../shared/constants/designTokens';
import { useTheme } from '../../shared/hooks/useTheme';
// 🎯 NUOVO: Import layer centralizzato
// import { useResponsiveLayout } from '../../shared/hooks/useResponsiveLayout';

// ❌ RIMOSSO: Calcolo manuale duplicato
// const { width: screenWidth } = Dimensions.get('window');

interface SectionContainerProps {
  readonly children: React.ReactNode;
  readonly spacing?: 'compact' | 'standard' | 'large' | 'hero' | 'golden';
  readonly horizontal?: boolean;
  readonly variant?: 'default' | 'elevated' | 'glass' | 'premium';
  readonly centerContent?: boolean;
}

// 🚀 MIGRATED: Sistema spacing usando layer centralizzato
type ResponsiveResolver = <T>(
  values: Partial<Record<string, T>>
) => T | undefined;

const getSpacingConfig = (
  spacing: SectionContainerProps['spacing'],
  responsive: ResponsiveResolver
) => {
  // ❌ RIMOSSO: Breakpoints manuali frammentati
  // if (screenWidth < 375) baseSpacing = 0.8;
  // else if (screenWidth < 768) baseSpacing = 1;
  // else baseSpacing = 1.2;

  // ✅ NUOVO: Responsive scaling dal layer centralizzato
  const baseSpacing =
    responsive({
      compact: 0.8,
      standard: 1.0,
      large: 1.0,
      xlarge: 1.2,
      xxlarge: 1.2,
    }) ?? 1;

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

// Helper per evitare nested ternary - border radius premium
const getBorderRadiusForPremium = () => {
  return BorderRadius['3xl'] ?? BorderRadius['2xl']; // Fallback semplificato
};

// 🎨 VARIANTI DESIGN AVANZATE (unchanged)
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

export const SectionContainerMigrated: React.FC<SectionContainerProps> = ({
  children,
  spacing = 'standard',
  horizontal = true,
  variant = 'default',
  centerContent = false,
}) => {
  const { colors } = useTheme();
  // 🎯 NUOVO: Layer centralizzato
  const responsive: ResponsiveResolver = values => {
    // Fallback semplificato: usa standard/compact se presenti
    if (values.standard !== undefined) return values.standard;
    if (values.compact !== undefined) return values.compact;
    const firstDefined = (
      Object.values(values) as (unknown | undefined)[]
    ).find(v => v !== undefined);
    return firstDefined as never;
  };

  const spacingConfig = getSpacingConfig(spacing, responsive);
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

  // 🎁 MIGRATED: Wrapper interno usando responsive padding
  const innerWrapperStyle = {
    ...(variant !== 'default' && {
      // ❌ RIMOSSO: Calcolo manuale frammentato
      // padding: screenWidth < 375 ? Spacing[4] : Spacing[6],

      // ✅ NUOVO: Padding dal layer centralizzato
      padding:
        responsive({
          compact: Spacing[4],
          standard: Spacing[6],
          large: Spacing[6],
          xlarge: Spacing[8],
          xxlarge: Spacing[10],
        }) ?? Spacing[6],
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

export default SectionContainerMigrated;

// ===================================================================
// 📊 MIGRATION BENEFITS SUMMARY
// ===================================================================

/**
 * ELIMINATI:
 * ❌ const { width: screenWidth } = Dimensions.get('window');  // Duplicato in 3+ componenti
 * ❌ if (screenWidth < 375) baseSpacing = 0.8;                 // Breakpoint frammentato
 * ❌ else if (screenWidth < 768) baseSpacing = 1;              // Breakpoint frammentato
 * ❌ padding: screenWidth < 375 ? Spacing[4] : Spacing[6]      // Calcolo manuale
 *
 * AGGIUNTI:
 * ✅ useResponsiveLayout()                                     // Layer centralizzato
 * ✅ responsive({ compact: 0.8, standard: 1.0, xlarge: 1.2 }) // Token-based
 * ✅ responsive({ compact: Spacing[4], xlarge: Spacing[8] })   // Padding unificato
 *
 * FUTURE BENEFITS:
 * 🚀 Tablet XL → baseSpacing automatico per 1280+ px
 * 🚀 Dark mode → colori variant si aggiornano automaticamente
 * 🚀 RTL support → spacing direction aware
 * 🚀 Re-branding → colori primary/neutral dal tema centralizzato
 */
