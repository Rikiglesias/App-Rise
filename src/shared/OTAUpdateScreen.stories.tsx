/**
 * OTA Update Screen - Visual Examples
 * Per testare visualmente la schermata in sviluppo
 */

import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { OTAUpdateScreen } from './OTAUpdateScreen';

/**
 * Esempio 1: Checking for updates
 */
export const CheckingState = () => (
  <OTAUpdateScreen
    isChecking={true}
    isDownloading={false}
    progress={0}
    message="Controllo aggiornamenti..."
  />
);

/**
 * Esempio 2: Downloading (inizio)
 */
export const DownloadingStart = () => (
  <OTAUpdateScreen
    isChecking={false}
    isDownloading={true}
    progress={15}
    message="Download aggiornamento in corso..."
  />
);

/**
 * Esempio 3: Downloading (metà)
 */
export const DownloadingMid = () => (
  <OTAUpdateScreen
    isChecking={false}
    isDownloading={true}
    progress={50}
    message="Download aggiornamento in corso..."
  />
);

/**
 * Esempio 4: Downloading (quasi completo)
 */
export const DownloadingEnd = () => (
  <OTAUpdateScreen
    isChecking={false}
    isDownloading={true}
    progress={95}
    message="Download aggiornamento in corso..."
  />
);

/**
 * Demo interattivo con tutti gli stati
 */
export const InteractiveDemo = () => {
  const [state, setState] = React.useState<'idle' | 'checking' | 'downloading'>(
    'idle'
  );
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (state === 'downloading') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 100);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [state]);

  if (state === 'idle') {
    return (
      <View style={styles.demoContainer}>
        <Button
          title="Simula Check Update"
          onPress={() => setState('checking')}
        />
        <Button
          title="Simula Download Update"
          onPress={() => {
            setState('downloading');
            setProgress(0);
          }}
        />
      </View>
    );
  }

  return (
    <OTAUpdateScreen
      isChecking={state === 'checking'}
      isDownloading={state === 'downloading'}
      progress={progress}
    />
  );
};

const styles = StyleSheet.create({
  demoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
});

// Export default per uso semplice
export default {
  title: 'OTA Update Screen',
  component: OTAUpdateScreen,
};
