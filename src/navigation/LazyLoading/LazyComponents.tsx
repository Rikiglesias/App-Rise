/**
 * LAZY COMPONENTS - Code Splitting per tutte le Features
 * Componenti lazy con preloading intelligente per performance ottimali
 */

import React from 'react';
import { createLazyComponent } from './createLazyComponent';
import { LazyScreen } from './LazyScreen';

// =================================================================
// 🚀 MAIN FEATURES - Lazy Loading con Preloading
// =================================================================

/**
 * HOME SCREEN - Precaricata (feature principale)
 */
export const LazyHomeScreen = createLazyComponent(
  () => import('../../features/home/screens/HomeScreen'),
  {
    name: 'HomeScreen',
    preload: true, // Precarica subito
    timeout: 5000,
    retryAttempts: 3,
  }
);

/**
 * CONTRIBUTE TAB SCREEN - Precaricata (feature critica)
 */
export const LazyContributeTabScreen = createLazyComponent(
  () =>
    import('../../features/actions/screens/ContributeTabScreen').then(
      module => ({ default: module.ContributeTabScreen })
    ),
  {
    name: 'ContributeTabScreen',
    preload: true, // Precarica subito
    timeout: 5000,
    retryAttempts: 3,
  }
);

/**
 * IMPACT STACK NAVIGATOR - Caricamento lazy
 */
export const LazyImpactStackNavigator = createLazyComponent(
  () => import('../ImpactStackNavigator'),
  {
    name: 'ImpactStackNavigator',
    preload: false, // Carica on-demand
    timeout: 8000,
    retryAttempts: 2,
  }
);

// =================================================================
// 📱 SECONDARY SCREENS - Lazy Loading On-Demand
// =================================================================

/**
 * CHI SIAMO SCREEN
 */
export const LazyChiSiamoScreen = createLazyComponent(
  () => import('../../features/about/screens/ChiSiamoScreen'),
  {
    name: 'ChiSiamoScreen',
    preload: false,
    timeout: 6000,
    retryAttempts: 2,
  }
);

/**
 * SEGUICI SCREEN
 */
export const LazySeguiciScreen = createLazyComponent(
  () => import('../../features/social/screens/SeguiciScreen'),
  {
    name: 'SeguiciScreen',
    preload: false,
    timeout: 6000,
    retryAttempts: 2,
  }
);

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
export const WrappedHomeScreen = withLazyScreen(LazyHomeScreen);
export const WrappedContributeTabScreen = withLazyScreen(
  LazyContributeTabScreen
);
// export const WrappedImpactStackNavigator = withLazyScreen(
//   LazyImpactStackNavigator
// );
// Note: Removed to avoid loading spinner - using direct import in BottomTabNavigator
export const WrappedChiSiamoScreen = withLazyScreen(LazyChiSiamoScreen);
export const WrappedSeguiciScreen = withLazyScreen(LazySeguiciScreen);
export const WrappedProjectsScreen = withLazyScreen(LazyProjectsScreen);
export const WrappedImpatto2024Screen = withLazyScreen(LazyImpatto2024Screen);
export const WrappedDevelopmentScreen = withLazyScreen(LazyDevelopmentScreen);

// =================================================================
// 🚀 PRELOADING STRATEGIES
// =================================================================

/**
 * Precarica componenti critici per l'app
 */
// Evita i dynamic import di preloading durante i test/CI
const shouldSkipPreload = (): boolean => {
  if (process.env.NODE_ENV === 'test') return true;
  if (typeof process !== 'undefined' && process.env.JEST_WORKER_ID) return true;
  return false;
};
export const preloadCriticalComponents = (): void => {
  if (shouldSkipPreload()) return;
  // Precarica componenti che l'utente probabilmente userà presto
  setTimeout(() => {
    void import('../../features/actions/screens/ContributeTabScreen');
  }, 2000);

  setTimeout(() => {
    void import('../ImpactStackNavigator');
  }, 4000);
};

/**
 * Precarica componenti secondari in background
 */
export const preloadSecondaryComponents = (): void => {
  if (shouldSkipPreload()) return;
  // Precarica dopo che l'app è completamente caricata
  setTimeout(() => {
    void import('../../features/about/screens/ChiSiamoScreen');
    void import('../../features/social/screens/SeguiciScreen');
  }, 8000);

  setTimeout(() => {
    void import('../../features/projects/screens/ProjectsScreen');
    void import('../../features/impact/screens/Impatto2024Screen');
  }, 12000);
};
