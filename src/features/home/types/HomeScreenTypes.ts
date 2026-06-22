// ===================================================================
// 🏠 HOME FEATURE - TYPES
// ===================================================================

import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/types';

/**
 * Home Screen Types
 * Tipi per la feature Home
 * RootStackParamList: SSOT in @/navigation/types (qui NON ridefinito).
 */

// Navigation types
export interface HomeScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}
