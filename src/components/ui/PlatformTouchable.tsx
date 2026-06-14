import React from 'react';
import {
  Platform,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { TouchableRipple } from 'react-native-paper';

interface PlatformTouchableProps extends TouchableOpacityProps {
  rippleColor?: string;
  borderless?: boolean;
}

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
  // Wrappa automaticamente i children multipli in un View
  const wrappedChildren =
    React.Children.count(children) > 1 ? <View>{children}</View> : children;

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
    ...(props.accessibilityHint !== undefined && {
      accessibilityHint: props.accessibilityHint,
    }),
    ...(props.accessibilityState !== undefined && {
      accessibilityState: props.accessibilityState,
    }),
    ...(props.accessible !== undefined && { accessible: props.accessible }),
    ...(props.hitSlop !== undefined && { hitSlop: props.hitSlop }),
    ...(props.testID !== undefined && { testID: props.testID }),
    ...(props.onLongPress !== undefined && { onLongPress: props.onLongPress }),
  };

  return (
    <TouchableRipple
      onPress={onPress ?? handleEmptyPress}
      style={style}
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
