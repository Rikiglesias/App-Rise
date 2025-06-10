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

export const useHapticFeedback = () => {
  const triggerHaptic = async (
    type: HapticType,
    options: HapticOptions = {}
  ) => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      return;
    }

    const { delay = 0, repeat = 1, interval = 100 } = options;

    const executeHaptic = async () => {
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
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Error
            );
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
        // Haptic feedback not supported on this device
      }
    };

    // Delay iniziale
    if (delay > 0) {
      setTimeout(async () => {
        await executeHaptic();

        // Ripetizioni aggiuntive
        for (let i = 1; i < repeat; i++) {
          setTimeout(executeHaptic, interval * i);
        }
      }, delay);
    } else {
      await executeHaptic();

      // Ripetizioni aggiuntive
      for (let i = 1; i < repeat; i++) {
        setTimeout(executeHaptic, interval * i);
      }
    }
  };

  // Shortcuts per i tipi più comuni
  const lightTap = () => triggerHaptic('light');
  const mediumTap = () => triggerHaptic('medium');
  const heavyTap = () => triggerHaptic('heavy');
  const successFeedback = () => triggerHaptic('success');
  const errorFeedback = () => triggerHaptic('error');
  const selectionFeedback = () => triggerHaptic('selection');

  // Patterns complessi
  const buttonPress = () => triggerHaptic('medium');
  const cardTap = () => triggerHaptic('light');
  const swipeGesture = () => triggerHaptic('selection');
  const longPress = () => triggerHaptic('heavy', { delay: 50 });
  const doubleVibration = () =>
    triggerHaptic('medium', { repeat: 2, interval: 100 });
  const pulsePattern = () =>
    triggerHaptic('light', { repeat: 3, interval: 150 });

  return {
    triggerHaptic,
    lightTap,
    mediumTap,
    heavyTap,
    successFeedback,
    errorFeedback,
    selectionFeedback,
    buttonPress,
    cardTap,
    swipeGesture,
    longPress,
    doubleVibration,
    pulsePattern,
  };
};
