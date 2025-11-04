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
import {
  scale,
  scaleSpacing,
  scaleTouch,
} from '../../shared/constants/perfectScale';
import {
  getPerfectShadow,
  type ShadowType,
} from '../../shared/constants/perfectShadow';
import { useUniversalTheme } from '../../shared/theme/UniversalTheme';

type ContainerPreset = {
  padding?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  backgroundColor?: 'primary' | 'secondary' | 'card' | 'modal' | 'transparent';
  flex?: number;
  borderRadius?: number;
  shadow?: ShadowType | boolean;
  marginHorizontal?: number;
  marginVertical?: number;
};

interface PerfectContainerProps extends Omit<ViewProps, 'style'> {
  /** Preset per layout comuni */
  preset?: 'page' | 'card' | 'section' | 'modal' | 'header' | 'footer';

  /** Padding interno (riferimento iPhone 15) */
  padding?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;

  /** Margin esterno (riferimento iPhone 15) */
  margin?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
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

// Preset calcolati a runtime (evita valori scalati all'import)
const getPresetRuntime = (
  preset: NonNullable<PerfectContainerProps['preset']>
): ContainerPreset => {
  switch (preset) {
    case 'page':
      return {
        padding: scaleSpacing(20),
        backgroundColor: 'primary' as const,
        flex: 1,
      };
    case 'card':
      return {
        padding: scaleSpacing(16),
        backgroundColor: 'card' as const,
        borderRadius: scale(12),
        shadow: 'light' as const,
      };
    case 'section':
      return {
        padding: scaleSpacing(16),
        marginVertical: scale(8),
        backgroundColor: 'transparent' as const,
      };
    case 'modal':
      return {
        padding: scaleSpacing(24),
        backgroundColor: 'modal' as const,
        borderRadius: scale(16),
        shadow: 'strong' as const,
        marginHorizontal: scaleSpacing(20),
      };
    case 'header':
      return {
        paddingHorizontal: scaleSpacing(20),
        paddingVertical: scaleSpacing(12),
        backgroundColor: 'primary' as const,
      };
    case 'footer':
      return {
        paddingHorizontal: scaleSpacing(20),
        paddingVertical: scaleSpacing(16),
        backgroundColor: 'secondary' as const,
      };
  }
};

export const PerfectContainer: React.FC<PerfectContainerProps> = ({
  preset,
  padding,
  paddingHorizontal,
  paddingVertical,
  margin,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
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

  // Risolvi preset a runtime
  const config: ContainerPreset | null = preset
    ? getPresetRuntime(preset)
    : null;

  // Dimensioni (device-aware)
  const finalPadding =
    padding !== undefined ? scaleSpacing(padding) : undefined;
  const finalPaddingH = (() => {
    if (paddingHorizontal !== undefined) return scaleSpacing(paddingHorizontal);
    if (config?.padding !== undefined) return config.padding;
    return undefined;
  })();
  const finalPaddingV = (() => {
    if (paddingVertical !== undefined) return scaleSpacing(paddingVertical);
    if (config?.padding !== undefined) return config.padding;
    return undefined;
  })();

  const finalMargin = margin !== undefined ? scaleSpacing(margin) : undefined;
  const finalMarginTop =
    marginTop !== undefined ? scaleSpacing(marginTop) : undefined;
  const finalMarginBottom =
    marginBottom !== undefined ? scaleSpacing(marginBottom) : undefined;
  const finalMarginLeft =
    marginLeft !== undefined ? scaleSpacing(marginLeft) : undefined;
  const finalMarginRight =
    marginRight !== undefined ? scaleSpacing(marginRight) : undefined;
  const finalMarginH = (() => {
    if (marginHorizontal !== undefined) return scaleSpacing(marginHorizontal);
    if (config?.marginHorizontal !== undefined) return config.marginHorizontal;
    return undefined;
  })();
  const finalMarginV = (() => {
    if (marginVertical !== undefined) return scaleSpacing(marginVertical);
    if (config?.marginVertical !== undefined) return config.marginVertical;
    return undefined;
  })();

  // Width/Height
  const finalWidth = typeof width === 'number' ? scale(width) : width;
  const finalHeight = height ? scaleTouch(height) : undefined;
  const finalBorderRadius = (() => {
    if (borderRadius !== undefined) return scale(borderRadius);
    if (config?.borderRadius !== undefined) return config.borderRadius;
    return undefined;
  })();
  const finalGap = gap ? scale(gap) : undefined;

  // Background
  const finalBackgroundColor = (() => {
    const bgKey = backgroundColor ?? config?.backgroundColor;
    if (!bgKey || bgKey === 'transparent') return 'transparent';
    return colors[bgKey as keyof typeof colors];
  })();

  // Shadow
  const finalShadow = ((): ShadowType | boolean | undefined => {
    if (shadow !== undefined) return shadow;
    if (config?.shadow !== undefined) return config.shadow;
    return undefined;
  })();
  const shadowStyle = (() => {
    if (finalShadow && typeof finalShadow === 'string') {
      return getPerfectShadow(finalShadow as ShadowType);
    }
    if (finalShadow === true) {
      return getPerfectShadow('medium');
    }
    return {};
  })();

  // Compose
  const mergedStyle = Array.isArray(style) ? StyleSheet.flatten(style) : style;
  const containerStyle: ViewStyle = {
    ...(config?.flex !== undefined && { flex: config.flex }),
    ...(flex && { flex }),
    ...(flexDirection && { flexDirection }),
    ...(justifyContent && { justifyContent }),
    ...(alignItems && { alignItems }),
    ...(finalGap && { gap: finalGap }),
    ...(finalWidth && { width: finalWidth as DimensionValue }),
    ...(finalHeight && { height: finalHeight }),
    ...(finalPadding && { padding: finalPadding }),
    ...(finalPaddingH && { paddingHorizontal: finalPaddingH }),
    ...(finalPaddingV && { paddingVertical: finalPaddingV }),
    ...(finalMargin && { margin: finalMargin }),
    ...(finalMarginTop && { marginTop: finalMarginTop }),
    ...(finalMarginBottom && { marginBottom: finalMarginBottom }),
    ...(finalMarginLeft && { marginLeft: finalMarginLeft }),
    ...(finalMarginRight && { marginRight: finalMarginRight }),
    ...(finalMarginH && { marginHorizontal: finalMarginH }),
    ...(finalMarginV && { marginVertical: finalMarginV }),
    ...(finalBackgroundColor !== 'transparent' && {
      backgroundColor: finalBackgroundColor,
    }),
    ...(finalBorderRadius && { borderRadius: finalBorderRadius }),
    ...shadowStyle,
    ...(mergedStyle ?? {}),
  };

  return (
    <View style={containerStyle} {...props}>
      {children}
    </View>
  );
};

// Shortcuts
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
