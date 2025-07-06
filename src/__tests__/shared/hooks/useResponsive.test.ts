import { renderHook } from '@testing-library/react-native';
import { useResponsive } from '../../../shared/hooks/useResponsive';

// Mock completo del sistema responsive
jest.mock('../../../shared/constants/responsiveSystem', () => ({
  DeviceInfo: {
    width: 375,
    height: 812,
    scale: 1,
    fontScale: 1,
  },
  ScalingFactors: {
    fontSize: 1.0,
    spacing: 1.0,
    borderRadius: 1.0,
  },
  getCurrentBreakpoint: jest.fn(() => 'standard'),
  scaleSize: jest.fn((size: number) => size),
  scaleFont: jest.fn((size: number) => size),
  scaleSpacing: jest.fn((size: number) => size),
  DesignTokens: {
    layout: { spacing: 16 },
  },
  TypographyTokens: {
    styles: {
      body: { medium: 16 },
    },
  },
  SpacingTokens: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
}));

// Mock React Native Dimensions
jest.mock('react-native', () => ({
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
    addEventListener: jest.fn(() => ({
      remove: jest.fn(),
    })),
  },
}));

describe('useResponsive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return responsive values successfully', () => {
    const { result } = renderHook(() => useResponsive());

    expect(result.current).toBeDefined();
    expect(result.current.dimensions).toBeDefined();
    expect(result.current.dimensions.width).toBe(375);
    expect(result.current.dimensions.height).toBe(812);
  });

  it('should provide scaling functions', () => {
    const { result } = renderHook(() => useResponsive());

    expect(typeof result.current.scale).toBe('function');
    expect(typeof result.current.scaleFont).toBe('function');
    expect(typeof result.current.scaleSpacing).toBe('function');
  });

  it('should provide device categorization', () => {
    const { result } = renderHook(() => useResponsive());

    expect(typeof result.current.isCompact).toBe('boolean');
    expect(typeof result.current.isStandard).toBe('boolean');
    expect(typeof result.current.isLarge).toBe('boolean');
    expect(typeof result.current.isSmallDevice).toBe('boolean');
    expect(typeof result.current.isMediumDevice).toBe('boolean');
    expect(typeof result.current.isLargeDevice).toBe('boolean');
  });

  it('should provide select utility function', () => {
    const { result } = renderHook(() => useResponsive());

    expect(typeof result.current.select).toBe('function');

    const selectedValue = result.current.select({
      compact: 'small',
      standard: 'medium',
      large: 'large',
      default: 'default',
    });

    expect(selectedValue).toBeDefined();
  });

  it('should provide design tokens', () => {
    const { result } = renderHook(() => useResponsive());

    expect(result.current.spacing).toBeDefined();
    expect(result.current.typography).toBeDefined();
    expect(result.current.layout).toBeDefined();
    expect(result.current.deviceInfo).toBeDefined();
    expect(result.current.scalingFactors).toBeDefined();
  });

  it('should handle device info correctly', () => {
    const { result } = renderHook(() => useResponsive());

    expect(result.current.deviceInfo.width).toBe(375);
    expect(result.current.deviceInfo.height).toBe(812);
  });

  it('should provide scaling utilities', () => {
    const { result } = renderHook(() => useResponsive());

    expect(typeof result.current.canScaleUp).toBe('boolean');
    expect(typeof result.current.shouldScaleDown).toBe('boolean');
  });

  it('should handle responsive component updates', () => {
    const { result } = renderHook(() => useResponsive());

    expect(result.current.dimensions.width).toBe(375);
    expect(result.current.dimensions.height).toBe(812);
    expect(result.current.dimensions.breakpoint).toBe('standard');
  });
});
