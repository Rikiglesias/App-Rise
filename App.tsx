import 'react-native-gesture-handler'; // MUST BE AT THE TOP
import { StatusBar } from 'expo-status-bar';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
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

// Durata minima splash screen (ms)
const SPLASH_SCREEN_DURATION = 2500;

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
  logger.debug('App', 'preventAutoHideAsync failed', e as Error);
});

// The new Main component that bridges the two theme systems
const Main: React.FC = () => {
  const { isDark, universal, brand } = usePerfectTheme();

  // Define base theme from React Native Paper
  const baseTheme = isDark ? MD3DarkTheme : MD3LightTheme;

  // Create a new, merged theme
  const paperTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      // Use brand for primary/accent, universal for surfaces/backgrounds
      primary: brand.primary[500],
      background: universal.primary,
      surface: universal.card,
      // text: colors.neutral[900], // The base theme handles text color well based on isDark
      // You can continue to map more colors here if needed
      // e.g., error, notification, etc.
    },
  };

  return (
    <PaperProvider theme={paperTheme}>
      <AppNavigator />
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
        logger.debug('App', 'hideAsync failed (web)', e as Error);
      });
    }, SPLASH_SCREEN_DURATION);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <Main />
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};

// --- NATIVE VERSION (Full OTA logic) ---
const NativeApp: React.FC = () => {
  // Hook NATIVO expo-updates (SDK 54 - React 19 compatibile)
  const { isDownloading, downloadProgress, isUpdatePending } =
    Updates.useUpdates();

  // Trigger re-render dopo init display zoom (per applicare normalizzazione)
  const [_, setZoomReadyTick] = useState(0);

  const [showOtaScreen, setShowOtaScreen] = useState(false);
  const [visualProgress, setVisualProgress] = useState(0);
  
  // Refs per gestire lo stato asincrono senza causare re-render inutili durante l'animazione
  const downloadStartTimeRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Ref dedicato all'animazione di completamento: NON condiviso con il download,
  // così ogni effetto cancella solo il proprio timer (evita interferenze cross-effect).
  const completionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Timeout del reload, cancellabile nel cleanup per non lasciare timer pendenti.
  const reloadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isReloadingRef = useRef(false);
  // Se il reload fallisce, evita di ri-tentare in loop su uno stato re-innescabile.
  const reloadFailedRef = useRef(false);

  const MIN_ANIMATION_TIME = 3000; // ✨ Aumentato a 3s per garantire animazione visibile
  const UPDATE_COMPLETION_DELAY = 1500; // Tempo per mostrare "Completato" prima del reload

  // Inizializzazione app e gestione splash screen
  useEffect(() => {
    logger.info('App', '🚀 App initialized with SDK 54 - Enhanced OTA Logic');
    void initDisplayZoom()
      .catch((e: unknown) =>
        logger.warn('App', 'initDisplayZoom failed', e as Error)
      )
      .finally(() => setZoomReadyTick(t => t + 1));

    // Nasconde la splash screen dopo il delay minimo
    const splashTimer = setTimeout(() => {
      SplashScreen.hideAsync().catch((e: unknown) => {
        logger.debug('App', 'hideAsync failed', e as Error);
      });
      logger.info('App', '🎨 Splash screen hidden after minimum duration');
    }, SPLASH_SCREEN_DURATION);

    return () => clearTimeout(splashTimer);
  }, []);

  // Gestione Logica OTA - Avvio Download e Animazione
  useEffect(() => {
    // 1. Avvio Download
    if (isDownloading && !showOtaScreen) {
      setShowOtaScreen(true);
      setVisualProgress(0);
      downloadStartTimeRef.current = Date.now();
      
      logger.info('App', '📥 OTA Download started - animating progress from 0%');
      
      // Avvia animazione fluida GARANTITA da 0 a 90%
      progressIntervalRef.current = setInterval(() => {
        setVisualProgress(prev => {
          // Calcola progresso basato su tempo per GARANTIRE animazione visibile
          const elapsed = Date.now() - (downloadStartTimeRef.current || Date.now());
          const timeProgress = Math.min((elapsed / MIN_ANIMATION_TIME) * 90, 90);
          
          // Prendi il massimo tra progresso temporale e reale (se disponibile)
          const realProgress = (downloadProgress || 0) * 100;
          let target = Math.max(timeProgress, realProgress);
          
          // Cap al 90% finché non è pending (NON 95%, così c'è spazio per salto finale)
          target = Math.min(target, 90);

          // Movimento fluido verso il target - step piccolo per animazione smooth
          const diff = target - prev;
          const step = Math.max(diff * 0.15, 0.3); // ✨ Step più graduale
          
          return Math.min(prev + step, target);
        });
      }, 50);
    }

    // Cleanup intervallo quando componente smonta
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [isDownloading, downloadProgress, showOtaScreen]);

  // Gestione Completamento - Anima SMOOTH fino a 100% quando update è pronto
  useEffect(() => {
    if (isUpdatePending && showOtaScreen && !isReloadingRef.current) {
      // FERMA l'intervallo vecchio
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      logger.info('App', '⚡ Update ready - animating smoothly to 100%');

      // ✨ NUOVA animazione smooth da current progress a 100% (ref dedicato)
      completionIntervalRef.current = setInterval(() => {
        setVisualProgress(prev => {
          if (prev >= 100) {
            // Raggiunti 100% - ferma animazione
            if (completionIntervalRef.current) {
              clearInterval(completionIntervalRef.current);
              completionIntervalRef.current = null;
            }
            return 100;
          }

          // Animazione rapida ma smooth verso 100%
          const remaining = 100 - prev;
          const step = Math.max(remaining * 0.2, 1); // 20% della distanza rimanente, min 1%

          return Math.min(prev + step, 100);
        });
      }, 40); // 40ms = 25fps, smooth ma veloce
    }

    // Cleanup: ferma SOLO l'animazione di completamento (non il download) se le
    // dipendenze cambiano o il componente smonta. Idempotente (StrictMode-safe).
    return () => {
      if (completionIntervalRef.current) {
        clearInterval(completionIntervalRef.current);
        completionIntervalRef.current = null;
      }
    };
  }, [isUpdatePending, showOtaScreen]);

  // Gestione Reload - Triggera solo quando effettivamente al 100%
  useEffect(() => {
    if (
      visualProgress >= 100 &&
      isUpdatePending &&
      showOtaScreen &&
      !isReloadingRef.current &&
      !reloadFailedRef.current
    ) {
      isReloadingRef.current = true;

      logger.info('App', '✅ Progress at 100% - Showing completion state');

      // Aspetta per mostrare il messaggio "Completato" (timeout cancellabile via ref)
      reloadTimeoutRef.current = setTimeout(() => {
        logger.info('App', '🔄 Triggering reloadAsync...');
        Updates.reloadAsync().catch(e => {
          logger.error('App', '❌ Reload failed', e);
          // Marca il fallimento per NON ri-tentare in loop su uno stato re-innescabile
          reloadFailedRef.current = true;
          isReloadingRef.current = false;
          setShowOtaScreen(false);
        });
      }, UPDATE_COMPLETION_DELAY);
    }

    // Cleanup: annulla il reload pendente se le dipendenze cambiano o il componente
    // smonta prima che scada il delay. Idempotente (StrictMode-safe).
    return () => {
      if (reloadTimeoutRef.current) {
        clearTimeout(reloadTimeoutRef.current);
        reloadTimeoutRef.current = null;
      }
    };
  }, [visualProgress, isUpdatePending, showOtaScreen]);

  // Se non sta scaricando e non c'è update pending, assicurati che lo schermo sia nascosto
  useEffect(() => {
    if (!isDownloading && !isUpdatePending && showOtaScreen && !isReloadingRef.current) {
      // Safety check: se per qualche motivo lo stato si blocca
      const timeout = setTimeout(() => {
        setShowOtaScreen(false);
      }, 1000);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [isDownloading, isUpdatePending, showOtaScreen]);

  if (showOtaScreen) {
    return (
      <OTAUpdateScreen
        isChecking={false}
        isDownloading={true}
        progress={visualProgress}
      />
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <Main />
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};

const App: React.FC = () => {
  // Platform check at the root level - clean separation
  if (Platform.OS === 'web') {
    return <WebApp />;
  }
  return <NativeApp />;
};

// Sentry.wrap abilita l'instrumentation (touch/navigation/performance). No-op senza DSN.
export default Sentry.wrap(App);
