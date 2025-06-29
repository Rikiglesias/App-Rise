// ===================================================================
// CONFIGURAZIONE CENTRALE SISTEMA RESPONSIVE
// Configurazione globale per controllo di tutto il sistema responsive
// ===================================================================

import { setMigrationConfig } from '../utils/responsiveMigration';
import { logDebug } from '../utils/logger';

// ===================================================================
// GLOBAL RESPONSIVE CONFIGURATION
// ===================================================================

export interface GlobalResponsiveConfig {
  // Master switches
  enableGlobalResponsive: boolean;
  enableFontScaling: boolean;
  enableSpacingScaling: boolean;
  enableImageScaling: boolean;
  enableModalScaling: boolean;
  enableButtonScaling: boolean;

  // Debug options
  enableDebugMode: boolean;
  enablePerformanceLogging: boolean;
  enableDeviceInfoLogging: boolean;

  // Override scales per device category
  scaleOverrides: {
    phone: {
      fontScale: number;
      spacingScale: number;
      imageScale: number;
    };
    tablet: {
      fontScale: number;
      spacingScale: number;
      imageScale: number;
    };
    desktop: {
      fontScale: number;
      spacingScale: number;
      imageScale: number;
    };
  };

  // Performance options
  enableMemoization: boolean;
  enableLazyLoading: boolean;
  optimizeForAndroid: boolean;
  optimizeForIOS: boolean;
}

// ===================================================================
// DEFAULT CONFIGURATION
// ===================================================================

const defaultConfig: GlobalResponsiveConfig = {
  // Master switches - ABILITATO TUTTO PER DEFAULT
  enableGlobalResponsive: true,
  enableFontScaling: true,
  enableSpacingScaling: true,
  enableImageScaling: true,
  enableModalScaling: true,
  enableButtonScaling: true,

  // Debug options - ABILITATO SOLO IN DEV MODE
  enableDebugMode: __DEV__,
  enablePerformanceLogging: __DEV__,
  enableDeviceInfoLogging: __DEV__,

  // Scale overrides - PERFETTAMENTE BILANCIATI
  scaleOverrides: {
    phone: {
      fontScale: 1.0, // Font identici su tutti i mobile
      spacingScale: 1.0, // Spacing identici su tutti i mobile
      imageScale: 1.0, // Immagini identiche su tutti i mobile
    },
    tablet: {
      fontScale: 1.2, // Font leggermente più grandi su tablet
      spacingScale: 1.3, // Spacing più ampi su tablet
      imageScale: 1.4, // Immagini più grandi su tablet
    },
    desktop: {
      fontScale: 1.4, // Font più grandi su desktop
      spacingScale: 1.6, // Spacing molto più ampi su desktop
      imageScale: 2.0, // Immagini molto più grandi su desktop
    },
  },

  // Performance options - OTTIMIZZATO PER PERFORMANCE
  enableMemoization: true,
  enableLazyLoading: true,
  optimizeForAndroid: true,
  optimizeForIOS: true,
};

// ===================================================================
// GLOBAL STATE
// ===================================================================

let currentGlobalConfig = { ...defaultConfig };

// ===================================================================
// CONFIGURATION FUNCTIONS
// ===================================================================

/**
 * Aggiorna la configurazione globale responsive
 */
export const updateGlobalResponsiveConfig = (
  newConfig: Partial<GlobalResponsiveConfig>
): void => {
  currentGlobalConfig = {
    ...currentGlobalConfig,
    ...newConfig,
  };

  // Aggiorna anche la configurazione della migrazione
  setMigrationConfig({
    enableImageScaling: currentGlobalConfig.enableImageScaling,
    enableFontScaling: currentGlobalConfig.enableFontScaling,
    enableSpacingScaling: currentGlobalConfig.enableSpacingScaling,
    enableModalScaling: currentGlobalConfig.enableModalScaling,
    enableButtonScaling: currentGlobalConfig.enableButtonScaling,
    debugMode: currentGlobalConfig.enableDebugMode,
  });

  if (currentGlobalConfig.enableDeviceInfoLogging && __DEV__) {
    logDebug('GlobalResponsiveConfig', 'Config updated', currentGlobalConfig);
  }
};

/**
 * Ottiene la configurazione globale corrente
 */
export const getGlobalResponsiveConfig = (): GlobalResponsiveConfig => {
  return { ...currentGlobalConfig };
};

/**
 * Reset della configurazione ai valori di default
 */
export const resetGlobalResponsiveConfig = (): void => {
  updateGlobalResponsiveConfig(defaultConfig);
};

/**
 * Disabilita completamente il sistema responsive
 */
export const disableAllResponsive = (): void => {
  updateGlobalResponsiveConfig({
    enableGlobalResponsive: false,
    enableFontScaling: false,
    enableSpacingScaling: false,
    enableImageScaling: false,
    enableModalScaling: false,
    enableButtonScaling: false,
  });
};

/**
 * Abilita completamente il sistema responsive
 */
export const enableAllResponsive = (): void => {
  updateGlobalResponsiveConfig({
    enableGlobalResponsive: true,
    enableFontScaling: true,
    enableSpacingScaling: true,
    enableImageScaling: true,
    enableModalScaling: true,
    enableButtonScaling: true,
  });
};

/**
 * Modalità debug completa
 */
export const enableFullDebugMode = (): void => {
  updateGlobalResponsiveConfig({
    enableDebugMode: true,
    enablePerformanceLogging: true,
    enableDeviceInfoLogging: true,
  });
};

/**
 * Disabilita debug mode
 */
export const disableDebugMode = (): void => {
  updateGlobalResponsiveConfig({
    enableDebugMode: false,
    enablePerformanceLogging: false,
    enableDeviceInfoLogging: false,
  });
};

// ===================================================================
// PRESET CONFIGURATIONS
// ===================================================================

/**
 * Preset ottimizzato per sviluppo
 */
export const applyDevelopmentPreset = (): void => {
  updateGlobalResponsiveConfig({
    ...defaultConfig,
    enableDebugMode: true,
    enablePerformanceLogging: true,
    enableDeviceInfoLogging: true,
  });
};

/**
 * Preset ottimizzato per produzione
 */
export const applyProductionPreset = (): void => {
  updateGlobalResponsiveConfig({
    ...defaultConfig,
    enableDebugMode: false,
    enablePerformanceLogging: false,
    enableDeviceInfoLogging: false,
    enableMemoization: true,
    enableLazyLoading: true,
  });
};

/**
 * Preset per testing
 */
export const applyTestingPreset = (): void => {
  updateGlobalResponsiveConfig({
    enableGlobalResponsive: false, // Disabilita responsive nei test
    enableFontScaling: false,
    enableSpacingScaling: false,
    enableImageScaling: false,
    enableModalScaling: false,
    enableButtonScaling: false,
    enableDebugMode: false,
    enablePerformanceLogging: false,
    enableDeviceInfoLogging: false,
  });
};

// ===================================================================
// INITIALIZATION
// ===================================================================

/**
 * Inizializza il sistema responsive con la configurazione di default
 */
export const initializeResponsiveSystem = (): void => {
  // Applica preset basato sull'ambiente
  if (__DEV__) {
    applyDevelopmentPreset();
  } else {
    applyProductionPreset();
  }

  if (__DEV__) {
    logDebug(
      'ResponsiveSystem',
      'Initialized with config',
      currentGlobalConfig
    );
  }
};

// ===================================================================
// AUTO-INITIALIZATION
// ===================================================================

// Inizializza automaticamente al caricamento del modulo
initializeResponsiveSystem();

// ===================================================================
// EXPORTS
// ===================================================================

export {
  currentGlobalConfig as globalResponsiveConfig,
  defaultConfig as defaultResponsiveConfig,
};

export default {
  updateConfig: updateGlobalResponsiveConfig,
  getConfig: getGlobalResponsiveConfig,
  resetConfig: resetGlobalResponsiveConfig,
  disableAll: disableAllResponsive,
  enableAll: enableAllResponsive,
  enableDebug: enableFullDebugMode,
  disableDebug: disableDebugMode,
  presets: {
    development: applyDevelopmentPreset,
    production: applyProductionPreset,
    testing: applyTestingPreset,
  },
  initialize: initializeResponsiveSystem,
};
