import type { GestureResponderEvent, ViewStyle } from 'react-native';
import { Animated } from 'react-native';

export interface EnhancedCardProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly icon: string;
  readonly onPress?: (event: GestureResponderEvent) => void;
  readonly variant?: 'default' | 'primary' | 'elevated';
  readonly size?: 'compact' | 'standard' | 'large';
  readonly disabled?: boolean;
  readonly showArrow?: boolean;
  readonly customStyle?: ViewStyle;
  readonly children?: React.ReactNode;
  readonly accessibilityLabel?: string;
  readonly accessibilityHint?: string;
}

export type CardVariant = NonNullable<EnhancedCardProps['variant']>;
export type CardSize = NonNullable<EnhancedCardProps['size']>;

export interface IconSectionProps {
  icon: string;
  variant: EnhancedCardProps['variant'];
  size: EnhancedCardProps['size'];
}

export interface TextSectionProps {
  title: string;
  subtitle: string | undefined;
  variant: EnhancedCardProps['variant'];
  size: EnhancedCardProps['size'];
  children?: React.ReactNode;
}

export interface ArrowSectionProps {
  showArrow: boolean;
  onPress: ((event: GestureResponderEvent) => void) | undefined;
  disabled: boolean;
  variant: EnhancedCardProps['variant'];
  shadowValue: Animated.Value;
}
