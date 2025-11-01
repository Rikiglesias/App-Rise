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
import {
  View,
  ViewProps,
  ViewStyle,
  DimensionValue,
  StyleSheet,
} from 'react-native';
import { scale } from '../../shared/constants/perfectScale';
import {
  getPerfectShadow,
  type ShadowType,
} from '../../shared/constants/perfectShadow';
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
  justifyContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';

  /** Gap tra children (se flexDirection è impostato) */
  gap?: number;

  /** Stile custom */
  style?: ViewStyle | ViewStyle[];
}

// 🎨 PRESET CONTAINER (riferimento iPhone 15)
const CONTAINER_PRESETS = {
  page: {
    padding: scale(20),
    backgroundColor: 'primary' as const,
    flex: 1,
  },
  card: {
    padding: scale(16),
    backgroundColor: 'card' as const,
    borderRadius: scale(12),
    shadow: 'light' as const,
  },
  section: {
    padding: scale(16),
    marginVertical: scale(8),
    backgroundColor: 'transparent' as const,
  },
  modal: {
    padding: scale(24),
    backgroundColor: 'modal' as const,
    borderRadius: scale(16),
    shadow: 'strong' as const,
    marginHorizontal: scale(20),
  },
  header: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(12),
    backgroundColor: 'primary' as const,
  },
  footer: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(16),
    backgroundColor: 'secondary' as const,
  },
} as const;

// 🎭 SHADOW STYLES - Ora gestito da PerfectShadow system (scalato automaticamente)

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
  const finalPadding = padding !== undefined ? scale(padding) : undefined;
  const finalPaddingH = (() => {
    if (paddingHorizontal !== undefined) return scale(paddingHorizontal);
    if (config && 'padding' in config) return config.padding;
    return undefined;
  })();
  const finalPaddingV = (() => {
    if (paddingVertical !== undefined) return scale(paddingVertical);
    if (config && 'padding' in config) return config.padding;
    return undefined;
  })();

  const finalMargin = margin !== undefined ? scale(margin) : undefined;
  const finalMarginH = (() => {
    if (marginHorizontal !== undefined) return scale(marginHorizontal);
    if (config && 'marginHorizontal' in config) return config.marginHorizontal;
    return undefined;
  })();
  const finalMarginV = (() => {
    if (marginVertical !== undefined) return scale(marginVertical);
    if (config && 'marginVertical' in config) return config.marginVertical;
    return undefined;
  })();

  const finalWidth = typeof width === 'number' ? scale(width) : width;
  const finalHeight = height ? scale(height) : undefined;
  const finalBorderRadius = (() => {
    if (borderRadius !== undefined) return scale(borderRadius);
    if (config && 'borderRadius' in config) return config.borderRadius;
    return undefined;
  })();
  const finalGap = gap ? scale(gap) : undefined;

  // 🎨 RISOLVI COLORI AUTOMATICI
  const finalBackgroundColor = (() => {
    const bgKey = backgroundColor ?? config?.backgroundColor;
    if (!bgKey || bgKey === 'transparent') return 'transparent';
    return colors[bgKey as keyof typeof colors];
  })();

  // 🎭 RISOLVI OMBRA (con Perfect Shadow - scalato automaticamente)
  const finalShadow =
    shadow ?? (config && 'shadow' in config ? config.shadow : undefined);
  const shadowStyle = (() => {
    if (finalShadow && typeof finalShadow === 'string') {
      return getPerfectShadow(finalShadow as ShadowType);
    }
    if (finalShadow === true) {
      return getPerfectShadow('medium');
    }
    return {};
  })();

  // 🏗️ COMPONI STILE FINALE
  const mergedStyle = Array.isArray(style) ? StyleSheet.flatten(style) : style;
  const containerStyle: ViewStyle = {
    // Preset properties
    ...(config && 'flex' in config && { flex: config.flex }),

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
    ...(finalBackgroundColor !== 'transparent' && {
      backgroundColor: finalBackgroundColor,
    }),
    ...(finalBorderRadius && { borderRadius: finalBorderRadius }),

    // Shadow
    ...shadowStyle,

    // Custom style override (supports style arrays)
    ...(mergedStyle ?? {}),
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

export const PerfectSection = (
  props: Omit<PerfectContainerProps, 'preset'>
) => <PerfectContainer {...props} preset="section" />;

export const ModalContainer = (
  props: Omit<PerfectContainerProps, 'preset'>
) => <PerfectContainer {...props} preset="modal" />;

export const HeaderContainer = (
  props: Omit<PerfectContainerProps, 'preset'>
) => <PerfectContainer {...props} preset="header" />;

export const FooterContainer = (
  props: Omit<PerfectContainerProps, 'preset'>
) => <PerfectContainer {...props} preset="footer" />;
