/**
 * LAZY LOADING SYSTEM - Export unificati
 * Code splitting per le schermate secondarie montate da AppNavigator.
 */

// Core lazy loading utilities
export { LazyScreen } from './LazyScreen';
export { createLazyComponent } from './createLazyComponent';

// Lazy components (raw)
export {
  LazyProjectsScreen,
  LazyImpatto2024Screen,
  LazyDevelopmentScreen,
} from './LazyComponents';

// Wrapped components (ready to use)
export {
  WrappedProjectsScreen,
  WrappedImpatto2024Screen,
  WrappedDevelopmentScreen,
} from './LazyComponents';
