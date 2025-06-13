import { Dimensions } from 'react-native';
import { useTheme } from '../shared/hooks/useTheme';
import type {
  ProfessionalColors,
  ProfessionalTypography,
} from '../types/ContributeScreenTypes';

const { width: screenWidth } = Dimensions.get('window');

export const useProfessionalTokens = () => {
  const { colors } = useTheme();
  const isLargeScreen = screenWidth > 380;

  // Professional typography scale
  const professionalTypography: ProfessionalTypography = {
    display: {
      fontSize: isLargeScreen ? 30 : 26,
      fontWeight: '800' as const,
      letterSpacing: -0.8,
      lineHeight: isLargeScreen ? 34 : 30,
    },
    headline: {
      fontSize: isLargeScreen ? 22 : 20,
      fontWeight: '700' as const,
      letterSpacing: -0.4,
      lineHeight: isLargeScreen ? 26 : 24,
    },
    title: {
      fontSize: 18,
      fontWeight: '600' as const,
      letterSpacing: -0.2,
      lineHeight: 22,
    },
    body: {
      fontSize: 16,
      fontWeight: '500' as const,
      letterSpacing: 0,
      lineHeight: 20,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400' as const,
      letterSpacing: 0.1,
      lineHeight: 16,
    },
  };

  // Professional color system
  const professionalColors: ProfessionalColors = {
    surface: {
      primary: colors.neutral[0],
      secondary: '#FAFBFC',
      tertiary: '#F6F8FA',
      elevated: colors.neutral[0],
    },
    text: {
      primary: '#1F2937',
      secondary: '#374151',
      tertiary: '#6B7280',
      accent: colors.primary[600],
      inverse: colors.neutral[0],
    },
    border: {
      light: '#E5E7EB',
      default: '#D1D5DB',
      accent: colors.primary[200],
    },
  };

  return { professionalTypography, professionalColors, colors, isLargeScreen };
};
