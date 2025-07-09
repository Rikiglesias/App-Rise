/**
 * RESPONSIVE BOX - WRAPPER COMPONENT
 *
 * Elimina layout hard-coded utilizzando tema centralizzato
 * Supporta width, padding, margin responsive tramite breakpoints
 */

import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';
import {
  useResponsiveLayout,
  ResponsiveValue,
} from '../../shared/hooks/useResponsiveLayout';
import { useResponsiveDarkMode } from '../../shared/hooks/useResponsiveDarkMode';
import { ResponsiveTheme } from '../../shared/constants/responsiveTheme';

export interface ResponsiveBoxProps extends Omit<ViewProps, 'style'> {
  // Responsive width
  width?: ResponsiveValue<string | number>;

  // Responsive padding
  padding?: ResponsiveValue<number> | number;
  paddingHorizontal?: ResponsiveValue<number> | number;
  paddingVertical?: ResponsiveValue<number> | number;

  // Responsive margin
  margin?: ResponsiveValue<number> | number;
  marginHorizontal?: ResponsiveValue<number> | number;
  marginVertical?: ResponsiveValue<number> | number;

  // Preset widths (elimina hard-coding)
  preset?: 'card' | 'container' | 'modal' | 'progress' | 'divider';

  // Background color con dark mode support
  backgroundColor?: string;

  // Dark mode auto colors
  autoBackgroundColor?: 'primary' | 'secondary' | 'card' | 'modal';

  // Flex properties
  flex?: number;
  flexDirection?: 'row' | 'column';
  justifyContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch';

  // Style override
  style?: ViewStyle;

  // Children
  children?: React.ReactNode;
}

/**
 * Box component responsive con tema centralizzato
 */
export const ResponsiveBox: React.FC<ResponsiveBoxProps> = ({
  width,
  padding,
  paddingHorizontal,
  paddingVertical,
  margin,
  marginHorizontal,
  marginVertical,
  preset,
  backgroundColor,
  autoBackgroundColor,
  flex,
  flexDirection,
  justifyContent,
  alignItems,
  style,
  children,
  ...props
}) => {
  const { responsive, breakpoint } = useResponsiveLayout();
  const { backgroundColor: themeColors } = useResponsiveDarkMode();

  // Resolve responsive width
  const resolvedWidth = (() => {
    if (preset) {
      // Usa preset dal tema
      switch (preset) {
        case 'card':
          return ResponsiveTheme.layout.cardWidth[breakpoint];
        case 'container':
          return ResponsiveTheme.layout.containerWidth[breakpoint];
        case 'modal':
          return ResponsiveTheme.layout.modalWidth[breakpoint];
        case 'progress':
          return ResponsiveTheme.layout.progressWidth[breakpoint];
        case 'divider':
          return ResponsiveTheme.layout.dividerWidth[breakpoint];
        default:
          return undefined;
      }
    }

    if (width) {
      return responsive(width);
    }

    return undefined;
  })();

  // Helper function to resolve responsive values
  const resolveResponsiveValue = (
    value: ResponsiveValue<number> | number | undefined
  ) => {
    if (typeof value === 'number') return value;
    if (value) return responsive(value);
    return undefined;
  };

  // Resolve responsive padding
  const resolvedPadding = resolveResponsiveValue(padding);
  const resolvedPaddingHorizontal = resolveResponsiveValue(paddingHorizontal);
  const resolvedPaddingVertical = resolveResponsiveValue(paddingVertical);

  // Resolve responsive margin
  const resolvedMargin = resolveResponsiveValue(margin);
  const resolvedMarginHorizontal = resolveResponsiveValue(marginHorizontal);
  const resolvedMarginVertical = resolveResponsiveValue(marginVertical);

  // Resolve background color (manual override or auto dark mode)
  const resolvedBackgroundColor =
    backgroundColor ??
    (autoBackgroundColor ? themeColors[autoBackgroundColor] : undefined);

  // Compose style
  const composedStyle: ViewStyle = {
    ...(resolvedWidth && { width: resolvedWidth as never }),
    ...(resolvedPadding && { padding: resolvedPadding }),
    ...(resolvedPaddingHorizontal && {
      paddingHorizontal: resolvedPaddingHorizontal,
    }),
    ...(resolvedPaddingVertical && {
      paddingVertical: resolvedPaddingVertical,
    }),
    ...(resolvedMargin && { margin: resolvedMargin }),
    ...(resolvedMarginHorizontal && {
      marginHorizontal: resolvedMarginHorizontal,
    }),
    ...(resolvedMarginVertical && { marginVertical: resolvedMarginVertical }),
    ...(resolvedBackgroundColor && {
      backgroundColor: resolvedBackgroundColor,
    }),
    ...(flex && { flex }),
    ...(flexDirection && { flexDirection }),
    ...(justifyContent && { justifyContent }),
    ...(alignItems && { alignItems }),
    ...style,
  };

  return (
    <View style={composedStyle} {...props}>
      {children}
    </View>
  );
};

/**
 * Stack component per layout flessibile
 */
export interface ResponsiveStackProps extends ResponsiveBoxProps {
  spacing?: ResponsiveValue<number> | number;
  direction?: 'horizontal' | 'vertical';
}

export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  spacing,
  direction = 'vertical',
  children,
  ...props
}) => {
  const { responsive } = useResponsiveLayout();

  // Helper function to resolve responsive values
  const resolveResponsiveValue = (
    value: ResponsiveValue<number> | number | undefined
  ) => {
    if (typeof value === 'number') return value;
    if (value) return responsive(value);
    return undefined;
  };

  const resolvedSpacing = resolveResponsiveValue(spacing);

  const stackStyle: ViewStyle = {
    flexDirection: direction === 'horizontal' ? 'row' : 'column',
    ...(resolvedSpacing &&
      direction === 'vertical' && { gap: resolvedSpacing }),
    ...(resolvedSpacing &&
      direction === 'horizontal' && { gap: resolvedSpacing }),
  };

  return (
    <ResponsiveBox style={stackStyle} {...props}>
      {children}
    </ResponsiveBox>
  );
};

/**
 * Card component responsive
 */
export interface ResponsiveCardProps extends ResponsiveBoxProps {
  elevated?: boolean;
  borderRadius?: number;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  elevated = false,
  borderRadius = 12,
  backgroundColor = '#FFFFFF',
  style,
  ...props
}) => {
  const cardStyle: ViewStyle = {
    borderRadius,
    backgroundColor,
    ...(elevated && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    }),
    ...style,
  };

  return <ResponsiveBox preset="card" style={cardStyle} {...props} />;
};
