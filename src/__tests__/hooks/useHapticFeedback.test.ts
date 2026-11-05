import { renderHook } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { useHapticFeedback } from '../../shared/hooks/useHapticFeedback';

// Platform.OS pilotato dal test: il hook vibra solo su iOS e Android.
const mockPlatform = {
  OS: 'ios',
};

Object.defineProperty(Platform, 'OS', {
  get: () => mockPlatform.OS,
  configurable: true,
});

// I mock stanno DENTRO la factory: `jest.mock` sale sopra gli import, e una costante
// definita fuori lì non è ancora inizializzata (era il motivo del vecchio `it.skip`).
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 'LIGHT_VALUE',
    Medium: 'MEDIUM_VALUE',
    Heavy: 'HEAVY_VALUE',
  },
  NotificationFeedbackType: {
    Success: 'SUCCESS_VALUE',
    Warning: 'WARNING_VALUE',
    Error: 'ERROR_VALUE',
  },
}));

const impactAsync = Haptics.impactAsync as jest.Mock;
const notificationAsync = Haptics.notificationAsync as jest.Mock;
const selectionAsync = Haptics.selectionAsync as jest.Mock;
const tutte = [impactAsync, notificationAsync, selectionAsync];

describe('useHapticFeedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPlatform.OS = 'ios';
  });

  it.each([
    ['light', impactAsync, ['LIGHT_VALUE']],
    ['heavy', impactAsync, ['HEAVY_VALUE']],
    ['success', notificationAsync, ['SUCCESS_VALUE']],
    ['error', notificationAsync, ['ERROR_VALUE']],
    ['selection', selectionAsync, []],
  ] as const)(
    '%s fa partire la sua vibrazione e nessun’altra',
    async (tipo, fn, args) => {
      const { result } = renderHook(() => useHapticFeedback());

      await result.current.triggerHaptic(tipo);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith(...args);
      for (const altra of tutte)
        if (altra !== fn) expect(altra).not.toHaveBeenCalled();
    }
  );

  it('vibra anche su Android', async () => {
    mockPlatform.OS = 'android';
    const { result } = renderHook(() => useHapticFeedback());

    await result.current.lightTap();

    expect(impactAsync).toHaveBeenCalledWith('LIGHT_VALUE');
  });

  it('sul web non chiama nessuna vibrazione', async () => {
    mockPlatform.OS = 'web';
    const { result } = renderHook(() => useHapticFeedback());

    await result.current.triggerHaptic('heavy');

    for (const fn of tutte) expect(fn).not.toHaveBeenCalled();
  });

  it('un dispositivo senza vibrazione non fa fallire il tocco', async () => {
    impactAsync.mockRejectedValueOnce(new Error('non supportato'));
    const { result } = renderHook(() => useHapticFeedback());

    await expect(
      result.current.triggerHaptic('light')
    ).resolves.toBeUndefined();
    expect(impactAsync).toHaveBeenCalledTimes(1);
  });
});
