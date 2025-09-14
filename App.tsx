import { StatusBar } from 'expo-status-bar';
import {
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
  configureFonts,
} from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { Typography } from './src/shared/constants/designTokens';
import { ThemeProvider, useTheme } from './src/shared/hooks/useTheme';
import { UniversalThemeProvider } from './src/shared/theme/UniversalTheme';
import { performanceMonitor } from './src/shared/monitoring/PerformanceMonitor';
import { logger } from './src/shared/utils/logger';
// Import rimossi - preloading disabilitato
// import {
//   preloadCriticalComponents,
//   preloadSecondaryComponents,
// } from './src/navigation/LazyLoading';

// Define the font config based on our design tokens
const fontConfig = {
  headlineSmall: {
    fontFamily: Typography.families.heading,
    fontWeight: Typography.weights.bold as '700',
  },
  titleLarge: {
    fontFamily: Typography.families.heading,
    fontWeight: Typography.weights.bold as '700',
  },
  titleMedium: {
    fontFamily: Typography.families.accent,
    fontWeight: Typography.weights.extrabold as '800', // Cambiato da black a extrabold per compatibilità
  },
  bodyLarge: {
    fontFamily: Typography.families.body,
    fontWeight: Typography.weights.regular as '400',
  },
  bodyMedium: {
    fontFamily: Typography.families.body,
    fontWeight: Typography.weights.regular as '400',
  },
  // Default for all other text variants
  default: {
    fontFamily: Typography.families.body,
    fontWeight: Typography.weights.regular as '400',
  },
};

// The new Main component that bridges the two theme systems
const Main: React.FC = () => {
  const { isDark, colors } = useTheme();

  // Define base theme from React Native Paper
  const baseTheme = isDark ? MD3DarkTheme : MD3LightTheme;

  // Create a new, merged theme
  const paperTheme = {
    ...baseTheme,
    fonts: configureFonts({ config: fontConfig }),
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
  // Inizializza Performance Monitor e Lazy Loading all'avvio dell'app
  useEffect(() => {
    // Log dell'inizializzazione
    logger.info('App', 'Performance Monitor initialized', {
      timestamp: Date.now(),
      version: '1.0.0',
    });

    // Monitora il tempo di avvio dell'app
    const appStartTime = Date.now();
    performanceMonitor.recordUserInteraction('app_startup', appStartTime);

    // Inizializza preloading intelligente - DISABILITATO per evitare caricamenti non necessari
    // preloadCriticalComponents();

    // Precarica componenti secondari dopo che l'app è stabile - DISABILITATO
    // const secondaryPreloadTimer = setTimeout(() => {
    //   preloadSecondaryComponents();
    // }, 5000);

    return () => {
      // Cleanup
      // clearTimeout(secondaryPreloadTimer); // DISABILITATO insieme al preloading
      logger.debug('App', 'Performance Monitor cleanup');
    };
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <UniversalThemeProvider>
          <Main />
        </UniversalThemeProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
