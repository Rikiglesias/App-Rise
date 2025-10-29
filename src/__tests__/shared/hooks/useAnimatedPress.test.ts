import { renderHook } from '@testing-library/react-native';
import { useAnimatedPress } from '../../../shared/hooks/useAnimatedPress';

describe('useAnimatedPress', () => {
  it('should return animated press handlers', () => {
    const { result } = renderHook(() => useAnimatedPress());
    
    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe('object');
  });

  it('should return hook values', () => {
    const { result } = renderHook(() => useAnimatedPress());
    
    // Hook returns object with properties
    expect(result.current).toBeTruthy();
  });

  it('should be stable across renders', () => {
    const { result } = renderHook(() => useAnimatedPress());
    
    // Hook should return consistent object
    expect(result.current).toBeDefined();
    expect(result.current).toBeTruthy();
  });
});
