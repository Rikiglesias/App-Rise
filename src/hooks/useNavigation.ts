import { StackNavigationProp } from '@react-navigation/stack';
import { useCallback } from 'react';
import { RootStackParamList } from '../navigation/types';
import { useHapticFeedback } from './useHapticFeedback';

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
      selectionFeedback();
    }
  }, [enableHaptics, selectionFeedback]);

  // Memoized navigation handlers with haptic feedback
  const navigateToImpatto = useCallback(() => {
    triggerHaptic();
    navigation.navigate('Impatto2024');
  }, [navigation, triggerHaptic]);

  const navigateToProgetti = useCallback(() => {
    triggerHaptic();
    navigation.navigate('Progetti');
  }, [navigation, triggerHaptic]);

  const navigateToSeguici = useCallback(() => {
    triggerHaptic();
    navigation.navigate('Seguici');
  }, [navigation, triggerHaptic]);

  const navigateToChiSiamo = useCallback(() => {
    triggerHaptic();
    navigation.navigate('ChiSiamo');
  }, [navigation, triggerHaptic]);

  return {
    navigateToImpatto,
    navigateToProgetti,
    navigateToSeguici,
    navigateToChiSiamo,
    triggerHaptic,
  };
};
