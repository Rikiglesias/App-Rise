/* eslint-disable */
export default {
  expo: {
    name: 'Rise Against Hunger Italia',
    slug: 'rise-against-hunger-italia',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    primaryColor: '#FF6B35',

    // Configurazioni splash screen
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#FF6B35',
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
            'riseagainsthunger.org': {
              NSExceptionAllowsInsecureHTTPLoads: false,
              NSExceptionMinimumTLSVersion: '1.2',
              NSExceptionRequiresForwardSecrecy: true,
              NSPinnedDomains: {
                'api.riseagainsthunger.org': {
                  NSIncludesSubdomains: true,
                  NSPinnedCAIdentities: [
                    'Let\'s Encrypt R3',
                    'ISRG Root X1'
                  ]
                },
                'cdn.riseagainsthunger.org': {
                  NSIncludesSubdomains: true,
                  NSPinnedCAIdentities: [
                    'Let\'s Encrypt R3',
                    'ISRG Root X1'
                  ]
                }
              }
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
      edgeToEdgeEnabled: true,
      statusBarStyle: 'dark',
      statusBarTranslucent: true,
      statusBarBackgroundColor: '#00000000',
      systemNavigationBarBackgroundColor: '#00000000',
      systemNavigationBarStyle: 'light',
      // Abilita overscroll effect
      androidRenderingAPI: 'auto',
    },

    // Configurazioni aggiuntive
    assetBundlePatterns: ['**/*'],
    web: {
      favicon: './assets/favicon.png',
    },

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
