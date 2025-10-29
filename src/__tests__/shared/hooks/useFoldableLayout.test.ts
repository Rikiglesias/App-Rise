import { renderHook } from '@testing-library/react-native';
import { useFoldableLayout } from '../../../shared/hooks/useFoldableLayout';

// Mock dependencies
jest.mock('../../../shared/hooks/useResponsive', () => ({
  useResponsive: () => ({
    dimensions: { width: 390, height: 844, breakpoint: 'standard' },
    deviceInfo: { width: 390, height: 844, isLandscape: false },
  }),
}));

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
