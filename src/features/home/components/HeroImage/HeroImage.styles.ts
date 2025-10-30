import { StyleSheet } from 'react-native';
import { Spacing } from '../../../../shared/constants/designTokens';
import { getPerfectShadow } from '../../../../shared/constants/perfectShadow';

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
      ...getPerfectShadow('medium'),
    },

    image: {
      width: '100%',
      height: 280,
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
