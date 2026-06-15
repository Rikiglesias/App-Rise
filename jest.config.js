module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(?:.pnpm/)?((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg))',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    'src/__tests__/helpers/', // Ignora helper files che non sono test
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/__tests__/helpers/**',
    '!src/features/**/DevelopmentScreen.tsx',
    '!src/features/**/SimplePlaceholderScreen.tsx',
    '!src/features/**/TestAutomaticoScreen.tsx',
    '!src/features/development/**',
    '!src/**/index.ts',
    '!src/stores/types.ts',
    '!src/stores/migration-examples.ts',
    '!src/shared/screens/**',
    '!src/shared/monitoring/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  // Configurazione per evitare che Jest rimanga appeso
  testTimeout: 10000,
  coverageThreshold: {
    global: {
      branches: 25,
      functions: 35,
      lines: 40,
      statements: 40,
    },
  },
  // Module name mapping per alias TypeScript
  moduleNameMapper: {
    // Mappa nativa: in jest usa il mock (come metro per web/Expo Go); il modulo
    // nativo @maplibre non è caricabile nell'ambiente di test.
    '^@maplibre/maplibre-react-native$': '<rootDir>/web-maps-mock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
    '^@/navigation/(.*)$': '<rootDir>/src/navigation/$1',
    '^@/stores/(.*)$': '<rootDir>/src/stores/$1',
    '^@/screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/shared/hooks/$1',
    '^@/utils/(.*)$': '<rootDir>/src/shared/utils/$1',
  },
};
