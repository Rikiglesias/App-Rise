import React from 'react';
import { Animated } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { ModernSmartTitle } from '@/features/home/components/ModernSmartTitle';

// Mock useTheme
jest.mock('@/shared/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#DC2626',
      background: '#FFFFFF',
      text: '#1F2937',
    },
  }),
}));

// Mock UniversalTheme to avoid provider requirement in this unit test
jest.mock('@/shared/theme/UniversalTheme', () => ({
  UniversalThemeProvider: ({ children }: any) => children,
  useUniversalTheme: () => ({
    isDark: false,
    toggleTheme: jest.fn(),
    setTheme: jest.fn(),
    themeMode: 'light',
    colors: {} as any,
  }),
}));

describe('ModernSmartTitle', () => {
  it('renderizza titolo e logo', () => {
    const anim = new Animated.Value(1);
    render(
      <ModernSmartTitle
        titleAnim={anim}
        titleOpacity={anim as unknown as Animated.AnimatedInterpolation<number>}
        titleTransform={anim as unknown as Animated.AnimatedInterpolation<number>}
      />
    );

    expect(screen.getByText(/Rise Against/i)).toBeTruthy();
    expect(screen.getByText(/Hunger/i)).toBeTruthy();
    expect(screen.getByText(/Italia/i)).toBeTruthy();
    expect(screen.getByLabelText('Logo Rise Against Hunger')).toBeTruthy();
  });
});
