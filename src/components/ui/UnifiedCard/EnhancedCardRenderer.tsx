/**
 * ENHANCED CARD RENDERER - Renderer per Enhanced Cards
 * Gestisce la logica specifica per EnhancedCard con animazioni
 */

import React from 'react';
import { Animated, View, ViewStyle, GestureResponderEvent } from 'react-native';

import { useAnimatedPress } from '../../../shared/hooks/useAnimatedPress';
import PlatformTouchable from '../PlatformTouchable';
import {
  useAccessibilityConfig,
  useCardStyling,
} from '../hooks/useEnhancedCardStyling';
import {
  ArrowSection,
  IconSection,
  TextSection,
} from '../EnhancedCardSections';
import type { EnhancedVariant, CardSize } from './types';

interface EnhancedCardRendererProps {
  title: string;
  subtitle?: string | undefined;
  icon: string;
  onPress?: ((event: GestureResponderEvent) => void) | undefined;
  variant: EnhancedVariant;
  size: CardSize;
  disabled: boolean;
  showArrow: boolean;
  customStyle?: ViewStyle | undefined;
  children?: React.ReactNode;
  accessibilityLabel?: string | undefined;
  accessibilityHint?: string | undefined;
}

export const EnhancedCardRenderer: React.FC<EnhancedCardRendererProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  variant,
  size,
  disabled,
  showArrow,
  customStyle,
  children,
  accessibilityLabel,
  accessibilityHint,
}) => {
  // Use custom hook for animations - eliminates 40+ lines of duplicate code
  const { shadowValue, handlePressIn, handlePressOut, animatedStyle } =
    useAnimatedPress({ scaleValue: 0.98, minOpacity: 0.85 });

  // Use styling hook
  const { getCardStyle } = useCardStyling(variant, size, disabled, customStyle);

  // Use accessibility hook
  const accessibilityConfig = useAccessibilityConfig(
    title,
    subtitle,
    accessibilityLabel,
    accessibilityHint,
    onPress,
    disabled
  );

  return (
    <Animated.View style={[animatedStyle]}>
      <PlatformTouchable
        style={getCardStyle()}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        {...accessibilityConfig}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconSection icon={icon} variant={variant} size={size} />

          <TextSection
            title={title}
            subtitle={subtitle}
            variant={variant}
            size={size}
          >
            {children}
          </TextSection>

          <ArrowSection
            showArrow={showArrow}
            onPress={onPress}
            disabled={disabled}
            variant={variant}
            shadowValue={shadowValue}
          />
        </View>
      </PlatformTouchable>
    </Animated.View>
  );
};
