import { Colors } from '../shared/constants/designTokens';
import type { ActionData, ActionHandlers } from '../types/HomeActionsTypes';

// ===================================================================
// ACTIONS DATA FACTORY - Extracted logic
// ===================================================================
export const createActionsData = (
  colors: typeof Colors,
  handlers: ActionHandlers
): ActionData[] => [
  {
    id: 'shop',
    title: 'Shop',
    subtitle: 'Solidale',
    description: 'Acquista con impatto',
    icon: '🛍️',
    handlePress: handlers.onShopPress,
    gradient: [colors.semantic.info.main, colors.primary[500]],
    accentColor: colors.semantic.info.main,
  },
  {
    id: 'gift',
    title: 'Gift Card',
    subtitle: 'Regala',
    description: 'Dona solidarietà',
    icon: '🎁',
    handlePress: handlers.onGiftCardPress,
    gradient: [colors.semantic.success.main, colors.primary[600]],
    accentColor: colors.semantic.success.main,
  },
  {
    id: 'events',
    title: 'Eventi',
    subtitle: 'Partecipa',
    description: 'Unisciti a noi',
    icon: '📅',
    handlePress: handlers.onEventsPress,
    gradient: [colors.semantic.warning.main, colors.primary[500]],
    accentColor: colors.semantic.warning.main,
  },
  {
    id: 'projects',
    title: 'Progetti',
    subtitle: 'Scopri',
    description: 'Le nostre iniziative',
    icon: '🌱',
    handlePress: handlers.onProjectsPress,
    gradient: [colors.primary[500], colors.primary[700]],
    accentColor: colors.primary[600],
  },
];
