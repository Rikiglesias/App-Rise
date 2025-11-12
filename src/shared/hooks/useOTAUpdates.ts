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
  downloadProgress: number; // 0-100
  error: string | null;
  updateInfo: Updates.UpdateCheckResult | null;
}

export const useOTAUpdates = () => {
  const [updateState, setUpdateState] = useState<UpdateState>({
    isChecking: false,
    isDownloading: false,
    isUpdateAvailable: false,
    downloadProgress: 0,
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
          downloadProgress: 0,
          updateInfo: update,
        }));

        // Download con listener progresso
        const downloadResult = await Updates.fetchUpdateAsync();

        // Simula progresso (Expo non fornisce progresso reale ancora)
        setUpdateState(prev => ({ ...prev, downloadProgress: 100 }));

        logger.info(
          'OTA Updates',
          'Update downloaded. It will apply on next app restart.',
          { updateId: downloadResult.manifest?.id }
        );

        // Nota: niente reload immediato per evitare crash/loop.
        // L'aggiornamento verrà applicato al prossimo riavvio dell'app.
        setUpdateState(prev => ({
          ...prev,
          isChecking: false,
          isDownloading: false,
          isUpdateAvailable: true,
        }));
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

  // Controlla aggiornamenti in background quando app torna in foreground
  useEffect(() => {
    // 🛡️ PROTEZIONE: Skip in Expo Go per evitare crash da moduli native
    if (__DEV__ && !Updates.isEmbeddedLaunch) {
      logger.debug(
        'OTA Updates',
        'Expo Go detected - skipping AppState listener to prevent crash'
      );
      return;
    }

    // Import dinamico di AppState per evitare dipendenze circolari
    let subscription: { remove: () => void } | null = null;

    const setupBackgroundCheck = async () => {
      try {
        const { AppState } = await import('react-native');

        subscription = AppState.addEventListener('change', nextAppState => {
          // Check OTA solo quando app torna attiva da background
          if (nextAppState === 'active') {
            // Silent check - nessuna UI, nessun alert
            void checkForUpdates().catch(() => {
              // Fail silently - non disturbare l'utente
              // Log già gestito in checkForUpdates()
            });
          }
        });
      } catch (error) {
        logger.warn(
          'OTA Updates',
          'AppState listener setup failed',
          error as Error
        );
      }
    };

    void setupBackgroundCheck();

    return () => {
      subscription?.remove();
    };
  }, []);

  // Note:
  // - NO check all'avvio (evita schermata loading fastidiosa)
  // - Check SOLO quando app torna in foreground (silent)
  // - Update scaricato in background
  // - Update applicato al prossimo restart (no reload forzato)
  // GitHub Actions: workflow auto-trigger test

  return {
    ...updateState,
    checkForUpdates,
    manualReload,
  };
};
