const { withStringsXml } = require('@expo/config-plugins');

// Plugin per garantire che le stringhe critiche (come il nome app) esistano nel locale di default
const withDefaultStrings = (config) => {
  return withStringsXml(config, (config) => {
    if (!config.modResults.resources) {
      config.modResults.resources = {};
    }
    if (!config.modResults.resources.string) {
      config.modResults.resources.string = [];
    }

    const strings = config.modResults.resources.string;
    const appName = config.name || 'RAH Italia'; // Fallback sicuro

    // Definisci le stringhe che devono essere presenti nel default (values/strings.xml)
    const defaultStrings = [
      { name: 'CFBundleDisplayName', value: appName },
      { name: 'app_name', value: appName }
    ];

    defaultStrings.forEach(({ name, value }) => {
      const existingIndex = strings.findIndex(s => s.$.name === name);
      const stringItem = { $: { name }, _: value };

      if (existingIndex > -1) {
        // Aggiorna esistente
        strings[existingIndex] = stringItem;
      } else {
        // Aggiungi nuova
        strings.push(stringItem);
      }
    });

    return config;
  });
};

const CODE_SIGNING_CERTIFICATE =
  process.env.EXPO_UPDATES_CODE_SIGNING_CERTIFICATE ??
  process.env.EXPO_PUBLIC_UPDATES_CODE_SIGNING_CERTIFICATE;
const CODE_SIGNING_KEY_ID =
  process.env.EXPO_UPDATES_CODE_SIGNING_KEY_ID ?? 'main';
const CODE_SIGNING_ALGORITHM =
  process.env.EXPO_UPDATES_CODE_SIGNING_ALGORITHM ?? 'rsa-v1_5-sha256';

const baseUpdatesConfig = {
  fallbackToCacheTimeout: 0, // Avvio immediato - nessun delay
  checkAutomatically: 'ON_LOAD', // Check automatico sempre - WiFi E dati mobile
  url: 'https://u.expo.dev/52a33b0f-dec1-4674-812b-de5b888c911a',
};

const updatesConfig =
  CODE_SIGNING_CERTIFICATE !== undefined
    ? {
        ...baseUpdatesConfig,
        codeSigningCertificate: CODE_SIGNING_CERTIFICATE,
        codeSigningMetadata: {
          keyId: CODE_SIGNING_KEY_ID,
          alg: CODE_SIGNING_ALGORITHM,
        },
      }
    : baseUpdatesConfig;

export default withDefaultStrings({
  expo: {
    name: 'RAH Italia',
    slug: 'rise-against-hunger-italia',
    version: '1.2.9',
    orientation: 'portrait',
    icon: './assets/icons/app/app-icon.png',
    userInterfaceStyle: 'light',
    primaryColor: '#DC2626',
    
    // Configurazione lingue supportate
    locales: {
      it: './locales/it.json',
      en: './locales/en.json',
    },

    // Configurazioni splash screen
    splash: {
      image: './assets/icons/app/splash-screen.png',
      resizeMode: 'contain',
      backgroundColor: '#FFFFFF',
    },

    // Configurazioni web
    web: {
      favicon: './assets/icons/app/app-icon.png',
      bundler: 'metro',
    },

    // Configurazioni sicurezza e ambiente
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
      enableFlipperInApp: process.env.ENABLE_FLIPPER === 'true',
      performanceMonitoring:
        process.env.ENABLE_PERFORMANCE_MONITORING === 'true',
      logLevel: process.env.LOG_LEVEL || 'info',
      // Feature flags e opzioni di runtime esposte a JS
      displayZoomNormalization:
        String(
          process.env.EXPO_PUBLIC_ENABLE_DISPLAY_ZOOM_NORMALIZATION ??
            process.env.ENABLE_DISPLAY_ZOOM_NORMALIZATION
        ).toLowerCase() === 'true',
      // Modalità "Perfect Strict": blocca il font scaling di sistema per testi identici
      perfectStrictMode:
        String(
          process.env.EXPO_PUBLIC_PERFECT_STRICT_MODE ??
            process.env.PERFECT_STRICT_MODE
        ).toLowerCase() === 'true',
      // Soglia oltre la quale sbloccare il font scaling di sistema (es. 1.3)
      fontScaleUnlockThreshold: (() => {
        const raw =
          process.env.EXPO_PUBLIC_FONT_SCALE_UNLOCK_THRESHOLD ??
          process.env.FONT_SCALE_UNLOCK_THRESHOLD;
        const num = raw ? Number(raw) : NaN;
        return Number.isFinite(num) && num > 0 ? num : undefined;
      })(),
      // Limite massimo di scaling del testo (es. 1.3, 1.6, 2.0)
      maxFontScale: (() => {
        const raw =
          process.env.EXPO_PUBLIC_MAX_FONT_SCALE ?? process.env.MAX_FONT_SCALE;
        const num = raw ? Number(raw) : NaN;
        return Number.isFinite(num) && num > 0 ? num : undefined;
      })(),
      // Fattore di test per Expo Go (solo sviluppo). Esempio: 1.2
      displayZoomTestFactor: (() => {
        const raw =
          process.env.EXPO_PUBLIC_DISPLAY_ZOOM_TEST_FACTOR ??
          process.env.DISPLAY_ZOOM_TEST_FACTOR;
        const num = raw ? Number(raw) : NaN;
        return Number.isFinite(num) && num > 0 ? num : undefined;
      })(),
      eas: {
        projectId: '52a33b0f-dec1-4674-812b-de5b888c911a',
      },
    },

    // Configurazioni sicurezza iOS
    ios: {
      displayName: 'RAH Italia',
      supportsTablet: true,
      // Google Maps API key per provider="google" (MapView). Valore SOLO da env
      // (mai committato); iniettata in Info.plist al prebuild. Senza key la mappa
      // renderizza vuota (audit rank 3). RNMaps 1.20.1 < 1.22 => no config-plugin.
      ...(process.env.GOOGLE_MAPS_API_KEY && {
        config: { googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY },
      }),
      bundleIdentifier:
        process.env.IOS_BUNDLE_IDENTIFIER ||
        'it.creareunapp.editor.ios63da226b4447c',
      // buildNumber removed - managed by EAS remote (appVersionSource: "remote" in eas.json)
      ...(process.env.IOS_BUILD_NUMBER && {
        buildNumber: process.env.IOS_BUILD_NUMBER,
      }),
      icon: './assets/icons/app/app-icon.png',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription:
          'Questa app utilizza la fotocamera per scansionare QR code per donazioni e eventi.',
        CFBundleLocalizations: ['it', 'en'], // Lingue supportate nelle Settings iOS
        CFBundleDevelopmentRegion: 'it', // Lingua di default
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: false,
          NSExceptionDomains: {
            'italy.riseagainsthunger.org': {
              NSExceptionAllowsInsecureHTTPLoads: false,
              NSExceptionMinimumTLSVersion: '1.2',
              NSExceptionRequiresForwardSecrecy: true,
            },
            'riseagainsthunger.org': {
              NSExceptionAllowsInsecureHTTPLoads: false,
              NSExceptionMinimumTLSVersion: '1.2',
              NSExceptionRequiresForwardSecrecy: true,
              // TLS pinning non supportato in iOS managed: usare modulo nativo se necessario
            },
          },
        },
      },
    },

    // Configurazioni sicurezza Android - Enterprise Grade
    android: {
      displayName: 'RAH Italia',
      adaptiveIcon: {
        foregroundImage: './assets/icons/app/app-icon.png',
        backgroundColor: '#FFFFFF',
        monochromeImage: './assets/icons/app/app-icon.png',
      },
      package: process.env.ANDROID_PACKAGE || 'org.riseagainsthunger.italia',
      // versionCode removed - managed by EAS remote (appVersionSource: "remote" in eas.json)
      ...(process.env.ANDROID_VERSION_CODE && {
        versionCode: parseInt(process.env.ANDROID_VERSION_CODE, 10),
      }),
      // Google Maps API key per provider="google" (MapView). Valore SOLO da env
      // (mai committato); iniettata nell'AndroidManifest al prebuild. Senza key
      // i tile non caricano (audit rank 3).
      ...(process.env.GOOGLE_MAPS_API_KEY && {
        config: { googleMaps: { apiKey: process.env.GOOGLE_MAPS_API_KEY } },
      }),
      icon: './assets/icons/app/app-icon.png',
      // Permessi specifici con giustificazione
      permissions: [
        'CAMERA', // QR code scanning per donazioni
        'INTERNET', // Comunicazione API
        'ACCESS_NETWORK_STATE', // Monitoraggio stato rete
        // Nota: com.google.android.gms.permission.AD_ID non necessario
        // perché l'app NON usa l'Advertising ID
      ],
      // Dichiarazione Google Play per Android 13+
      blockedPermissions: [
        'com.google.android.gms.permission.AD_ID', // App non usa advertising
      ],
      // Configurazioni sicurezza enterprise
      networkSecurityConfig:
        (process.env.APP_ENV ?? process.env.NODE_ENV) === 'development'
          ? './android-network-security-config.xml'
          : './android-network-security-config.prod.xml',
      // Configurazioni build production
      allowBackup: false, // Sicurezza: no backup automatici
      requestLegacyExternalStorage: false, // Scoped storage Android 10+
      // Configurazioni Google Play Store
      playStoreUrl:
        'https://play.google.com/store/apps/details?id=org.riseagainsthunger.italia',
      // Configurazioni performance
      compileSdkVersion: 34,
      targetSdkVersion: 34,
      minSdkVersion: 21, // Android 5.0+ (95% coverage)
      // Configurazioni proguard per obfuscation
      proguardFiles: ['proguard-android-optimize.txt'],
      // Configurazioni splash screen Android 12+
      splash: {
        backgroundColor: '#FFFFFF',
        resizeMode: 'contain',
        dark: {
          backgroundColor: '#000000',
        },
      },
    },

    // Configurazioni aggiuntive
    assetBundlePatterns: ['**/*'],

    // Plugin richiesti
    plugins: [
      'expo-secure-store',
      'expo-updates',
      'expo-font',
      'expo-localization',
      'expo-splash-screen',
      // MapLibre (mappa "Dove operiamo"): config plugin per il modulo nativo.
      // Tile/style via MapTiler (EXPO_PUBLIC_MAPTILER_KEY). Richiede New Arch
      // (default SDK 54) + dev build (no Expo Go). Sostituisce react-native-maps/Google.
      '@maplibre/maplibre-react-native',
      // Sentry: config plugin per setup nativo + upload source map al build EAS.
      // Attivo SOLO con SENTRY_ORG + SENTRY_PROJECT in env (auth token via SENTRY_AUTH_TOKEN,
      // MAI committato). Senza questi -> plugin assente, prebuild invariato (pre-DSN safe).
      ...(process.env.SENTRY_ORG && process.env.SENTRY_PROJECT
        ? [
            [
              '@sentry/react-native/expo',
              {
                organization: process.env.SENTRY_ORG,
                project: process.env.SENTRY_PROJECT,
                url: process.env.SENTRY_URL || 'https://sentry.io/',
              },
            ],
          ]
        : []),
    ],

    // Aggiornamenti OTA
    updates: updatesConfig,

    // Runtime version per aggiornamenti: unificata su appVersion
    runtimeVersion: { policy: 'appVersion' },
  },
});
