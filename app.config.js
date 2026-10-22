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

export default {
  expo: {
    name: 'RAH Italia',
    slug: 'rise-against-hunger-italia',
    // 1.3.0: prima versione per Google Play (pacchetto nuovo). Il runtime OTA segue la
    // versione (`runtimeVersion.policy: appVersion`), quindi resta separato dalla 1.2.9
    // già negli store, che ha moduli nativi diversi.
    version: '1.3.0',
    // Custom URL scheme per i deep link auth (es. reset password: rahitalia://reset-password).
    // Expo prebuild configura iOS CFBundleURLTypes + Android intent-filter. La stessa URL va
    // aggiunta all'allow-list Redirect URLs del progetto Supabase.
    scheme: 'rahitalia',
    orientation: 'portrait',
    icon: './assets/icons/app/app-icon.png',
    userInterfaceStyle: 'light',
    primaryColor: '#DC2626',

    // Nome dell'app tradotto. Dall'SDK 54 questi file finiscono anche nelle stringhe
    // Android (`values-b+<lingua>/strings.xml`): le chiavi iOS stanno sotto `ios`,
    // altrimenti il lint della build release le rifiuta (ExtraTranslation) e la build
    // fallisce. Su Android il nome viene già da `name` qui sotto.
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
      // Soglia di «testo molto grande» per la disposizione di tab bar e CTA (es. 1.3);
      // lo scaling del testo vale comunque da 1.0 (src/shared/utils/textScale.ts)
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
      // Mappa: MapLibre + MapTiler (style via EXPO_PUBLIC_MAPTILER_KEY a runtime),
      // nessuna API key Google nativa richiesta.
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
        // Nessuna NSCameraUsageDescription: l'app non usa la fotocamera (nessun modulo
        // che la apra), e dichiararla farebbe chiedere ai revisori a cosa serve.
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
      // Icona adattiva: il simbolo dentro il cerchio sicuro e la sua maschera per le icone a
      // tema. Si rigenerano da logo.png con `node scripts/genera-icona-adattiva.mjs`.
      adaptiveIcon: {
        foregroundImage: './assets/icons/app/adaptive-foreground.png',
        backgroundColor: '#FFFFFF',
        monochromeImage: './assets/icons/app/adaptive-monochrome.png',
      },
      package: process.env.ANDROID_PACKAGE || 'org.riseagainsthunger.italia',
      // versionCode removed - managed by EAS remote (appVersionSource: "remote" in eas.json)
      ...(process.env.ANDROID_VERSION_CODE && {
        versionCode: parseInt(process.env.ANDROID_VERSION_CODE, 10),
      }),
      // Mappa: MapLibre + MapTiler (style via EXPO_PUBLIC_MAPTILER_KEY a runtime),
      // nessuna API key Google nativa richiesta.
      icon: './assets/icons/app/app-icon.png',
      // Permessi specifici con giustificazione. Niente CAMERA: nessuna funzione la usa,
      // e un permesso dichiarato senza uso va giustificato nel modulo di Play Console.
      permissions: [
        'INTERNET', // Comunicazione API
        'ACCESS_NETWORK_STATE', // Monitoraggio stato rete
        // Nota: com.google.android.gms.permission.AD_ID non necessario
        // perché l'app NON usa l'Advertising ID
      ],
      // Dichiarazione Google Play per Android 13+
      blockedPermissions: [
        'com.google.android.gms.permission.AD_ID', // App non usa advertising
        // Dal template di Expo, nessun uso nel release (misurati sull'AAB 1.3.0 vc 19):
        'android.permission.SYSTEM_ALERT_WINDOW', // serve solo agli overlay di debug
        'android.permission.READ_EXTERNAL_STORAGE', // l'app non legge file del telefono
        'android.permission.WRITE_EXTERNAL_STORAGE',
        // Da androidx.biometric di expo-secure-store: servono solo con
        // `requireAuthentication`, che l'app non usa.
        'android.permission.USE_BIOMETRIC',
        'android.permission.USE_FINGERPRINT',
      ],
      // Configurazioni build production
      allowBackup: false, // Sicurezza: no backup automatici
      requestLegacyExternalStorage: false, // Scoped storage Android 10+
      // Configurazioni Google Play Store
      playStoreUrl:
        'https://play.google.com/store/apps/details?id=org.riseagainsthunger.italia',
      // Livelli API: decide l'SDK di Expo (54: compile e target 36, min 24). Le chiavi
      // compileSdkVersion/targetSdkVersion/minSdkVersion/proguardFiles/networkSecurityConfig
      // che stavano qui non sono configurazione Expo e non venivano applicate: tolte il
      // 2026-10-12. Se servisse cambiarli, si usa il plugin `expo-build-properties`.
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
      // NB: qui viveva la patch CocoaPods `modular_headers` su GoogleUtilities e
      // RecaptchaInterop. Esisteva SOLO perché il pod Swift di google-signin
      // (AppCheckCore) importava quei due pod ObjC senza module map, e senza la
      // patch `pod install` falliva. Rimossa insieme a google-signin (2026-07-26):
      // sparita la libreria, sparita la causa. Se un domani rientrasse una
      // dipendenza con lo stesso problema, la forma giusta resta questa —
      // `modular_headers` MIRATO sui singoli pod, MAI `useFrameworks: static`
      // globale, che rompe i TurboModule della New Architecture a runtime.
      'expo-secure-store',
      'expo-updates',
      // Build per gli store senza expo-dev-client (motivo nel file).
      './plugins/escludi-dev-client.js',
      // Pieghevole aperto o finestra ridimensionata senza riavvio (motivo nel file).
      './plugins/finestra-senza-riavvio.js',
      // Prova di possesso della chiave per la verifica dello sviluppatore Android (motivo nel file).
      './plugins/registrazione-pacchetto.js',
      'expo-font',
      'expo-localization',
      // SDK 54: lo splash si configura QUI (config plugin), non più via la chiave
      // legacy `splash`/`android.splash`. Senza `image` il plugin referenzia
      // @drawable/splashscreen_logo senza generarlo → build Android fallisce
      // (processDebugResources: resource not found). Valori = identici al legacy.
      [
        'expo-splash-screen',
        {
          image: './assets/icons/app/splash-screen.png',
          resizeMode: 'contain',
          backgroundColor: '#FFFFFF',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
      // Login social rimosso (2026-07-26): niente `expo-apple-authentication` —
      // che portava con sé la capability "Sign in with Apple" nell'entitlements —
      // né il plugin google-signin condizionale su EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME.
      // L'unico ingresso è email + password.
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
};
