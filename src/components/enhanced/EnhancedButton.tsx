/**
 * 🌟 ENHANCED BUTTON - Sistema Microinterazioni 2025
 * Button component che dimostra le nuove microinterazioni
 */

import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';

import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from '../../shared/constants';
import { TypographyTokens } from '../../shared/constants/responsiveSystem';
import { useMicroInteraction } from '../../systems/MicroInteractionEngine';

// ===================================================================
// INTERFACCE
// ===================================================================

export interface EnhancedButtonProps {
  readonly title: string;
  readonly onPress?: () => void;
  readonly variant?: 'primary' | 'secondary' | 'success' | 'error';
  readonly disabled?: boolean;
  readonly icon?: string;
  readonly accessibilityLabel?: string;
}

// ===================================================================
// CONFIGURAZIONI STILE
// ===================================================================

const getVariantStyles = (variant: string) => {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: Colors.primary[500],
        textColor: Colors.neutral[0],
      };
    case 'secondary':
      return {
        backgroundColor: Colors.neutral[600],
        textColor: Colors.neutral[0],
      };
    case 'success':
      return {
        backgroundColor: Colors.semantic.success.main,
        textColor: Colors.neutral[0],
      };
    case 'error':
      return {
        backgroundColor: Colors.semantic.error.main,
        textColor: Colors.neutral[0],
      };
    default:
      return {
        backgroundColor: Colors.primary[500],
        textColor: Colors.neutral[0],
      };
  }
};

// ===================================================================
// COMPONENTE PRINCIPALE
// ===================================================================

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  icon,
  accessibilityLabel,
}) => {
  // Hook microinterazioni
  const microInteraction = useMicroInteraction('buttonTap');

  const variantStyle = getVariantStyles(variant);

  // Handler press con microinterazioni
  const handlePress = useCallback(async () => {
    if (disabled || !onPress) return;

    // Trigger microinteraction
    await microInteraction.trigger();

    // Execute callback
    onPress();

    // Reset after interaction
    setTimeout(() => {
      void microInteraction.reverse();
    }, 100);
  }, [disabled, microInteraction, onPress]);

  // Handler press in/out
  const handlePressIn = useCallback(() => {
    if (disabled) return;
    void microInteraction.trigger();
  }, [disabled, microInteraction]);

  const handlePressOut = useCallback(() => {
    if (disabled) return;
    void microInteraction.reverse();
  }, [disabled, microInteraction]);

  const buttonStyle = [
    styles.button,
    {
      backgroundColor: variantStyle.backgroundColor,
      opacity: disabled ? 0.5 : 1,
    },
  ];

  const textStyle = [
    styles.text,
    {
      color: variantStyle.textColor,
    },
  ];

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
    >
      <Animated.View style={[buttonStyle, microInteraction.animatedStyle]}>
        <View style={styles.content}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={textStyle}>{title}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ===================================================================
// STILI
// ===================================================================

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[4],
    borderRadius: BorderRadius.md,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },

  text: {
    fontSize: TypographyTokens.styles.body.medium,
    fontWeight: Typography.weights.semibold,
    textAlign: 'center',
  },

  icon: {},
});

export default EnhancedButton;
