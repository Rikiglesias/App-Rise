import React from 'react';
import { Animated, TextStyle } from 'react-native';
import { PerfectText } from './PerfectText';
import { PerfectContainer } from './PerfectContainer';
import { enhancedCardStyles } from './styles/EnhancedCardStyles';
import type {
  ArrowSectionProps,
  IconSectionProps,
  TextSectionProps,
} from './types/EnhancedCardTypes';

const AnimatedPerfectText = Animated.createAnimatedComponent(PerfectText);

// Icon section component - Separated to reduce function length
export const IconSection: React.FC<IconSectionProps> = ({
  icon,
  variant,
  size,
}) => {
  const iconStyle = [
    enhancedCardStyles.icon,
    variant ? enhancedCardStyles[`${variant}Icon`] : undefined,
    size ? enhancedCardStyles[`${size}Icon`] : undefined,
  ];

  const iconFontSize =
    (size && (enhancedCardStyles[`${size}Icon`] as TextStyle)?.fontSize) ??
    (enhancedCardStyles.icon as TextStyle)?.fontSize ??
    18;

  return (
    <PerfectContainer style={enhancedCardStyles.iconSection}>
      <PerfectContainer
        style={[
          enhancedCardStyles.iconContainer,
          variant && enhancedCardStyles[`${variant}IconContainer`],
          size && enhancedCardStyles[`${size}IconContainer`],
        ].filter(Boolean) as never}
      >
        <PerfectText size={iconFontSize} lines={1} style={iconStyle}>
          {icon}
        </PerfectText>
      </PerfectContainer>
    </PerfectContainer>
  );
};

// Text section component - Separated to reduce function length
export const TextSection: React.FC<TextSectionProps> = ({
  title,
  subtitle,
  variant,
  size,
  children,
}) => {
  const titleStyles = [
    enhancedCardStyles.title,
    variant ? enhancedCardStyles[`${variant}Title`] : undefined,
    size ? enhancedCardStyles[`${size}Title`] : undefined,
  ];

  const subtitleStyles = [
    enhancedCardStyles.subtitle,
    variant ? enhancedCardStyles[`${variant}Subtitle`] : undefined,
    size ? enhancedCardStyles[`${size}Subtitle`] : undefined,
  ];

  const titleSize =
    (size && (enhancedCardStyles[`${size}Title`] as TextStyle)?.fontSize) ??
    (enhancedCardStyles.title as TextStyle)?.fontSize ??
    18;
  const subtitleSize =
    (size && (enhancedCardStyles[`${size}Subtitle`] as TextStyle)?.fontSize) ??
    (enhancedCardStyles.subtitle as TextStyle)?.fontSize ??
    16;

  return (
    <PerfectContainer style={enhancedCardStyles.textSection}>
      <PerfectText size={titleSize} lines={2} style={titleStyles}>
        {title}
      </PerfectText>

      {subtitle !== undefined && subtitle !== null && subtitle !== '' && (
        <PerfectText size={subtitleSize} lines={2} style={subtitleStyles}>
          {subtitle}
        </PerfectText>
      )}

      {children}
    </PerfectContainer>
  );
};

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

  const arrowStyles = [
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
  ];
  const arrowSize = enhancedCardStyles.arrow.fontSize ?? 16;

  return (
    <PerfectContainer style={enhancedCardStyles.arrowSection}>
      <AnimatedPerfectText size={arrowSize} lines={1} style={arrowStyles}>
        ➔
      </AnimatedPerfectText>
    </PerfectContainer>
  );
};
