/**
 * MATERIAL CARD RENDERER - Renderer per Material Design Cards
 * Gestisce la logica specifica per MaterialCard
 */

import React from 'react';
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import { Surface, TouchableRipple } from 'react-native-paper';

import { Colors } from '../../../shared/constants/designTokens';
import type { MaterialVariant, ElevationLevel } from './types';

interface MaterialCardRendererProps {
  children: React.ReactNode;
  variant: MaterialVariant;
  elevation: ElevationLevel;
  style?: ViewStyle | undefined;
  onPress?: ((event: GestureResponderEvent) => void) | undefined;
  disabled: boolean;
  rippleColor?: string | undefined;
}

export const MaterialCardRenderer: React.FC<MaterialCardRendererProps> = ({
  children,
  variant,
  elevation,
  style,
  onPress,
  disabled,
  rippleColor,
}) => {
  // iOS: mantiene comportamento esistente con Surface
  if (Platform.OS === 'ios') {
    const CardComponent = onPress ? TouchableOpacity : View;

    return (
      <CardComponent
        style={[styles.iosCard, style]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Surface style={styles.iosSurface} elevation={0}>
          {children}
        </Surface>
      </CardComponent>
    );
  }

  // Helper function to convert elevation level to number
  const getElevationValue = (level: ElevationLevel): number => {
    switch (level) {
      case 'level0':
        return 0;
      case 'level1':
        return 1;
      case 'level2':
        return 2;
      case 'level3':
        return 3;
      default:
        return 1;
    }
  };

  // Android: Material Design 3 Card completa
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: '#FFFFFF',
          elevation: getElevationValue(elevation),
        };
      case 'filled':
        return {
          backgroundColor: '#F3F3F3',
          elevation: 0,
        };
      case 'outlined':
        return {
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: '#E0E0E0',
          elevation: 0,
        };
      default:
        return {
          backgroundColor: '#FFFFFF',
          elevation: getElevationValue(elevation),
        };
    }
  };

  const variantStyle = getVariantStyle();

  if (onPress) {
    return (
      <TouchableRipple
        style={[styles.androidCard, variantStyle, style]}
        onPress={onPress}
        disabled={disabled}
        rippleColor={rippleColor ?? Colors.primary[50]}
        borderless={false}
      >
        <View style={styles.cardContent}>{children}</View>
      </TouchableRipple>
    );
  }

  return (
    <View style={[styles.androidCard, variantStyle, style]}>
      <View style={styles.cardContent}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  iosCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  iosSurface: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flex: 1,
  },
  androidCard: {
    borderRadius: 12, // Material Design 3 standard
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
  },
});
