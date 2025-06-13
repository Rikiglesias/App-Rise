import React from 'react';
import { Animated, Text, View } from 'react-native';
import { enhancedCardStyles } from '../../styles/EnhancedCardStyles';
import type {
  ArrowSectionProps,
  IconSectionProps,
  TextSectionProps,
} from '../../types/EnhancedCardTypes';

// Icon section component - Separated to reduce function length
export const IconSection: React.FC<IconSectionProps> = ({
  icon,
  variant,
  size,
}) => (
  <View style={enhancedCardStyles.iconSection}>
    <View
      style={[
        enhancedCardStyles.iconContainer,
        variant ? enhancedCardStyles[`${variant}IconContainer`] : undefined,
        size ? enhancedCardStyles[`${size}IconContainer`] : undefined,
      ]}
    >
      <Text
        style={[
          enhancedCardStyles.icon,
          variant ? enhancedCardStyles[`${variant}Icon`] : undefined,
          size ? enhancedCardStyles[`${size}Icon`] : undefined,
        ]}
      >
        {icon}
      </Text>
    </View>
  </View>
);

// Text section component - Separated to reduce function length
export const TextSection: React.FC<TextSectionProps> = ({
  title,
  subtitle,
  variant,
  size,
  children,
}) => (
  <View style={enhancedCardStyles.textSection}>
    <Text
      style={[
        enhancedCardStyles.title,
        variant ? enhancedCardStyles[`${variant}Title`] : undefined,
        size ? enhancedCardStyles[`${size}Title`] : undefined,
      ]}
      numberOfLines={2}
      ellipsizeMode="tail"
    >
      {title}
    </Text>

    {subtitle !== undefined && subtitle !== null && subtitle !== '' && (
      <Text
        style={[
          enhancedCardStyles.subtitle,
          variant ? enhancedCardStyles[`${variant}Subtitle`] : undefined,
          size ? enhancedCardStyles[`${size}Subtitle`] : undefined,
        ]}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {subtitle}
      </Text>
    )}

    {children}
  </View>
);

// Arrow section component - Separated to reduce function length
export const ArrowSection: React.FC<ArrowSectionProps> = ({
  showArrow,
  onPress,
  disabled,
  variant,
  shadowValue,
}) => {
  if (!showArrow || !onPress || disabled) {
    return null;
  }

  return (
    <View style={enhancedCardStyles.arrowSection}>
      <Animated.Text
        style={[
          enhancedCardStyles.arrow,
          variant ? enhancedCardStyles[`${variant}Arrow`] : undefined,
          {
            transform: [
              {
                translateX: shadowValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 2],
                }),
              },
            ],
          },
        ]}
      >
        →
      </Animated.Text>
    </View>
  );
};
