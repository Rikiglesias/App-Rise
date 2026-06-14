// getSentryExpoConfig è un drop-in di getDefaultConfig (chiama getDefaultConfig
// internamente) + aggiunge il serializer per l'upload dei source map a Sentry.
const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getSentryExpoConfig(__dirname);

// ========================================
// 🚀 METRO CONFIG OTTIMIZZATA - EXPO SDK 54
// ========================================
//
// Configurazione Metro ottimizzata per performance e compatibilità
// Ripristinata gradualmente dopo risoluzione problemi di caricamento
//
// COMPATIBILE CON:
// - Expo SDK 54.0.19
// - Metro 0.83.2
// - React Native 0.81.5
//
// OTTIMIZZAZIONI INCLUSE:
// ✅ Server configuration (porta custom)
// ✅ Resolver (alias, estensioni, platforms)
// ✅ Transformer (bundle optimizations)
// ✅ Serializer (configurazione sicura)
// ✅ Watcher (health check, cartelle monitorate)
//
// RIMOSSO (incompatibile):
// ❌ exclusionList (metro-config@0.83.2)
// ❌ minifierConfig (configurazioni avanzate)
// ❌ enhanceMiddleware (middleware custom)
// ❌ processModuleFilter (serializer custom)
// ========================================

// Server configuration base
config.server = {
  ...config.server,
  port: 8081,
};

// Resolver ottimizzato
config.resolver = {
  ...config.resolver,
  // Estensioni supportate
  sourceExts: [...config.resolver.sourceExts, 'cjs', 'mjs'],
  assetExts: [
    ...config.resolver.assetExts,
    'bin',
    'txt',
    'jpg',
    'png',
    'json',
    'svg',
    'webp',
    'gif',
  ],
  // Platform-specific resolution
  platforms: ['ios', 'android', 'native', 'web'],
  // Alias per path resolution
  alias: {
    '@': path.resolve(__dirname, 'src'),
    '@components': path.resolve(__dirname, 'src/components'),
    '@shared': path.resolve(__dirname, 'src/shared'),
    '@features': path.resolve(__dirname, 'src/features'),
    '@assets': path.resolve(__dirname, 'assets'),
    ...(process.env.EXPO_PUBLIC_PLATFORM === 'web' || process.env.NODE_ENV === 'development'
      ? { 'react-native-maps': path.resolve(__dirname, 'web-maps-mock.js') }
      : {}),
  },
};

// Transformer con ottimizzazioni base
config.transformer = {
  ...config.transformer,
  enableBabelRCLookup: false,
  enableBabelRuntime: false,
  // Ottimizzazioni bundle base
  experimentalImportSupport: true,
  inlineRequires: true,
};

// Serializer ottimizzato per bundle
config.serializer = {
  ...config.serializer,
  // Configurazione sicura senza processModuleFilter custom
};

// Watcher ottimizzato per development
config.watchFolders = [
  path.resolve(__dirname, 'src'),
  path.resolve(__dirname, 'assets'),
];

config.watcher = {
  ...config.watcher,
  additionalExts: ['cjs', 'mjs'],
  healthCheck: {
    enabled: true,
    filePrefix: '.metro-health-check',
  },
};

module.exports = config;
