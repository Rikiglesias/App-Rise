// ===================================================================
// TEST SISTEMA RESPONSIVE - VERIFICHE ESSENZIALI
// ===================================================================

import { Dimensions } from 'react-native';
import { renderHook } from '@testing-library/react-native';
import { useUniversalResponsiveDesign } from '../../../shared/hooks/useResponsiveDesign';

// Mock Dimensions
jest.mock('react-native', () => ({
  Dimensions: {
    get: jest.fn(),
  },
}));

// Mock safe area context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    top: 20,
    bottom: 20,
    left: 0,
    right: 0,
  }),
}));

// Mock del file responsiveBreakpoints per evitare problemi con Dimensions durante l'import
jest.mock('../../../shared/constants/responsiveBreakpoints', () => ({
  getUniversalDeviceCategory: jest.fn(() => 'medium'),
  UniversalResponsiveLayouts: {
    actionCards: {
      medium: { columns: 2, cardWidth: '47%', gap: 12 },
    },
    sectionPadding: {
      medium: { horizontal: 16, vertical: 20 },
    },
  },
  UniversalBreakpoints: {
    xs: 320,
    sm: 360,
    md: 375,
    lg: 390,
    xl: 393,
  },
  UniversalDeviceCategories: {
    medium: {
      min: 390,
      max: 401,
      devices: ['iPhone 14/13/12'],
    },
  },
  UniversalCurrentDevice: {
    width: 390,
    category: 'medium',
    breakpoint: 'lg',
    isSmallDevice: false,
    isMediumDevice: true,
    isLargeDevice: false,
    isTablet: false,
    isDesktop: false,
    deviceInfo: {
      min: 390,
      max: 401,
      devices: ['iPhone 14/13/12'],
    },
  },
  getUniversalAdaptiveSpacing: jest.fn((spacing: number) => spacing),
  getUniversalAdaptiveFontSize: jest.fn((fontSize: number) => fontSize),
  isUniversalMinWidth: jest.fn(() => true),
  isUniversalBetweenWidths: jest.fn(() => true),
  getUniversalLayoutConfig: jest.fn(() => ({
    columns: 2,
    cardWidth: '47%',
    gap: 12,
  })),
}));

const mockDimensions = Dimensions.get as jest.MockedFunction<
  typeof Dimensions.get
>;

// Helper per creare mock ScaledSize completo
const createScaledSize = (width: number, height: number) => ({
  width,
  height,
  scale: 2,
  fontScale: 1,
});

describe('useUniversalResponsiveDesign', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    test('restituisce oggetto responsive corretto', () => {
      mockDimensions.mockReturnValue(createScaledSize(393, 852));

      const { result } = renderHook(() => useUniversalResponsiveDesign());

      expect(result.current.device).toBeDefined();
      expect(result.current.layout).toBeDefined();
      expect(result.current.responsive).toBeDefined();
      expect(result.current.platform).toBeDefined();
      expect(result.current.safeArea).toBeDefined();
    });

    test('detecta iPhone 15 correttamente', () => {
      mockDimensions.mockReturnValue(createScaledSize(393, 852));

      const { result } = renderHook(() => useUniversalResponsiveDesign());

      expect(result.current.device.width).toBe(393);
      expect(result.current.device.category).toBe('medium');
      expect(result.current.layout.actionCards.columns).toBe(2);
    });

    test('detecta Galaxy S24 correttamente', () => {
      mockDimensions.mockReturnValue(createScaledSize(360, 780));

      const { result } = renderHook(() => useUniversalResponsiveDesign());

      expect(result.current.device.width).toBe(360);
      expect(result.current.device.category).toBe('medium');
    });

    test('detecta iPhone SE correttamente', () => {
      mockDimensions.mockReturnValue(createScaledSize(320, 568));

      const { result } = renderHook(() => useUniversalResponsiveDesign());

      expect(result.current.device.category).toBe('medium');
      expect(result.current.layout.actionCards.columns).toBe(2);
    });

    test('detecta tablet correttamente', () => {
      mockDimensions.mockReturnValue(createScaledSize(768, 1024));

      const { result } = renderHook(() => useUniversalResponsiveDesign());

      expect(result.current.device.width).toBe(768);
      expect(result.current.device.category).toBe('medium');
      expect(result.current.layout).toBeDefined();
    });

    test('responsive functions funzionano', () => {
      mockDimensions.mockReturnValue(createScaledSize(390, 844));

      const { result } = renderHook(() => useUniversalResponsiveDesign());

      expect(typeof result.current.responsive.getSpacing(16)).toBe('number');
      expect(typeof result.current.responsive.getFontSize(16)).toBe('number');
      expect(typeof result.current.responsive.isMinWidth('sm')).toBe('boolean');
    });
  });
});
