import { StatusBar } from 'expo-status-bar';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/shared/hooks/useTheme';
import { logger } from './src/shared/utils/logger';
import { initDisplayZoom } from './src/shared/services/displayZoom';
import { usePerfectTheme } from './src/shared/hooks/usePerfectTheme';
import { useOTAUpdates } from './src/shared/hooks/useOTAUpdates';
import { OTAUpdateScreen } from './src/shared/OTAUpdateScreen';

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
  // OTA Updates hook
  const { isChecking, isDownloading, downloadProgress } = useOTAUpdates();

  // Trigger re-render dopo init display zoom (per applicare normalizzazione)
  const [_, setZoomReadyTick] = useState(0);

  // Inizializzazione app
  useEffect(() => {
    // Log dell'inizializzazione
    logger.info('App', '✅ App initialized with OTA Updates enabled');
    // Telemetria Display Zoom e re-render per applicare normalizzazione
    void initDisplayZoom().finally(() => setZoomReadyTick(t => t + 1));
  }, []);

  // Mostra schermata aggiornamento se necessario
  const showUpdateScreen = isChecking || isDownloading;

  if (showUpdateScreen) {
    return (
      <OTAUpdateScreen
        isChecking={isChecking}
        isDownloading={isDownloading}
        progress={downloadProgress}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Main />
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
