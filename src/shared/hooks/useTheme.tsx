import React from 'react';
import { Colors } from '@/shared/constants/designTokens';
import {
  UniversalThemeProvider,
  useUniversalTheme,
} from '@/shared/theme/UniversalTheme';

// Adapter type (keeps existing API for brand tokens)
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: typeof Colors; // brand tokens
}

// ThemeProvider now delegates to UniversalThemeProvider (single source of truth)
export const ThemeProvider: React.FC<{ children: React.ReactNode }>
  = ({ children }) => (
  <UniversalThemeProvider>{children}</UniversalThemeProvider>
);

// Hook adapter: reads mode/toggle from UniversalTheme, exposes brand colors
export const useTheme = (): ThemeContextType => {
  try {
    const { isDark, toggleTheme: _toggle, setTheme } = useUniversalTheme();
    // Adapter toggle: simple light <-> dark flip for callers expecting binary toggle
    const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');
    return { isDark, toggleTheme, colors: Colors };
  } catch {
    // Preserve legacy error contract for tests/callers
    throw new Error('useTheme must be used within a ThemeProvider');
  }
};

// Hook for getting current brand colors
export const useThemeColors = () => Colors;

// Hook for getting theme-aware styles (brand-based)
export const useThemeStyles = () => {
  const { isDark } = useUniversalTheme();
  const colors = Colors;

  return {
    isDark,
    colors,
    container: {
      backgroundColor: colors.neutral[50],
    },
    card: {
      backgroundColor: colors.neutral[0],
      borderColor: colors.neutral[200],
    },
    text: {
      primary: colors.neutral[900],
      secondary: colors.neutral[600],
      accent: colors.primary[500],
    },
    surface: {
      primary: colors.neutral[0],
      secondary: colors.neutral[100],
      elevated: colors.neutral[0],
    },
  };
};

export default useTheme;
