import type { GestureResponderEvent, ViewStyle } from 'react-native';
import { Accessibility } from '../constants/designTokens';
import { enhancedCardStyles } from '../styles/EnhancedCardStyles';
import type { EnhancedCardProps } from '../types/EnhancedCardTypes';

// Hook for card styling - Separated to reduce function length
export const useCardStyling = (
  variant: EnhancedCardProps['variant'],
  size: EnhancedCardProps['size'],
  disabled: boolean,
  customStyle?: ViewStyle
) => {
  const getCardStyle = (): (ViewStyle | undefined)[] => {
    const baseStyles: (ViewStyle | undefined)[] = [
      enhancedCardStyles.baseCard,
      variant ? enhancedCardStyles[`${variant}Card`] : undefined,
      size ? enhancedCardStyles[`${size}Card`] : undefined,
      customStyle,
    ];

    // Add conditional styles separately to avoid type conflicts
    if (disabled) {
      baseStyles.push(enhancedCardStyles.disabledCard);
    }

    return baseStyles.filter(
      (style): style is ViewStyle => style !== undefined
    );
  };

  return { getCardStyle };
};

// Hook for accessibility configuration - Separated to reduce function length
export const useAccessibilityConfig = (
  title: string,
  subtitle?: string,
  accessibilityLabel?: string,
  accessibilityHint?: string,
  onPress?: (event: GestureResponderEvent) => void,
  disabled = false
) => {
  const accessibilityConfig = {
    accessible: true,
    accessibilityLabel:
      accessibilityLabel ??
      `${title}${
        subtitle !== undefined && subtitle !== null && subtitle !== ''
          ? `, ${subtitle}`
          : ''
      }`,
    accessibilityHint:
      accessibilityHint ?? (onPress ? 'Tocca per aprire' : undefined),
    accessibilityState: { disabled },
    ...Accessibility.touchTarget,
  };

  return accessibilityConfig;
};
