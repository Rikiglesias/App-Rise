import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { Colors } from '../constants/designTokens';

// Types
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: typeof Colors;
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDark, setIsDark] = useState(false);

  // Initialize theme from system preference
  useEffect(() => {
    const colorScheme = Appearance.getColorScheme();
    setIsDark(colorScheme === 'dark');

    // Listen for system theme changes
    const subscription = Appearance.addChangeListener(
      ({ colorScheme }: { colorScheme: ColorSchemeName }) => {
        if (colorScheme) {
          setIsDark(colorScheme === 'dark');
        }
      }
    );

    return () => subscription?.remove();
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors: Colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook for getting current theme colors
export const useThemeColors = () => {
  const { colors } = useTheme();
  return colors;
};

// Hook for getting theme-aware styles
export const useThemeStyles = () => {
  const { isDark, colors } = useTheme();

  return {
    isDark,
    colors,
    // Common theme-aware style helpers
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
