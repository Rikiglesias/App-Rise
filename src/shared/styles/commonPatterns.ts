/**
 * COMMON STYLE PATTERNS
 *
 * Pattern di stili riutilizzabili tra features per evitare duplicazioni.
 * Questi pattern sono usati frequentemente e devono restare consistenti.
 */

import { ViewStyle } from 'react-native';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

/**
 * Pattern per header di sezione con background
 * Usato in: Impact (TotalMeals, Results2024, Map, Community),
 * Actions (Contribute), Social (Header)
 *
 * @param colors token dark-aware (`useThemeColors()`); default `Colors` (light statico)
 * per retro-compatibilità coi caller non ancora migrati. Passare `colors` rende
 * lo sfondo adattivo al tema (necessario quando il testo sopra è adattivo).
 */
export const sectionHeaderBackground = (
  variant: 'white' | 'light' = 'white',
  colors: ThemeColors = Colors
): ViewStyle => ({
  alignSelf: 'stretch',
  backgroundColor:
    variant === 'white' ? colors.neutral[0] : colors.neutral[100],
  borderRadius: scale(16),
  paddingVertical: PerfectSpacing.base,
  paddingHorizontal: PerfectSpacing.lg,
  borderWidth: scale(1),
  borderColor: variant === 'white' ? colors.neutral[200] : colors.neutral[400],
});

/**
 * Pattern per linee separatrici decorative
 * Usato in: Home (ModernSmartTitle, ActionDescription),
 * Actions (HeaderDivider), About (mainStyles)
 */
export const decorativeSeparator = (
  color: string = Colors.neutral[300],
  height: number = 2
): ViewStyle => ({
  height: scale(height),
  backgroundColor: color,
  borderRadius: scale(1),
  opacity: 0.8,
});

/**
 * Shadow custom per card progetti
 * Usato in: Projects (ProjectsScreenStyles, ProjectCard)
 */
export const projectCardShadow: ViewStyle = {
  shadowColor: Colors.neutral[900],
  shadowOffset: { width: 0, height: scale(4) },
  shadowOpacity: 0.08,
  shadowRadius: scale(12),
  elevation: 4,
};

/**
 * Pattern per close button circolare
 * Usato in: modali e overlay
 */
export const circularCloseButton = (
  size: number = 32,
  backgroundColor: string = Colors.neutral[900]
): ViewStyle => ({
  width: size,
  height: size,
  borderRadius: 999,
  backgroundColor,
  justifyContent: 'center',
  alignItems: 'center',
});

/**
 * Pattern per card content con padding e border
 * Varianti comuni: primary, neutral, white
 */
export const cardContainer = (
  variant: 'primary' | 'neutral' | 'white' = 'white'
): ViewStyle => {
  const variants = {
    primary: {
      backgroundColor: Colors.primary[50],
      borderColor: Colors.primary[200],
    },
    neutral: {
      backgroundColor: Colors.neutral[50],
      borderColor: Colors.neutral[200],
    },
    white: {
      backgroundColor: Colors.neutral[0],
      borderColor: Colors.neutral[300],
    },
  };

  const config = variants[variant];

  return {
    backgroundColor: config.backgroundColor,
    borderRadius: scale(16),
    padding: PerfectSpacing.lg,
    borderWidth: 2,
    borderColor: config.borderColor,
  };
};

/**
 * Export presets comuni come oggetto per uso rapido
 */
export const CommonPatterns = {
  sectionHeaderWhite: sectionHeaderBackground('white'),
  sectionHeaderLight: sectionHeaderBackground('light'),
  separatorDefault: decorativeSeparator(),
  separatorPrimary: decorativeSeparator(Colors.primary[200]),
  projectShadow: projectCardShadow,
  closeButton: circularCloseButton(),
  cardPrimary: cardContainer('primary'),
  cardNeutral: cardContainer('neutral'),
  cardWhite: cardContainer('white'),
} as const;
