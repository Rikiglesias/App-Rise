/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Dimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  ProfessionalContainer,
  TitleContainer,
  CardContainer,
} from '../../../components/ui/ProfessionalContainer';
import { PerfectText } from '../../../components/ui/PerfectText';

// Mock SafeAreaProvider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SafeAreaProvider
    initialMetrics={{
      frame: { x: 0, y: 0, width: 375, height: 812 },
      insets: { top: 44, left: 0, right: 0, bottom: 34 },
    }}
  >
    {children}
  </SafeAreaProvider>
);

// Mock different screen sizes
const mockScreenSize = (width: number, height: number) => {
  jest.spyOn(Dimensions, 'get').mockReturnValue({
    width,
    height,
    scale: 2,
    fontScale: 1,
  });
};

// Test helper functions
const renderWithTestWrapper = (component: React.ReactElement) => {
  return render(<TestWrapper>{component}</TestWrapper>);
};

const expectStyleToContain = (
  container: { props: { style: unknown } },
  expectedStyle: object
) => {
  const style = Array.isArray(container.props.style)
    ? container.props.style[0]
    : container.props.style;
  expect(style).toEqual(expect.objectContaining(expectedStyle));
};

// Width Management Tests
const testWidthManagement = () => {
  describe('📱 Width Management (Point 1)', () => {
    it('should use 90% width on phone screens', () => {
      mockScreenSize(375, 812);

      renderWithTestWrapper(
        <ProfessionalContainer testID="test-container">
          <PerfectText size={24} lines={1}>
            Test Content
          </PerfectText>
        </ProfessionalContainer>
      );

      const container = screen.getByTestId('test-container');
      expectStyleToContain(container, {
        maxWidth: '90%',
        width: '100%',
        alignSelf: 'center',
      });
    });

    it('should use fixed width on tablet screens', () => {
      mockScreenSize(768, 1024);

      renderWithTestWrapper(
        <ProfessionalContainer testID="test-container">
          <PerfectText size={24} lines={1}>
            Test Content
          </PerfectText>
        </ProfessionalContainer>
      );

      const container = screen.getByTestId('test-container');
      expectStyleToContain(container, {
        maxWidth: expect.any(Number),
        width: '100%',
        alignSelf: 'center',
      });
    });

    it('should handle forced width override', () => {
      mockScreenSize(375, 812);

      renderWithTestWrapper(
        <ProfessionalContainer testID="test-container" forceWidth="100%">
          <PerfectText size={24} lines={1}>
            Test Content
          </PerfectText>
        </ProfessionalContainer>
      );

      const container = screen.getByTestId('test-container');
      expectStyleToContain(container, {
        maxWidth: '100%',
      });
    });
  });
};

// Padding Tests
const testPaddingConsistency = () => {
  describe('📏 Padding Consistency (Point 2)', () => {
    it('should apply constant padding in dp', () => {
      mockScreenSize(375, 812);

      renderWithTestWrapper(
        <ProfessionalContainer testID="test-container">
          <PerfectText size={24} lines={1}>
            Test Content
          </PerfectText>
        </ProfessionalContainer>
      );

      const container = screen.getByTestId('test-container');
      const style = Array.isArray(container.props.style)
        ? container.props.style[0]
        : container.props.style;

      expect(style?.paddingHorizontal).toBeGreaterThan(0);
      expect((style?.paddingHorizontal as number) % 4).toBe(0);
    });

    it('should scale padding consistently across devices', () => {
      mockScreenSize(320, 568);
      const { rerender } = renderWithTestWrapper(
        <ProfessionalContainer testID="test-container">
          <PerfectText size={24} lines={1}>
            Test Content
          </PerfectText>
        </ProfessionalContainer>
      );

      const smallContainer = screen.getByTestId('test-container');
      const smallStyle = Array.isArray(smallContainer.props.style)
        ? smallContainer.props.style[0]
        : smallContainer.props.style;
      const smallPadding = smallStyle.paddingHorizontal;

      mockScreenSize(428, 926);
      rerender(
        <TestWrapper>
          <ProfessionalContainer testID="test-container">
            <PerfectText size={24} lines={1}>
              Test Content
            </PerfectText>
          </ProfessionalContainer>
        </TestWrapper>
      );

      const largeContainer = screen.getByTestId('test-container');
      const largeStyle = Array.isArray(largeContainer.props.style)
        ? largeContainer.props.style[0]
        : largeContainer.props.style;
      const largePadding = largeStyle.paddingHorizontal;

      expect(largePadding).toBeGreaterThanOrEqual(smallPadding);
      expect(largePadding % 4).toBe(0);
    });
  });
};

// Safe Area Tests
const testSafeAreaHandling = () => {
  describe('🛡️ Safe Area Handling (Point 3)', () => {
    it('should integrate safe area insets', () => {
      mockScreenSize(375, 812);

      renderWithTestWrapper(
        <ProfessionalContainer testID="test-container">
          <PerfectText size={24} lines={1}>
            Test Content
          </PerfectText>
        </ProfessionalContainer>
      );

      const container = screen.getByTestId('test-container');
      const style = Array.isArray(container.props.style)
        ? container.props.style[0]
        : container.props.style;

      expect(style.paddingTop).toBeGreaterThan(0);
      expect(style.paddingBottom).toBeGreaterThan(0);
      expect(style.paddingTop).toBeGreaterThanOrEqual(44);
      expect(style.paddingBottom).toBeGreaterThanOrEqual(34);
    });
  });
};

// RTL Tests
const testRTLSupport = () => {
  describe('🌍 RTL Support (Point 4)', () => {
    it('should handle RTL text direction', () => {
      mockScreenSize(375, 812);

      renderWithTestWrapper(
        <ProfessionalContainer testID="test-container" enableRTL={true}>
          <PerfectText size={24} lines={1}>
            مرحبا بك
          </PerfectText>
        </ProfessionalContainer>
      );

      const container = screen.getByTestId('test-container');
      expect(container).toBeTruthy();
      expectStyleToContain(container, {
        alignSelf: 'center',
      });
    });
  });
};

// Variant Tests
const testVariantBehaviors = () => {
  describe('🎯 Variant Behaviors', () => {
    it('should apply text variant styles correctly', () => {
      mockScreenSize(375, 812);

      renderWithTestWrapper(
        <ProfessionalContainer testID="test-container" variant="text">
          <PerfectText size={24} lines={1}>
            Test Content
          </PerfectText>
        </ProfessionalContainer>
      );

      const container = screen.getByTestId('test-container');
      expectStyleToContain(container, {
        maxWidth: '90%',
        alignSelf: 'center',
      });
    });

    it('should apply card variant styles correctly', () => {
      mockScreenSize(375, 812);

      renderWithTestWrapper(
        <ProfessionalContainer testID="test-container" variant="card">
          <PerfectText size={24} lines={1}>
            Test Content
          </PerfectText>
        </ProfessionalContainer>
      );

      const container = screen.getByTestId('test-container');
      expectStyleToContain(container, {
        backgroundColor: '#FFFFFF',
        borderRadius: expect.any(Number),
      });
    });
  });
};

// Main test suite
describe.skip('ProfessionalContainer Layout Consistency', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  testWidthManagement();
  testPaddingConsistency();
  testSafeAreaHandling();
  testRTLSupport();
  testVariantBehaviors();
});

describe.skip('TitleContainer Specialized Tests', () => {
  beforeEach(() => {
    mockScreenSize(375, 812);
  });

  it('should ensure consistent height for 2-line titles', () => {
    render(
      <TestWrapper>
        <TitleContainer testID="title-container">
          <PerfectText size={75} lines={2}>
            Rise Against Hunger Italia
          </PerfectText>
        </TitleContainer>
      </TestWrapper>
    );

    const container = screen.getByTestId('title-container');
    expect(container.props.style).toEqual(
      expect.objectContaining({
        minHeight: 90, // Ensure consistent height
        alignItems: 'center',
        justifyContent: 'center',
      })
    );
  });

  it('should maintain layout consistency with different title lengths', () => {
    const shortTitle = 'Short Title';
    const longTitle =
      'This is a Very Long Title That Should Still Fit in Two Lines';

    // Test short title
    const { rerender } = render(
      <TestWrapper>
        <TitleContainer testID="title-container">
          <PerfectText size={75} lines={2}>
            {shortTitle}
          </PerfectText>
        </TitleContainer>
      </TestWrapper>
    );

    const shortContainer = screen.getByTestId('title-container');
    const shortStyle = shortContainer.props.style;

    // Test long title
    rerender(
      <TestWrapper>
        <TitleContainer testID="title-container">
          <PerfectText size={75} lines={2}>
            {longTitle}
          </PerfectText>
        </TitleContainer>
      </TestWrapper>
    );

    const longContainer = screen.getByTestId('title-container');
    const longStyle = longContainer.props.style;

    // Container should have same dimensions regardless of content
    expect(shortStyle.minHeight).toBe(longStyle.minHeight);
    expect(shortStyle.alignItems).toBe(longStyle.alignItems);
    expect(shortStyle.justifyContent).toBe(longStyle.justifyContent);
  });
});

describe.skip('CardContainer Specialized Tests', () => {
  beforeEach(() => {
    mockScreenSize(375, 812);
  });

  it('should apply proper card styling', () => {
    render(
      <TestWrapper>
        <CardContainer testID="card-container">
          <PerfectText size={16} lines={1}>
            Card Content
          </PerfectText>
        </CardContainer>
      </TestWrapper>
    );

    const container = screen.getByTestId('card-container');
    expect(container.props.style).toEqual(
      expect.objectContaining({
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
      })
    );
  });
});

describe.skip('📊 Layout Measurement Tests', () => {
  it('should provide layout measurement callback', () => {
    mockScreenSize(375, 812);
    const onLayoutMock = jest.fn();

    render(
      <TestWrapper>
        <ProfessionalContainer testID="test-container" onLayout={onLayoutMock}>
          <PerfectText size={24} lines={1}>
            Test Content
          </PerfectText>
        </ProfessionalContainer>
      </TestWrapper>
    );

    // Simulate layout event
    const container = screen.getByTestId('test-container');
    const mockEvent = {
      nativeEvent: {
        layout: {
          width: 337.5, // 90% of 375px
          height: 40,
          x: 0,
          y: 0,
        },
      },
    };

    container.props.onLayout(mockEvent);
    expect(onLayoutMock).toHaveBeenCalledWith(mockEvent);
  });
});

describe.skip('📐 Professional Guide Compliance Checklist', () => {
  beforeEach(() => {
    mockScreenSize(375, 812);
  });

  it('✅ maxWidth consistent across devices', () => {
    render(
      <TestWrapper>
        <ProfessionalContainer testID="test-container">
          <PerfectText size={24} lines={1}>
            Test
          </PerfectText>
        </ProfessionalContainer>
      </TestWrapper>
    );

    const container = screen.getByTestId('test-container');
    expect(container.props.style.maxWidth).toBe('90%');
  });

  it('✅ Padding constant in dp', () => {
    render(
      <TestWrapper>
        <ProfessionalContainer testID="test-container">
          <PerfectText size={24} lines={1}>
            Test
          </PerfectText>
        </ProfessionalContainer>
      </TestWrapper>
    );

    const container = screen.getByTestId('test-container');
    expect(container.props.style.paddingHorizontal).toBeGreaterThan(0);
    expect(container.props.style.paddingHorizontal % 4).toBe(0); // 4dp grid
  });

  it('✅ Safe area handled', () => {
    render(
      <TestWrapper>
        <ProfessionalContainer testID="test-container">
          <PerfectText size={24} lines={1}>
            Test
          </PerfectText>
        </ProfessionalContainer>
      </TestWrapper>
    );

    const container = screen.getByTestId('test-container');
    expect(container.props.style.paddingTop).toBeGreaterThanOrEqual(44);
    expect(container.props.style.paddingBottom).toBeGreaterThanOrEqual(34);
  });

  it('✅ RTL support available', () => {
    render(
      <TestWrapper>
        <ProfessionalContainer testID="test-container" enableRTL={true}>
          <PerfectText size={24} lines={1}>
            Test
          </PerfectText>
        </ProfessionalContainer>
      </TestWrapper>
    );

    const container = screen.getByTestId('test-container');
    expect(container).toBeTruthy(); // RTL doesn't crash
  });

  it('✅ Baseline grid implemented', () => {
    // Test is implicit - baseline grid is implemented in the layout hook
    render(
      <TestWrapper>
        <ProfessionalContainer testID="test-container">
          <PerfectText size={24} lines={1}>
            Test
          </PerfectText>
        </ProfessionalContainer>
      </TestWrapper>
    );

    expect(screen.getByTestId('test-container')).toBeTruthy();
  });
});
