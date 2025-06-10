import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Appearance } from 'react-native';
import { Colors, DarkMode } from '../constants/designTokens';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: typeof Colors;
  isSystemDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDark, setIsDark] = useState(false);
  const [isSystemDark, setIsSystemDark] = useState(false);

  // Listen to system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsSystemDark(colorScheme === 'dark');
    });

    // Initial check
    setIsSystemDark(Appearance.getColorScheme() === 'dark');

    return () => subscription?.remove();
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(!isDark);
    // Update DarkMode utility
    DarkMode.isDark = !isDark;
  }, [isDark]);

  // Memoize expensive color palette calculation
  const colors = useMemo(() => {
    if (isDark) {
      return {
        ...Colors,
        // Override neutral colors for dark theme
        neutral: {
          ...Colors.neutral,
          0: Colors.dark.surface.secondary,
          50: Colors.dark.surface.primary,
          100: Colors.dark.surface.tertiary,
          200: Colors.dark.border.primary,
          300: Colors.dark.border.secondary,
          400: Colors.dark.text.tertiary,
          500: Colors.dark.text.secondary,
          600: Colors.dark.text.primary,
          700: Colors.dark.text.primary,
          800: Colors.dark.text.primary,
          900: Colors.dark.text.primary,
          950: Colors.dark.text.primary,
        },
        // Add glass effects for dark theme
        glass: {
          ...Colors.glass,
          light: 'rgba(255, 255, 255, 0.05)',
          medium: 'rgba(255, 255, 255, 0.1)',
          heavy: 'rgba(255, 255, 255, 0.15)',
        },
      };
    }
    return Colors;
  }, [isDark]);

  const value: ThemeContextType = useMemo(
    () => ({
      isDark,
      toggleTheme,
      colors,
      isSystemDark,
    }),
    [isDark, toggleTheme, colors, isSystemDark]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

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
