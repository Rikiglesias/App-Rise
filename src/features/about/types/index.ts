import type { StackNavigationProp } from '@react-navigation/stack';
import type { Animated, TextStyle, ViewStyle } from 'react-native';

import type { RootStackParamList } from '../../../navigation/types';

// Navigation Types
export type ChiSiamoScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ChiSiamo'
>;

export interface ChiSiamoScreenProps {
  readonly navigation: ChiSiamoScreenNavigationProp;
}

// Contact Data Types
export interface ContactData {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
}

// Animation Types
export interface ChiSiamoAnimations {
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  scaleAnim: Animated.Value;
  contactAnimations: readonly [Animated.Value, Animated.Value, Animated.Value];
}

// Component Props Types
export interface ChiSiamoSectionProps {
  animations: ChiSiamoAnimations;
  onInfoPress: () => void;
}

export interface ContactSectionProps {
  animations: ChiSiamoAnimations;
  contacts: ContactData[];
}

export interface AnimatedContactProps {
  contact: ContactData;
  animationValue: Animated.Value;
}

export interface StoriaModalProps {
  visible: boolean;
  onClose: () => void;
}

// Style Types
export interface ContactStyles {
  contactButtonContainer: ViewStyle;
  contactTouchable: ViewStyle;
  gradientBorder: ViewStyle;
  whiteContainer: ViewStyle;
  contactContent: ViewStyle;
  contactIcon: ViewStyle;
  contactTextContainer: ViewStyle;
  contactButtonTitle: TextStyle;
  contactButtonSubtitle: TextStyle;
}

//===================================================================
// ABOUT TYPES - Central Export
//===================================================================

// All types are defined in this file directly
// Navigation types are imported from navigation module
