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

  const [showOtaScreen, setShowOtaScreen] = useState(false);
  const [visualProgress, setVisualProgress] = useState(0);
  
  // Refs per gestire lo stato asincrono senza causare re-render inutili durante l'animazione
  const downloadStartTimeRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isReloadingRef = useRef(false);

  const MIN_ANIMATION_TIME = 2000; // Minimo tempo per arrivare al 90%
  const UPDATE_COMPLETION_DELAY = 1500; // Tempo per mostrare "Completato" prima del reload

  // Inizializzazione app
  useEffect(() => {
    logger.info('App', '🚀 App initialized with SDK 54 - Enhanced OTA Logic');
    void initDisplayZoom().finally(() => setZoomReadyTick(t => t + 1));
  }, []);

  // Gestione Logica OTA - Avvio Download e Animazione
  useEffect(() => {
    // 1. Avvio Download
    if (isDownloading && !showOtaScreen) {
      setShowOtaScreen(true);
      setVisualProgress(0);
      downloadStartTimeRef.current = Date.now();
      
      // Avvia animazione fluida
      progressIntervalRef.current = setInterval(() => {
        setVisualProgress(prev => {
          // Altrimenti calcola progresso basato su tempo o download reale
          const elapsed = Date.now() - (downloadStartTimeRef.current || Date.now());
          const timeProgress = Math.min((elapsed / MIN_ANIMATION_TIME) * 90, 90);
          
          // Prendi il massimo tra progresso temporale e reale (se disponibile)
          const realProgress = (downloadProgress || 0) * 100;
          let target = Math.max(timeProgress, realProgress);
          
          // Cap al 95% finché non è pending
          target = Math.min(target, 95);

          // Movimento fluido verso il target
          const diff = target - prev;
          const step = Math.max(diff * 0.1, 0.5);
          
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

  // Gestione Completamento - Forza 100% quando update è pronto
  useEffect(() => {
    if (isUpdatePending && showOtaScreen && !isReloadingRef.current) {
      // FORZA immediatamente il progresso al 100%
      logger.info('App', '⚡ Update ready - forcing progress to 100%');
      setVisualProgress(100);
    }
  }, [isUpdatePending, showOtaScreen]);

  // Gestione Reload - Triggera solo quando effettivamente al 100%
  useEffect(() => {
    if (visualProgress >= 100 && isUpdatePending && showOtaScreen && !isReloadingRef.current) {
      isReloadingRef.current = true;
      
      // Pulisci intervallo animazione
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      logger.info('App', '✅ Progress at 100% - Showing completion state');

      // Aspetta per mostrare il messaggio "Completato"
      setTimeout(() => {
        logger.info('App', '🔄 Triggering reloadAsync...');
        Updates.reloadAsync().catch(e => {
          logger.error('App', '❌ Reload failed', e);
          isReloadingRef.current = false;
          setShowOtaScreen(false);
        });
      }, UPDATE_COMPLETION_DELAY);
    }
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

export default App;
