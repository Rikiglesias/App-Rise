/**
 * Configurazioni per ottimizzazioni di performance
 * Centralizza tutte le impostazioni relative alle performance dell'app
 */

export const PerformanceConfig = {
  // Animazioni
  animation: {
    // Durate standard per le animazioni
    durations: {
      fast: 150,
      normal: 300,
      slow: 500,
      veryFast: 100,
    },
    // Configurazioni per spring animations
    spring: {
      gentle: {
        tension: 120,
        friction: 8,
      },
      snappy: {
        tension: 300,
        friction: 10,
      },
      bouncy: {
        tension: 180,
        friction: 6,
      },
    },
    // Soglie per disabilitare animazioni su dispositivi lenti
    thresholds: {
      disableOnLowEnd: true,
      maxConcurrentAnimations: 5,
    },
  },

  // Gestione memoria
  memory: {
    // Numero massimo di immagini in cache
    maxImageCache: 50,
    // Timeout per cleanup automatico (ms)
    cleanupInterval: 30000,
    // Soglia di memoria per warning (MB)
    memoryWarningThreshold: 100,
  },

  // Rendering
  rendering: {
    // Numero massimo di elementi renderizzati contemporaneamente
    maxListItems: 50,
    // Soglia per virtualizzazione liste
    virtualizationThreshold: 20,
    // Debounce per aggiornamenti frequenti (ms)
    updateDebounce: 100,
  },

  // Network
  network: {
    // Timeout per richieste HTTP (ms)
    requestTimeout: 10000,
    // Numero massimo di retry
    maxRetries: 3,
    // Delay tra retry (ms)
    retryDelay: 1000,
  },

  // Debug e monitoring
  debug: {
    // Abilita logging performance
    enablePerformanceLogging: __DEV__,
    // Abilita warning per operazioni lente
    enableSlowOperationWarnings: __DEV__,
    // Soglia per considerare un'operazione lenta (ms)
    slowOperationThreshold: 100,
  },
} as const;

/**
 * Utility per verificare se il dispositivo è considerato "low-end"
 * Basato su euristiche semplici usando API React Native native
 */
export const isLowEndDevice = () => {
  // Logica basilare basata su timeout JS e memoria disponibile
  // Dispositivi più lenti tendono ad avere execution time più lunghi
  const start = void Date.now();

  // Test sincrono semplice per misurare performance
  for (let i = 0; i < 100000; i++) {
    void Math.random();
  }

  const executionTime = Date.now() - (start ?? 0);

  // Se l'execution time è > 10ms, consideriamo il dispositivo lento
  // Soglia conservativa per evitare falsi positivi
  return executionTime > 10;
};

/**
 * Hook per ottenere configurazioni di performance adattive
 */
export const getAdaptivePerformanceConfig = () => {
  const isLowEnd = isLowEndDevice();

  return {
    ...PerformanceConfig,
    animation: {
      ...PerformanceConfig.animation,
      // Riduci durate su dispositivi lenti
      durations: isLowEnd
        ? {
            fast: 100,
            normal: 200,
            slow: 300,
            veryFast: 50,
          }
        : PerformanceConfig.animation.durations,
      // Disabilita animazioni complesse su dispositivi lenti
      thresholds: {
        ...PerformanceConfig.animation.thresholds,
        disableOnLowEnd: isLowEnd,
        maxConcurrentAnimations: isLowEnd ? 2 : 5,
      },
    },
    rendering: {
      ...PerformanceConfig.rendering,
      // Riduci elementi renderizzati su dispositivi lenti
      maxListItems: isLowEnd ? 25 : 50,
      virtualizationThreshold: isLowEnd ? 10 : 20,
    },
  };
};
