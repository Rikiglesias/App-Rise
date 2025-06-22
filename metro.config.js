const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

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
