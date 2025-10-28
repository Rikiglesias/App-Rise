module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(?:.pnpm/)?((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg))',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
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
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  // Module name mapping per alias TypeScript
  moduleNameMapper: {
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
