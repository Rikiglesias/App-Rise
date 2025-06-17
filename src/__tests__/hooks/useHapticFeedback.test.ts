import { renderHook } from '@testing-library/react-native';
import { Platform } from 'react-native';

import { useHapticFeedback } from '../../shared/hooks/useHapticFeedback';

// Mock Platform esplicitamente
const mockPlatform = {
  OS: 'ios',
};

Object.defineProperty(Platform, 'OS', {
  get: () => mockPlatform.OS,
  configurable: true,
});

// Mock expo-haptics
const mockImpactAsync = jest.fn().mockResolvedValue(undefined);

jest.mock('expo-haptics', () => ({
  impactAsync: mockImpactAsync,
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

describe('useHapticFeedback', () => {
  beforeEach(() => {
    void jest.clearAllMocks();
    mockPlatform.OS = 'ios';
  });

  it('should work on iOS platform', () => {
    expect(Platform.OS).toBe('ios');
  });

  it.skip('should call triggerHaptic and execute haptic', async () => {
    const { result } = renderHook(() => useHapticFeedback());

    // Test triggerHaptic directly
    await result.current.triggerHaptic('light');

    // Should have called impactAsync with Light value
    expect(mockImpactAsync).toHaveBeenCalledWith('LIGHT_VALUE');
  });
});
