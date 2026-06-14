//===================================================================
// SHARED - Central Export Hub
//===================================================================

// Design System - Explicit exports
export * from './constants';
export * from './hooks';
export * from './screens';

// Utilities
export {
  success,
  failure,
  isSuccess,
  isFailure,
  map,
  mapError,
  chain,
  combine,
  type Result,
} from './utils/result';

export { logger, logDebug, logInfo, logWarn, logError } from './utils/logger';

export {
  env,
  isProduction,
  isDevelopment,
  isFeatureEnabled,
} from './config/environment';
