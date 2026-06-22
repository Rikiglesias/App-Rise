import { Animated } from 'react-native';

// Props per HeaderSection
export interface HeaderSectionProps {
  scrollY: Animated.Value;
  titleAnim: Animated.Value;
  titleOpacity: Animated.AnimatedNode;
  titleTransform: Animated.AnimatedNode;
}

// Props per HeroImage
export interface HeroImageProps {
  imageAnim: Animated.Value;
  imageParallax: Animated.AnimatedNode;
  imageScale: Animated.AnimatedNode;
  gradientOpacity: Animated.AnimatedNode;
  imageRotation: Animated.AnimatedNode;
}

// Props per EntraInAzione
export interface EntraInAzioneProps {
  // Componente autonomo senza props
  readonly __brand?: 'EntraInAzioneProps';
}

// Props per ActionCTAButtons
export interface ActionCTAButtonsProps {
  onImpactPress: () => void;
  onActionsPress: () => void;
}
