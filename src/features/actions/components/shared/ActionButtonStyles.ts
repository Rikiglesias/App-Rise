import { StyleSheet } from 'react-native';
import type { ButtonStyles } from './ActionButtonTypes';
import { Colors, PerfectSpacing, Typography } from '@/shared/constants';
import { scale, scaleTouch, scaleSpacing } from '@/shared/constants/perfectScale';
import { getPerfectShadow } from '@/shared/constants/perfectShadow';

export const createActionButtonStyles = (): ButtonStyles => {
  return StyleSheet.create({
    container: {
      paddingHorizontal: PerfectSpacing.base,
      gap: PerfectSpacing.sm,
      paddingTop: PerfectSpacing.sm,
      paddingBottom: PerfectSpacing.base,
    },
    categoryContainer: {
      marginBottom: PerfectSpacing.lg,
    },
    categoryHeader: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: PerfectSpacing['3xl'],
      position: 'relative',
    },

    // CONTAINER ELEGANTE PER TITOLO DONA - IDENTICO CROSS-PLATFORM
    donateTitleContainer: {
      alignItems: 'center',
      backgroundColor: Colors.primary[50],
      paddingVertical: PerfectSpacing.sm,
      paddingHorizontal: PerfectSpacing.md,
      width: '70%', // Riduce visivamente la lunghezza del container
      borderRadius: scale(16),
      borderWidth: scale(1),
      borderColor: Colors.primary[100],
      shadowColor: Colors.primary[600],
      shadowOffset: { width: 0, height: scale(2) },
      shadowOpacity: 0.08,
      shadowRadius: scale(8),
      elevation: 3,
    },

    // ELIMINATO: donateTitleContainerAndroid - ora iOS e Android usano stesso stile

    // TITOLO CATEGORIA DONA ELEGANTE - PIÙ GRASSETTO
    donateCategoryTitle: {
      // fontSize rimosso - ora gestito da Text
      fontWeight: Typography.weights.black, // PIÙ GRASSETTO: da bold a black
      color: Colors.primary[600],
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
      textShadowColor: Colors.neutral[700],
      textShadowOffset: { width: 0, height: scale(2) },
      textShadowRadius: scale(4),
    },

    // TITOLO COMMUNITY DISTINTIVO
    communityTitle: {
      // fontSize rimosso - ora gestito da Text
      fontWeight: Typography.weights.bold, // BOLD normale
      color: Colors.neutral[900],
      textAlign: 'center',
      letterSpacing: scale(-0.4),
      includeFontPadding: false,
      textShadowColor: Colors.neutral[800],
      textShadowOffset: { width: 0, height: scale(2) },
      textShadowRadius: scale(4),
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
      right: scaleSpacing(45),
      top: scaleSpacing(8),
      width: scaleTouch(24),
      height: scaleTouch(24),
      borderRadius: scale(12),
      backgroundColor: Colors.primary[600],
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: Colors.primary[600],
      shadowOffset: { width: 0, height: scale(3) },
      shadowOpacity: 0.4,
      shadowRadius: scale(6),
      elevation: 6,
      borderWidth: scale(1),
      borderColor: Colors.primary[500],
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
    // GRADIENT CONTAINER PATTERN per bottoni (clickabili) - ANDROID OTTIMIZZATO
    gradientBorder: {
      borderRadius: scale(20),
      // Spessore bordo pagina Azioni: 2pt
      padding: scale(2),
      ...getPerfectShadow('strong'),
    },
    whiteContainer: {
      backgroundColor: Colors.neutral[0],
      borderRadius: scale(18), // 20-2 per effetto bordo
      overflow: 'hidden',
      // Nota: proprietà di rasterizzazione rimosse per compatibilità tipizzazioni
    },
    buttonContent: {
      paddingVertical: PerfectSpacing.base,
      paddingHorizontal: PerfectSpacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonIcon: {
      marginBottom: PerfectSpacing.md,
    },
    buttonTitle: {
      fontWeight: Typography.weights.bold,
      color: Colors.neutral[900],
      textAlign: 'center',
      letterSpacing: scale(-0.3),
      // Text shadow per profondità
      textShadowColor: Colors.neutral[900],
      textShadowOffset: { width: 0, height: scale(1) },
      textShadowRadius: scale(3),
    },

    // SUBTITLE POTENZIATO COMMUNITY
    communitySubtitle: {
      fontWeight: Typography.weights.medium,
      color: Colors.neutral[700], // GRIGIO SCURO per leggibilità
      textAlign: 'center',
      marginTop: PerfectSpacing.md,
      opacity: 0.9,
      letterSpacing: scale(0.1),
    },

    // DIVISORE ULTRA COMPATTO TRA SEZIONI
    sectionDivider: {
      height: scale(2),
      backgroundColor: Colors.neutral[200],
      marginVertical: PerfectSpacing.sm,
      marginHorizontal: PerfectSpacing.lg,
    },

    // LINEA TRA SEZIONI - IDENTICA A SECTIONDIVIDER
    firstSectionDivider: {
      height: scale(2),
      backgroundColor: Colors.neutral[200],
      marginVertical: PerfectSpacing.sm,
      marginHorizontal: PerfectSpacing.lg,
    },

    // STILI PER INLINE STYLES
    centeredRow: {
      justifyContent: 'center',
    },
    singleButtonContainer: {
      flex: 0,
      width: '80%',
    },
    chevronPosition: {
      position: 'absolute',
      top: scaleSpacing(8),
      right: scaleSpacing(8),
    },

    // CONTAINER BACKGROUND ESPLORA
    exploreHeaderBackground: {
      backgroundColor: Colors.neutral[50],
      borderRadius: scale(20),
      paddingVertical: PerfectSpacing.base,
      paddingHorizontal: PerfectSpacing.lg,
      borderWidth: scale(1),
      borderColor: Colors.neutral[100],
      shadowColor: Colors.neutral[700],
      shadowOffset: { width: 0, height: scale(2) },
      shadowOpacity: 0.05,
      shadowRadius: scale(8),
      elevation: 2,
    },

    // ELIMINATO: exploreHeaderBackgroundAndroid - uniformità iOS/Android

    // CONTAINER BACKGROUND COMMUNITY
    communityHeaderBackground: {
      backgroundColor: Colors.neutral[50],
      borderRadius: scale(20),
      paddingVertical: PerfectSpacing.base,
      paddingHorizontal: PerfectSpacing.lg,
      borderWidth: scale(1),
      borderColor: Colors.neutral[100],
      shadowColor: Colors.neutral[900],
      shadowOffset: { width: 0, height: scale(2) },
      shadowOpacity: 0.05,
      shadowRadius: scale(8),
      elevation: 2,
      position: 'relative',
    },

    // ELIMINATO: communityHeaderBackgroundAndroid - uniformità iOS/Android

    // ICONA LINK COMMUNITY - ESTREMO ANGOLO SUPERIORE DESTRO
    communityChevron: {
      position: 'absolute',
      top: scaleSpacing(8),
      right: scaleSpacing(12),
      opacity: 0.7,
    },
  });
};
