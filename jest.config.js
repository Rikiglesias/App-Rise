module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(?:.pnpm/)?((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|d3-geo|d3-array|internmap|topojson-client|rn-international-phone-number|rn-country-select))',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    'src/__tests__/helpers/', // Ignora helper files che non sono test
    'tests/acceptance/', // Oracoli topic-loop: girano con vitest (dynamic import incompatibile col vm CJS di jest)
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/__tests__/helpers/**',
    '!src/**/index.ts',
    '!src/shared/screens/**',
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
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
    '^@/navigation/(.*)$': '<rootDir>/src/navigation/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/shared/hooks/$1',
    '^@/utils/(.*)$': '<rootDir>/src/shared/utils/$1',
  },
};
