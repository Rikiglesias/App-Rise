/**
 * Schermata di aggiornamento OTA con barra di progresso
 * Mostra il progresso del download e gestisce l'esperienza utente
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PerfectText } from '../../components/ui';
import { useOTAUpdates } from '../hooks/useOTAUpdates';
import { Colors } from '../constants/designTokens';
import {
  DesignTokens,
  SpacingTokens,
  TypographyTokens,
} from '../constants/responsiveSystem';

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
    }
    // Return undefined per i casi che non hanno cleanup
    return undefined;
  }, [isChecking, isDownloading, isUpdateAvailable, onComplete]);

  useEffect(() => {
    if (error) {
      setStatusMessage("❌ Errore durante l'aggiornamento");
      setProgress(0);
    }
  }, [error]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" style={styles.modal}>
      <LinearGradient
        colors={Colors.gradients.redToBlack}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Logo e titolo */}
          <View style={styles.logoContainer}>
            <PerfectText
              size={TypographyTokens.styles.display.medium} // Sistema responsive
              fontWeight="bold"
              lines={1}
              style={styles.appName}
            >
              Rise Against Hunger
            </PerfectText>
            <PerfectText
              size={TypographyTokens.styles.body.large} // Sistema responsive
              lines={1}
              style={styles.subtitle}
            >
              Italia
            </PerfectText>
          </View>

          {/* Status */}
          <View style={styles.statusContainer}>
            <PerfectText
              size={TypographyTokens.styles.title.medium} // Sistema responsive
              fontWeight="500"
              lines={1}
              style={styles.statusText}
            >
              {statusMessage}
            </PerfectText>
          </View>

          {/* Progress Bar */}
          {(isDownloading || progress > 0) && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${progress}%` }]}
                />
              </View>
              <PerfectText
                size={TypographyTokens.styles.body.small} // Sistema responsive
                fontWeight="500"
                lines={1}
                style={styles.progressText}
              >
                {progress}%
              </PerfectText>
            </View>
          )}

          {/* Spinner */}
          {isChecking && (
            <View style={styles.spinnerContainer}>
              <ActivityIndicator size="large" color="white" />
            </View>
          )}

          {/* Info */}
          <View style={styles.infoContainer}>
            {error ? (
              <PerfectText
                size={TypographyTokens.styles.body.small} // Sistema responsive
                lines={2}
                style={styles.errorText}
              >
                {error}
              </PerfectText>
            ) : (
              <PerfectText
                size={TypographyTokens.styles.body.small} // Sistema responsive
                lines={1}
                style={styles.infoText}
              >
                Stiamo migliorando la tua esperienza
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
    margin: SpacingTokens['0'], // Sistema responsive
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: SpacingTokens['6'], // Sistema responsive
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SpacingTokens['8'], // Sistema responsive
  },
  appName: {
    color: 'white',
    textAlign: 'center',
    marginBottom: SpacingTokens['2'], // Sistema responsive
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  statusContainer: {
    marginBottom: SpacingTokens['6'], // Sistema responsive
  },
  statusText: {
    color: 'white',
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: SpacingTokens['6'], // Sistema responsive
  },
  progressBar: {
    width: '80%',
    height: SpacingTokens['2'], // Sistema responsive (8dp)
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: DesignTokens.borderRadius.small, // Sistema responsive
    overflow: 'hidden',
    marginBottom: SpacingTokens['2'], // Sistema responsive
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: DesignTokens.borderRadius.small, // Sistema responsive
  },
  progressText: {
    color: 'white',
  },
  spinnerContainer: {
    marginBottom: SpacingTokens['6'], // Sistema responsive
  },
  infoContainer: {
    alignItems: 'center',
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  errorText: {
    color: '#ffcccb',
    textAlign: 'center',
  },
});
