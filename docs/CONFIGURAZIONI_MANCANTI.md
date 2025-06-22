# ⚙️ CONFIGURAZIONI MANCANTI E OTTIMIZZAZIONI

## 🚨 **CONFIGURAZIONI CRITICHE MANCANTI**

### **1. Environment Variables - MANCANTI COMPLETAMENTE**

**Problema:** Nessun file `.env` trovato. Configurazioni hardcoded nel codice.

**Soluzione Immediata:**

```bash
# .env.development
NODE_ENV=development
APP_VERSION=1.0.0
API_BASE_URL=https://api.riseagainsthunger.italia.dev
ENABLE_FLIPPER=true
ENABLE_PERFORMANCE_MONITORING=true
LOG_LEVEL=debug

# .env.production
NODE_ENV=production
APP_VERSION=1.0.0
API_BASE_URL=https://api.riseagainsthunger.italia
ENABLE_FLIPPER=false
ENABLE_PERFORMANCE_MONITORING=false
LOG_LEVEL=error

# .env.staging
NODE_ENV=staging
APP_VERSION=1.0.0-staging
API_BASE_URL=https://api.riseagainsthunger.italia.staging
ENABLE_FLIPPER=true
ENABLE_PERFORMANCE_MONITORING=true
LOG_LEVEL=info
```

### **2. Metro Configuration - MANCANTE**

**Problema:** Configurazione Metro di default, non ottimizzata per Expo + performance.

**File da creare: `metro.config.js`**

```javascript
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
```

### **3. TypeScript Version - NON SUPPORTATA UFFICIALMENTE**

**Problema:** TypeScript 5.8.3 non supportata da ESLint TypeScript

**Correzione nel `package.json`:**

```json
{
  "devDependencies": {
    "typescript": "~5.5.4"
  }
}
```

### **4. Configurazione Sicurezza App - MANCANTE**

**File da creare: `app.config.js`** (sostituisce app.json per logica dinamica)

```javascript
export default {
  expo: {
    name: 'Rise Against Hunger Italia',
    slug: 'rise-against-hunger-italia',
    version: process.env.APP_VERSION || '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    primaryColor: '#FF6B35',

    // Sicurezza
    extra: {
      apiUrl: process.env.API_BASE_URL,
      enableFlipperInApp: process.env.ENABLE_FLIPPER === 'true',
      performanceMonitoring:
        process.env.ENABLE_PERFORMANCE_MONITORING === 'true',
      eas: {
        projectId: '52a33b0f-dec1-4674-812b-de5b888c911a',
      },
    },

    // Configurazioni sicurezza iOS
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'org.riseagainsthunger.italia',
      buildNumber: '1',
      infoPlist: {
        NSCameraUsageDescription:
          'Questa app utilizza la fotocamera per scansionare QR code per donazioni e eventi.',
        NSLocationWhenInUseUsageDescription:
          'Questa app utilizza la posizione per trovare eventi locali di Rise Against Hunger.',
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: false,
          NSExceptionDomains: {
            'riseagainsthunger.italia': {
              NSExceptionAllowsInsecureHTTPLoads: false,
              NSExceptionMinimumTLSVersion: '1.2',
              NSExceptionRequiresForwardSecrecy: true,
            },
          },
        },
      },
    },

    // Configurazioni sicurezza Android
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FF6B35',
      },
      package: 'org.riseagainsthunger.italia',
      versionCode: 1,
      permissions: ['CAMERA', 'ACCESS_FINE_LOCATION'],
      usesCleartextTraffic: false,
      networkSecurityConfig: './android-network-security-config.xml',
    },
  },
};
```

### **5. Configurazione Babel - DA OTTIMIZZARE**

**File: `babel.config.js`** (creazione o aggiornamento)

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          blocklist: null,
          allowlist: null,
          safe: false,
          allowUndefined: true,
          verbose: false,
        },
      ],
      'react-native-reanimated/plugin', // Deve essere ultimo
    ],
  };
};
```

## 🔧 **CONFIGURAZIONI DA AGGIORNARE**

### **6. ESLint - Versione TypeScript**

**Aggiornamento `.eslintrc.js`:**

```javascript
// Aggiungere regola per TypeScript version
rules: {
  // Console statements in produzione
  'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',

  // Gestione debug statements
  'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',

  // Alert statements
  'no-alert': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
}
```

### **7. Jest Configuration - Coverage Thresholds**

**Aggiornamento `jest.config.js`:**

```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Coverage migliorata
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/types/**/*',
    '!src/**/*.styles.ts', // Esclude file di stili
  ],

  // Thresholds di qualità
  coverageThreshold: {
    global: {
      statements: 35,
      branches: 25,
      functions: 40,
      lines: 35,
    },
  },

  // Timeout più lunghi per test complessi
  testTimeout: 10000,

  // Migliore gestione moduli
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

### **8. Package.json - Script Mancanti**

**Script da aggiungere:**

```json
{
  "scripts": {
    "build:ios": "eas build --platform ios",
    "build:android": "eas build --platform android",
    "build:all": "eas build --platform all",
    "submit:ios": "eas submit --platform ios",
    "submit:android": "eas submit --platform android",
    "submit:all": "eas submit --platform all",
    "preview": "eas build --profile preview",
    "update": "eas update",
    "doctor": "expo doctor",
    "install:clean": "rm -rf node_modules package-lock.json && npm install",
    "typecheck": "tsc --noEmit",
    "typecheck:watch": "tsc --noEmit --watch",
    "lint:fix": "eslint src/ --ext .ts,.tsx --fix",
    "format": "prettier --write src/",
    "quality:full": "npm run typecheck && npm run lint && npm run test && npm run format"
  }
}
```

## 🛡️ **SICUREZZA E PERFORMANCE**

### **9. Flipper Configuration**

**File: `react-native.config.js`**

```javascript
module.exports = {
  dependencies: {
    'react-native-flipper': {
      platforms: {
        ios: {
          configurations: ['Debug'],
        },
      },
    },
  },
};
```

### **10. Network Security Config Android**

**File: `android-network-security-config.xml`**

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <domain-config>
    <domain includeSubdomains="true">riseagainsthunger.italia</domain>
    <pin-set>
      <pin digest="SHA-256">HASH_YOUR_CERTIFICATE</pin>
      <pin digest="SHA-256">BACKUP_HASH</pin>
    </pin-set>
  </domain-config>

  <base-config cleartextTrafficPermitted="false">
    <trust-anchors>
      <certificates src="system"/>
    </trust-anchors>
  </base-config>
</network-security-config>
```

### **11. Git Hooks - Husky Setup**

**File: `.husky/pre-commit`**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run pre-modifiche
```

**File: `.husky/pre-push`**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run test:coverage:threshold
```

## 🚀 **IMPLEMENTAZIONE PRIORITARIA**

### **FASE 1 - Oggi (30 minuti)**

1. ✅ Creare file `.env.development` e `.env.production`
2. ✅ Aggiornare TypeScript alla versione supportata
3. ✅ Creare `metro.config.js` ottimizzato

### **FASE 2 - Questa settimana (2 ore)**

1. ✅ Convertire `app.json` in `app.config.js` con env variables
2. ✅ Configurare `babel.config.js` con dotenv
3. ✅ Setup network security Android
4. ✅ Aggiornare script package.json

### **FASE 3 - Prossime 2 settimane (1 giorno)**

1. ✅ Implementare Husky git hooks
2. ✅ Configurare Flipper per debug
3. ✅ Setup monitoring performance avanzato
4. ✅ Implementare error tracking

---

## 🎯 RISULTATO: Configurazione enterprise-grade completa
