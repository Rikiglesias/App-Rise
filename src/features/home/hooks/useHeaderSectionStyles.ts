import { StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../../shared/constants/designTokens';
import { useTheme } from '../../../shared/hooks/useTheme';

export const useHeaderSectionStyles = () => {
  const { colors } = useTheme();

  return StyleSheet.create({
    container: {
      backgroundColor: Colors.neutral[50],
      paddingBottom: Spacing[2],
    },

    headerSection: {
      backgroundColor: colors.neutral[50],
      overflow: 'hidden',
    },

    gradientBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.3,
    },

    textContainer: {
      zIndex: 2,
    },
  });
};
