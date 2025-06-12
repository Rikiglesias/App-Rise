import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type HapticType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection'
  | 'impact';

export interface HapticOptions {
  delay?: number;
  repeat?: number;
  interval?: number;
}

// Utilità per eseguire haptic basato sul tipo
const executeHapticByType = async (type: HapticType): Promise<void> => {
  try {
    switch (type) {
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        break;
      case 'warning':
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning
        );
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'selection':
        await Haptics.selectionAsync();
        break;
      case 'impact':
      default:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
    }
  } catch {
    // Fail silently on unsupported devices
  }
};

// Gestione ripetizioni e delay
const executeWithOptions = async (
  type: HapticType,
  options: HapticOptions
): Promise<void> => {
  const { delay = 0, repeat = 1, interval = 100 } = options;

  const execute = () => executeHapticByType(type);

  if (delay > 0) {
    setTimeout(async () => {
      await execute();
      for (let i = 1; i < repeat; i++) {
        setTimeout(() => void execute(), interval * i);
      }
    }, delay);
  } else {
    await execute();
    for (let i = 1; i < repeat; i++) {
      setTimeout(() => void execute(), interval * i);
    }
  }
};

export const useHapticFeedback = () => {
  const triggerHaptic = async (
    type: HapticType,
    options: HapticOptions = {}
  ) => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      return;
    }
    await executeWithOptions(type, options);
  };

  return {
    triggerHaptic,
    // Shortcuts
    lightTap: () => triggerHaptic('light'),
    mediumTap: () => triggerHaptic('medium'),
    heavyTap: () => triggerHaptic('heavy'),
    successFeedback: () => triggerHaptic('success'),
    errorFeedback: () => triggerHaptic('error'),
    selectionFeedback: () => triggerHaptic('selection'),
    // Patterns
    buttonPress: () => triggerHaptic('medium'),
    cardTap: () => triggerHaptic('light'),
    swipeGesture: () => triggerHaptic('selection'),
    longPress: () => triggerHaptic('heavy', { delay: 50 }),
    doubleVibration: () =>
      triggerHaptic('medium', { repeat: 2, interval: 100 }),
    pulsePattern: () => triggerHaptic('light', { repeat: 3, interval: 150 }),
  };
};
