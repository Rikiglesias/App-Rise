/**
 * RESPONSIVE DARK MODE PROVIDER
 * 
 * Provider che combina layout responsive + dark mode unificato
 * Elimina frammentazione di colori nei componenti
 */

import React, { createContext, useContext } from 'react';
import { useResponsiveDarkMode, ResponsiveDarkModeReturn } from '../hooks/useResponsiveDarkMode';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

// Context per dark mode responsive
const ResponsiveDarkModeContext = createContext<ResponsiveDarkModeReturn | undefined>(undefined);

export const ResponsiveDarkModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const value = useResponsiveDarkMode();
  
  return (
    <ResponsiveDarkModeContext.Provider value={value}>
      {children}
    </ResponsiveDarkModeContext.Provider>
  );
};

export const useResponsiveDarkModeContext = (): ResponsiveDarkModeReturn => {
  const context = useContext(ResponsiveDarkModeContext);
  if (!context) {
    throw new Error('useResponsiveDarkModeContext must be used within ResponsiveDarkModeProvider');
  }
  return context;
};

/**
 * Hook combinato che integra layout responsive + dark mode
 * API unificata per tutti i componenti
 */
export const useResponsiveTheme = () => {
  const layout = useResponsiveLayout();
  const darkMode = useResponsiveDarkMode();
  
  return {
    // Layout properties
    ...layout,
    
    // Dark mode properties
    ...darkMode,
    
    // Unified theme object
    theme: {
      breakpoint: layout.breakpoint,
      isDark: darkMode.isDark,
      colors: darkMode.backgroundColor,
      text: darkMode.textColor,
      border: darkMode.borderColor,
    },
    
    // Shorthand for common patterns
    getThemeColor: (type: 'background' | 'text' | 'border', variant: 'primary' | 'secondary' | 'tertiary' = 'primary') => {
      switch (type) {
        case 'background':
          return darkMode.backgroundColor[variant as keyof typeof darkMode.backgroundColor] || darkMode.backgroundColor.primary;
        case 'text':
          return darkMode.textColor[variant as keyof typeof darkMode.textColor] || darkMode.textColor.primary;
        case 'border':
          return darkMode.borderColor[variant as keyof typeof darkMode.borderColor] || darkMode.borderColor.primary;
        default:
          return darkMode.backgroundColor.primary;
      }
    },
  };
}; 