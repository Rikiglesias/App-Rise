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

  const MIN_ANIMATION_TIME = 3000; // ✨ Aumentato a 3s per garantire animazione visibile
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
      
      // ✨ NUOVA animazione smooth da current progress a 100%
      progressIntervalRef.current = setInterval(() => {
        setVisualProgress(prev => {
          if (prev >= 100) {
            // Raggiunti 100% - ferma animazione
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
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
  }, [isUpdatePending, showOtaScreen]);

  // Gestione Reload - Triggera solo quando effettivamente al 100%
  useEffect(() => {
    if (visualProgress >= 100 && isUpdatePending && showOtaScreen && !isReloadingRef.current) {
      isReloadingRef.current = true;

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
