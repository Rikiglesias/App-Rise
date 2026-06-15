/**
 * Sistema Environment Variables Sicuro
 * Utilizza Expo Constants per gestire configurazioni ambiente
 * Evita dipendenze problematiche come react-native-dotenv
 */

import Constants from 'expo-constants';

const getEnvVar = (key: string): string | undefined => {
  const processEnv = (
    globalThis as typeof globalThis & {
      process?: { env?: Record<string, string | undefined> };
    }
  ).process?.env;
  const value = processEnv?.[key] as string | undefined;
  return typeof value === 'string' && value.trim().length > 0
    ? value
    : undefined;
};

/**
 * Resolve production API URL.
 * NOTA: l'app NON usa un API backend — tutti i dati sono statici. Questo resta
 * un placeholder/feature-flag esposto via env, senza consumer di rete reali.
 */
const resolveProductionApiUrl = (): string => {
  const extra = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)
    ?.apiUrl;
  const envFallback =
    getEnvVar('EXPO_PUBLIC_API_BASE_URL') ?? getEnvVar('API_BASE_URL');
  const url = extra ?? envFallback;

  // Fallback per Jest
  const jestWorkerId = getEnvVar('JEST_WORKER_ID');
  if (!url && jestWorkerId) {
    return 'https://test-api.local';
  }

  // Placeholder per produzione se non configurato (l'app non usa API)
  return url ?? 'https://api.placeholder.local';
};

// Tipizzazione forte per environment variables
interface AppEnvironment {
  NODE_ENV: 'development' | 'staging' | 'production';
  APP_VERSION: string;
  API_BASE_URL: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  ENABLE_FLIPPER: boolean;
  ENABLE_PERFORMANCE_MONITORING: boolean;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  ENVIRONMENT: 'development' | 'staging' | 'production';
}

// Configurazioni per ambiente
const environmentConfigs: Record<string, AppEnvironment> = {
  development: {
    NODE_ENV: 'development',
    APP_VERSION: '1.0.0-dev',
    SUPABASE_URL: getEnvVar('EXPO_PUBLIC_SUPABASE_URL') ?? '',
    SUPABASE_ANON_KEY: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY') ?? '',
    API_BASE_URL:
      getEnvVar('EXPO_PUBLIC_API_BASE_URL_DEV') ??
      getEnvVar('EXPO_PUBLIC_API_BASE_URL') ??
      'https://api.riseagainsthunger.italia.dev',
    ENABLE_FLIPPER: true,
    ENABLE_PERFORMANCE_MONITORING: true,
    LOG_LEVEL: 'debug',
    ENVIRONMENT: 'development',
  },
  staging: {
    NODE_ENV: 'staging',
    APP_VERSION: '1.0.0-staging',
    SUPABASE_URL: getEnvVar('EXPO_PUBLIC_SUPABASE_URL') ?? '',
    SUPABASE_ANON_KEY: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY') ?? '',
    API_BASE_URL:
      getEnvVar('EXPO_PUBLIC_API_BASE_URL_STAGING') ??
      getEnvVar('EXPO_PUBLIC_API_BASE_URL') ??
      'https://api.riseagainsthunger.italia.staging',
    ENABLE_FLIPPER: true,
    ENABLE_PERFORMANCE_MONITORING: true,
    LOG_LEVEL: 'info',
    ENVIRONMENT: 'staging',
  },
  production: {
    NODE_ENV: 'production',
    APP_VERSION: '1.0.0',
    SUPABASE_URL: getEnvVar('EXPO_PUBLIC_SUPABASE_URL') ?? '',
    SUPABASE_ANON_KEY: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY') ?? '',
    API_BASE_URL: resolveProductionApiUrl(),
    ENABLE_FLIPPER: false,
    ENABLE_PERFORMANCE_MONITORING: false,
    LOG_LEVEL: 'error',
    ENVIRONMENT: 'production',
  },
};

// Determina l'ambiente corrente
const getCurrentEnvironment = (): keyof typeof environmentConfigs => {
  // In sviluppo usa __DEV__
  if (__DEV__) {
    return 'development';
  }

  // Controlla release channel per staging (se disponibile)
  const manifest = Constants.manifest;
  if (
    manifest &&
    typeof manifest === 'object' &&
    'releaseChannel' in manifest
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const releaseChannel = manifest.releaseChannel;
    if (releaseChannel === 'staging') {
      return 'staging';
    }
  }

  // Default production
  return 'production';
};

// Validazione configurazione
const validateEnvironmentConfig = (envConfig: AppEnvironment): void => {
  const requiredFields: (keyof AppEnvironment)[] = [
    'NODE_ENV',
    'APP_VERSION',
    'API_BASE_URL',
    'ENABLE_FLIPPER',
    'ENABLE_PERFORMANCE_MONITORING',
    'LOG_LEVEL',
    'ENVIRONMENT',
  ];

  for (const field of requiredFields) {
    if (envConfig[field] === undefined || envConfig[field] === null) {
      throw new Error(
        `Environment variable ${field} is required but not defined`
      );
    }
  }

  // Validazione URL API (permetti placeholder per produzione senza backend)
  try {
    new URL(envConfig.API_BASE_URL);
  } catch {
    throw new Error(`Invalid API_BASE_URL: ${envConfig.API_BASE_URL}`);
  }
};

// Lazy initialization: configurazione validata solo al primo accesso
let cachedConfig: AppEnvironment | null = null;

const getEnvironmentConfig = (): AppEnvironment => {
  if (cachedConfig) {
    return cachedConfig;
  }

  // Ottieni configurazione ambiente corrente
  const currentEnv = getCurrentEnvironment();
  const config = environmentConfigs[currentEnv];

  // Sicurezza: verifica che la configurazione esista
  if (!config) {
    throw new Error(`Environment configuration not found for: ${currentEnv}`);
  }

  // Valida configurazione
  validateEnvironmentConfig(config);

  // Cache per accessi successivi
  cachedConfig = config;
  return config;
};

// Export configurazione tipizzata con lazy initialization
// Usa Proxy per intercettare accessi e validare solo quando necessario
export const env: AppEnvironment = new Proxy({} as AppEnvironment, {
  get: (_target, prop: string | symbol) => {
    const config = getEnvironmentConfig();
    return config[prop as keyof AppEnvironment];
  },
});

// Export helper functions
export const isDevelopment = (): boolean => env.NODE_ENV === 'development';
export const isStaging = (): boolean => env.NODE_ENV === 'staging';
export const isProduction = (): boolean => env.NODE_ENV === 'production';

// Helper per debugging
export const getEnvironmentInfo = (): Record<string, unknown> => {
  const manifest = Constants.manifest;
  const releaseChannel =
    manifest && typeof manifest === 'object' && 'releaseChannel' in manifest
      ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        manifest.releaseChannel
      : undefined;

  return {
    current: getCurrentEnvironment(),
    isDev: __DEV__,
    releaseChannel,
    expoVersion: Constants.expoConfig?.version,
    platform: Constants.platform,
    deviceName: Constants.deviceName,
    appOwnership: Constants.appOwnership,
  };
};

/**
 * Constructs a complete API URL by combining the base URL with an endpoint.
 * Handles proper URL formatting and slash normalization.
 *
 * @param endpoint - The API endpoint path (with or without leading slash)
 * @returns Complete API URL
 *
 * @example
 * ```typescript
 * const userUrl = getApiUrl('/users/123'); // 'https://api.example.com/users/123'
 * const profileUrl = getApiUrl('profile'); // 'https://api.example.com/profile'
 * ```
 */
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = env.API_BASE_URL.endsWith('/')
    ? env.API_BASE_URL.slice(0, -1)
    : env.API_BASE_URL;

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  return `${baseUrl}${cleanEndpoint}`;
};

/**
 * Checks if a specific feature flag is enabled in the current environment.
 *
 * @param feature - The feature flag to check
 * @returns True if the feature is enabled, false otherwise
 *
 * @example
 * ```typescript
 * if (isFeatureEnabled('ENABLE_PERFORMANCE_MONITORING')) {
 *   startPerformanceTracking();
 * }
 *
 * if (isFeatureEnabled('ENABLE_FLIPPER')) {
 *   initializeFlipper();
 * }
 * ```
 */
export const isFeatureEnabled = (
  feature: keyof Pick<
    AppEnvironment,
    'ENABLE_FLIPPER' | 'ENABLE_PERFORMANCE_MONITORING'
  >
): boolean => {
  return env[feature];
};

// Export di convenienza per backward compatibility
export const {
  NODE_ENV,
  APP_VERSION,
  API_BASE_URL,
  ENABLE_FLIPPER,
  ENABLE_PERFORMANCE_MONITORING,
  LOG_LEVEL,
  ENVIRONMENT,
} = env;

// Debug info (solo in sviluppo) - usa logger professionale
if (__DEV__) {
  // Il debug delle environment variables viene gestito dal logger professionale
  // Nessun console.log diretto per rispettare la politica zero-tolleranza
}
