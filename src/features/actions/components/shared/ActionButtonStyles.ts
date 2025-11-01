import { StyleSheet } from 'react-native';
import type { ButtonStyles } from './ActionButtonTypes';
import { Colors, Spacing, Typography } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { getPerfectShadow } from '@/shared/constants/perfectShadow';

export const createActionButtonStyles = (): ButtonStyles => {
  return StyleSheet.create({
    container: {
      paddingHorizontal: Spacing[4],
      gap: Spacing[2], // RIDOTTO: sezioni più unite, compensa l'aumento marginBottom categoryContainer
      paddingTop: Spacing[2], // AUMENTATO: più spazio sopra per respirazione
      paddingBottom: Spacing[4], // AUMENTATO: più spazio sotto per equilibrio
    },
    categoryContainer: {
      marginBottom: Spacing[6], // AUMENTATO: da Spacing[3] a Spacing[6] per maggiore separazione tra sezioni
    },
    categoryHeader: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing[12], // ULTERIORMENTE AUMENTATO: da Spacing[8] a Spacing[12] per respirazione ottimale
      position: 'relative',
    },

    // CONTAINER ELEGANTE PER TITOLO DONA - IDENTICO CROSS-PLATFORM
    donateTitleContainer: {
      alignItems: 'center',
      backgroundColor: Colors.primary[50], // IDENTICO: stesso rgba su entrambe le piattaforme
      paddingVertical: Spacing[2],
      paddingHorizontal: Spacing[3],
      width: '70%', // Riduce visivamente la lunghezza del container
      borderRadius: scale(16),
      borderWidth: scale(1),
      borderColor: Colors.primary[100], // IDENTICO: stesso rgba su entrambe le piattaforme
      shadowColor: Colors.primary[600],
      shadowOffset: { width: 0, height: scale(2) },
      shadowOpacity: 0.08,
      shadowRadius: scale(8),
      elevation: 3,
    },

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
      marginTop: Spacing[1], // MANTENUTO: spazio dal titolo anche senza container
      opacity: 0.8,
    },

    // TITOLO ESPLORA DISTINTIVO
    exploreTitle: {
      // fontSize rimosso - ora gestito da Text
      fontWeight: Typography.weights.bold, // BOLD normale
      color: Colors.neutral[700], // GRIGIO SCURO ELEGANTE per Esplora
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
      color: Colors.neutral[900], // NERO per Community
      textAlign: 'center',
      letterSpacing: scale(-0.4),
      includeFontPadding: false,
      textShadowColor: Colors.neutral[800],
      textShadowOffset: { width: 0, height: scale(2) },
      textShadowRadius: scale(4),
    },

    exploreSubtitle: {
      fontWeight: Typography.weights.medium,
      color: Colors.neutral[600], // GRIGIO MEDIO per leggibilità
      textAlign: 'center',
      marginTop: Spacing[3],
      opacity: 0.9,
      letterSpacing: scale(0.1),
    },

    infoButton: {
      position: 'absolute',
      right: scale(45),
      top: scale(8),
      width: scale(24),
      height: scale(24),
      borderRadius: scale(12),
      backgroundColor: Colors.primary[600],
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: Colors.primary[600],
      shadowOffset: { width: 0, height: scale(3) },
      shadowOpacity: 0.4,
      shadowRadius: scale(6),
      elevation: 6,
      borderWidth: 1,
      borderColor: Colors.primary[500],
    },

    buttonsGrid: {
      gap: Spacing[4],
    },
    buttonRow: {
      flexDirection: 'row',
      gap: Spacing[4],
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
      paddingVertical: Spacing[4], // RIDOTTO per bottoni più compatti
      paddingHorizontal: Spacing[3], // RIDOTTO per minimalismo
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonIcon: {
      marginBottom: Spacing[3],
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
      marginTop: Spacing[3],
      opacity: 0.9,
      letterSpacing: scale(0.1),
    },

    // DIVISORE ULTRA COMPATTO TRA SEZIONI
    sectionDivider: {
      height: scale(2), // SPESSORE STANDARD
      backgroundColor: Colors.neutral[200], // SCURITO: da neutral[100] a [200] per maggiore visibilità
      marginVertical: Spacing[2], // RIDOTTO ulteriormente
      marginHorizontal: Spacing[6], // LUNGHEZZA STANDARD
    },

    // LINEA TRA SEZIONI - IDENTICA A SECTIONDIVIDER
    firstSectionDivider: {
      height: scale(2), // STESSO SPESSORE di sectionDivider
      backgroundColor: Colors.neutral[200],
      marginVertical: Spacing[2],
      marginHorizontal: Spacing[6], // STESSA LUNGHEZZA di sectionDivider
    },

    // STILI PER INLINE STYLES
    centeredRow: {
      justifyContent: 'center',
    },
    singleButtonContainer: {
      flex: 0,
      width: '80%', // ANCORA PIÙ LARGO: dominante nella sezione
    },
    chevronPosition: {
      position: 'absolute',
      top: scale(8),
      right: scale(8),
    },

    // CONTAINER BACKGROUND ESPLORA - IDENTICO CROSS-PLATFORM
    exploreHeaderBackground: {
      backgroundColor: Colors.neutral[50], // IDENTICO: stesso rgba su entrambe le piattaforme
      borderRadius: scale(20),
      paddingVertical: Spacing[4],
      paddingHorizontal: Spacing[6],
      borderWidth: 1,
      borderColor: Colors.neutral[100], // IDENTICO: stesso rgba su entrambe le piattaforme
      shadowColor: Colors.neutral[700],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: scale(8),
      elevation: 2,
    },

    // CONTAINER BACKGROUND COMMUNITY - IDENTICO CROSS-PLATFORM
    communityHeaderBackground: {
      backgroundColor: Colors.neutral[50], // IDENTICO: stesso rgba su entrambe le piattaforme
      borderRadius: scale(20),
      paddingVertical: Spacing[4],
      paddingHorizontal: Spacing[6],
      borderWidth: 1,
      borderColor: Colors.neutral[100], // IDENTICO: stesso rgba su entrambe le piattaforme
      shadowColor: Colors.neutral[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: scale(8),
      elevation: 2,
      position: 'relative',
    },

    // ICONA LINK COMMUNITY - ESTREMO ANGOLO SUPERIORE DESTRO
    communityChevron: {
      position: 'absolute',
      top: scale(8),
      right: scale(12),
      opacity: 0.7, // IDENTICO iOS: semi-trasparente
    },
  });
};
