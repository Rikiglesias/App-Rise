import React from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';

import {
  useAccessibilityConfig,
  useCardStyling,
} from '../../hooks/useEnhancedCardStyling';
import { useAnimatedPress } from '../../shared/hooks/useAnimatedPress';
import { enhancedCardStyles } from '../../styles/EnhancedCardStyles';
import type { EnhancedCardProps } from '../../types/EnhancedCardTypes';
import { ArrowSection, IconSection, TextSection } from './EnhancedCardSections';

export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  variant = 'default',
  size = 'standard',
  disabled = false,
  showArrow = true,
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
      <TouchableOpacity
        style={getCardStyle()}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
        {...accessibilityConfig}
      >
        <View style={enhancedCardStyles.cardContent}>
          <IconSection icon={icon} variant={variant} size={size} />
          <TextSection
            title={title}
            subtitle={subtitle}
            variant={variant}
            size={size}
            // eslint-disable-next-line react/no-children-prop
            children={children}
          />
          <ArrowSection
            showArrow={showArrow}
            onPress={onPress}
            disabled={disabled}
            variant={variant}
            shadowValue={shadowValue}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default EnhancedCard;
