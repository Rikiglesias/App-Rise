/**
 * RESPONSIVE DARK MODE - UNIFICATO CON LAYER CENTRALIZZATO
 * 
 * Estende il sistema useTheme esistente per supportare
 * dark mode automatico in tutti i ResponsiveBox components
 */

import { useState, useCallback, useEffect } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { ResponsiveColors, getResponsiveColor, ResponsiveColorMode } from '../constants/responsiveTheme';

export interface ResponsiveDarkModeReturn {
  // Current mode
  isDark: boolean;
  colorMode: ResponsiveColorMode;
  
  // Toggle functions
  toggleDarkMode: () => void;
  setColorMode: (mode: ResponsiveColorMode) => void;
  
  // Responsive colors
  responsiveColors: typeof ResponsiveColors;
  getColor: (colorKey: keyof typeof ResponsiveColors, property: string) => string;
  
  // Shorthand colors for common use
  backgroundColor: {
    primary: string;
    secondary: string;
    card: string;
    modal: string;
  };
  
  textColor: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  
  borderColor: {
    primary: string;
    accent: string;
  };
}

/**
 * Hook per dark mode responsive unificato
 * Si integra con il layer centralizzato per colori automatici
 */
export const useResponsiveDarkMode = (): ResponsiveDarkModeReturn => {
  const [colorMode, setColorModeState] = useState<ResponsiveColorMode>('light');

  // Initialize from system preference
  useEffect(() => {
    const systemColorScheme = Appearance.getColorScheme();
    setColorModeState(systemColorScheme === 'dark' ? 'dark' : 'light');

    // Listen for system changes
    const subscription = Appearance.addChangeListener(
      ({ colorScheme }: { colorScheme: ColorSchemeName }) => {
        if (colorScheme) {
          setColorModeState(colorScheme === 'dark' ? 'dark' : 'light');
        }
      }
    );

    return () => subscription?.remove();
  }, []);

  // Toggle functions
  const toggleDarkMode = useCallback(() => {
    setColorModeState(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const setColorMode = useCallback((mode: ResponsiveColorMode) => {
    setColorModeState(mode);
  }, []);

  // Color getter function
  const getColor = useCallback((
    colorKey: keyof typeof ResponsiveColors,
    property: string
  ): string => {
    return getResponsiveColor(colorKey, property, colorMode);
  }, [colorMode]);

  // Computed values
  const isDark = colorMode === 'dark';

  // Pre-computed common colors for performance
  const backgroundColor = {
    primary: getColor('background', 'primary'),
    secondary: getColor('background', 'secondary'),
    card: getColor('surface', 'card'),
    modal: getColor('surface', 'modal'),
  };

  const textColor = {
    primary: getColor('text', 'primary'),
    secondary: getColor('text', 'secondary'),
    tertiary: getColor('text', 'tertiary'),
  };

  const borderColor = {
    primary: getColor('border', 'primary'),
    accent: getColor('border', 'accent'),
  };

  return {
    isDark,
    colorMode,
    toggleDarkMode,
    setColorMode,
    responsiveColors: ResponsiveColors,
    getColor,
    backgroundColor,
    textColor,
    borderColor,
  };
};

 