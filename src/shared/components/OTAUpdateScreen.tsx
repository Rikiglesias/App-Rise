/**
 * Schermata di aggiornamento OTA con barra di progresso
 * Mostra il progresso del download e gestisce l'esperienza utente
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PerfectText } from '../../components/ui';
import { useOTAUpdates } from '../hooks/useOTAUpdates';
import { Colors, Spacing, Typography } from '../constants/designTokens';

interface OTAUpdateScreenProps {
  visible: boolean;
  onComplete: () => void;
}

export const OTAUpdateScreen: React.FC<OTAUpdateScreenProps> = ({
  visible,
  onComplete,
}) => {
  const { isChecking, isDownloading, isUpdateAvailable, error } =
    useOTAUpdates();
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState(
    'Controllo aggiornamenti...'
  );

  useEffect(() => {
    if (isChecking) {
      setStatusMessage('🔍 Controllo aggiornamenti...');
      setProgress(10);
    } else if (isUpdateAvailable && isDownloading) {
      setStatusMessage('📦 Scaricamento aggiornamento...');
      // Simula progresso del download
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);
      return () => clearInterval(interval);
    } else if (!isUpdateAvailable && !isChecking) {
      setStatusMessage('✅ App aggiornata');
      setProgress(100);
      setTimeout(() => {
        onComplete();
      }, 1000);
    } else if (error) {
      setStatusMessage("❌ Errore durante l'aggiornamento");
      setProgress(0);
      setTimeout(() => {
        onComplete();
      }, 2000);
    }

    // Return undefined per i casi che non hanno cleanup
    return undefined;
  }, [isChecking, isDownloading, isUpdateAvailable, error, onComplete]);

  // Gestisce il completamento del download
  useEffect(() => {
    if (progress >= 90 && isDownloading) {
      setStatusMessage('🔄 Installazione in corso...');
      setProgress(100);
      // L'app si ricaricherà automaticamente dopo il download
    }
  }, [progress, isDownloading]);

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      style={styles.modal}
    >
      <LinearGradient
        colors={[Colors.primary[500], Colors.primary[700]]}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Logo o icona dell'app */}
          <View style={styles.logoContainer}>
            <PerfectText lines={1} style={styles.appName}>
              RAH Italia
            </PerfectText>
            <PerfectText lines={1} style={styles.subtitle}>
              Rise Against Hunger
            </PerfectText>
          </View>

          {/* Messaggio di stato */}
          <View style={styles.statusContainer}>
            <PerfectText lines={1} style={styles.statusText}>
              {statusMessage}
            </PerfectText>
          </View>

          {/* Barra di progresso */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <PerfectText lines={1} style={styles.progressText}>
              {progress}%
            </PerfectText>
          </View>

          {/* Spinner per operazioni in corso */}
          {(isChecking || isDownloading) && (
            <View style={styles.spinnerContainer}>
              <ActivityIndicator size="large" color="white" />
            </View>
          )}

          {/* Informazioni aggiuntive */}
          <View style={styles.infoContainer}>
            {isUpdateAvailable && (
              <PerfectText lines={1} style={styles.infoText}>
                📱 Nuovo aggiornamento disponibile
              </PerfectText>
            )}
            {error && (
              <PerfectText lines={1} style={styles.errorText}>
                Errore: {error}
              </PerfectText>
            )}
            {!isUpdateAvailable && !isChecking && !error && (
              <PerfectText lines={1} style={styles.infoText}>
                🎉 La tua app è aggiornata!
              </PerfectText>
            )}
          </View>
        </View>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: Spacing[6],
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing[8],
  },
  appName: {
    fontSize: 32,
    fontWeight: Typography.weights.bold as '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: Spacing[2],
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  statusContainer: {
    marginBottom: Spacing[6],
  },
  statusText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    fontWeight: Typography.weights.medium as '500',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing[6],
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing[2],
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: 'white',
    fontWeight: Typography.weights.medium as '500',
  },
  spinnerContainer: {
    marginBottom: Spacing[6],
  },
  infoContainer: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#ffcccb',
    textAlign: 'center',
  },
});
