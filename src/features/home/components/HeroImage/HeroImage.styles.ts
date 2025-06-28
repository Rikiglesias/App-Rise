import { StyleSheet, Dimensions } from 'react-native';
import { Spacing } from '../../../../shared/constants/designTokens';

const { width: screenWidth } = Dimensions.get('window');

export const useHeroImageStyles = () => {
  return StyleSheet.create({
    imageSection: {
      marginTop: Spacing[1],
      marginBottom: Spacing[3],
    },

    imageContainer: {
      marginHorizontal: Spacing[4],
      borderRadius: 20,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },

    image: {
      width: '100%',
      height: screenWidth * 0.56, // Aspect ratio 16:9
      borderRadius: 20,
    },

    imageGradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 20,
    },

    flexOne: {
      flex: 1,
    },
  });
};
