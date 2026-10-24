import 'react-native-gesture-handler'; // MUST BE AT THE TOP
import { StatusBar } from 'expo-status-bar';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import * as Updates from 'expo-updates';
import * as SplashScreen from 'expo-splash-screen';
import * as Sentry from '@sentry/react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/shared/hooks/useTheme';
import { logger } from './src/shared/utils/logger';
import { initDisplayZoom } from './src/shared/services/displayZoom';
import { usePerfectTheme } from './src/shared/hooks/usePerfectTheme';
import { OTAUpdateScreen } from './src/shared/OTAUpdateScreen';
import { ErrorBoundary } from './src/shared/components/ErrorBoundary';
import { AuthProvider } from './src/shared/auth/AuthContext';
import { shouldReloadOtaAtStartup } from './src/shared/utils/otaStartupPolicy';

// Durata minima splash screen (ms)
const SPLASH_SCREEN_DURATION = 2500;

// Tetto della schermata d'attesa OTA che blocca l'app all'avvio (C73): scaduto, l'app torna
// usabile e il bundle scaricato dopo vale dal prossimo avvio a freddo, mai ricaricato sotto le dita.
const OTA_ATTESA_MASSIMA_MS = 30_000;

// Crash reporting Sentry. DSN SOLO da env (mai committato): finché EXPO_PUBLIC_SENTRY_DSN
// non è impostato, enabled=false => init no-op (nessun invio, nessun impatto runtime).
// NB: il modulo nativo Sentry richiede un dev build / prebuild (NON funziona in Expo Go).
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
Sentry.init({
  dsn: SENTRY_DSN,
  enabled: !!SENTRY_DSN,
  // App di contenuti: campiona le tracce per non generare volume inutile.
  tracesSampleRate: 0.2,
  // In sviluppo non inizializzare il layer nativo (evita rumore durante il dev).
  enableNative: !__DEV__,
});

// Previene la chiusura automatica della splash screen
SplashScreen.preventAutoHideAsync().catch((e: unknown) => {
  // Atteso su web (nessuna splash nativa): traccia a debug invece di ingoiare
  logger.debug('preventAutoHideAsync failed', 'App', e);
});

// The new Main component that bridges the two theme systems
const Main: React.FC<{ onNavigationReady?: (() => void) | undefined }> = ({
  onNavigationReady,
}) => {
  const { isDark, universal, brand } = usePerfectTheme();

  // Define base theme from React Native Paper
  const baseTheme = isDark ? MD3DarkTheme : MD3LightTheme;

  // Create a new, merged theme (memoizzato: è il value passato a PaperProvider,
  // ricrearlo a ogni render forzerebbe il re-render dei consumer del theme)
  const paperTheme = useMemo(
    () => ({
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        // Use brand for primary/accent, universal for surfaces/backgrounds
        primary: brand.primary[500],
        background: universal.primary,
        surface: universal.card,
      },
    }),
    [baseTheme, brand, universal]
  );

  return (
    <PaperProvider theme={paperTheme}>
      <AppNavigator onReady={onNavigationReady} />
      <StatusBar style={isDark ? 'light' : 'dark'} translucent={true} />
    </PaperProvider>
  );
};

// --- WEB VERSION (No OTA logic) ---
const WebApp: React.FC = () => {
  useEffect(() => {
    // Nasconde la splash screen dopo il delay
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch((e: unknown) => {
        logger.debug('hideAsync failed (web)', 'App', e);
      });
    }, SPLASH_SCREEN_DURATION);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <Main />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};

// --- NATIVE VERSION (Full OTA logic) ---
const NativeApp: React.FC = () => {
  const { isDownloading, downloadProgress, isUpdatePending } =
    Updates.useUpdates();
  const [_, setZoomReadyTick] = useState(0);
  const startupTimeRef = useRef(Date.now());
  const navigationReadyRef = useRef(false);
  const wasDownloadingRef = useRef(false);
  const reloadAttemptedRef = useRef(false);
  const mountedRef = useRef(false);
  const otaWaitStartRef = useRef<number | null>(null);
  const otaWaitExpiredRef = useRef(false);
  // La decisione segue l'inizio del download, non il momento in cui finisce.
  const [reloadDuringStartup, setReloadDuringStartup] = useState<
    boolean | null
  >(null);
  const [reloadFailed, setReloadFailed] = useState(false);
  const onNavigationReady = useCallback(() => {
    navigationReadyRef.current = true;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    logger.info('App initialized with SDK 54', 'App');
    void initDisplayZoom()
      .catch((error: unknown) =>
        logger.warn('initDisplayZoom failed', 'App', error)
      )
      .finally(() => {
        if (mountedRef.current) setZoomReadyTick(tick => tick + 1);
      });

    const splashTimer = setTimeout(() => {
      SplashScreen.hideAsync().catch((error: unknown) => {
        logger.debug('hideAsync failed', 'App', error);
      });
    }, SPLASH_SCREEN_DURATION);

    return () => {
      mountedRef.current = false;
      clearTimeout(splashTimer);
    };
  }, []);

  useEffect(() => {
    const downloadStarted = isDownloading && !wasDownloadingRef.current;
    // Il download nativo può essere già finito al primo render JS.
    const firstPending = isUpdatePending && reloadDuringStartup === null;
    let currentPolicy = reloadDuringStartup;
    if (downloadStarted || firstPending) {
      currentPolicy = shouldReloadOtaAtStartup({
        navigationReady: navigationReadyRef.current,
        elapsedSinceStartupMs: Date.now() - startupTimeRef.current,
        attesaScaduta: otaWaitExpiredRef.current,
      });
      setReloadDuringStartup(currentPolicy);
    }
    wasDownloadingRef.current = isDownloading;

    if (!isUpdatePending || !currentPolicy || reloadAttemptedRef.current) {
      return;
    }

    // Nessun timer/animazione ritarda un aggiornamento ammesso all'avvio.
    reloadAttemptedRef.current = true;
    void Updates.reloadAsync().catch((error: unknown) => {
      logger.error('OTA reload failed', 'App', error);
      if (mountedRef.current) setReloadFailed(true);
    });
  }, [isDownloading, isUpdatePending, reloadDuringStartup]);

  const showOtaScreen =
    reloadDuringStartup === true &&
    (isDownloading || isUpdatePending) &&
    !reloadFailed;

  // Il tempo conta dalla prima comparsa della schermata: anche due download di fila non la
  // tengono oltre il tetto. Scaduto, la decisione passa a «niente ricarica fino al prossimo avvio».
  useEffect(() => {
    if (!showOtaScreen) return;
    otaWaitStartRef.current ??= Date.now();
    const remaining =
      OTA_ATTESA_MASSIMA_MS - (Date.now() - otaWaitStartRef.current);
    const timer = setTimeout(
      () => {
        otaWaitExpiredRef.current = true;
        setReloadDuringStartup(
          shouldReloadOtaAtStartup({
            navigationReady: navigationReadyRef.current,
            elapsedSinceStartupMs: Date.now() - startupTimeRef.current,
            attesaScaduta: true,
          })
        );
      },
      Math.max(0, remaining)
    );
    return () => clearTimeout(timer);
  }, [showOtaScreen]);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <View style={styles.app}>
              <View
                style={styles.app}
                pointerEvents={showOtaScreen ? 'none' : 'auto'}
                accessibilityElementsHidden={showOtaScreen}
                importantForAccessibility={
                  showOtaScreen ? 'no-hide-descendants' : 'auto'
                }
              >
                <Main onNavigationReady={onNavigationReady} />
              </View>
              {showOtaScreen && (
                <View style={StyleSheet.absoluteFill} accessibilityViewIsModal>
                  <OTAUpdateScreen
                    isChecking={false}
                    isDownloading={isDownloading}
                    progress={
                      isUpdatePending ? 100 : (downloadProgress ?? 0) * 100
                    }
                  />
                </View>
              )}
            </View>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({ app: { flex: 1 } });

const App: React.FC = () => {
  // Platform check at the root level - clean separation
  if (Platform.OS === 'web') {
    return <WebApp />;
  }
  return <NativeApp />;
};

// Sentry.wrap abilita l'instrumentation (touch/navigation/performance). No-op senza DSN.
export default Sentry.wrap(App);
