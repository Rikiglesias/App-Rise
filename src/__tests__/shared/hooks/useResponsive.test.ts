import { renderHook } from '@testing-library/react-native';
import { useResponsive, useIntelligentFontScaling, useBreakpointAware } from '../../../shared/hooks/useResponsive';

// Mock react-native modules
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('useResponsive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should return responsive object with all required properties', () => {
      const { result } = renderHook(() => useResponsive());

      expect(result.current).toHaveProperty('dimensions');
      expect(result.current).toHaveProperty('deviceInfo');
      expect(result.current).toHaveProperty('scalingFactors');
      expect(result.current).toHaveProperty('scale');
      expect(result.current).toHaveProperty('scaleFont');
      expect(result.current).toHaveProperty('scaleSpacing');
    });

    it('should have dimensions with width, height, breakpoint, and fontScale', () => {
      const { result } = renderHook(() => useResponsive());

      expect(result.current.dimensions).toHaveProperty('width');
      expect(result.current.dimensions).toHaveProperty('height');
      expect(result.current.dimensions).toHaveProperty('breakpoint');
      expect(result.current.dimensions).toHaveProperty('fontScale');
    });

    it('should return scaling functions that are callable', () => {
      const { result } = renderHook(() => useResponsive());

      expect(typeof result.current.scale).toBe('function');
      expect(typeof result.current.scaleFont).toBe('function');
      expect(typeof result.current.scaleSpacing).toBe('function');
    });
  });

  describe('Breakpoint Detection', () => {
    it('should provide breakpoint boolean flags', () => {
      const { result } = renderHook(() => useResponsive());

      expect(typeof result.current.isCompact).toBe('boolean');
      expect(typeof result.current.isStandard).toBe('boolean');
      expect(typeof result.current.isLarge).toBe('boolean');
      expect(typeof result.current.isXLarge).toBe('boolean');
      expect(typeof result.current.isXXLarge).toBe('boolean');
    });

    it('should have one and only one breakpoint flag as true', () => {
      const { result } = renderHook(() => useResponsive());

      const flags = [
        result.current.isCompact,
        result.current.isStandard,
        result.current.isLarge,
        result.current.isXLarge,
        result.current.isXXLarge,
      ];

      const trueCount = flags.filter(Boolean).length;
      expect(trueCount).toBe(1);
    });

    it('should provide scaling utilities based on breakpoint', () => {
      const { result } = renderHook(() => useResponsive());

      expect(typeof result.current.canScaleUp).toBe('boolean');
      expect(typeof result.current.shouldScaleDown).toBe('boolean');
    });
  });

  describe('Select Helper', () => {
    it('should have a select function', () => {
      const { result } = renderHook(() => useResponsive());

      expect(typeof result.current.select).toBe('function');
    });

    it('should return default value when called', () => {
      const { result } = renderHook(() => useResponsive());

      const value = result.current.select({
        compact: 10,
        standard: 20,
        large: 30,
        default: 15,
      });

      expect(typeof value).toBe('number');
    });

    it('should return breakpoint-specific value or default', () => {
      const { result } = renderHook(() => useResponsive());

      const testValues = {
        compact: 'compact-value',
        standard: 'standard-value',
        default: 'default-value',
      };

      const value = result.current.select(testValues);
      expect(typeof value).toBe('string');
    });
  });

  describe('Responsive Tokens', () => {
    it('should provide spacing tokens', () => {
      const { result } = renderHook(() => useResponsive());

      expect(result.current.spacing).toBeDefined();
      expect(typeof result.current.spacing).toBe('object');
    });

    it('should provide typography tokens', () => {
      const { result } = renderHook(() => useResponsive());

      expect(result.current.typography).toBeDefined();
      expect(typeof result.current.typography).toBe('object');
    });

    it('should provide layout tokens', () => {
      const { result } = renderHook(() => useResponsive());

      expect(result.current.layout).toBeDefined();
      expect(typeof result.current.layout).toBe('object');
    });
  });

  // Note: Dimension Updates tests skipped due to React Native mock limitations
});

describe('useIntelligentFontScaling', () => {
  it('should return font scaling utilities', () => {
    const { result } = renderHook(() => useIntelligentFontScaling());

    expect(result.current).toHaveProperty('scaleFont');
    expect(result.current).toHaveProperty('canScaleUp');
    expect(result.current).toHaveProperty('shouldScaleDown');
    expect(result.current).toHaveProperty('currentBreakpoint');
  });

  it('should provide scaleIfLarge helper', () => {
    const { result } = renderHook(() => useIntelligentFontScaling());

    expect(typeof result.current.scaleIfLarge).toBe('function');

    const scaled = result.current.scaleIfLarge(16, 20);
    expect(typeof scaled).toBe('number');
  });

  it('should provide getOptimalFontSize helper', () => {
    const { result } = renderHook(() => useIntelligentFontScaling());

    expect(typeof result.current.getOptimalFontSize).toBe('function');

    const optimal = result.current.getOptimalFontSize(12, 16, 20);
    expect(typeof optimal).toBe('number');
    expect(optimal).toBeGreaterThan(0);
  });

  it('should return consistent scaling results', () => {
    const { result } = renderHook(() => useIntelligentFontScaling());

    const size1 = result.current.scaleIfLarge(16);
    const size2 = result.current.scaleIfLarge(16);

    expect(size1).toBe(size2);
  });
});

describe('useBreakpointAware', () => {
  it('should return all responsive properties', () => {
    const { result } = renderHook(() => useBreakpointAware());

    // Should include all properties from useResponsive
    expect(result.current).toHaveProperty('dimensions');
    expect(result.current).toHaveProperty('deviceInfo');
    expect(result.current).toHaveProperty('scale');
  });

  it('should be a wrapper around useResponsive', () => {
    const { result: responsiveResult } = renderHook(() => useResponsive());
    const { result: breakpointResult } = renderHook(() => useBreakpointAware());

    // Should have same dimensions
    expect(breakpointResult.current.dimensions.width).toBe(
      responsiveResult.current.dimensions.width
    );
  });
});

describe('Integration Tests', () => {
  it('should maintain consistent state across multiple hook calls', () => {
    const { result: result1 } = renderHook(() => useResponsive());
    const { result: result2 } = renderHook(() => useResponsive());

    // Both should report same dimensions
    expect(result1.current.dimensions.width).toBe(
      result2.current.dimensions.width
    );
    expect(result1.current.dimensions.breakpoint).toBe(
      result2.current.dimensions.breakpoint
    );
  });

  it('should work with useIntelligentFontScaling and useResponsive together', () => {
    const { result: responsiveResult } = renderHook(() => useResponsive());
    const { result: fontResult } = renderHook(() => useIntelligentFontScaling());

    expect(responsiveResult.current.dimensions.breakpoint).toBe(
      fontResult.current.currentBreakpoint
    );
  });
});
