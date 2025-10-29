const CODE_SIGNING_CERTIFICATE =
  process.env.EXPO_UPDATES_CODE_SIGNING_CERTIFICATE ??
  process.env.EXPO_PUBLIC_UPDATES_CODE_SIGNING_CERTIFICATE;
const CODE_SIGNING_KEY_ID =
  process.env.EXPO_UPDATES_CODE_SIGNING_KEY_ID ?? 'main';
const CODE_SIGNING_ALGORITHM =
  process.env.EXPO_UPDATES_CODE_SIGNING_ALGORITHM ?? 'rsa-v1_5-sha256';

const baseUpdatesConfig = {
  fallbackToCacheTimeout: 30000, // 30 secondi per controllare updates
  checkAutomatically: 'ON_LOAD', // Controlla all'avvio
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

export default {
  expo: {
    name: 'RAH Italia',
    slug: 'rise-against-hunger-italia',
    version: '1.2.4',
    orientation: 'portrait',
    icon: './assets/icons/app/app-icon.png',
    userInterfaceStyle: 'light',
    primaryColor: '#DC2626',

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
      eas: {
        projectId: '52a33b0f-dec1-4674-812b-de5b888c911a',
      },
    },

    // Configurazioni sicurezza iOS
    ios: {
      displayName: 'RAH Italia',
      supportsTablet: true,
      bundleIdentifier:
        process.env.IOS_BUNDLE_IDENTIFIER ||
        'it.creareunapp.editor.ios63da226b4447c',
      buildNumber: process.env.IOS_BUILD_NUMBER || '19',
      icon: './assets/icons/app/app-icon.png',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription:
          'Questa app utilizza la fotocamera per scansionare QR code per donazioni e eventi.',
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
      versionCode: parseInt(process.env.ANDROID_VERSION_CODE || '4', 10),
      // Permessi specifici con giustificazione
      permissions: [
        'CAMERA', // QR code scanning per donazioni
        'INTERNET', // Comunicazione API
        'ACCESS_NETWORK_STATE', // Monitoraggio stato rete
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
    plugins: ['expo-secure-store', 'expo-updates', 'expo-font'],

    // Aggiornamenti OTA
    updates: updatesConfig,

    // Runtime version per aggiornamenti
    runtimeVersion: {
      policy: 'appVersion',
    },
  },
};
