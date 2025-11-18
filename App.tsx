import { StatusBar } from 'expo-status-bar';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useUpdates } from 'expo-updates';
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
  const { isDownloading, downloadProgress } = useUpdates();

  // Trigger re-render dopo init display zoom (per applicare normalizzazione)
  const [_, setZoomReadyTick] = useState(0);

  // 🧪 TEST: Rimuovi questo per testare la schermata OTA
  const [testProgress, setTestProgress] = useState(0);
  const [forceShow, setForceShow] = useState(false); // Controllo dinamico
  const FORCE_SHOW_OTA_SCREEN = forceShow; // ❌ DISATTIVATO in produzione

  // Inizializzazione app
  useEffect(() => {
    // Log dell'inizializzazione
    logger.info('App', '✅ App initialized with SDK 54 - OTA Updates with UI');
    // Telemetria Display Zoom e re-render per applicare normalizzazione
    void initDisplayZoom().finally(() => setZoomReadyTick(t => t + 1));

    // 🧪 TEST: Simula download progressivo
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

  // Mostra UI aggiornamento SOLO durante download (non durante check)
  // Check è veloce (1-2 sec) e silenzioso, download mostra UI
  if (isDownloading || FORCE_SHOW_OTA_SCREEN) {
    return (
      <OTAUpdateScreen
        isChecking={false}
        isDownloading={true}
        progress={
          FORCE_SHOW_OTA_SCREEN
            ? testProgress
            : downloadProgress
              ? downloadProgress * 100
              : 0
        }
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
