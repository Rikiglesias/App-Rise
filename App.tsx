import { StatusBar } from 'expo-status-bar';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import * as Updates from 'expo-updates';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/shared/hooks/useTheme';
import { logger } from './src/shared/utils/logger';
import { initDisplayZoom } from './src/shared/services/displayZoom';
import { usePerfectTheme } from './src/shared/hooks/usePerfectTheme';
import { OTAUpdateScreen } from './src/shared/OTAUpdateScreen';
import { ErrorBoundary } from './src/shared/components/ErrorBoundary';

const MINIMUM_OTA_SCREEN_MS = 2400;
const PROGRESS_CAP_BEFORE_COMPLETE = 98;

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

const App: React.FC = () => {
  // Hook NATIVO expo-updates (SDK 54 - React 19 compatibile)
  const { isDownloading, downloadProgress, isUpdatePending } =
    Updates.useUpdates();

  // Trigger re-render dopo init display zoom (per applicare normalizzazione)
  const [_, setZoomReadyTick] = useState(0);

  // ?? TEST: Rimuovi questo per testare la schermata OTA
  const [testProgress, setTestProgress] = useState(0);
  const [forceShow, setForceShow] = useState(false); // Controllo dinamico
  const FORCE_SHOW_OTA_SCREEN = forceShow; // ? DISATTIVATO in produzione

  const [showOtaScreen, setShowOtaScreen] = useState(false);
  const [smoothProgress, setSmoothProgress] = useState(0);
  const downloadStartTimeRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const smoothIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const downloadProgressRef = useRef<number | null>(null);
  const updatePendingRef = useRef(isUpdatePending);
  const reloadTriggeredRef = useRef(false);

  // Inizializzazione app
  useEffect(() => {
    // Log dell'inizializzazione
    logger.info('App', '? App initialized with SDK 54 - OTA Updates with UI');
    // Telemetria Display Zoom e re-render per applicare normalizzazione
    void initDisplayZoom().finally(() => setZoomReadyTick(t => t + 1));

    // ?? TEST: Simula download progressivo
    if (FORCE_SHOW_OTA_SCREEN) {
      const interval = setInterval(() => {
        setTestProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            // Dopo 100%, aspetta 1 sec e chiudi schermata
            setTimeout(() => {
              setForceShow(false); // Chiude schermata, mostra app
            }, 1000);
            return 100;
          }
          return prev + 5; // Più veloce per test
        });
      }, 150);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [FORCE_SHOW_OTA_SCREEN]);

  // Memorizza il progresso reale per uso negli intervalli di smoothing
  useEffect(() => {
    downloadProgressRef.current =
      typeof downloadProgress === 'number' ? downloadProgress : null;
  }, [downloadProgress]);

  useEffect(() => {
    updatePendingRef.current = isUpdatePending;
  }, [isUpdatePending]);

  // Gestisce la visibilità della schermata OTA e impone una durata minima
  useEffect(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    if (isDownloading) {
      setShowOtaScreen(true);
      if (!downloadStartTimeRef.current) {
        downloadStartTimeRef.current = Date.now();
      }
      return;
    }

    if (!isDownloading && !isUpdatePending && showOtaScreen) {
      const elapsed = downloadStartTimeRef.current
        ? Date.now() - downloadStartTimeRef.current
        : 0;
      const remaining = Math.max(MINIMUM_OTA_SCREEN_MS - elapsed, 0);

      const timeout = setTimeout(() => {
        setShowOtaScreen(false);
        setSmoothProgress(0);
        downloadStartTimeRef.current = null;
      }, remaining);

      hideTimeoutRef.current = timeout;

      return () => {
        clearTimeout(timeout);
        hideTimeoutRef.current = null;
      };
    }

    return undefined;
  }, [isDownloading, isUpdatePending, showOtaScreen]);

  // Calcola un progresso fluido anche per update "leggeri"
  useEffect(() => {
    if (!showOtaScreen || FORCE_SHOW_OTA_SCREEN) {
      if (smoothIntervalRef.current) {
        clearInterval(smoothIntervalRef.current);
        smoothIntervalRef.current = null;
      }

      if (!showOtaScreen) {
        setSmoothProgress(0);
        downloadStartTimeRef.current = null;
      }

      return;
    }

    if (!downloadStartTimeRef.current) {
      downloadStartTimeRef.current = Date.now();
    }

    smoothIntervalRef.current = setInterval(() => {
      setSmoothProgress(prev => {
        const startTime = downloadStartTimeRef.current ?? Date.now();
        const elapsed = Date.now() - startTime;
        const minimumGoal = Math.min(
          (elapsed / MINIMUM_OTA_SCREEN_MS) * 85,
          85
        );
        const actualProgress =
          downloadProgressRef.current != null
            ? downloadProgressRef.current * 100
            : 0;

        let target = Math.max(minimumGoal, actualProgress);

        if (updatePendingRef.current) {
          target = 100;
        } else {
          target = Math.min(target, PROGRESS_CAP_BEFORE_COMPLETE);
        }

        if (target <= prev) {
          return updatePendingRef.current ? 100 : prev;
        }

        const delta = Math.max((target - prev) * 0.25, 1);
        return Math.min(prev + delta, target);
      });
    }, 120);

    return () => {
      if (smoothIntervalRef.current) {
        clearInterval(smoothIntervalRef.current);
        smoothIntervalRef.current = null;
      }
    };
  }, [showOtaScreen, FORCE_SHOW_OTA_SCREEN]);

  // Applica immediatamente l'aggiornamento OTA appena scaricato
  useEffect(() => {
    if (isUpdatePending && !reloadTriggeredRef.current) {
      reloadTriggeredRef.current = true;

      const timeout = setTimeout(() => {
        logger.info('App', 'Applying OTA update via automatic reload');
        void Updates.reloadAsync().catch(error => {
          reloadTriggeredRef.current = false;
          logger.error('App', 'Failed to reload after OTA update', error);
        });
      }, 600);

      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [isUpdatePending]);

  const shouldRenderOtaScreen = showOtaScreen || FORCE_SHOW_OTA_SCREEN;
  const progressValue = FORCE_SHOW_OTA_SCREEN ? testProgress : smoothProgress;

  // Mostra UI aggiornamento SOLO durante download (non durante check)
  // Check è veloce (1-2 sec) e silenzioso, download mostra UI
  if (shouldRenderOtaScreen) {
    return (
      <OTAUpdateScreen
        isChecking={false}
        isDownloading={true}
        progress={progressValue}
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

export default App;
