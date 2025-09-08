/**
 * UNIFIED CARD TYPES - Tipi per componente Card unificato
 * Consolida MaterialCard, EnhancedCard, GlassmorphismCard
 */

import type { GestureResponderEvent, ViewStyle } from 'react-native';

// Varianti di design supportate
export type CardDesignVariant =
  | 'material' // MaterialCard style
  | 'enhanced' // EnhancedCard style
  | 'glassmorphism'; // GlassmorphismCard style;

// Varianti Material Design
export type MaterialVariant = 'elevated' | 'filled' | 'outlined';

// Varianti Enhanced
export type EnhancedVariant = 'default' | 'primary' | 'elevated';

// Varianti Glassmorphism
export type GlassmorphismVariant = 'light' | 'medium' | 'dark' | 'primary';

// Dimensioni supportate
export type CardSize = 'compact' | 'standard' | 'large';

// Livelli di elevazione Material
export type ElevationLevel = 'level0' | 'level1' | 'level2' | 'level3';

// Intensità glassmorphism
export type GlassmorphismIntensity = 'subtle' | 'normal' | 'strong';

// Props base comuni a tutti i tipi di card
interface BaseCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

// Props specifiche per Material Design
interface MaterialCardProps extends BaseCardProps {
  designVariant: 'material';
  variant?: MaterialVariant;
  elevation?: ElevationLevel;
  rippleColor?: string;
}

// Props specifiche per Enhanced Card
interface EnhancedCardProps extends BaseCardProps {
  designVariant: 'enhanced';
  variant?: EnhancedVariant;
  size?: CardSize;
  title: string;
  subtitle?: string;
  icon: string;
  showArrow?: boolean;
  customStyle?: ViewStyle;
}

// Props specifiche per Glassmorphism
interface GlassmorphismCardProps extends BaseCardProps {
  designVariant: 'glassmorphism';
  variant?: GlassmorphismVariant;
  intensity?: GlassmorphismIntensity;
  gradient?: boolean;
}

// Union type per tutte le varianti
export type UnifiedCardProps =
  | MaterialCardProps
  | EnhancedCardProps
  | GlassmorphismCardProps;

// Type guards per discriminare le varianti
export const isMaterialCard = (
  props: UnifiedCardProps
): props is MaterialCardProps => props.designVariant === 'material';

export const isEnhancedCard = (
  props: UnifiedCardProps
): props is EnhancedCardProps => props.designVariant === 'enhanced';

export const isGlassmorphismCard = (
  props: UnifiedCardProps
): props is GlassmorphismCardProps => props.designVariant === 'glassmorphism';

// Props per sezioni Enhanced Card
export interface IconSectionProps {
  icon: string;
  variant?: EnhancedVariant;
  size?: CardSize;
}

export interface TextSectionProps {
  title: string;
  subtitle?: string;
  variant?: EnhancedVariant;
  size?: CardSize;
  children?: React.ReactNode;
}

export interface ArrowSectionProps {
  showArrow: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  disabled: boolean;
  variant?: EnhancedVariant;
}
