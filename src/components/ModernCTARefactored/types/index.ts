import { Animated, StyleProp, ViewStyle } from 'react-native';

import { Colors } from '../../../constants/designTokens';
import {
  createButtonStyles,
  createContainerStyles,
  createContentStyles,
  createTypographyStyles,
} from '../styles';

// ===================================================================
// MAIN COMPONENT PROPS
// ===================================================================
export interface ModernCTAProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly description?: string;
  readonly onPress?: () => void;
  readonly variant?: 'primary' | 'secondary' | 'gradient';
  readonly size?: 'compact' | 'standard' | 'large';
  readonly disabled?: boolean;
  readonly accessibilityLabel?: string;
  readonly accessibilityHint?: string;
}

// ===================================================================
// STYLE TYPES
// ===================================================================
export type ContentStylesType = ReturnType<typeof createContentStyles>;
export type TypographyStylesType = ReturnType<typeof createTypographyStyles>;
export type ButtonStylesType = ReturnType<typeof createButtonStyles>;
export type ContainerStylesType = ReturnType<typeof createContainerStyles>;

// ===================================================================
// ACCESSIBILITY CONFIG
// ===================================================================
export interface AccessibilityConfig {
  accessible: boolean;
  accessibilityRole: 'button';
  accessibilityLabel: string;
  accessibilityHint: string;
  accessibilityState: { disabled: boolean };
}

// ===================================================================
// CONTENT PROPS
// ===================================================================
export interface ContentProps {
  description: string | undefined;
  title: string;
  subtitle: string | undefined;
  variant: 'primary' | 'secondary' | 'gradient';
  size: 'compact' | 'standard' | 'large';
  contentStyles: ContentStylesType;
  typographyStyles: TypographyStylesType;
  shimmerValue: Animated.Value;
}

// ===================================================================
// COMPONENT PROPS
// ===================================================================
export interface TextComponentProps {
  variant: string;
  size: string;
  contentStyles: ContentStylesType;
  typographyStyles: TypographyStylesType;
}

export interface CTADescriptionProps extends TextComponentProps {
  description: string;
}

export interface CTATitleProps extends TextComponentProps {
  title: string;
}

export interface CTASubtitleProps extends TextComponentProps {
  subtitle: string;
}

export interface CTAAccentLineProps {
  variant: string;
  contentStyles: ContentStylesType;
  shimmerValue: Animated.Value;
}

// ===================================================================
// BUTTON PROPS
// ===================================================================
export interface BaseButtonProps {
  containerStyle: StyleProp<ViewStyle>;
  scaleValue: Animated.Value;
  onPress?: (() => void) | undefined;
  handlePressIn: () => void;
  handlePressOut: () => void;
  disabled: boolean;
  accessibilityConfig: AccessibilityConfig;
  contentProps: ContentProps;
}

export interface GradientButtonProps extends BaseButtonProps {
  buttonStyle: StyleProp<ViewStyle>;
  buttonStyles: ButtonStylesType;
  colors: typeof Colors;
  contentStyles: ContentStylesType;
  shimmerValue: Animated.Value;
}

export interface StandardButtonProps extends BaseButtonProps {
  buttonStyle: StyleProp<ViewStyle>;
}
