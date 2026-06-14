/**
 * LAZY COMPONENTS - Code Splitting per le schermate secondarie
 * Solo le schermate effettivamente montate in modo lazy da AppNavigator.
 * Le schermate principali (Home, ContributeTab, ChiSiamo, Seguici) e
 * ImpactStackNavigator usano import diretti nei rispettivi navigator.
 */

import React from 'react';
import { createLazyComponent } from './createLazyComponent';
import { LazyScreen } from './LazyScreen';

// =================================================================
// 📱 SECONDARY SCREENS - Lazy Loading On-Demand
// =================================================================

/**
 * PROJECTS SCREEN
 */
export const LazyProjectsScreen = createLazyComponent(
  () => import('../../features/projects/screens/ProjectsScreen'),
  {
    name: 'ProjectsScreen',
    preload: false,
    timeout: 6000,
    retryAttempts: 2,
  }
);

/**
 * IMPATTO 2024 SCREEN
 */
export const LazyImpatto2024Screen = createLazyComponent(
  () => import('../../features/impact/screens/Impatto2024Screen'),
  {
    name: 'Impatto2024Screen',
    preload: false,
    timeout: 6000,
    retryAttempts: 2,
  }
);

/**
 * DEVELOPMENT SCREEN (Work in Progress)
 */
export const LazyDevelopmentScreen = createLazyComponent(
  () => import('../../shared/screens/DevelopmentScreen'),
  {
    name: 'DevelopmentScreen',
    preload: false,
    timeout: 4000,
    retryAttempts: 2,
  }
);

// =================================================================
// 🎯 WRAPPED COMPONENTS - Con LazyScreen Container
// =================================================================

/**
 * Wrapper per componenti lazy con loading states
 */
const withLazyScreen = <T extends object>(
  LazyComponent: React.LazyExoticComponent<React.ComponentType<T>>
) => {
  const WrappedComponent = React.forwardRef<unknown, T>((props, ref) => (
    <LazyScreen>
      <LazyComponent {...props} ref={ref} />
    </LazyScreen>
  ));

  WrappedComponent.displayName = 'withLazyScreen(LazyComponent)';

  return WrappedComponent;
};

// Export dei componenti wrappati
export const WrappedProjectsScreen = withLazyScreen(LazyProjectsScreen);
export const WrappedImpatto2024Screen = withLazyScreen(LazyImpatto2024Screen);
export const WrappedDevelopmentScreen = withLazyScreen(LazyDevelopmentScreen);
