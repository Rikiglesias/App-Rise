import { Dimensions } from 'react-native';
import { Spacing } from '../constants/designTokens';

const { width: screenWidth } = Dimensions.get('window');

export interface HomeActionsSectionProps {
  readonly onShopPress: () => void;
  readonly onGiftCardPress: () => void;
  readonly onEventsPress: () => void;
  readonly onProjectsPress: () => void;
}

export interface ActionData {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly icon: string;
  readonly handlePress: () => void;
  readonly gradient: readonly string[];
  readonly accentColor: string;
}

// Type for styles to avoid circular imports
export type HomeActionsStyles = Record<string, any>;

export interface CardOverlaysProps {
  readonly accentColor: string;
  readonly cardStyles: HomeActionsStyles;
}

export interface CardHeaderProps {
  readonly action: ActionData;
  readonly cardStyles: HomeActionsStyles;
}

export interface BentoActionCardProps {
  readonly action: ActionData;
  readonly cardStyles: HomeActionsStyles;
}

export interface ActionHandlers {
  readonly onShopPress: () => void;
  readonly onGiftCardPress: () => void;
  readonly onEventsPress: () => void;
  readonly onProjectsPress: () => void;
}

// ===================================================================
// LAYOUT CONFIGURATION - Extracted logic
// ===================================================================
export const getLayoutConfig = () => {
  // Breakpoint intelligenti basati su device reali
  if (screenWidth >= 768) {
    // Tablet e desktop: 2x2 griglia con gap generoso
    return {
      numColumns: 2,
      cardWidth: '48%',
      gap: Spacing[3],
      justifyContent: 'space-between' as const,
    };
  } else if (screenWidth >= 430) {
    // iPhone Pro Max, telefoni large: 2x2 ottimizzata
    return {
      numColumns: 2,
      cardWidth: '47%', // Leggermente ridotta per più spazio
      gap: Spacing[3],
      justifyContent: 'space-between' as const,
    };
  } else if (screenWidth >= 375) {
    // iPhone standard, telefoni medi: 2x2 compatta
    return {
      numColumns: 2,
      cardWidth: '46%', // Ridotta per spazio ottimale
      gap: Spacing[2],
      justifyContent: 'space-between' as const,
    };
  }
  // Telefoni piccoli: layout verticale 1 colonna
  return {
    numColumns: 1,
    cardWidth: '100%',
    gap: Spacing[3],
    justifyContent: 'center' as const,
  };
};
