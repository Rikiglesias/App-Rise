/**
 * Hook per gestire gli aggiornamenti Over-the-Air (OTA)
 * Rise Against Hunger Italia
 */

import { useEffect, useState } from 'react';
import * as Updates from 'expo-updates';
import { logger } from '@/shared/utils/logger';

interface UpdateState {
  isChecking: boolean;
  isDownloading: boolean;
  isUpdateAvailable: boolean;
  error: string | null;
  updateInfo: Updates.UpdateCheckResult | null;
}

export const useOTAUpdates = () => {
  const [updateState, setUpdateState] = useState<UpdateState>({
    isChecking: false,
    isDownloading: false,
    isUpdateAvailable: false,
    error: null,
    updateInfo: null,
  });

  const checkForUpdates = async () => {
    // Controlla se expo-updates è abilitato
    if (!Updates.isEnabled) {
      logger.debug(
        'OTA Updates',
        'Expo Updates is not enabled - skipping update check'
      );
      return;
    }

    // In Expo Go (development), non procedere con il controllo per evitare errori
    if (__DEV__ && !Updates.isEmbeddedLaunch) {
      logger.debug(
        'OTA Updates',
        'Development mode in Expo Go detected - skipping update check to avoid errors'
      );
      return;
    }

    // In development builds standalone, procedi normalmente
    if (__DEV__) {
      logger.debug(
        'OTA Updates',
        'Development build detected - proceeding with update check'
      );
    }

    try {
      setUpdateState(prev => ({ ...prev, isChecking: true, error: null }));

      logger.info('OTA Updates', 'Checking for updates...', {
        currentUpdateId: Updates.updateId,
        channel: Updates.channel,
        runtimeVersion: Updates.runtimeVersion,
      });

      const update = await Updates.checkForUpdateAsync();

      logger.info('OTA Updates', 'Update check completed', {
        isAvailable: update.isAvailable,
        updateId: update.isAvailable ? update.manifest?.id : null,
      });

      if (update.isAvailable) {
        logger.info('OTA Updates', 'Update available, downloading...', {
          manifest: update.manifest,
          updateId: update.manifest?.id,
        });

        setUpdateState(prev => ({
          ...prev,
          isUpdateAvailable: true,
          isDownloading: true,
          updateInfo: update,
        }));

        await Updates.fetchUpdateAsync();

        logger.info('OTA Updates', 'Update downloaded, reloading app...');

        // Riavvia l'app per applicare l'aggiornamento
        await Updates.reloadAsync();
      } else {
        logger.info('OTA Updates', 'No updates available');
        setUpdateState(prev => ({
          ...prev,
          isChecking: false,
          isUpdateAvailable: false,
        }));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      logger.error('OTA Updates', 'Failed to check for updates', {
        error: errorMessage,
      });

      setUpdateState(prev => ({
        ...prev,
        isChecking: false,
        isDownloading: false,
        error: errorMessage,
      }));
    }
  };

  const manualReload = async () => {
    try {
      logger.info('OTA Updates', 'Manual reload requested');
      await Updates.reloadAsync();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      logger.error('OTA Updates', 'Failed to reload app', {
        error: errorMessage,
      });
      setUpdateState(prev => ({ ...prev, error: errorMessage }));
    }
  };

  // Controlla aggiornamenti all'avvio dell'app
  useEffect(() => {
    // Ritarda il controllo di 2 secondi per permettere all'app di caricarsi completamente
    const timer = setTimeout(() => {
      void checkForUpdates();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Nota: Il controllo automatico quando l'app torna in foreground
  // può essere implementato in futuro usando AppState.addEventListener

  return {
    ...updateState,
    checkForUpdates,
    manualReload,
  };
};
