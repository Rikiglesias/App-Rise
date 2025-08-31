import React from 'react';
import {
  Platform,
  View,
  ViewStyle,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Surface, TouchableRipple } from 'react-native-paper';
import {
  getAndroidMaterialProps,
  MaterialColors,
} from '../../shared/constants/materialDesignTokens';

interface MaterialCardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'filled' | 'outlined';
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
  elevation?: 'level0' | 'level1' | 'level2' | 'level3';
}

/**
 * Material Design 3 Card Component
 * Android: implementa specifiche Material Design complete
 * iOS: usa Surface standard (comportamento esistente)
 */
export const MaterialCard: React.FC<MaterialCardProps> = ({
  children,
  variant = 'elevated',
  style,
  onPress,
  disabled = false,
  elevation = 'level1',
}) => {
  // iOS: mantiene comportamento esistente con Surface
  if (Platform.OS === 'ios') {
    return (
      <Surface style={[styles.iosCard, style]} elevation={0}>
        {children}
      </Surface>
    );
  }

  // Android: Material Design 3 Card completa
  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: MaterialColors.surface.containerLow,
          borderWidth: 0,
          ...getAndroidMaterialProps(elevation),
        };
      case 'filled':
        return {
          backgroundColor: MaterialColors.surface.containerLowest,
          borderWidth: 0,
          elevation: 0,
        };
      case 'outlined':
        return {
          backgroundColor: MaterialColors.surface.containerLowest,
          borderWidth: 1,
          borderColor: MaterialColors.surface.containerHigh,
          elevation: 0,
        };
      default:
        return {
          backgroundColor: MaterialColors.surface.containerLow,
          ...getAndroidMaterialProps('level1'),
        };
    }
  };

  const cardStyle = {
    ...styles.androidCard,
    ...getVariantStyle(),
    opacity: disabled ? 0.38 : 1,
  };

  return (
    <View
      style={[cardStyle, style]}
      accessible={!!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      {children}
    </View>
  );
};

/**
 * Material Design 3 Action Card
 * Card con TouchableRipple integrato per Android
 */
interface MaterialActionCardProps extends MaterialCardProps {
  onPress: () => void;
  rippleColor?: string;
}

export const MaterialActionCard: React.FC<MaterialActionCardProps> = ({
  children,
  variant = 'elevated',
  style,
  onPress,
  disabled = false,
  elevation = 'level1',
  rippleColor,
}) => {
  // iOS: usa Surface con TouchableOpacity wrapper
  if (Platform.OS === 'ios') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Surface style={[styles.iosCard, style]} elevation={0}>
          {children}
        </Surface>
      </TouchableOpacity>
    );
  }

  // Android: TouchableRipple con Material Design

  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: MaterialColors.surface.containerLow,
          borderWidth: 0,
          ...getAndroidMaterialProps(elevation),
        };
      case 'filled':
        return {
          backgroundColor: MaterialColors.surface.containerLowest,
          borderWidth: 0,
          elevation: 0,
        };
      case 'outlined':
        return {
          backgroundColor: MaterialColors.surface.containerLowest,
          borderWidth: 1,
          borderColor: MaterialColors.surface.containerHigh,
          elevation: 0,
        };
      default:
        return {
          backgroundColor: MaterialColors.surface.containerLow,
          ...getAndroidMaterialProps('level1'),
        };
    }
  };

  const cardStyle = {
    ...styles.androidCard,
    ...getVariantStyle(),
    opacity: disabled ? 0.38 : 1,
  };

  const defaultRippleColor = rippleColor ?? 'transparent';

  return (
    <TouchableRipple
      style={[cardStyle, style]}
      onPress={onPress}
      disabled={disabled}
      rippleColor={defaultRippleColor}
      accessibilityRole="button"
    >
      <View style={styles.cardContent}>{children}</View>
    </TouchableRipple>
  );
};

const styles = StyleSheet.create({
  // iOS: comportamento esistente
  iosCard: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // Android: Material Design 3
  androidCard: {
    borderRadius: 12, // Material Design 3 standard
    overflow: 'hidden',
  },

  cardContent: {
    flex: 1,
  },
});

export default MaterialCard;
