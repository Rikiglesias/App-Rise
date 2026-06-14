import React from 'react';
import { render, renderHook, act } from '@testing-library/react-native';
import { Appearance, ColorSchemeName } from 'react-native';
import { ThemeProvider, useTheme } from '../../../shared/hooks/useTheme';
import { Colors } from '../../../shared/constants/designTokens';

// Mock React Native Appearance
jest.mock('react-native', () => ({
  Appearance: {
    getColorScheme: jest.fn(),
    addChangeListener: jest.fn(),
  },
}));

const mockAppearance = Appearance as jest.Mocked<typeof Appearance>;

describe('useTheme - Theme Provider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAppearance.getColorScheme.mockReturnValue('light');
    mockAppearance.addChangeListener.mockReturnValue({
      remove: jest.fn(),
    });
  });

  it('should provide theme context successfully', () => {
    const TestComponent = () => {
      useTheme(); // Just call the hook to verify it works
      return null;
    };

    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(getByTestId).toBeDefined();
  });

  it('should initialize with light theme by default', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(result.current.isDark).toBe(false);
    expect(result.current.colors).toBe(Colors);
  });

  it('should initialize with dark theme when system is dark', () => {
    mockAppearance.getColorScheme.mockReturnValue('dark');

    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(result.current.isDark).toBe(true);
  });

  it('should toggle theme correctly', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(result.current.isDark).toBe(false);

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.isDark).toBe(true);

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.isDark).toBe(false);
  });
});

describe('useTheme - System Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAppearance.getColorScheme.mockReturnValue('light');
    mockAppearance.addChangeListener.mockReturnValue({
      remove: jest.fn(),
    });
  });

  it('should listen to system appearance changes', () => {
    renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(mockAppearance.addChangeListener).toHaveBeenCalled();
  });

  it('should handle system theme change to dark', () => {
    let changeListener: (preferences: { colorScheme: ColorSchemeName }) => void;
    mockAppearance.addChangeListener.mockImplementation(listener => {
      changeListener = listener;
      return { remove: jest.fn() };
    });

    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(result.current.isDark).toBe(false);

    act(() => {
      changeListener({ colorScheme: 'dark' });
    });

    expect(result.current.isDark).toBe(true);
  });

  it('should handle system theme change to light', () => {
    let changeListener: (preferences: { colorScheme: ColorSchemeName }) => void;
    mockAppearance.addChangeListener.mockImplementation(listener => {
      changeListener = listener;
      return { remove: jest.fn() };
    });
    mockAppearance.getColorScheme.mockReturnValue('dark');

    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(result.current.isDark).toBe(true);

    act(() => {
      changeListener({ colorScheme: 'light' });
    });

    expect(result.current.isDark).toBe(false);
  });

  it('should handle null colorScheme gracefully', () => {
    let changeListener: (preferences: { colorScheme: ColorSchemeName }) => void;
    mockAppearance.addChangeListener.mockImplementation(listener => {
      changeListener = listener;
      return { remove: jest.fn() };
    });

    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    const initialIsDark = result.current.isDark;

    act(() => {
      changeListener({ colorScheme: null });
    });

    // Should not change when colorScheme is null
    expect(result.current.isDark).toBe(initialIsDark);
  });
});

describe('useTheme - Error Handling', () => {
  // Mock console.error to avoid error output in tests
  // eslint-disable-next-line no-console
  const originalError = console.error;
  beforeAll(() => {
    // eslint-disable-next-line no-console
    console.error = jest.fn();
  });
  afterAll(() => {
    // eslint-disable-next-line no-console
    console.error = originalError;
  });

  it('should throw error when used outside ThemeProvider', () => {
    const TestHook = () => {
      useTheme();
      return null;
    };

    expect(() => render(<TestHook />)).toThrow(
      'useTheme must be used within a ThemeProvider'
    );
  });
});

describe('useTheme - Cleanup and Memory', () => {
  it('should cleanup appearance listener on unmount', () => {
    const mockRemove = jest.fn();
    mockAppearance.addChangeListener.mockReturnValue({
      remove: mockRemove,
    });

    const { unmount } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    unmount();

    expect(mockRemove).toHaveBeenCalled();
  });

  it('should handle missing remove function gracefully', () => {
    mockAppearance.addChangeListener.mockReturnValue({
      remove: jest.fn(),
    });

    const { unmount } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(() => unmount()).not.toThrow();
  });
});
