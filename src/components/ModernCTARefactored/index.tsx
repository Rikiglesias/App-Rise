// ===================================================================
// PREMIUM MODERN CTA COMPONENT - Refactored & Optimized
// Ultra-premium call-to-action with modular architecture
// ===================================================================

import React from 'react';

import { useTheme } from '../../hooks/useTheme';
import { GradientCTAButton, StandardCTAButton } from './components';
import {
  useModernCTAAnimations,
  useModernCTAConfig,
  useModernCTAStyles,
} from './hooks';
import { ModernCTAProps } from './types';

// ===================================================================
// RENDER LOGIC - Extracted for clarity
// ===================================================================
const renderModernCTA = (
  variant: string,
  props: {
    containerStyle: ReturnType<typeof useModernCTAStyles>['containerStyle'];
    scaleValue: ReturnType<typeof useModernCTAAnimations>['scaleValue'];
    onPress: ModernCTAProps['onPress'];
    handlePressIn: ReturnType<typeof useModernCTAAnimations>['handlePressIn'];
    handlePressOut: ReturnType<typeof useModernCTAAnimations>['handlePressOut'];
    disabled: boolean;
    accessibilityConfig: ReturnType<typeof useModernCTAConfig>;
    buttonStyle: ReturnType<typeof useModernCTAStyles>['buttonStyle'];
    buttonStyles: ReturnType<typeof useModernCTAStyles>['buttonStyles'];
    colors: ReturnType<typeof useTheme>['colors'];
    contentStyles: ReturnType<typeof useModernCTAStyles>['contentStyles'];
    shimmerValue: ReturnType<typeof useModernCTAAnimations>['shimmerValue'];
    contentProps: Parameters<typeof GradientCTAButton>[0]['contentProps'];
  }
) => {
  // Gradient variant with premium effects
  if (variant === 'gradient') {
    return <GradientCTAButton {...props} />;
  }

  // Standard variants (primary/secondary)
  return <StandardCTAButton {...props} />;
};

// ===================================================================
// MAIN COMPONENT - Simplified and Clean
// ===================================================================
export const ModernCTA: React.FC<ModernCTAProps> = ({
  title,
  subtitle,
  description,
  onPress,
  variant = 'primary',
  size = 'standard',
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { colors } = useTheme();

  const {
    buttonStyles,
    contentStyles,
    typographyStyles,
    containerStyle,
    buttonStyle,
  } = useModernCTAStyles(colors, size, variant, disabled);

  const { scaleValue, shimmerValue, handlePressIn, handlePressOut } =
    useModernCTAAnimations();

  const accessibilityConfig = useModernCTAConfig(
    title,
    accessibilityLabel,
    accessibilityHint,
    disabled
  );

  const contentProps = {
    description,
    title,
    subtitle,
    variant,
    size,
    contentStyles,
    typographyStyles,
    shimmerValue,
  };

  const renderProps = {
    containerStyle,
    scaleValue,
    onPress,
    handlePressIn,
    handlePressOut,
    disabled,
    accessibilityConfig,
    buttonStyle,
    buttonStyles,
    colors,
    contentStyles,
    shimmerValue,
    contentProps,
  };

  return renderModernCTA(variant, renderProps);
};

export default ModernCTA;
