import React from 'react';
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';
import { TouchableRipple } from 'react-native-paper';

interface PlatformTouchableProps extends TouchableOpacityProps {
  rippleColor?: string;
  borderless?: boolean;
}

// Su iOS i figli li dispone TouchableOpacity; su Android e web i figli multipli
// passano per un View interno (TouchableRipple ne accetta uno solo). Il View
// prende dallo stile del pulsante impaginazione e padding: senza, i figli vanno
// in colonna e quelli in posizione assoluta si misurano dentro il padding.
const CHILD_LAYOUT_KEYS = new Set<string>([
  'flexDirection',
  'alignItems',
  'justifyContent',
  'flexWrap',
  'gap',
  'rowGap',
  'columnGap',
]);

const isPaddingKey = (key: string) => key.startsWith('padding');

const splitStyleForChildren = (style: TouchableOpacityProps['style']) => {
  const flat: ViewStyle = StyleSheet.flatten(style) ?? {};
  const moved = Object.entries(flat).filter(
    ([key]) => CHILD_LAYOUT_KEYS.has(key) || isPaddingKey(key)
  );
  const paddingReset = Object.fromEntries(
    moved.filter(([key]) => isPaddingKey(key)).map(([key]) => [key, 0])
  ) as ViewStyle;
  return {
    touchable: [style, paddingReset],
    // Il View riempie il pulsante: centratura e spaziatura valgono sull'intera area.
    children: {
      flexGrow: 1,
      alignSelf: 'stretch',
      ...(Object.fromEntries(moved) as ViewStyle),
    } satisfies ViewStyle,
  };
};

/**
 * Smart Touchable che usa:
 * - iOS: TouchableOpacity (mantiene comportamento esistente)
 * - Android: TouchableRipple (Material Design nativo)
 *
 * API identica, comportamento ottimizzato per piattaforma
 */
const handleEmptyPress = () => {
  // Empty function for when onPress is not provided
};

export const PlatformTouchable: React.FC<PlatformTouchableProps> = ({
  onPress,
  children,
  style,
  // Evita flash/grigio su Android durante animazioni
  // (può essere sovrascritto localmente dove serve un ripple visibile)
  rippleColor = 'transparent',
  borderless = false,
  disabled = false,
  ...props
}) => {
  // iOS: mantiene TouchableOpacity esistente (zero cambiamenti)
  if (Platform.OS === 'ios') {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={style}
        disabled={disabled}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  // Android: usa TouchableRipple nativo per Material Design
  // TouchableRipple richiede esattamente un singolo figlio React
  // Wrappa automaticamente i children multipli in un View che eredita
  // impaginazione e padding del pulsante. Anche nessun figlio va avvolto
  // (lo sfondo che chiude una modale): `React.Children.only` lancerebbe.
  const split =
    React.Children.count(children) > 1 ? splitStyleForChildren(style) : null;
  const wrappedChildren = React.isValidElement(children) ? (
    children
  ) : (
    <View style={split?.children}>{children}</View>
  );

  // Inoltra a TouchableRipple i prop a11y/interazione che il ramo iOS passa via
  // {...props} ma che qui si perdevano (bug a11y su Android). Spread CONDIZIONALE:
  // evita di passare `undefined` esplicito (incompatibile con exactOptionalPropertyTypes)
  // e di propagare prop specifici di TouchableOpacity non validi su Ripple.
  const forwardedProps = {
    ...(props.accessibilityRole !== undefined && {
      accessibilityRole: props.accessibilityRole,
    }),
    ...(props.accessibilityLabel !== undefined && {
      accessibilityLabel: props.accessibilityLabel,
    }),
    ...(props.accessibilityValue !== undefined && {
      accessibilityValue: props.accessibilityValue,
    }),
    ...(props.accessibilityHint !== undefined && {
      accessibilityHint: props.accessibilityHint,
    }),
    ...(props.accessibilityState !== undefined && {
      accessibilityState: props.accessibilityState,
    }),
    ...(props.accessible !== undefined && { accessible: props.accessible }),
    ...(props.focusable !== undefined && { focusable: props.focusable }),
    ...(props.hitSlop !== undefined && { hitSlop: props.hitSlop }),
    ...(props.testID !== undefined && { testID: props.testID }),
    ...(props.onLongPress !== undefined && { onLongPress: props.onLongPress }),
  };

  return (
    <TouchableRipple
      onPress={onPress ?? handleEmptyPress}
      style={split ? split.touchable : style}
      rippleColor={rippleColor}
      borderless={borderless}
      disabled={disabled}
      {...forwardedProps}
    >
      {wrappedChildren}
    </TouchableRipple>
  );
};

export default PlatformTouchable;
