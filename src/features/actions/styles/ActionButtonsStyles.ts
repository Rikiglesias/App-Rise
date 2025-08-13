import { Platform, StyleSheet } from 'react-native';

import { Colors, Spacing, Typography } from '../../../shared/constants';
import { scaleDimensionLinear, LOGICAL_REFERENCE } from '../../../shared/constants/responsiveSystem';

/**
 * Stili modulari per ActionButtons
 * Estratti dal componente principale per migliorare la manutenibilità
 */
export const actionButtonsStyles = StyleSheet.create({
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
    backgroundColor: 'rgba(220, 38, 38, 0.03)', // IDENTICO: stesso rgba su entrambe le piattaforme
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[5],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.12)', // IDENTICO: stesso rgba su entrambe le piattaforme
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === 'android' ? 0.04 : 0.08, // Solo ombra diversa per stabilità
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 2 : 3, // Solo elevation diversa per stabilità
  },

  // TITOLO CATEGORIA DONA ELEGANTE - PIÙ GRASSETTO
  donateCategoryTitle: {
    // fontSize rimosso - ora gestito da Text
    fontWeight: Typography.weights.black, // PIÙ GRASSETTO: da bold a black
    color: '#DC2626',
    textAlign: 'center',
    letterSpacing: -0.4,
    includeFontPadding: false,
  },

  // SUBTITLE ELEGANTE DONA INGRANDITO
  donateInlineSubtitle: {
    fontWeight: Typography.weights.medium,
    color: '#B91C1C',
    textAlign: 'center',
    letterSpacing: 0.2,
    marginTop: Spacing[1], // MANTENUTO: spazio dal titolo anche senza container
    opacity: 0.8,
  },

  // TITOLO ESPLORA DISTINTIVO
  exploreTitle: {
    // fontSize rimosso - ora gestito da Text
    fontWeight: Typography.weights.bold, // BOLD normale
    color: '#374151', // GRIGIO SCURO ELEGANTE per Esplora
    textAlign: 'center',
    letterSpacing: -0.4,
    includeFontPadding: false,
    textShadowColor: 'rgba(55, 65, 81, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // TITOLO COMMUNITY DISTINTIVO
  communityTitle: {
    // fontSize rimosso - ora gestito da Text
    fontWeight: Typography.weights.bold, // BOLD normale
    color: '#1F2937', // NERO per Community
    textAlign: 'center',
    letterSpacing: -0.4,
    includeFontPadding: false,
    textShadowColor: 'rgba(31, 41, 55, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  exploreSubtitle: {
    fontWeight: Typography.weights.medium,
    color: '#4B5563', // GRIGIO MEDIO per leggibilità
    textAlign: 'center',
    marginTop: Spacing[3],
    opacity: 0.9,
    letterSpacing: 0.1,
  },

  infoButton: {
    position: 'absolute',
    right: Platform.OS === 'android' ? 33 : 45, // ANDROID: 33 come regolato / iOS: 45 ancora più a sinistra
    top: Platform.OS === 'android' ? 5 : 8, // ANDROID: 5 come regolato / iOS: 8 più in alto
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.8)',
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
    borderRadius: 20,
    padding: 2,
    ...(Platform.OS === 'android'
      ? {
          // ANDROID: Rendering ottimizzato per evitare bleeding durante animazioni
          elevation: 2, // MOLTO RIDOTTO per animazioni fluide
          shadowColor: 'transparent',
          // Forza compositing layer per stabilità durante animazioni
          needsOffscreenAlphaCompositing: false,
        }
      : {
          // iOS: Ombreggiatura normale
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
        }),
  },
  whiteContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 18, // 20-2 per effetto bordo
    overflow: 'hidden',
    ...(Platform.OS === 'android' && {
      // ANDROID: Forza background completamente opaco durante le animazioni
      backgroundColor: '#FFFFFF',
      // Forza il render layer per evitare bleeding durante animazioni
      renderToHardwareTextureAndroid: true,
      shouldRasterizeIOS: false,
    }),
  },
  buttonContent: {
    paddingVertical: Spacing[4], // RIDOTTO per bottoni più compatti
    paddingHorizontal: Spacing[3], // RIDOTTO per minimalismo
    alignItems: 'center',
    minHeight: 100, // RIDOTTO per bottoni più piccoli
    justifyContent: 'center',
  },
  buttonIcon: {
    marginBottom: Spacing[3],
  },
  buttonTitle: {
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    textAlign: 'center',
    letterSpacing: -0.3,
    // Text shadow per profondità
    textShadowColor: 'rgba(0, 0, 0, 0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // SUBTITLE POTENZIATO COMMUNITY
  communitySubtitle: {
    fontWeight: Typography.weights.medium,
    color: '#374151', // GRIGIO SCURO per leggibilità
    textAlign: 'center',
    marginTop: Spacing[3],
    opacity: 0.9,
    letterSpacing: 0.1,
  },

  // DIVISORE ULTRA COMPATTO TRA SEZIONI
  sectionDivider: {
    height: 2, // SPESSORE STANDARD
    backgroundColor: Colors.neutral[200], // SCURITO: da neutral[100] a [200] per maggiore visibilità
    marginVertical: Spacing[2], // RIDOTTO ulteriormente
    marginHorizontal: Spacing[6], // LUNGHEZZA STANDARD
  },

  // LINEA TRA SEZIONI - IDENTICA A SECTIONDIVIDER
  firstSectionDivider: {
    height: 2, // STESSO SPESSORE di sectionDivider
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
    width: scaleDimensionLinear(LOGICAL_REFERENCE.width * 0.8), // 80% iPhone 15 scalato millimetricamente
  },
  chevronPosition: {
    position: 'absolute',
    top: 8,
    right: 8,
  },

  // CONTAINER BACKGROUND ESPLORA - IDENTICO CROSS-PLATFORM
  exploreHeaderBackground: {
    backgroundColor: 'rgba(31, 41, 55, 0.03)', // IDENTICO: stesso rgba su entrambe le piattaforme
    borderRadius: 20,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[6],
    borderWidth: 1,
    borderColor: 'rgba(31, 41, 55, 0.08)', // IDENTICO: stesso rgba su entrambe le piattaforme
    shadowColor: '#374151',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === 'android' ? 0.03 : 0.05, // Solo ombra diversa per stabilità
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 1 : 2, // Solo elevation diversa per stabilità
  },

  // CONTAINER BACKGROUND COMMUNITY - IDENTICO CROSS-PLATFORM
  communityHeaderBackground: {
    backgroundColor: 'rgba(31, 41, 55, 0.03)', // IDENTICO: stesso rgba su entrambe le piattaforme
    borderRadius: 20,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[6],
    borderWidth: 1,
    borderColor: 'rgba(31, 41, 55, 0.08)', // IDENTICO: stesso rgba su entrambe le piattaforme
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === 'android' ? 0.03 : 0.05, // Solo ombra diversa per stabilità
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 1 : 2, // Solo elevation diversa per stabilità
    position: 'relative',
  },

  // ICONA LINK COMMUNITY - ESTREMO ANGOLO SUPERIORE DESTRO
  communityChevron: {
    position: 'absolute',
    top: Platform.OS === 'android' ? -4 : 8, // ANDROID: -4 come regolato / iOS: 8 più in basso
    right: Platform.OS === 'android' ? -8 : 12, // ANDROID: -8 come regolato / iOS: 12 più a sinistra
    opacity: 0.7, // IDENTICO iOS: semi-trasparente
  },
});
