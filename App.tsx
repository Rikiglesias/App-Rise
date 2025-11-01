import { StatusBar } from 'expo-status-bar';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider, useTheme } from './src/shared/hooks/useTheme';
import { useOTAUpdateScreen } from './src/shared/hooks/useOTAUpdateScreen';
import { OTAUpdateScreen } from './src/shared/components/OTAUpdateScreen';
import { UniversalThemeProvider } from './src/shared/theme/UniversalTheme';
import { logger } from './src/shared/utils/logger';
// Import rimossi - preloading disabilitato
// import {
//   preloadCriticalComponents,
//   preloadSecondaryComponents,
// } from './src/navigation/LazyLoading';

// The new Main component that bridges the two theme systems
const Main: React.FC = () => {
  const { isDark, colors } = useTheme();

  // Define base theme from React Native Paper
  const baseTheme = isDark ? MD3DarkTheme : MD3LightTheme;

  // Create a new, merged theme
  const paperTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary[500],
      background: colors.neutral[50],
      surface: colors.neutral[0],
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
  // Inizializza schermata OTA Updates
  const { showUpdateScreen, hideUpdateScreen } = useOTAUpdateScreen();

  // Inizializzazione app
  useEffect(() => {
    // Log dell'inizializzazione OTA Updates
    logger.info('App', 'OTA Update system initialized');
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <UniversalThemeProvider>
          <Main />
          {/* Schermata di aggiornamento OTA */}
          <OTAUpdateScreen
            visible={showUpdateScreen}
            onComplete={hideUpdateScreen}
          />
        </UniversalThemeProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
