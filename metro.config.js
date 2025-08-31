const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// ========================================
// 🚀 OTTIMIZZAZIONI PERFORMANCE AVANZATE
// ========================================

// Use default Metro cache configuration

// Server configuration per performance
config.server = {
  ...config.server,
  port: 8081,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Compression headers per assets
      if (req.url?.match(/\.(js|css|json|svg)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      }
      return middleware(req, res, next);
    };
  },
};

// ========================================
// 🌳 TREE SHAKING E MINIFICATION AVANZATA
// ========================================

config.transformer = {
  ...config.transformer,
  enableBabelRCLookup: false,
  enableBabelRuntime: false,
  // Minification avanzata
  minifierConfig: {
    // Tree shaking ottimizzato
    keep_fnames: false,
    mangle: {
      keep_fnames: false,
      toplevel: true,
      safari10: true,
    },
    compress: {
      drop_console: process.env.NODE_ENV === 'production',
      drop_debugger: true,
      pure_funcs: ['console.log', 'console.info', 'console.debug'],
      passes: 3,
      unsafe: true,
      unsafe_comps: true,
      unsafe_math: true,
      unsafe_proto: true,
    },
    output: {
      comments: false,
      ascii_only: true,
    },
  },
  // Ottimizzazioni bundle
  experimentalImportSupport: true,
  inlineRequires: true,
};

// ========================================
// 📁 RESOLVER OTTIMIZZATO
// ========================================

config.resolver = {
  ...config.resolver,
  // Estensioni supportate ottimizzate
  sourceExts: [...config.resolver.sourceExts, 'cjs', 'mjs'],
  assetExts: [
    ...config.resolver.assetExts,
    'bin', 'txt', 'jpg', 'png', 'json', 'svg', 'webp', 'gif'
  ],
  // Platform-specific resolution
  platforms: ['ios', 'android', 'native', 'web'],
  // Alias per ottimizzazioni
  alias: {
    '@': path.resolve(__dirname, 'src'),
    '@components': path.resolve(__dirname, 'src/components'),
    '@shared': path.resolve(__dirname, 'src/shared'),
    '@features': path.resolve(__dirname, 'src/features'),
    '@assets': path.resolve(__dirname, 'assets'),
  },
  // Blocklist per escludere file non necessari
  blockList: [
    /.*\/__tests__\/.*/, // Escludi test files dal bundle
    /.*\/\..*/, // Escludi hidden files
    /node_modules\/.*\/test\/.*/, // Escludi test in node_modules
  ],
};

// ========================================
// 📊 SERIALIZER PER BUNDLE OPTIMIZATION
// ========================================

config.serializer = {
  ...config.serializer,
  // Rimuoviamo la createModuleIdFactory personalizzata per evitare ID non stabili
  // che possono causare "Requiring unknown module <id>" con Hermes/HMR/OTA
  // Processamento moduli ottimizzato
  processModuleFilter: (module) => {
    // Escludi moduli di test dal bundle production
    if (process.env.NODE_ENV === 'production') {
      return !module.path.includes('__tests__') && 
             !module.path.includes('.test.') &&
             !module.path.includes('.spec.');
    }
    return true;
  },
};

// ========================================
// 🔧 WATCHER OTTIMIZZATO
// ========================================

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
