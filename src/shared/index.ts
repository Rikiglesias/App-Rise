//===================================================================
// SHARED - Central Export Hub
//===================================================================

// Design System
export * from './constants';
export * from './hooks';
export * from './screens';

// Utilities & Services
export * from './utils/result';
export * from './utils/logger';
export * from './config/environment';

// Services
export * from './services/apiSecurity';
export * from './services/errorTracking';
export * from './services/secureStorage';

// Monitoring (explicit exports to avoid conflicts)
export {
  performanceMonitor,
  type PerformanceMetric,
  type ComponentPerformanceData,
  type NetworkPerformanceData,
} from './monitoring/PerformanceMonitor';
