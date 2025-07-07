/**
 * RESPONSIVE LAYOUT HOOK - LAYER CENTRALIZZATO
 * 
 * Elimina frammentazione di breakpoints e percentuali hard-coded
 * Soluzione custom senza dipendenze esterne
 */

import { useWindowDimensions } from 'react-native';
import { DeviceBreakpoints } from '../constants/responsiveSystem';

export type ResponsiveBreakpoint = 'compact' | 'standard' | 'large' | 'xlarge' | 'xxlarge' | 'tabletXL' | 'desktop' | 'desktopXL';

export interface ResponsiveValue<T> {
  compact?: T;
  standard?: T; 
  large?: T;
  xlarge?: T;
  xxlarge?: T;
  tabletXL?: T;
  desktop?: T;
  desktopXL?: T;
}

export interface ResponsiveLayoutReturn {
  // Breakpoint corrente
  breakpoint: ResponsiveBreakpoint;
  
  // Dimensioni schermo
  width: number;
  height: number;
  
  // Utility per valori responsive
  responsive: <T>(values: ResponsiveValue<T>) => T | undefined;
  
  // Helper comuni
  isTablet: boolean;
  isDesktop: boolean;
  isCompact: boolean;
  
  // Percentuali standardizzate
  cardWidth: string;
  containerWidth: string;
  modalWidth: string;
}

/**
 * Hook per gestire layout responsive centralizzato
 * Elimina duplicazione di breakpoints e percentuali
 */
export const useResponsiveLayout = (): ResponsiveLayoutReturn => {
  const { width, height } = useWindowDimensions();
  
  // Determina breakpoint corrente usando tema centralizzato
  const getBreakpoint = (): ResponsiveBreakpoint => {
    if (width <= DeviceBreakpoints.compact.maxWidth) return 'compact';
    if (width <= DeviceBreakpoints.standard.maxWidth) return 'standard';
    if (width <= DeviceBreakpoints.large.maxWidth) return 'large';
    if (width <= DeviceBreakpoints.xlarge.maxWidth) return 'xlarge';
    if (width <= 601) return 'xxlarge';
    if (width <= 1280) return 'tabletXL';
    if (width <= 1440) return 'desktop';
    return 'desktopXL';
  };
  
  const breakpoint = getBreakpoint();
  
  // Utility per valori responsive
  const responsive = <T>(values: ResponsiveValue<T>): T | undefined => {
    // Cerca valore per breakpoint corrente o fallback
    const value = values[breakpoint] ?? 
           values.standard ?? 
           values.compact ?? 
           Object.values(values)[0];
    
    return value as T | undefined;
  };
  
  // Helper comuni
  const isTablet = breakpoint === 'xlarge' || breakpoint === 'xxlarge';
  const isDesktop = breakpoint === 'xxlarge';
  const isCompact = breakpoint === 'compact';
  
  // Percentuali standardizzate (elimina hard-coding)
  const cardWidth = responsive({
    compact: '100%',
    standard: '47.5%',
    large: '47.5%',
    xlarge: '31%',
    xxlarge: '23%'
  }) ?? '47.5%';
  
  const containerWidth = responsive({
    compact: '95%',
    standard: '90%',
    large: '85%',
    xlarge: '80%',
    xxlarge: '75%'
  }) ?? '90%';
  
  const modalWidth = responsive({
    compact: '95%',
    standard: '90%',
    large: '85%',
    xlarge: '70%',
    xxlarge: '60%'
  }) ?? '90%';
  
  return {
    breakpoint,
    width,
    height,
    responsive,
    isTablet,
    isDesktop,
    isCompact,
    cardWidth,
    containerWidth,
    modalWidth,
  };
};

/**
 * Hook specifico per spacing responsive
 * Elimina calcoli manuali di padding/margin
 */
export const useResponsiveSpacing = () => {
  const { responsive } = useResponsiveLayout();
  
  const spacing = {
    container: responsive({
      compact: 16,
      standard: 20,
      large: 24,
      xlarge: 32,
      xxlarge: 40
    }) ?? 20,
    
    card: responsive({
      compact: 12,
      standard: 16,
      large: 20,
      xlarge: 24,
      xxlarge: 28
    }) ?? 16,
    
    section: responsive({
      compact: 20,
      standard: 24,
      large: 32,
      xlarge: 40,
      xxlarge: 48
    }) ?? 24,
  };
  
  return spacing;
};

/**
 * Hook per colori responsive (dark mode prep)
 * Prepara per unificazione tema colori
 */
export const useResponsiveColors = () => {
  // TODO: Integrare con sistema dark mode esistente
  return {};
}; 