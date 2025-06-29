// ===================================================================
// UTILITY MIGRAZIONE RESPONSIVE - ZERO TOLLERANZA
// Migrazione automatizzata e sicura dal hardcoded al responsive
// ===================================================================

import { Dimensions } from 'react-native';
import {
  getUniversalAdaptiveFontSize,
  getUniversalAdaptiveSpacing,
  getUniversalDeviceCategory,
  UniversalDeviceCategories,
} from '../constants/responsiveBreakpoints';
import { logDebug } from './logger';

// ===================================================================
// MIGRATION TYPES
// ===================================================================

export interface ResponsiveMigrationConfig {
  enableImageScaling: boolean;
  enableFontScaling: boolean;
  enableSpacingScaling: boolean;
  enableModalScaling: boolean;
  enableButtonScaling: boolean;
  debugMode: boolean;
}

export interface ResponsiveValue<T = number> {
  base: T;
  responsive: T;
  device: keyof typeof UniversalDeviceCategories;
  originalValue: T;
  migrationApplied: boolean;
}

// ===================================================================
// CONFIGURATION
// ===================================================================

const defaultConfig: ResponsiveMigrationConfig = {
  enableImageScaling: true,
  enableFontScaling: true,
  enableSpacingScaling: true,
  enableModalScaling: true,
  enableButtonScaling: true,
  debugMode: __DEV__,
};

let globalConfig = { ...defaultConfig };

export const setMigrationConfig = (
  config: Partial<ResponsiveMigrationConfig>
) => {
  globalConfig = { ...globalConfig, ...config };
  if (globalConfig.debugMode && __DEV__) {
    logDebug('ResponsiveMigration', 'Config updated', globalConfig);
  }
};

// ===================================================================
// CORE MIGRATION FUNCTIONS
// ===================================================================

/**
 * Migra font size hardcoded al sistema responsive
 */
export const migrateFontSize = (
  originalSize: number,
  forceUpdate = false
): ResponsiveValue => {
  if (!globalConfig.enableFontScaling && !forceUpdate) {
    return createResponsiveValue(originalSize, originalSize, false);
  }

  const { width } = Dimensions.get('window');
  const responsiveSize = getUniversalAdaptiveFontSize(originalSize, width);

  return createResponsiveValue(originalSize, responsiveSize, true);
};

/**
 * Migra spacing hardcoded al sistema responsive
 */
export const migrateSpacing = (
  originalSpacing: number,
  forceUpdate = false
): ResponsiveValue => {
  if (!globalConfig.enableSpacingScaling && !forceUpdate) {
    return createResponsiveValue(originalSpacing, originalSpacing, false);
  }

  const { width } = Dimensions.get('window');
  const responsiveSpacing = getUniversalAdaptiveSpacing(originalSpacing, width);

  return createResponsiveValue(originalSpacing, responsiveSpacing, true);
};

/**
 * Crea un ResponsiveValue standardizzato
 */
const createResponsiveValue = <T>(
  original: T,
  responsive: T,
  migrationApplied: boolean
): ResponsiveValue<T> => {
  const { width } = Dimensions.get('window');
  const device = getUniversalDeviceCategory(width);

  if (globalConfig.debugMode && migrationApplied && __DEV__) {
    logDebug('ResponsiveMigration', `${device} ${original} → ${responsive}`);
  }

  return {
    base: original,
    responsive,
    device,
    originalValue: original,
    migrationApplied,
  };
};

/**
 * Estrae il valore responsive da un ResponsiveValue
 */
export const getResponsiveValue = <T>(value: ResponsiveValue<T> | T): T => {
  if (typeof value === 'object' && value !== null && 'responsive' in value) {
    return (value as ResponsiveValue<T>).responsive;
  }
  return value as T;
};

export default {
  migrateFontSize,
  migrateSpacing,
  getResponsiveValue,
  setMigrationConfig,
};
