import { renderHook } from '@testing-library/react-native';
import { useFoldableLayout } from '../../../shared/hooks/useFoldableLayout';

// Mock react-native to avoid DevMenu and other native module issues
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Platform: {
      ...RN.Platform,
      OS: 'ios',
    },
    Dimensions: {
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
      get: () => ({ width: 390, height: 844 }),
    },
    NativeModules: {
      ...RN.NativeModules,
      DevMenu: null,
    },
    TurboModuleRegistry: {
      getEnforcing: jest.fn(),
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
