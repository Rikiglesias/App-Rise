import { Dimensions, StyleSheet } from 'react-native';

import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from '../../../shared/constants/designTokens';

const { width: screenWidth } = Dimensions.get('window');

// Main Screen Styles
export const mainStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  backButton: {
    position: 'absolute',
    top: 60, // AUMENTATO: da 50 a 60 per evitare overlap con notch/fotocamera
    left: Spacing[4],
    padding: Spacing[2],
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[0],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  contentContainer: {
    paddingHorizontal: Spacing[4],
    gap: Spacing[0],
    paddingTop: Spacing[12], // AUMENTATO: da 8 a 12 per safe area Android
    paddingBottom: Spacing[12],
  },
  // SEPARATORE TRA SEZIONI - IDENTICO PAGINA AZIONI
  sectionDividerContainer: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4], // IDENTICO PAGINA AZIONI: spazio equilibrato per separazione
    alignItems: 'center',
  },
  // LINEA SEPARATRICE - IDENTICA PAGINA AZIONI
  sectionDivider: {
    height: 2, // IDENTICO PAGINA AZIONI: altezza bilanciata
    backgroundColor: Colors.neutral[300], // IDENTICO PAGINA AZIONI: più soft per eleganza
    width: '60%', // IDENTICO PAGINA AZIONI: bilanciato per proporzioni migliori
    borderRadius: 1, // IDENTICO PAGINA AZIONI
    opacity: 0.8, // IDENTICO PAGINA AZIONI: sottile trasparenza per delicatezza
    // OMBRA ELEGANTE IDENTICA PAGINA AZIONI
    shadowColor: Colors.neutral[400],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
});

// Modal Styles
export const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
  },

  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },

  modalContainer: {
    maxWidth: screenWidth * 0.9,
    width: '100%',
    maxHeight: '80%',
  },

  modalGradientBorder: {
    borderRadius: 24,
    padding: 3,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },

  modalWhiteContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 21,
    overflow: 'hidden',
  },

  modalContent: {
    maxHeight: '100%',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    position: 'relative',
  },

  modalTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.black,
    color: '#DC2626',
    letterSpacing: -0.8,
    flex: 1,
    textAlign: 'center',
    paddingRight: Spacing[8], // SPAZIO per icona posizionata assolutamente
  },

  closeButton: {
    position: 'absolute',
    top: Spacing[5], // ULTERIORMENTE IN BASSO: da Spacing[4] a Spacing[5]
    right: -Spacing[1], // PIÙ A SINISTRA: da Spacing[2] a -Spacing[1]
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  storyScroll: {
    maxHeight: '85%',
  },

  storyContainer: {
    padding: Spacing[6],
    gap: Spacing[4],
  },

  storyTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: Spacing[2],
  },

  storyText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[700],
    lineHeight: 24,
    textAlign: 'justify',
    letterSpacing: 0.3,
  },

  highlightText: {
    color: '#DC2626',
    fontWeight: Typography.weights.bold,
  },

  sectionTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing[2],
  },

  sectionDivider: {
    height: 1,
    backgroundColor: Colors.neutral[200],
    marginVertical: Spacing[4],
  },

  finalMessageContainer: {
    marginTop: Spacing[6],
    alignItems: 'center',
  },

  finalMessage: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.3,
  },

  introText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: Spacing[4],
    fontStyle: 'italic',
  },

  pillarsContainer: {
    gap: Spacing[4],
  },

  pillarItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
    marginBottom: Spacing[3],
  },

  pillarIcon: {
    fontSize: Typography.sizes.xl,
    marginTop: 2,
  },

  pillarTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing[1],
  },

  pillarContent: {
    flex: 1,
  },

  pillarText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[700],
    lineHeight: 22,
  },
});

// ChiSiamo Section Styles
export const chiSiamoSectionStyles = StyleSheet.create({
  categoryContainer: {
    marginBottom: Spacing[2], // SPACING COMPATTO ma armonioso
  },

  // HEADER CON SPACING OTTIMIZZATO
  headerContainer: {
    paddingTop: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[2], // RIDOTTO: spazio compatto dopo la descrizione
    alignItems: 'center',
    position: 'relative',
  },

  // CONTAINER PRINCIPALE ELEGANTE COME PAGINA AZIONI
  titleHeaderContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.03)', // BACKGROUND COLORATO ELEGANTE
    paddingVertical: Spacing[3], // RIDOTTO per eleganza
    paddingHorizontal: Spacing[5], // RIDOTTO per coerenza
    borderRadius: 16, // MODERNO
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.12)', // BORDO ROSSO SOTTILE
    shadowColor: '#DC2626', // OMBRA ROSSA COORDINATA
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    width: '100%',
  },

  // CONTAINER TITOLO E ICONA - SPACING OTTIMIZZATO
  titleWithInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
    marginBottom: Spacing[4], // AUMENTATO: spazio armonioso prima della descrizione
  },

  // AREA CLICCABILE PER IL TITOLO - NUOVA
  titleTouchableArea: {
    // Nessun background o bordi - solo area cliccabile
    paddingHorizontal: Spacing[2], // Piccolo padding per area touch più ampia
    paddingVertical: Spacing[1],
  },

  titleContainer: {
    position: 'relative',
    alignItems: 'center',
  },

  // TITOLO PRINCIPALE - DIMENSIONI BILANCIATE
  categoryTitle: {
    fontSize: screenWidth > 375 ? 36 : 30, // RIDOTTO per migliore proporzione
    fontWeight: Typography.weights.black,
    color: Colors.neutral[900],
    textAlign: 'center',
    letterSpacing: -1.0, // BILANCIATO per leggibilità
    includeFontPadding: false,
    // TEXT SHADOW ELEGANTE
    textShadowColor: 'rgba(0, 0, 0, 0.10)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  // ACCENTO ROSSO POTENZIATO
  titleAccent: {
    color: '#DC2626',
    // TEXT SHADOW ROSSO coordinato
    textShadowColor: 'rgba(220, 38, 38, 0.25)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },

  // CONTAINER PER SUBTITLE CON ICONA INFO
  subtitleWithInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  // CONTAINER CLICCABILE ELEGANTE COME PAGINA AZIONI
  titleClickableContainer: {
    alignItems: 'center',
    flex: 1,
  },

  // SUBTITLE INLINE INGRANDITO E ELEGANTE
  mainSubtitleInline: {
    fontSize: Typography.sizes.base, // INGRANDITO: da sm a base per maggiore leggibilità
    fontWeight: Typography.weights.medium,
    color: '#B91C1C', // ROSSO PIÙ SCURO COORDINATO
    textAlign: 'center',
    letterSpacing: 0.2,
    marginTop: Spacing[1],
    opacity: 0.8,
  },

  // SUBTITLE - SPACING E STILE OTTIMIZZATI (LEGACY)
  mainSubtitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[700],
    textAlign: 'center',
    letterSpacing: 0.3,
    fontStyle: 'italic',
    lineHeight: 24, // AUMENTATO per migliore leggibilità
    // SUBTLE TEXT SHADOW
    textShadowColor: 'rgba(0, 0, 0, 0.06)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // ICONA INFO PER SUBTITLE
  infoIconSubtitle: {
    marginLeft: Spacing[2],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.8)',
  },

  // ICONA INFO - ULTERIORMENTE ALZATA E SPOSTATA A SINISTRA
  infoIconImproved: {
    position: 'absolute',
    right: Spacing[1], // ULTERIORMENTE A SINISTRA: da Spacing[2] a Spacing[1]
    top: Spacing[1], // ULTERIORMENTE ALZATA: da Spacing[2] a Spacing[1]
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    // OMBRA ELEGANTE
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    // BORDO PULITO
    borderWidth: 2,
    borderColor: Colors.neutral[0],
  },

  categorySubtitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
    marginBottom: Spacing[3],
    paddingHorizontal: Spacing[4],
    fontStyle: 'normal',
    color: '#DC2626',
    backgroundColor: 'rgba(220, 38, 38, 0.04)',
    paddingVertical: Spacing[3],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.15)',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
});

// Contact Section Styles - SPACING IDENTICO PAGINA AZIONI
export const contactSectionStyles = StyleSheet.create({
  categoryContainer: {
    marginBottom: Spacing[1], // IDENTICO PAGINA AZIONI: ultra avvicinato come "Scopri"
  },

  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[12], // IDENTICO PAGINA AZIONI: molto aumentato come "Dona Ora" - ampio spazio tra titolo e bottoni
    position: 'relative',
  },

  // CONTAINER HEADER SEMPLICE SENZA BACKGROUND - COME ESPLORA E COMMUNITY
  exploreHeaderContainer: {
    alignItems: 'center',
    paddingVertical: Spacing[2], // RIDOTTO per semplicità
    paddingHorizontal: Spacing[3], // RIDOTTO per semplicità
  },

  categoryTitle: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.black,
    color: Colors.neutral[800],
    textAlign: 'center',
    letterSpacing: -0.8,
    marginBottom: Spacing[1], // IDENTICO PAGINA AZIONI: ridotto per coerenza
    // Text shadow elegante identico pagina azioni
    textShadowColor: 'rgba(31, 41, 55, 0.15)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },

  // SUBTITLE INLINE INGRANDITA
  exploreSubtitleInline: {
    fontSize: Typography.sizes.base, // INGRANDITO: da sm a base per I nostri contatti
    fontWeight: Typography.weights.medium,
    color: '#374151',
    textAlign: 'center',
    letterSpacing: 0.3,
    fontStyle: 'italic',
    lineHeight: 24, // AUMENTATO per proportional spacing
  },

  // SEPARATORE HEADER - NON UTILIZZATO MA MANTENGO PER COMPATIBILITÀ
  headerDivider: {
    width: '70%',
    height: 3,
    backgroundColor: '#1F2937',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing[3],
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },

  contactsGrid: {
    gap: Spacing[4], // IDENTICO PAGINA AZIONI: spacing bilanciato
  },
});

// Animated Contact Styles
export const animatedContactStyles = StyleSheet.create({
  contactButtonContainer: {
    width: '100%',
  },
  contactTouchable: {
    width: '100%',
  },
  // GRADIENT CONTAINER PATTERN OTTIMIZZATO per Android
  gradientBorder: {
    borderRadius: 20, // RIDOTTO per migliore rendering Android
    padding: 2, // RIDOTTO per evitare artefatti
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 6 }, // RIDOTTO
    shadowOpacity: 0.2, // RIDOTTO
    shadowRadius: 12, // RIDOTTO
    elevation: 6, // RIDOTTO per Android
  },
  whiteContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 18, // 20-2 per effetto bordo
    overflow: 'hidden',
  },
  contactContent: {
    paddingVertical: Spacing[4], // RIMPICCIOLITO: da Spacing[5] a Spacing[4]
    paddingHorizontal: Spacing[4], // RIMPICCIOLITO: da Spacing[5] a Spacing[4]
    alignItems: 'center',
    minHeight: 80, // RIMPICCIOLITO: da 90 a 80
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contactIcon: {
    marginRight: Spacing[3],
  },
  contactTextContainer: {
    flex: 1,
  },
  contactButtonTitle: {
    fontSize: Typography.sizes.base, // RIMPICCIOLITO: da lg a base
    fontWeight: Typography.weights.bold, // RIDOTTO: da black a bold
    color: Colors.neutral[900],
    marginBottom: 2, // RIDOTTO: da 3 a 2
    textShadowColor: 'rgba(0, 0, 0, 0.08)', // RIDOTTO: opacità più leggera
    textShadowOffset: { width: 0, height: 1 }, // RIDOTTO: più sottile
    textShadowRadius: 3, // RIDOTTO: meno morbido
    letterSpacing: -0.2, // RIDOTTO: meno compresso
  },
  contactButtonSubtitle: {
    fontSize: Typography.sizes.sm, // RIMPICCIOLITO: da base a sm
    fontWeight: Typography.weights.medium, // RIDOTTO: da semibold a medium
    color: Colors.neutral[600], // PIÙ CHIARO: da 700 a 600
    letterSpacing: 0.2, // RIDOTTO: meno spaziato
  },
});
