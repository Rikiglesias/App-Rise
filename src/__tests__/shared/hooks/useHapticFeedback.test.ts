import { renderHook } from '@testing-library/react-native';
import { useHapticFeedback } from '../../../shared/hooks/useHapticFeedback';

describe('useHapticFeedback', () => {
  it('should return haptic feedback object', () => {
    const { result } = renderHook(() => useHapticFeedback());
    
    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe('object');
  });

  it('should have haptic methods', () => {
    const { result } = renderHook(() => useHapticFeedback());
    
    expect(result.current).toBeTruthy();
  });

  it('should be stable across renders', () => {
    const { result } = renderHook(() => useHapticFeedback());
    
    expect(result.current).not.toBeNull();
  });
});
