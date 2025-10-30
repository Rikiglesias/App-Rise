import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useCallback } from 'react';
import { Platform, StyleSheet } from 'react-native';

import {
  PerfectText,
  PlatformTouchable,
  PerfectContainer,
  PerfectImage,
} from '@/components/ui';
// ELIMINATO: scaleDimensionLinear from '@/shared/constants/responsiveSystem';
import { Colors, Spacing, Shadows } from '@/shared/constants/designTokens';
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
          source={require('../../../../assets/images/mappa.png')}
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
    paddingHorizontal: Spacing[4],
    marginTop: Spacing[6], // AGGIUNTO: spazio generoso tra linea e titolo "Dove Operiamo"
  },

  // MAP CONTAINER CLICCABILE - RIEMPIE TUTTO SENZA BORDI
  mapImageContainer: {
    backgroundColor: Colors.neutral[0], // RIPRISTINATO: background per vedere l'immagine
    borderRadius: 20,
    marginTop: Spacing[4],
    marginHorizontal: 0, // RIMOSSO: margini laterali per riempire tutto
    padding: 0, // RIMOSSO: padding per eliminare bordi vuoti
    ...Shadows.lg, // CONVERTITO: da shadow manuale a PlatformShadows per Android ottimizzato
    position: 'relative',
    overflow: 'hidden',
    height: IMAGE_DIMENSIONS.MAP_PREVIEW_HEIGHT, // ALTEZZA FISSA: per container stabile
    // FEEDBACK VISIVO CLICCABILE
    borderWidth: 1,
    borderColor: 'transparent',
  },
  mapImage: {
    width: '100%',
    height: '100%', // RIEMPIE TUTTO: il container
    borderRadius: 20, // UGUALE AL CONTAINER: per bordi perfetti
  },
  // INDICATORE CLICCABILE
  mapClickIndicator: {
    position: 'absolute',
    top: Spacing[2],
    right: Spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50], // Design Token
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    borderRadius: 12,
    gap: Spacing[1],
    zIndex: 2, // SOPRA l'immagine della mappa
    elevation: 8, // PER ANDROID: assicura che stia sopra
  },
  mapClickText: {
    color: Colors.neutral[600],
  },

  // Map Section - GEOGRAFICO
  mapHeaderContainer: {
    alignItems: 'center',
    marginBottom: Spacing[6],
  },

  mapHeaderBackground: {
    backgroundColor:
      Platform.OS === 'android'
        ? Colors.neutral[100] // ANDROID: Grigio leggermente più scuro
        : 'rgba(55, 65, 81, 0.03)', // iOS: Mantiene rgba originale
    borderRadius: 20,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[6],
    borderWidth: 1,
    borderColor:
      Platform.OS === 'android'
        ? Colors.neutral[200] // ANDROID: Bordo grigio leggermente più scuro
        : 'rgba(55, 65, 81, 0.08)', // iOS: Mantiene rgba originale
    shadowColor: Colors.neutral[700],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 1 : 2, // RIDOTTO su Android per stabilità
  },
  mapTitle: {
    color: Colors.neutral[700],
    textAlign: 'center',
    letterSpacing: -0.4,
    includeFontPadding: false,
    textShadowColor: 'rgba(55, 65, 81, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  mapSubtitle: {
    // fontSize rimosso - ora gestito da Text
    color: Colors.neutral[600], // GRIGIO MEDIO per leggibilità
    textAlign: 'center',
    marginTop: Spacing[3],
    opacity: 0.9,
    letterSpacing: 0.1,
  },
});
