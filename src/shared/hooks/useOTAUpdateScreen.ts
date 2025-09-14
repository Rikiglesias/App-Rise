/**
 * Hook per gestire la schermata di aggiornamento OTA
 * Controlla quando mostrare/nascondere la schermata di update
 */

import { useEffect, useState } from 'react';
import * as Updates from 'expo-updates';
import { logger } from '../utils/logger';

interface OTAUpdateScreenState {
  showUpdateScreen: boolean;
  isInitialCheck: boolean;
}

export const useOTAUpdateScreen = () => {
  const [state, setState] = useState<OTAUpdateScreenState>({
    showUpdateScreen: false,
    isInitialCheck: true,
  });

  useEffect(() => {
    // Solo nelle build standalone
    if (!Updates.isEnabled) {
      logger.debug('OTA Update Screen', 'Updates not enabled, skipping screen');
      setState(prev => ({ ...prev, isInitialCheck: false }));
      return;
    }

    // In development, mostra solo se esplicitamente richiesto
    if (__DEV__) {
      logger.debug(
        'OTA Update Screen',
        'Development mode, skipping initial screen'
      );
      setState(prev => ({ ...prev, isInitialCheck: false }));
      return;
    }

    // Mostra la schermata di aggiornamento all'avvio
    const checkForUpdatesOnStartup = async () => {
      try {
        logger.info('OTA Update Screen', 'Starting initial update check');
        setState(prev => ({ ...prev, showUpdateScreen: true }));

        // Controlla aggiornamenti
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          logger.info('OTA Update Screen', 'Update available, downloading...');
          await Updates.fetchUpdateAsync();
          logger.info('OTA Update Screen', 'Update downloaded, reloading...');
          await Updates.reloadAsync();
        } else {
          logger.info('OTA Update Screen', 'No updates available');
          // Nascondi la schermata dopo un breve delay
          setTimeout(() => {
            setState({
              showUpdateScreen: false,
              isInitialCheck: false,
            });
          }, 1500);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        logger.error('OTA Update Screen', 'Update check failed', {
          error: errorMessage,
        });

        // Nascondi la schermata anche in caso di errore
        setTimeout(() => {
          setState({
            showUpdateScreen: false,
            isInitialCheck: false,
          });
        }, 2000);
      }
    };

    // Avvia il controllo dopo un breve delay per permettere all'app di caricarsi
    const timer = setTimeout(() => {
      void checkForUpdatesOnStartup();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const hideUpdateScreen = () => {
    setState({
      showUpdateScreen: false,
      isInitialCheck: false,
    });
  };

  const showUpdateScreenManually = () => {
    setState(prev => ({ ...prev, showUpdateScreen: true }));
  };

  return {
    showUpdateScreen: state.showUpdateScreen,
    isInitialCheck: state.isInitialCheck,
    hideUpdateScreen,
    showUpdateScreenManually,
  };
};
