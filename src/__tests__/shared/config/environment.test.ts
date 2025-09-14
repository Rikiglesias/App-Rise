import {
  env,
  isDevelopment,
  isStaging,
  isProduction,
  getEnvironmentInfo,
  getApiUrl,
  isFeatureEnabled,
  NODE_ENV,
  APP_VERSION,
  API_BASE_URL,
} from '../../../shared/config/environment';

// Mock dei Constants aggiornato per Expo SDK 54
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      version: '1.0.0',
      name: 'App Rise',
      slug: 'app-rise',
    },
    executionEnvironment: 'standalone',
    platform: {
      ios: undefined,
      android: undefined,
    },
    deviceName: 'Test Device',
    appOwnership: 'expo',
    // Proprietà deprecate mantenute per compatibilità
    manifest: {
      releaseChannel: undefined,
    },
  },
}));

describe('Environment Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Configuration', () => {
    it('should load environment configuration', () => {
      expect(env).toBeDefined();
      expect(env.NODE_ENV).toBeDefined();
      expect(env.APP_VERSION).toBeDefined();
      expect(env.API_BASE_URL).toBeDefined();
    });

    it('should export individual environment variables', () => {
      expect(NODE_ENV).toBeDefined();
      expect(APP_VERSION).toBeDefined();
      expect(API_BASE_URL).toBeDefined();
    });

    it('should have valid API URL format', () => {
      expect(() => new URL(env.API_BASE_URL)).not.toThrow();
    });
  });

  describe('Environment Detection', () => {
    it('should detect development environment in __DEV__', () => {
      // In test environment __DEV__ is true
      expect(isDevelopment()).toBe(true);
      expect(isStaging()).toBe(false);
      expect(isProduction()).toBe(false);
    });

    it('should provide correct development configuration', () => {
      expect(env.NODE_ENV).toBe('development');
      expect(env.ENABLE_FLIPPER).toBe(true);
      expect(env.ENABLE_PERFORMANCE_MONITORING).toBe(true);
      expect(env.LOG_LEVEL).toBe('debug');
    });
  });

  describe('Helper Functions', () => {
    it('should generate API URLs correctly', () => {
      const url1 = getApiUrl('/users');
      const url2 = getApiUrl('users');

      expect(url1).toContain('/users');
      expect(url2).toContain('/users');
      expect(url1).toBe(url2);
    });

    it('should handle API URLs with trailing slash', () => {
      const endpoint = '/test';
      const url = getApiUrl(endpoint);

      expect(url).toContain(endpoint);
      expect(url).not.toMatch(/\/\/test/); // No double slashes
    });

    it('should check feature flags correctly', () => {
      const flipperEnabled = isFeatureEnabled('ENABLE_FLIPPER');
      const perfEnabled = isFeatureEnabled('ENABLE_PERFORMANCE_MONITORING');

      expect(typeof flipperEnabled).toBe('boolean');
      expect(typeof perfEnabled).toBe('boolean');
    });

    it('should provide environment info', () => {
      const info = getEnvironmentInfo();

      expect(info).toHaveProperty('current');
      expect(info).toHaveProperty('isDev');
      expect(info).toHaveProperty('releaseChannel');
      expect(info).toHaveProperty('expoVersion');
      expect(info).toHaveProperty('platform');
      expect(info).toHaveProperty('deviceName');
      expect(info).toHaveProperty('appOwnership');
    });
  });

  describe('Configuration Validation', () => {
    it('should have all required fields', () => {
      const requiredFields = [
        'NODE_ENV',
        'APP_VERSION',
        'API_BASE_URL',
        'ENABLE_FLIPPER',
        'ENABLE_PERFORMANCE_MONITORING',
        'LOG_LEVEL',
        'ENVIRONMENT',
      ];

      for (const field of requiredFields) {
        expect(env).toHaveProperty(field);
        expect(env[field as keyof typeof env]).toBeDefined();
      }
    });

    it('should have valid log level', () => {
      const validLogLevels = ['debug', 'info', 'warn', 'error'];
      expect(validLogLevels).toContain(env.LOG_LEVEL);
    });

    it('should have consistent environment values', () => {
      expect(env.NODE_ENV).toBe(env.ENVIRONMENT);
    });
  });
});
