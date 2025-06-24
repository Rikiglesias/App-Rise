export default {
  expo: {
    name: 'RAH Italia',
    slug: 'rise-against-hunger-italia',
    version: '1.2.1',
    orientation: 'portrait',
    icon: './assets/icons/app/logo.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    primaryColor: '#DC2626',

    // Configurazioni splash screen
    splash: {
      image: './assets/icons/app/ios-icon-1024.png',
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
        projectId: '52a33b0f-dec1-4674-812b-de5b888c911a',
      },
    },

    // Configurazioni sicurezza iOS
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'org.riseagainsthunger.italia',
      buildNumber: '4',
      icon: './assets/icons/app/ios-icon-1024.png',
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

    // Configurazioni sicurezza Android
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/icons/app/logo.png',
        backgroundColor: '#FFFFFF',
      },
      package: 'org.riseagainsthunger.italia',
      versionCode: 3,
      permissions: ['CAMERA', 'ACCESS_FINE_LOCATION'],
    },

    // Configurazioni aggiuntive
    assetBundlePatterns: ['**/*'],
    web: {
      favicon: './assets/icons/app/favicon.png',
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
