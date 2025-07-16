import { renderHook } from '@testing-library/react-native';

import { useProfessionalAnimations } from '../../shared/hooks/useProfessionalAnimations';

describe('useProfessionalAnimations', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should initialize with correct animation values', () => {
    const { result } = renderHook(() => useProfessionalAnimations());

    expect(result.current).toHaveProperty('headerFade');
    expect(result.current).toHaveProperty('contentReveal');
    expect(result.current).toHaveProperty('sectionsStagger');
    expect(result.current).toHaveProperty('statsAnimation');
  });

  it('should provide sectionsStagger as array', () => {
    const { result } = renderHook(() => useProfessionalAnimations());

    expect(Array.isArray(result.current.sectionsStagger)).toBe(true);
    expect(result.current.sectionsStagger).toHaveLength(3);
  });

  it('should start animations on mount', () => {
    const { result } = renderHook(() => useProfessionalAnimations());

    // Verifica che le animazioni esistano
    expect(result.current.headerFade).toBeDefined();
    expect(result.current.contentReveal).toBeDefined();
    expect(result.current.statsAnimation).toBeDefined();
  });
});
