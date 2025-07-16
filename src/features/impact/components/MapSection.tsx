import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useCallback } from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';

import { FormattedText, PlatformTouchable } from '../../../components/ui';
import {
  Colors,
  Spacing,
  Typography,
} from '../../../shared/constants/designTokens';
import { PlatformShadows } from '../../../shared/constants/platformDesignTokens';

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
    <View style={styles.mapSection}>
      {/* Header GEOGRAFICO con elementi di location */}
      <View style={styles.mapHeaderContainer}>
        <View style={styles.mapHeaderBackground}>
          <FormattedText variant="headline-small" style={styles.mapTitle}>
            🌍 Dove Operiamo
          </FormattedText>
          <FormattedText variant="body-large" style={styles.mapSubtitle}>
            Le nostre operazioni nel mondo
          </FormattedText>
        </View>
      </View>

      {/* CONTAINER MAPPA CLICCABILE - RIEMPIE TUTTO */}
      <PlatformTouchable
        style={styles.mapImageContainer}
        onPress={handleMapImagePress} // Mostra i dettagli dell'Italia per default
        activeOpacity={0.85}
      >
        <Image
          source={require('../../../../assets/images/mappa.png')}
          style={styles.mapImage}
          resizeMode="cover"
        />

        {/* INDICATORE CLICCABILE */}
        <View style={styles.mapClickIndicator}>
          <FormattedText variant="body-small" style={styles.mapClickText}>
            Tocca per esplorare
          </FormattedText>
          <MaterialCommunityIcons
            name="map-search"
            size={16}
            color={Colors.neutral[600]}
          />
        </View>
      </PlatformTouchable>
    </View>
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
    ...PlatformShadows.lg, // CONVERTITO: da shadow manuale a PlatformShadows per Android ottimizzato
    position: 'relative',
    overflow: 'hidden',
    height: 280, // ALTEZZA FISSA: per container stabile
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
    backgroundColor: '#FAFAFA', // UNIFICATO: stesso colore su entrambe le piattaforme per consistenza
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    borderRadius: 12,
    gap: Spacing[1],
    zIndex: 2, // SOPRA l'immagine della mappa
    elevation: 8, // PER ANDROID: assicura che stia sopra
  },
  mapClickText: {
    // fontSize rimosso - ora gestito da Text
    fontWeight: Typography.weights.medium,
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
        ? '#F4F5F5' // ANDROID: Grigio leggermente più scuro
        : 'rgba(55, 65, 81, 0.03)', // iOS: Mantiene rgba originale
    borderRadius: 20,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[6],
    borderWidth: 1,
    borderColor:
      Platform.OS === 'android'
        ? '#E6E8EA' // ANDROID: Bordo grigio leggermente più scuro
        : 'rgba(55, 65, 81, 0.08)', // iOS: Mantiene rgba originale
    shadowColor: '#374151',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 1 : 2, // RIDOTTO su Android per stabilità
  },
  mapTitle: {
    // fontSize rimosso - ora gestito da Text
    fontWeight: Typography.weights.bold, // BOLD normale
    color: '#374151', // GRIGIO ELEGANTE
    textAlign: 'center',
    letterSpacing: -0.4,
    includeFontPadding: false,
    textShadowColor: 'rgba(55, 65, 81, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  mapSubtitle: {
    // fontSize rimosso - ora gestito da Text
    color: '#4B5563', // GRIGIO MEDIO per leggibilità
    textAlign: 'center',
    marginTop: Spacing[3],
    opacity: 0.9,
    letterSpacing: 0.1,
  },
});
