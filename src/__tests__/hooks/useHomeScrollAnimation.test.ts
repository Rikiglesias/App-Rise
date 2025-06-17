import { renderHook } from '@testing-library/react-native';

import { useHomeScrollAnimation } from '../../shared/hooks/useHomeScrollAnimation';

describe('useHomeScrollAnimation', () => {
  it('should initialize with correct values', () => {
    const { result } = renderHook(() => useHomeScrollAnimation());

    expect(result.current).toHaveProperty('scrollY');
    expect(result.current).toHaveProperty('handleScroll');
    expect(result.current).toHaveProperty('handleImpactSectionLayout');
    expect(result.current).toHaveProperty('isImpactSectionVisible');
  });

  it('should provide isImpactSectionVisible as boolean', () => {
    const { result } = renderHook(() => useHomeScrollAnimation());

    expect(typeof result.current.isImpactSectionVisible).toBe('boolean');
    expect(result.current.isImpactSectionVisible).toBe(false);
  });

  it('should provide handleScroll as function', () => {
    const { result } = renderHook(() => useHomeScrollAnimation());

    expect(typeof result.current.handleScroll).toBe('function');
  });

  it('should provide handleImpactSectionLayout as function', () => {
    const { result } = renderHook(() => useHomeScrollAnimation());

    expect(typeof result.current.handleImpactSectionLayout).toBe('function');
  });
});
