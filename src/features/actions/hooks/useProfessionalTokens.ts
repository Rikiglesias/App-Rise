import { Dimensions } from 'react-native';
import { useTheme } from '../../../shared/hooks/useTheme';
import { useResponsive } from '../../../shared/hooks/useResponsive';
import type {
  ProfessionalColors,
  ProfessionalTypography,
} from '../types/ContributeScreenTypes';

const { width: screenWidth } = Dimensions.get('window');

export const useProfessionalTokens = () => {
  const { colors } = useTheme();
  const { scaleFont } = useResponsive();
  const isLargeScreen = screenWidth > 380;

  // Professional typography scale
  const professionalTypography: ProfessionalTypography = {
    display: {
      fontSize: scaleFont(28),
      fontWeight: '800' as const,
      letterSpacing: -0.8,
      lineHeight: scaleFont(32),
    },
    headline: {
      fontSize: scaleFont(21),
      fontWeight: '700' as const,
      letterSpacing: -0.4,
      lineHeight: scaleFont(25),
    },
    title: {
      fontSize: scaleFont(18),
      fontWeight: '600' as const,
      letterSpacing: -0.2,
      lineHeight: scaleFont(22),
    },
    body: {
      fontSize: scaleFont(16),
      fontWeight: '500' as const,
      letterSpacing: 0,
      lineHeight: scaleFont(20),
    },
    caption: {
      fontSize: scaleFont(14),
      fontWeight: '400' as const,
      letterSpacing: 0.1,
      lineHeight: scaleFont(16),
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
