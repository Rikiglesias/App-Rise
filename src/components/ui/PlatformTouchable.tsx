import React from 'react';
import {
  Platform,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { TouchableRipple } from 'react-native-paper';
import { Colors } from '../../shared/constants/designTokens';

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
  rippleColor = `rgba(${Colors.primary[500]}, 0.2)`,
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

  return (
    <TouchableRipple
      onPress={onPress ?? handleEmptyPress}
      style={style}
      rippleColor={rippleColor}
      borderless={borderless}
      disabled={disabled}
    >
      {wrappedChildren}
    </TouchableRipple>
  );
};

export default PlatformTouchable;
