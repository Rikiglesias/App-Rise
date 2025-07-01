import React, { useRef, useCallback } from 'react';
import { Platform, Animated, StyleSheet, View, Text } from 'react-native';

import { TouchableRipple } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useHapticFeedback } from '../../shared/hooks/useHapticFeedback';
import {
  getAndroidMaterialProps,
  MaterialColors,
  MaterialMotion,
} from '../../shared/constants/materialDesignTokens';

interface MaterialFABProps {
  onPress?: () => void;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  label?: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'surface';
  size?: 'small' | 'large' | 'extended';
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left';
  disabled?: boolean;
}

/**
 * Material Design 3 Floating Action Button
 * Implementa tutte le specifiche Material Design per Android
 * iOS: usa il PremiumFloatingButton esistente (zero cambiamenti)
 */
export const MaterialFAB: React.FC<MaterialFABProps> = ({
  onPress,
  icon = 'plus',
  label,
  variant = 'primary',
  size = 'large',
  position = 'bottom-right',
  disabled = false,
}) => {
  const { buttonPress } = useHapticFeedback();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // REACT HOOKS: Sempre chiamati in ordine consistente
  const handlePressIn = useCallback(() => {
    buttonPress();
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: MaterialMotion.duration.short1,
      useNativeDriver: true,
    }).start();
  }, [buttonPress, scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: MaterialMotion.duration.short2,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    if (!disabled && onPress) {
      onPress();
    }
  }, [disabled, onPress]);

  // iOS: rimanda al componente esistente (mantieni comportamento)
  if (Platform.OS === 'ios') {
    // Qui potresti importare e usare PremiumFloatingButton
    // return <PremiumFloatingButton onPress={onPress} />;
    // Per ora, renderizziamo null su iOS per non duplicare
    return null;
  }

  // Configurazioni per variant
  const getVariantConfig = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: MaterialColors.brand.primary,
          iconColor: '#FFFFFF',
          rippleColor: 'transparent',
          elevation: 'level3' as const,
        };
      case 'secondary':
        return {
          backgroundColor: MaterialColors.surface.containerHigh,
          iconColor: MaterialColors.brand.primary,
          rippleColor: 'transparent',
          elevation: 'level3' as const,
        };
      case 'tertiary':
        return {
          backgroundColor: MaterialColors.surface.container,
          iconColor: MaterialColors.brand.primary,
          rippleColor: 'transparent',
          elevation: 'level3' as const,
        };
      case 'surface':
        return {
          backgroundColor: MaterialColors.surface.containerLow,
          iconColor: MaterialColors.brand.primary,
          rippleColor: 'transparent',
          elevation: 'level1' as const,
        };
      default:
        return {
          backgroundColor: MaterialColors.brand.primary,
          iconColor: '#FFFFFF',
          rippleColor: 'transparent',
          elevation: 'level3' as const,
        };
    }
  };

  // Configurazioni per size
  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          width: 40,
          height: 40,
          borderRadius: 12,
          iconSize: 18,
        };
      case 'large':
        return {
          width: 56,
          height: 56,
          borderRadius: 16,
          iconSize: 24,
        };
      case 'extended':
        return {
          height: 56,
          borderRadius: 16,
          iconSize: 24,
          paddingHorizontal: 16,
          minWidth: label ? 80 : 56,
        };
      default:
        return {
          width: 56,
          height: 56,
          borderRadius: 16,
          iconSize: 24,
        };
    }
  };

  // Configurazioni per position
  const getPositionStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      bottom: 16,
      zIndex: 1000,
    };

    switch (position) {
      case 'bottom-right':
        return { ...baseStyle, right: 16 };
      case 'bottom-center':
        return { ...baseStyle, alignSelf: 'center' as const };
      case 'bottom-left':
        return { ...baseStyle, left: 16 };
      default:
        return { ...baseStyle, right: 16 };
    }
  };

  const variantConfig = getVariantConfig();
  const sizeConfig = getSizeConfig();
  const positionStyle = getPositionStyle();

  const containerStyle = {
    ...positionStyle,
    width: sizeConfig.width ?? sizeConfig.minWidth,
    height: sizeConfig.height,
    borderRadius: sizeConfig.borderRadius,
    backgroundColor: variantConfig.backgroundColor,
    ...getAndroidMaterialProps(variantConfig.elevation),
    opacity: disabled ? 0.38 : 1,
  };

  const contentStyle = {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: sizeConfig.paddingHorizontal ?? 0,
  };

  return (
    <Animated.View
      style={[
        containerStyle,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableRipple
        style={styles.touchable}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        rippleColor={variantConfig.rippleColor}
        borderless={true}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label ?? 'Floating action button'}
      >
        <View style={contentStyle}>
          <MaterialCommunityIcons
            name={icon}
            size={sizeConfig.iconSize}
            color={variantConfig.iconColor}
          />
          {size === 'extended' && label && (
            <Text
              style={[
                { fontSize: 14 },
                styles.label,
                { color: variantConfig.iconColor },
                styles.labelSpacing,
              ]}
            >
              {label}
            </Text>
          )}
        </View>
      </TouchableRipple>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  label: {
    fontWeight: '500',
    fontFamily: 'Roboto Medium',
    letterSpacing: 0.1,
  },
  labelSpacing: {
    marginLeft: 12,
  },
});

export default MaterialFAB;
