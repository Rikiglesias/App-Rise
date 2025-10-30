import { renderHook } from '@testing-library/react-native';
import { useFoldableLayout } from '../../../shared/hooks/useFoldableLayout';

// Mock Dimensions.get() since it's not available in test environment
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Dimensions: {
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
      get: () => ({ width: 390, height: 844 }),
    },
  };
});

describe('useFoldableLayout', () => {
  it('should return layout configuration', () => {
    const { result } = renderHook(() => useFoldableLayout());

    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe('object');
  });

  it('should determine if device is in foldable mode', () => {
    const { result } = renderHook(() => useFoldableLayout());

    expect(typeof result.current.isFoldableMode).toBe('boolean');
  });

  it('should provide device info', () => {
    const { result } = renderHook(() => useFoldableLayout());

    expect(result.current.deviceInfo).toBeDefined();
  });

  it('should handle non-foldable devices gracefully', () => {
    const { result } = renderHook(() => useFoldableLayout());

    expect(result.current).toBeTruthy();
  });
});
