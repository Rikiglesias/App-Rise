/**
 * SISTEMA DARK MODE UNIVERSALE
 *
 * Un solo toggle → tutta l'app si aggiorna automaticamente
 * Colori automatici per tutti i componenti
 * Sync con impostazioni sistema (opzionale)
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

// 🎨 COLORI UNIVERSALI
const UNIVERSAL_COLORS = {
  light: {
    // Backgrounds
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
    card: '#FFFFFF',
    modal: '#FFFFFF',

    // Texts
    text: '#1F2937',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',

    // Borders
    border: '#E5E7EB',
    borderLight: '#F3F4F6',

    // Accents
    accent: '#DC2626',
    success: '#059669',
    warning: '#D97706',
  },
  dark: {
    // Backgrounds
    primary: '#0C0C0E',
    secondary: '#1C1C1E',
    card: '#2C2C2E',
    modal: '#1C1C1E',

    // Texts
    text: '#F5F5F5',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',

    // Borders
    border: '#374151',
    borderLight: '#4B5563',

    // Accents
    accent: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
  },
} as const;

// 🔧 THEME CONTEXT
type ColorScheme = typeof UNIVERSAL_COLORS.light | typeof UNIVERSAL_COLORS.dark;

interface ThemeContextType {
  isDark: boolean;
  colors: ColorScheme;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  themeMode: 'light' | 'dark' | 'system';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 🌍 THEME PROVIDER
interface UniversalThemeProviderProps {
  children: ReactNode;
  initialTheme?: 'light' | 'dark' | 'system';
  followSystem?: boolean;
}

export const UniversalThemeProvider: React.FC<UniversalThemeProviderProps> = ({
  children,
  initialTheme = 'system',
  followSystem = true,
}) => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(
    initialTheme
  );
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  // 📱 SISTEMA THEME DETECTION
  useEffect(() => {
    try {
      // Rileva tema sistema iniziale (può essere null)
      const currentSystemTheme = Appearance.getColorScheme();
      setSystemTheme(currentSystemTheme === 'dark' ? 'dark' : 'light');

      if (!followSystem) {
        return undefined; // No cleanup needed
      }

      // Listener per cambiamenti tema sistema
      const subscription = Appearance.addChangeListener(
        ({ colorScheme }: { colorScheme: ColorSchemeName }) => {
          setSystemTheme(colorScheme === 'dark' ? 'dark' : 'light');
        }
      );

      return () => {
        try {
          subscription?.remove();
        } catch {
          // Fail silently se subscription non esiste più
        }
      };
    } catch (error) {
      // Fallback a light theme se Appearance API fallisce
      setSystemTheme('light');
      return undefined; // No cleanup needed
    }
  }, [followSystem]);

  // 🎯 CALCOLA TEMA ATTUALE
  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemTheme === 'dark');
  const colors = isDark ? UNIVERSAL_COLORS.dark : UNIVERSAL_COLORS.light;

  // 🔄 TOGGLE FUNCTIONS
  const toggleTheme = () => {
    setThemeMode(current => {
      if (current === 'light') return 'dark';
      if (current === 'dark') return 'system';
      return 'light';
    });
  };

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    setThemeMode(theme);
  };

  const value: ThemeContextType = {
    isDark,
    colors,
    toggleTheme,
    setTheme,
    themeMode,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// 🪝 THEME HOOK
export const useUniversalTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error(
      'useUniversalTheme must be used within UniversalThemeProvider'
    );
  }
  return context;
};

// 🎨 HELPER FUNCTIONS
export const getThemeColor = (
  colorKey: keyof typeof UNIVERSAL_COLORS.light,
  isDark: boolean
) => {
  return isDark
    ? UNIVERSAL_COLORS.dark[colorKey]
    : UNIVERSAL_COLORS.light[colorKey];
};

// 📱 THEME STATUS COMPONENT - REMOVED
// HTML elements like <div> cause crashes in React Native production builds
// If needed for debugging, use React Native View component instead
