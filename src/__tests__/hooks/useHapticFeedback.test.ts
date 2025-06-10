import { renderHook } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

describe('useHapticFeedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide all expected functions', () => {
    const { result } = renderHook(() => useHapticFeedback());

    expect(result.current).toHaveProperty('triggerHaptic');
    expect(result.current).toHaveProperty('lightTap');
    expect(result.current).toHaveProperty('mediumTap');
    expect(result.current).toHaveProperty('heavyTap');
    expect(result.current).toHaveProperty('successFeedback');
    expect(result.current).toHaveProperty('errorFeedback');
    expect(result.current).toHaveProperty('selectionFeedback');
    expect(result.current).toHaveProperty('buttonPress');
    expect(result.current).toHaveProperty('cardTap');
    expect(result.current).toHaveProperty('swipeGesture');
    expect(result.current).toHaveProperty('longPress');
    expect(result.current).toHaveProperty('doubleVibration');
    expect(result.current).toHaveProperty('pulsePattern');
  });

  it('should call appropriate haptic for lightTap', async () => {
    const mockImpactAsync = require('expo-haptics').impactAsync;
    const { result } = renderHook(() => useHapticFeedback());

    await result.current.lightTap();

    expect(mockImpactAsync).toHaveBeenCalledWith('light');
  });

  it('should handle errors gracefully', async () => {
    const mockImpactAsync = require('expo-haptics').impactAsync;
    mockImpactAsync.mockRejectedValueOnce(new Error('Haptic not supported'));

    const { result } = renderHook(() => useHapticFeedback());

    // Should not throw error
    await expect(result.current.lightTap()).resolves.toBeUndefined();
  });

  it('should skip haptics on unsupported platforms', async () => {
    const originalPlatform = Platform.OS;
    Object.defineProperty(Platform, 'OS', {
      writable: true,
      value: 'web',
    });

    const mockImpactAsync = require('expo-haptics').impactAsync;
    const { result } = renderHook(() => useHapticFeedback());

    await result.current.lightTap();

    expect(mockImpactAsync).not.toHaveBeenCalled();

    // Restore platform
    Object.defineProperty(Platform, 'OS', {
      writable: true,
      value: originalPlatform,
    });
  });
});
