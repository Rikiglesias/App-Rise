/**
 * PERFECT CONTAINER - Sistema Container Identici iPhone 15
 * 
 * GARANTISCE:
 * - Layout identico proporzionalmente su tutti i dispositivi
 * - Spacing e padding sempre proporzionali
 * - Preset per casi comuni (page, card, section)
 * - Dark mode automatico
 */

import React from 'react';
import { View, ViewProps, ViewStyle, DimensionValue } from 'react-native';
import { universal } from '../../shared/utils/UniversalMillimetricSystem';
import { useUniversalTheme } from '../../shared/theme/UniversalTheme';

interface PerfectContainerProps extends Omit<ViewProps, 'style'> {
  /** Preset per layout comuni */
  preset?: 'page' | 'card' | 'section' | 'modal' | 'header' | 'footer';
  
  /** Padding interno (riferimento iPhone 15) */
  padding?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  
  /** Margin esterno (riferimento iPhone 15) */
  margin?: number;
  marginHorizontal?: number;
  marginVertical?: number;
  
  /** Larghezza custom (riferimento iPhone 15) */
  width?: number | string;
  
  /** Altezza custom (riferimento iPhone 15) */
  height?: number;
  
  /** Background color automatico (dark mode) */
  backgroundColor?: 'primary' | 'secondary' | 'card' | 'modal' | 'transparent';
  
  /** Border radius */
  borderRadius?: number;
  
  /** Ombra */
  shadow?: boolean | 'light' | 'medium' | 'strong';
  
  /** Flex properties */
  flex?: number;
  flexDirection?: 'row' | 'column';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  
  /** Gap tra children (se flexDirection è impostato) */
  gap?: number;
  
  /** Stile custom */
  style?: ViewStyle;
}

// 🎨 PRESET CONTAINER (riferimento iPhone 15)
const CONTAINER_PRESETS = {
  page: {
    padding: 20,
    backgroundColor: 'primary' as const,
    flex: 1
  },
  card: {
    padding: 16,
    backgroundColor: 'card' as const,
    borderRadius: 12,
    shadow: 'light' as const
  },
  section: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: 'transparent' as const
  },
  modal: {
    padding: 24,
    backgroundColor: 'modal' as const,
    borderRadius: 16,
    shadow: 'strong' as const,
    marginHorizontal: 20
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'primary' as const
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'secondary' as const
  }
} as const;

// 🎭 SHADOW STYLES
const SHADOW_STYLES = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  strong: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  }
} as const;

export const PerfectContainer: React.FC<PerfectContainerProps> = ({
  preset,
  padding,
  paddingHorizontal,
  paddingVertical,
  margin,
  marginHorizontal,
  marginVertical,
  width,
  height,
  backgroundColor,
  borderRadius,
  shadow,
  flex,
  flexDirection,
  justifyContent,
  alignItems,
  gap,
  style,
  children,
  ...props
}) => {
  const { colors } = useUniversalTheme();
  
  // 🎯 RISOLVI PRESET O VALORI CUSTOM
  const config = preset ? CONTAINER_PRESETS[preset] : null;
  
  // 📏 CALCOLA DIMENSIONI MILLIMETRICHE
  const finalPadding = padding !== undefined ? universal.spacing(padding) : undefined;
  const finalPaddingH = (() => {
    if (paddingHorizontal !== undefined) return universal.spacing(paddingHorizontal);
    if (config && 'padding' in config) return universal.spacing(config.padding);
    return undefined;
  })();
  const finalPaddingV = (() => {
    if (paddingVertical !== undefined) return universal.spacing(paddingVertical);
    if (config && 'padding' in config) return universal.spacing(config.padding);
    return undefined;
  })();
    
  const finalMargin = margin !== undefined ? universal.spacing(margin) : undefined;
  const finalMarginH = marginHorizontal !== undefined 
    ? universal.spacing(marginHorizontal) 
    : undefined;
  const finalMarginV = marginVertical !== undefined 
    ? universal.spacing(marginVertical) 
    : undefined;
    
  const finalWidth = typeof width === 'number' ? universal.width(width) : width;
  const finalHeight = height ? universal.height(height) : undefined;
  const finalBorderRadius = (() => {
    if (borderRadius !== undefined) return universal.spacing(borderRadius);
    if (config && 'borderRadius' in config) return universal.spacing(config.borderRadius);
    return undefined;
  })();
  const finalGap = gap ? universal.spacing(gap) : undefined;

  // 🎨 RISOLVI COLORI AUTOMATICI
  const finalBackgroundColor = (() => {
    const bgKey = backgroundColor ?? config?.backgroundColor;
    if (!bgKey || bgKey === 'transparent') return 'transparent';
    return colors[bgKey as keyof typeof colors];
  })();

  // 🎭 RISOLVI OMBRA
  const finalShadow = shadow ?? (config && 'shadow' in config ? config.shadow : undefined);
  const shadowStyle = (() => {
    if (finalShadow && typeof finalShadow === 'string') {
      return SHADOW_STYLES[finalShadow as keyof typeof SHADOW_STYLES];
    }
    if (finalShadow === true) {
      return SHADOW_STYLES.medium;
    }
    return {};
  })();

  // 🏗️ COMPONI STILE FINALE
  const containerStyle: ViewStyle = {
    // Preset properties
    ...((config && 'flex' in config) && { flex: config.flex }),
    
    // Layout properties
    ...(flex && { flex }),
    ...(flexDirection && { flexDirection }),
    ...(justifyContent && { justifyContent }),
    ...(alignItems && { alignItems }),
    ...(finalGap && { gap: finalGap }),
    
    // Dimensions
    ...(finalWidth && { width: finalWidth as DimensionValue }),
    ...(finalHeight && { height: finalHeight }),
    
    // Spacing
    ...(finalPadding && { padding: finalPadding }),
    ...(finalPaddingH && { paddingHorizontal: finalPaddingH }),
    ...(finalPaddingV && { paddingVertical: finalPaddingV }),
    ...(finalMargin && { margin: finalMargin }),
    ...(finalMarginH && { marginHorizontal: finalMarginH }),
    ...(finalMarginV && { marginVertical: finalMarginV }),
    
    // Appearance
    ...(finalBackgroundColor !== 'transparent' && { backgroundColor: finalBackgroundColor }),
    ...(finalBorderRadius && { borderRadius: finalBorderRadius }),
    
    // Shadow
    ...shadowStyle,
    
    // Custom style override
    ...style
  };

  // Debug info removed for production

  return (
    <View style={containerStyle} {...props}>
      {children}
    </View>
  );
};

// 🎯 HELPER SHORTCUTS PER PRESET
export const PageContainer = (props: Omit<PerfectContainerProps, 'preset'>) => (
  <PerfectContainer {...props} preset="page" />
);

export const CardContainer = (props: Omit<PerfectContainerProps, 'preset'>) => (
  <PerfectContainer {...props} preset="card" />
);

export const SectionContainer = (props: Omit<PerfectContainerProps, 'preset'>) => (
  <PerfectContainer {...props} preset="section" />
);

export const ModalContainer = (props: Omit<PerfectContainerProps, 'preset'>) => (
  <PerfectContainer {...props} preset="modal" />
);

export const HeaderContainer = (props: Omit<PerfectContainerProps, 'preset'>) => (
  <PerfectContainer {...props} preset="header" />
);

export const FooterContainer = (props: Omit<PerfectContainerProps, 'preset'>) => (
  <PerfectContainer {...props} preset="footer" />
); 