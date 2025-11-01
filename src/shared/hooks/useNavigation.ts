import type { StackNavigationProp } from '@react-navigation/stack';
import { useCallback } from 'react';

import { useHapticFeedback } from './useHapticFeedback';
import type { RootStackParamList } from '@/navigation/types';


interface UseNavigationHookOptions {
  enableHaptics?: boolean;
}

interface UseNavigationHookReturn {
  navigateToImpatto: () => void;
  navigateToProgetti: () => void;
  navigateToSeguici: () => void;
  navigateToChiSiamo: () => void;
  triggerHaptic: () => void;
}

export const useNavigationHook = (
  navigation: StackNavigationProp<RootStackParamList, keyof RootStackParamList>,
  options: UseNavigationHookOptions = {}
): UseNavigationHookReturn => {
  const { enableHaptics = true } = options;
  const { selectionFeedback } = useHapticFeedback();

  // Haptic feedback function using the existing hook
  const triggerHaptic = useCallback(() => {
    if (enableHaptics) {
      void selectionFeedback();
    }
  }, [enableHaptics, selectionFeedback]);

  // Memoized navigation handlers with haptic feedback
  const navigateToImpatto = useCallback(() => {
    triggerHaptic();
    navigation.navigate('Impatto2024');
  }, [navigation, triggerHaptic]);

  const navigateToProgetti = useCallback(() => {
    triggerHaptic();
    void navigation.navigate('Progetti');
  }, [navigation, triggerHaptic]);

  const navigateToSeguici = useCallback(() => {
    triggerHaptic();
    void navigation.navigate('Seguici');
  }, [navigation, triggerHaptic]);

  const navigateToChiSiamo = useCallback(() => {
    triggerHaptic();
    void navigation.navigate('ChiSiamo');
  }, [navigation, triggerHaptic]);

  return {
    navigateToImpatto,
    navigateToProgetti,
    navigateToSeguici,
    navigateToChiSiamo,
    triggerHaptic,
  };
};
