import { StyleSheet } from 'react-native';
import { Spacing } from '../../../../shared/constants/designTokens';
import responsiveSystem, { scaleDimensionLinear } from '../../../../shared/constants/responsiveSystem';

export const useHeroImageStyles = () => {
  return StyleSheet.create({
    imageSection: {
      marginTop: Spacing[2], // Aumentato da 1 a 2 per più spazio dal titolo
      marginBottom: Spacing[2], // Ridotto da 3 a 2 per compattezza
    },

    imageContainer: {
      marginHorizontal: Spacing[3], // Ridotto da 4 a 3 per immagine più larga
      borderRadius: 16, // Ridotto da 20 a 16 per bordi meno arrotondati
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 }, // Ridotto da 4 a 3
      shadowOpacity: 0.12, // Ridotto da 0.15 a 0.12
      shadowRadius: 8, // Ridotto da 12 a 8
      elevation: 6, // Ridotto da 8 a 6
    },

    image: {
      width: '100%',
      height: scaleDimensionLinear(responsiveSystem.LOGICAL_REFERENCE.width * 0.45), // Altezza proporzionale iPhone 15 (45%)
      // Rimosso borderRadius dall'immagine per evitare problemi di rendering
    },

    imageGradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 16, // Aggiornato da 20 a 16 per coerenza
    },

    flexOne: {
      flex: 1,
    },
  });
};
