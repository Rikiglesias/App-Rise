import type { ViewStyle, TextStyle, Animated } from 'react-native';
import type { ContributeTabScreenProps } from '../../types/ContributeScreenTypes';
import type { useNewActionsAnimations } from './ContributeAnimations';

// Interfaccia per i dati di ogni bottone
export interface ButtonData {
  id: string;
  title: string;
  icon: string;
  gradient: readonly [string, string, string];
  onPress: () => void;
}

// Interfaccia per tutti gli stili dei bottoni (oggetti StyleSheet)
export interface ButtonStyles {
  container: ViewStyle;
  categoryContainer: ViewStyle;
  categoryHeader: ViewStyle;

  donateTitleContainer: ViewStyle;
  donateCategoryTitle: TextStyle;
  donateInlineSubtitle: TextStyle;

  exploreSubtitle: TextStyle;
  buttonsGrid: ViewStyle;
  buttonRow: ViewStyle;
  buttonContainer: ViewStyle;
  gradientBorder: ViewStyle;
  whiteContainer: ViewStyle;
  buttonContent: ViewStyle;
  buttonIcon: ViewStyle;
  buttonTitle: TextStyle;
  infoButton: ViewStyle;

  sectionDivider: ViewStyle;
  firstSectionDivider: ViewStyle;

  centeredRow: ViewStyle;
  singleButtonContainer: ViewStyle;
  chevronPosition: ViewStyle;
  exploreTitle: TextStyle;
  communityTitle: TextStyle;
  exploreHeaderBackground: ViewStyle;
  communityHeaderBackground: ViewStyle;
  communitySubtitle: TextStyle;
  communityChevron: ViewStyle;
}

// Props per il componente principale NewActionButtonsSection
export interface NewActionButtonsSectionProps {
  animations: ReturnType<typeof useNewActionsAnimations>;
  navigation: ContributeTabScreenProps['navigation'];
}

// Props per ActionButtonsContent
export interface ActionButtonsContentProps {
  animations: ReturnType<typeof useNewActionsAnimations>;
  donateButtons: ButtonData[];
  exploreButtons: ButtonData[];
  communityButtons: ButtonData[];
  onButtonPress: (button: ButtonData) => void;
  onInfoPress: () => void;
  onCommunityTitlePress: () => void;
}

// Props per DonateButtonsSection
export interface DonateButtonsSectionProps {
  styles: ButtonStyles;
  animations: ReturnType<typeof useNewActionsAnimations>;
  donateButtons: ButtonData[];
  onButtonPress: (button: ButtonData) => void;
  onInfoPress: () => void;
}

// Props per ExploreButtonsSection
export interface ExploreButtonsSectionProps {
  styles: ButtonStyles;
  animations: ReturnType<typeof useNewActionsAnimations>;
  exploreButtons: ButtonData[];
  onButtonPress: (button: ButtonData) => void;
}

// Props per CommunityButtonsSection
export interface CommunityButtonsSectionProps {
  styles: ButtonStyles;
  animations: ReturnType<typeof useNewActionsAnimations>;
  communityButtons: ButtonData[];
  onButtonPress: (button: ButtonData) => void;
  onCommunityTitlePress: () => void;
}

// Props per AnimatedButton
export interface AnimatedButtonProps {
  button: ButtonData;
  animationValue: Animated.Value; // Tipo corretto per eliminare warning ESLint
  styles: ButtonStyles;
  onPress: () => void;
  iconColor: string;
  fullWidth?: boolean;
}

// Props per i componenti utility divider
export interface SectionDividerProps {
  styles: ButtonStyles;
}
