const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Cache riabilitata con gestione errori robusta
config.resetCache = false;

// Configurazione cache avanzata per prestazioni ottimali
config.server = {
  ...config.server,
};

// Transformer ottimizzato per cache stabile
config.transformer = {
  ...config.transformer,
  enableBabelRCLookup: false,
  enableBabelRuntime: false,
};

// Ottimizzazioni performance
config.resolver.sourceExts.push('cjs');
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Cache migliorata
config.cacheStores = [
  {
    name: 'filesystem',
    options: {
      directory: '.metro-cache',
    },
  },
];

// Asset resolution ottimizzata
config.resolver.assetExts.push('bin', 'txt', 'jpg', 'png', 'json', 'svg');

module.exports = config;
