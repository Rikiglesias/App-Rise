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
  useWindowDimensions,
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
import {
  getPresetRuntime,
  type ContainerPreset,
  type ContainerPresetName,
} from './perfectContainerPresets';

interface PerfectContainerProps extends Omit<ViewProps, 'style'> {
  /** Preset per layout comuni */
  preset?: ContainerPresetName;

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
  // Iscritto alla finestra: le misure qui sotto (`scale*`) leggono quella di adesso, anche quando
  // il genitore è memorizzato e non si ridisegna (C54 del contratto android-play).
  useWindowDimensions();

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
