import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';

import {
  PerfectText,
  PlatformTouchable,
  PerfectContainer,
  PerfectImage,
} from '@/components/ui';
import { Colors, BorderRadius, Shadows  } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { IMAGE_DIMENSIONS } from '@/shared/constants/dimensions';

interface Props {
  onMapPress: () => void;
}

/**
 * Sezione mappa geografica con header decorativo e immagine interattiva
 */
export const MapSection: React.FC<Props> = React.memo(({ onMapPress }) => {
  const handleMapImagePress = useCallback(() => {
    onMapPress(); // Apre la mappa completa con tutti i pin
  }, [onMapPress]);

  return (
    <PerfectContainer style={styles.mapSection}>
      {/* Header GEOGRAFICO con elementi di location */}
      <PerfectContainer style={styles.mapHeaderContainer}>
        <PerfectContainer style={styles.mapHeaderBackground}>
          <PerfectText
            size={22}
            lines={1}
            fontWeight="700"
            immunity={true}
            style={styles.mapTitle}
          >
            🌍 Dove Operiamo
          </PerfectText>
          <PerfectText
            size={16}
            lines={1}
            immunity={true}
            style={styles.mapSubtitle}
          >
            Le nostre operazioni nel mondo
          </PerfectText>
        </PerfectContainer>
      </PerfectContainer>

      {/* CONTAINER MAPPA CLICCABILE - RIEMPIE TUTTO */}
      <PlatformTouchable
        style={styles.mapImageContainer}
        onPress={handleMapImagePress} // Mostra i dettagli dell'Italia per default
        activeOpacity={0.85}
      >
        <PerfectImage
          // iPhone 15 reference: container width ~393 - padding(16*2) = 361
          width={361}
          height={280}
          borderRadius={20}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          source={require('@assets/images/mappa.png')}
        />

        {/* INDICATORE CLICCABILE */}
        <PerfectContainer style={styles.mapClickIndicator}>
          <PerfectText
            size={12}
            lines={1}
            fontWeight="500"
            immunity={true}
            style={styles.mapClickText}
          >
            Tocca per esplorare
          </PerfectText>
          <MaterialCommunityIcons
            name="map-search"
            size={28}
            color={Colors.neutral[600]}
          />
        </PerfectContainer>
      </PlatformTouchable>
    </PerfectContainer>
  );
});

MapSection.displayName = 'MapSection';

const styles = StyleSheet.create({
  // Map Section - SENZA CONTAINER GRIGIO
  mapSection: {
    paddingHorizontal: PerfectSpacing.base,
    marginTop: PerfectSpacing.lg, // AGGIUNTO: spazio generoso tra linea e titolo "Dove Operiamo"
  },

  // MAP CONTAINER CLICCABILE - RIEMPIE TUTTO SENZA BORDI
  mapImageContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.xl,
    marginTop: PerfectSpacing.base,
    marginHorizontal: 0,
    padding: 0,
    ...Shadows.lg,
    position: 'relative',
    overflow: 'hidden',
    height: IMAGE_DIMENSIONS.MAP_PREVIEW_HEIGHT,
    borderWidth: scale(1),
    borderColor: 'transparent',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.xl,
  },
  // INDICATORE CLICCABILE
  mapClickIndicator: {
    position: 'absolute',
    top: PerfectSpacing.sm,
    right: PerfectSpacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
    paddingHorizontal: PerfectSpacing.sm,
    paddingVertical: PerfectSpacing.xs,
    borderRadius: BorderRadius.lg,
    gap: PerfectSpacing.xs,
    zIndex: 2,
    elevation: 8,
  },
  mapClickText: {
    color: Colors.neutral[600],
  },

  // Map Section - GEOGRAFICO
  mapHeaderContainer: {
    alignItems: 'center',
    marginBottom: PerfectSpacing.lg,
  },

  mapHeaderBackground: {
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.xl,
    paddingVertical: PerfectSpacing.base,
    paddingHorizontal: PerfectSpacing.lg,
    borderWidth: scale(1),
    borderColor: Colors.neutral[100],
    ...Shadows.sm,
  },
  mapTitle: {
    color: Colors.neutral[700],
    textAlign: 'center',
    letterSpacing: scale(-0.4),
    includeFontPadding: false,
    ...Shadows.sm,
  },
  mapSubtitle: {
    // fontSize rimosso - ora gestito da Text
    color: Colors.neutral[600], // GRIGIO MEDIO per leggibilità
    textAlign: 'center',
    marginTop: PerfectSpacing.md,
    opacity: 0.9,
    letterSpacing: scale(0.1),
  },
});
