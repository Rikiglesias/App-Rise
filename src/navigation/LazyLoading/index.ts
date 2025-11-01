/**
 * LAZY LOADING SYSTEM - Export unificati
 * Sistema completo di code splitting con performance ottimizzate
 */

// Core lazy loading utilities
export { LazyScreen } from './LazyScreen';
export {
  createLazyComponent,
  preloadComponent,
  preloadComponents,
  getLazyComponentStats,
  clearComponentCache,
} from './createLazyComponent';

// Lazy components (raw)
export {
  LazyHomeScreen,
  LazyContributeTabScreen,
  LazyImpactStackNavigator,
  LazyChiSiamoScreen,
  LazySeguiciScreen,
  LazyProjectsScreen,
  LazyImpatto2024Screen,
  LazyDevelopmentScreen,
} from './LazyComponents';

// Wrapped components (ready to use)
export {
  WrappedHomeScreen,
  WrappedContributeTabScreen,
  WrappedChiSiamoScreen,
  WrappedSeguiciScreen,
  WrappedProjectsScreen,
  WrappedImpatto2024Screen,
  WrappedDevelopmentScreen,
} from './LazyComponents';

// Note: WrappedImpactStackNavigator removed - using direct import to avoid loading spinner

// Preloading strategies
export {
  preloadCriticalComponents,
  preloadSecondaryComponents,
} from './LazyComponents';
