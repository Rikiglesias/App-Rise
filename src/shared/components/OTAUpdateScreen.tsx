/**
 * Schermata di aggiornamento OTA con barra di progresso
 * Mostra il progresso del download e gestisce l'esperienza utente
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { PerfectModal } from '@/components/ui/PerfectModal';
import { LinearGradient } from 'expo-linear-gradient';
import { PerfectText, PerfectContainer } from '@/components/ui';
import { useOTAUpdates } from '@/shared/hooks/useOTAUpdates';
import { Colors, BorderRadius  } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';

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
    <PerfectModal visible={visible} size="fullscreen" onRequestClose={onComplete}>
      <LinearGradient
        colors={Colors.gradients.redToBlack}
        style={styles.container}
      >
        <PerfectContainer style={styles.content}>
          {/* Logo e titolo */}
          <PerfectContainer style={styles.logoContainer}>
            <PerfectText
              size={32} // Display medium
              fontWeight="bold"
              lines={1}
              style={styles.appName}
            >
              Rise Against Hunger
            </PerfectText>
            <PerfectText
              size={16} // Body large
              lines={1}
              style={styles.subtitle}
            >
              Italia
            </PerfectText>
          </PerfectContainer>

          {/* Status */}
          <PerfectContainer style={styles.statusContainer}>
            <PerfectText
              size={20} // Title medium
              fontWeight="500"
              lines={1}
              style={styles.statusText}
            >
              {statusMessage}
            </PerfectText>
          </PerfectContainer>

          {/* Progress Bar */}
          {(isDownloading || progress > 0) && (
            <PerfectContainer style={styles.progressContainer}>
              <PerfectContainer style={styles.progressBar}>
                <PerfectContainer
                  style={[styles.progressFill, { width: `${progress}%` }]}
                />
              </PerfectContainer>
              <PerfectText
                size={13} // Body small
                fontWeight="500"
                lines={1}
                style={styles.progressText}
              >
                {progress}%
              </PerfectText>
            </PerfectContainer>
          )}

          {/* Spinner */}
          {isChecking && (
            <PerfectContainer style={styles.spinnerContainer}>
              <ActivityIndicator size="large" color="white" />
            </PerfectContainer>
          )}

          {/* Info */}
          <PerfectContainer style={styles.infoContainer}>
            {error ? (
              <PerfectText
                size={13} // Body small
                lines={2}
                style={styles.errorText}
              >
                {error}
              </PerfectText>
            ) : (
              <PerfectText
                size={13} // Body small
                lines={1}
                style={styles.infoText}
              >
                Stiamo migliorando la tua esperienza
              </PerfectText>
            )}
          </PerfectContainer>
        </PerfectContainer>
      </LinearGradient>
    </PerfectModal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: PerfectSpacing.none,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: PerfectSpacing.lg,
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: PerfectSpacing.xl,
  },
  appName: {
    color: 'white',
    textAlign: 'center',
    marginBottom: PerfectSpacing.sm,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  statusContainer: {
    marginBottom: PerfectSpacing.lg,
  },
  statusText: {
    color: 'white',
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: PerfectSpacing.lg,
  },
  progressBar: {
    width: '80%',
    height: PerfectSpacing.sm, // 8dp
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    marginBottom: PerfectSpacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: BorderRadius.sm,
  },
  progressText: {
    color: 'white',
  },
  spinnerContainer: {
    marginBottom: PerfectSpacing.lg,
  },
  infoContainer: {
    alignItems: 'center',
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  errorText: {
    color: Colors.semantic.error.light,
    textAlign: 'center',
  },
});
