module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'react-native'],
  extends: [
    'expo',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // TypeScript rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',

    // React rules
    'react/react-in-jsx-scope': 'off', // Non necessario con React 17+
    'react/prop-types': 'off', // Uso TypeScript per prop types
    'react/display-name': 'off',

    // React Native specific
    'react-native/no-unused-styles': 'error',
    'react-native/split-platform-components': 'warn',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'off', // Permettiamo colori nel codice
    'react-native/no-raw-text': 'off', // Per placeholder text

    // General quality rules
    'no-console': 'warn',
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
  },
  env: {
    'react-native/react-native': true,
    jest: true,
    es6: true,
    node: true,
  },
  ignorePatterns: [
    'node_modules/',
    '.expo/',
    'web-build/',
    'android/',
    'ios/',
    '!jest.config.js',
    '!jest.setup.js',
    '!.eslintrc.js',
  ],
};
