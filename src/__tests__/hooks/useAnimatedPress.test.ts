import { renderHook } from '@testing-library/react-native';
import { useAnimatedPress } from '../../hooks/useAnimatedPress';

describe('useAnimatedPress', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAnimatedPress());

    expect(result.current).toHaveProperty('scaleValue');
    expect(result.current).toHaveProperty('opacityValue');
    expect(result.current).toHaveProperty('shadowValue');
    expect(result.current).toHaveProperty('handlePressIn');
    expect(result.current).toHaveProperty('handlePressOut');
    expect(result.current).toHaveProperty('animatedStyle');
  });

  it('should accept custom options', () => {
    const options = {
      scaleValue: 0.95,
      minOpacity: 0.7,
      shadowEnabled: false,
    };

    const { result } = renderHook(() => useAnimatedPress(options));

    expect(result.current.handlePressIn).toBeInstanceOf(Function);
    expect(result.current.handlePressOut).toBeInstanceOf(Function);
  });

  it('should return consistent animatedStyle object', () => {
    const { result } = renderHook(() => useAnimatedPress());

    expect(result.current.animatedStyle).toHaveProperty('transform');
    expect(result.current.animatedStyle).toHaveProperty('opacity');
    expect(Array.isArray(result.current.animatedStyle.transform)).toBe(true);
  });
});
