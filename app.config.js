export default {
  expo: {
    name: 'RAH Italia',
    slug: 'rise-against-hunger-italia',
    version: '1.2.3',
    orientation: 'portrait',
    icon: './assets/icons/app/app-icon.jpg',
    userInterfaceStyle: 'light',
    newArchEnabled: false,
    primaryColor: '#DC2626',

    // Configurazioni splash screen
    splash: {
      image: './assets/icons/app/splash-screen.png',
      resizeMode: 'contain',
      backgroundColor: '#FFFFFF',
    },

    // Configurazioni sicurezza e ambiente
    extra: {
      apiUrl:
        process.env.API_BASE_URL || 'https://api.riseagainsthunger.italia',
      enableFlipperInApp: process.env.ENABLE_FLIPPER === 'true',
      performanceMonitoring:
        process.env.ENABLE_PERFORMANCE_MONITORING === 'true',
      logLevel: process.env.LOG_LEVEL || 'info',
      eas: {
        projectId: process.env.EAS_PROJECT_ID,
      },
    },

    // Configurazioni sicurezza iOS
    ios: {
      displayName: 'RAH Italia',
      supportsTablet: true,
      bundleIdentifier: process.env.IOS_BUNDLE_IDENTIFIER || 'it.creareunapp.editor.ios63da226b4447c',
      buildNumber: process.env.IOS_BUILD_NUMBER || '19',
      icon: './assets/icons/app/app-icon.jpg',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
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
            'riseagainsthunger.org': {
              NSExceptionAllowsInsecureHTTPLoads: false,
              NSExceptionMinimumTLSVersion: '1.2',
              NSExceptionRequiresForwardSecrecy: true,
              NSPinnedDomains: {
                'api.riseagainsthunger.org': {
                  NSIncludesSubdomains: true,
                  NSPinnedCAIdentities: ["Let's Encrypt R3", 'ISRG Root X1'],
                },
                'cdn.riseagainsthunger.org': {
                  NSIncludesSubdomains: true,
                  NSPinnedCAIdentities: ["Let's Encrypt R3", 'ISRG Root X1'],
                },
              },
            },
          },
        },
      },
    },

    // Configurazioni sicurezza Android - Enterprise Grade
    android: {
      displayName: 'RAH Italia',
      adaptiveIcon: {
        foregroundImage: './assets/icons/app/app-icon.jpg',
        backgroundColor: '#F8F8F8',
        monochromeImage: './assets/icons/app/app-icon.jpg', // Android 13+ themed icons
      },
      package: process.env.ANDROID_PACKAGE || 'it.creareunapp.editor.ios63da226b4447c',
      versionCode: parseInt(process.env.ANDROID_VERSION_CODE || '3', 10),
      // Permessi specifici con giustificazione
      permissions: [
        'CAMERA', // QR code scanning per donazioni
        'ACCESS_FINE_LOCATION', // Eventi locali Rise Against Hunger
        'INTERNET', // Comunicazione API
        'ACCESS_NETWORK_STATE', // Check connettività
      ],
      // Configurazioni sicurezza enterprise
      networkSecurityConfig: './android-network-security-config.xml',
      // Configurazioni build production
      allowBackup: false, // Sicurezza: no backup automatici
      requestLegacyExternalStorage: false, // Scoped storage Android 10+
      // Configurazioni Google Play Store
      playStoreUrl:
        'https://play.google.com/store/apps/details?id=it.creareunapp.editor.ios63da226b4447c',
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
    web: {
      favicon: './assets/icons/app/app-icon.jpg',
    },

    // Plugin richiesti
    plugins: ['expo-secure-store', 'expo-updates'],

    // Aggiornamenti OTA
    updates: {
      fallbackToCacheTimeout: 0,
      url: 'https://u.expo.dev/52a33b0f-dec1-4674-812b-de5b888c911a',
    },

    // Runtime version per aggiornamenti
    runtimeVersion: {
      policy: 'sdkVersion',
    },
  },
};
