/**
 * Pannello di debug per OTA Updates
 * Permette di testare manualmente il sistema di aggiornamenti
 */

import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import * as Updates from 'expo-updates';
import { PerfectText, PlatformTouchable } from '../../components/ui';
import { useOTAUpdates } from '../hooks/useOTAUpdates';
import { logger } from '../utils/logger';

const getStatusText = (isChecking: boolean, isDownloading: boolean): string => {
  if (isChecking) return '🔍 Checking...';
  if (isDownloading) return '⬇️ Downloading...';
  return '✅ Ready';
};

export const OTADebugPanel: React.FC = () => {
  const {
    isChecking,
    isDownloading,
    isUpdateAvailable,
    error,
    checkForUpdates,
    manualReload,
  } = useOTAUpdates();

  const showUpdateInfo = () => {
    const info = {
      'Updates Enabled': Updates.isEnabled,
      'Current Update ID': Updates.updateId ?? 'None',
      Channel: Updates.channel ?? 'None',
      'Runtime Version': Updates.runtimeVersion ?? 'None',
      'Is Embedded Launch': Updates.isEmbeddedLaunch,
      'Development Mode': __DEV__,
    };

    const message = Object.entries(info)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    Alert.alert('OTA Updates Info', message);
    logger.info('OTA Debug', 'Update info displayed', info);
  };

  const handleManualCheck = async () => {
    try {
      await checkForUpdates();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert('Error', `Failed to check for updates: ${errorMessage}`);
      logger.error('OTA Debug', 'Manual check failed', { error: errorMessage });
    }
  };

  const handleManualReload = async () => {
    try {
      await manualReload();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert('Error', `Failed to reload: ${errorMessage}`);
      logger.error('OTA Debug', 'Manual reload failed', {
        error: errorMessage,
      });
    }
  };

  if (!__DEV__) {
    return null; // Solo in development
  }

  return (
    <View style={styles.container}>
      <PerfectText lines={1} style={styles.title}>
        🔄 OTA Debug Panel
      </PerfectText>

      <View style={styles.statusContainer}>
        <PerfectText lines={1} style={styles.statusText}>
          Status: {getStatusText(isChecking, isDownloading)}
        </PerfectText>

        {isUpdateAvailable && (
          <PerfectText lines={1} style={styles.updateText}>
            📦 Update Available!
          </PerfectText>
        )}

        {error && (
          <PerfectText lines={1} style={styles.errorText}>
            ❌ Error: {error}
          </PerfectText>
        )}
      </View>

      <View style={styles.buttonsContainer}>
        <PlatformTouchable style={styles.button} onPress={showUpdateInfo}>
          <PerfectText lines={1} style={styles.buttonText}>
            ℹ️ Show Info
          </PerfectText>
        </PlatformTouchable>

        <PlatformTouchable
          style={styles.button}
          onPress={handleManualCheck}
          disabled={isChecking || isDownloading}
        >
          <PerfectText lines={1} style={styles.buttonText}>
            🔍 Check Updates
          </PerfectText>
        </PlatformTouchable>

        <PlatformTouchable
          style={styles.button}
          onPress={handleManualReload}
          disabled={isChecking || isDownloading}
        >
          <PerfectText lines={1} style={styles.buttonText}>
            🔄 Reload App
          </PerfectText>
        </PlatformTouchable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#007AFF',
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  updateText: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 14,
    color: '#dc3545',
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
    minWidth: 100,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
