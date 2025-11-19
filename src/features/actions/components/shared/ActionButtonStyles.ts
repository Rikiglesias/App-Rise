import { StyleSheet } from 'react-native';
import type { ButtonStyles } from './ActionButtonTypes';
import { Colors, PerfectSpacing, Typography } from '@/shared/constants';
import {
  scale,
  scaleSpacing,
  scaleBadge,
  scaleClamp,
} from '@/shared/constants/perfectScale';

// Info button container size centralized via Perfect Scale helpers
const INFO_BTN_SIZE = scaleBadge(28, { min: 22, max: 32 });
const INFO_BORDER = scaleClamp(2, 1, 2);

export const createActionButtonStyles = (): ButtonStyles => {
  return StyleSheet.create({
    container: {
      paddingHorizontal: PerfectSpacing.base,
      gap: PerfectSpacing.sm,
      paddingTop: PerfectSpacing.base,
      paddingBottom: PerfectSpacing.base,
    },
    categoryContainer: {
      marginBottom: PerfectSpacing.lg,
    },
    categoryContainerExplore: {
      marginBottom: PerfectSpacing.lg,
      marginTop: 0,
    },
    categoryContainerCommunity: {
      marginBottom: PerfectSpacing.lg,
      marginTop: 0,
    },
    categoryHeader: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: PerfectSpacing['2xl'],
    },

    donateTitleContainerWrapper: {
      width: scale(314), // Perfect System: 80% di 393px (iPhone 15), scala su tutti device
      position: 'relative',
    },

    donateTitleContainer: {
      alignItems: 'center',
      backgroundColor: Colors.primary[50],
      paddingVertical: PerfectSpacing.sm,
      paddingHorizontal: PerfectSpacing.md,
      position: 'relative',
      borderRadius: scale(16),
      borderWidth: scale(1),
      borderColor: Colors.primary[300],
      minHeight: scale(60),
    },

    // TITOLO CATEGORIA DONA ELEGANTE
    donateCategoryTitle: {
      // fontSize rimosso - ora gestito da Text
      fontWeight: Typography.weights.black, // PIÙ GRASSETTO: da bold a black
      color: Colors.primary[500],
      textAlign: 'center',
      letterSpacing: scale(-0.4),
      includeFontPadding: false,
    },

    // SUBTITLE ELEGANTE DONA INGRANDITO
    donateInlineSubtitle: {
      fontWeight: Typography.weights.medium,
      color: Colors.primary[700],
      textAlign: 'center',
      letterSpacing: scale(0.2),
      marginTop: PerfectSpacing.xs,
      opacity: 0.8,
    },

    // TITOLO ESPLORA DISTINTIVO
    exploreTitle: {
      // fontSize rimosso - ora gestito da Text
      fontWeight: Typography.weights.bold, // BOLD normale
      color: Colors.neutral[700],
      textAlign: 'center',
      letterSpacing: scale(-0.4),
      includeFontPadding: false,
    },

    // TITOLO COMMUNITY DISTINTIVO
    communityTitle: {
      // fontSize rimosso - ora gestito da Text
      fontWeight: Typography.weights.bold, // BOLD normale
      color: Colors.neutral[900],
      textAlign: 'center',
      letterSpacing: scale(-0.4),
      includeFontPadding: false,
    },

    exploreSubtitle: {
      fontWeight: Typography.weights.medium,
      color: Colors.neutral[600],
      textAlign: 'center',
      marginTop: PerfectSpacing.md,
      opacity: 0.9,
      letterSpacing: scale(0.1),
    },

    infoButton: {
      position: 'absolute',
      right: scaleSpacing(6),
      top: scaleSpacing(6),
      width: INFO_BTN_SIZE,
      height: INFO_BTN_SIZE,
      borderRadius: INFO_BTN_SIZE / 2,
      backgroundColor: Colors.primary[500],
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: INFO_BORDER,
      borderColor: Colors.neutral[0],
      shadowColor: Colors.primary[500],
      shadowOffset: { width: 0, height: scale(3) },
      shadowOpacity: 0.16,
      shadowRadius: scale(6),
      elevation: 3,
    },

    buttonsGrid: {
      gap: PerfectSpacing.base,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: PerfectSpacing.base,
    },
    buttonContainer: {
      flex: 1,
    },
    // Rimosso pattern gradient/white/buttonContent: gestito in AnimatedButton
    buttonIcon: {
      marginBottom: PerfectSpacing.md,
    },
    buttonTitle: {
      fontWeight: Typography.weights.bold,
      color: Colors.neutral[900],
      textAlign: 'center',
      letterSpacing: scale(-0.3),
    },

    communitySubtitle: {
      fontWeight: Typography.weights.medium,
      color: Colors.neutral[700],
      textAlign: 'center',
      marginTop: PerfectSpacing.md,
      opacity: 0.9,
      letterSpacing: scale(0.1),
    },

    // DIVISORE TRA SEZIONI - IDENTICO ALLA PAGINA IMPATTO
    sectionDivider: {
      height: scale(2),
      backgroundColor: Colors.neutral[200],
      marginTop: PerfectSpacing.xl,
      marginBottom: PerfectSpacing.base,
      marginHorizontal: PerfectSpacing.lg,
    },

    // PRIMA SEPARAZIONE - STESSA ALTEZZA DELLE ALTRE
    firstSectionDivider: {
      height: scale(2),
      backgroundColor: Colors.neutral[200],
      marginTop: PerfectSpacing.xl,
      marginBottom: PerfectSpacing.base,
      marginHorizontal: PerfectSpacing.lg,
    },

    // STILI PER INLINE STYLES
    centeredRow: {
      justifyContent: 'center',
    },
    singleButtonContainer: {
      flex: 0,
      width: scale(314), // Perfect System: 80% di 393px (iPhone 15), scala su tutti device
    },
    // CONTAINER BACKGROUND ESPLORA
    exploreHeaderBackground: {
      backgroundColor: Colors.neutral[100],
      borderRadius: scale(20),
      paddingVertical: PerfectSpacing.base,
      paddingHorizontal: PerfectSpacing.lg,
      borderWidth: scale(1),
      borderColor: Colors.neutral[400],
      minHeight: scale(60),
      width: scale(314), // Perfect System: 80% di 393px (iPhone 15), scala su tutti device
      justifyContent: 'center',
      alignSelf: 'center',
    },

    communityHeaderBackground: {
      backgroundColor: Colors.neutral[100],
      borderRadius: scale(20),
      paddingVertical: PerfectSpacing.base,
      paddingHorizontal: PerfectSpacing.lg,
      borderWidth: scale(1),
      borderColor: Colors.neutral[400],
      position: 'relative',
      minHeight: scale(60),
      width: scale(314), // Perfect System: 80% di 393px (iPhone 15), scala su tutti device
      justifyContent: 'center',
      alignSelf: 'center',
    },

    // ICONA LINK COMMUNITY
    communityChevron: {
      position: 'absolute',
      top: scale(8),
      right: scale(12),
      opacity: 0.7,
    },
  });
};
