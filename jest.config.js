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
  // Soglie a RIDOSSO della copertura reale, non 30-40 punti sotto.
  // Misurato il 2026-08-15: statements 76.86 · branches 67.43 · functions 67.29 ·
  // lines 78.36. Con i valori precedenti (25/35/40/40) si poteva DIMEZZARE la
  // copertura e il gate restava verde: una soglia così lontana dal vero non
  // protegge da niente, dà solo l'impressione di farlo.
  // Il margine di ~2 punti sotto il valore misurato assorbe le fluttuazioni
  // normali senza lasciar passare una regressione vera. Vanno rialzate quando la
  // copertura sale: una soglia si insegue, non si imposta una volta sola.
  coverageThreshold: {
    global: {
      branches: 65,
      functions: 65,
      lines: 76,
      statements: 74,
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
