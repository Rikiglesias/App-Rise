import { Dimensions, Platform, StyleSheet } from 'react-native';

import {
  SpacingTokens as Spacing,
  TypographyTokens,
} from '../../../shared/constants/responsiveSystem';
import { BorderRadius, Colors, Typography } from '../../../shared/constants';
import { PlatformShadows } from '../../../shared/constants/platformDesignTokens';

const { width: screenWidth } = Dimensions.get('window');

// Main Screen Styles
export const mainStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 60, // ANDROID: 40 come regolato / iOS: 60 più in basso
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
    paddingTop: Platform.OS === 'android' ? Spacing[20] : Spacing[12], // ANDROID: Spacing[20] / iOS: Spacing[12] più in alto
    paddingBottom: Platform.OS === 'android' ? Spacing[24] : Spacing[12], // ANDROID: Spacing[24] per evitare sovrapposizione bottom navigation / iOS: Spacing[12] normale
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

  backdropTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    maxHeight: '90%', // ULTERIORMENTE ALLUNGATO: da 85% a 90% per molto più spazio
    minHeight: 700, // AUMENTATO: da 500 a 700px per garantire altezza significativa
    height: '85%', // AUMENTATO: da 75% a 85% per modal molto più alto
  },

  modalGradientBorder: {
    borderRadius: 24,
    padding: 3,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
    height: '100%', // AGGIUNTO: altezza piena per evitare collasso del gradient
    minHeight: 700, // AGGIUNTO: altezza minima garantita
  },

  modalWhiteContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 21,
    overflow: 'hidden',
    height: '100%', // CAMBIATO: da flex: 1 a height fisso per evitare collasso
    minHeight: 650, // AGGIUNTO: altezza minima garantita
  },

  modalContent: {
    height: '100%', // CAMBIATO: da flex a height fisso per evitare collasso
    flexDirection: 'column',
    minHeight: 600, // AUMENTATO: da 400 a 600px per contenuto molto più alto
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    position: 'relative',
    height: 70, // AGGIUNTO: altezza fissa per l'header per evitare collasso
    minHeight: 70, // AGGIUNTO: altezza minima garantita
    flexShrink: 0, // AGGIUNTO: impedisce al header di rimpicciolirsi
  },

  modalTitle: {
    fontSize: TypographyTokens.styles.title.medium,
    fontWeight: Typography.weights.black,
    color: '#DC2626',
    letterSpacing: -0.8,
    flex: 1,
    textAlign: 'center',
    paddingRight: Spacing[8], // RIDOTTO: spazio appropriato per la X più piccola
  },

  closeButton: {
    position: 'absolute',
    top: Spacing[3], // RIAVVICINATO: più in alto ma non troppo
    right: Spacing[3], // RIAVVICINATO: più a destra ma equilibrato
    width: 32, // RIDOTTO: dimensione più discreta
    height: 32, // RIDOTTO: dimensione più discreta
    borderRadius: 16, // AGGIORNATO: per mantenere la forma circolare
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // SEMPLIFICATO: sfondo scuro minimale
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000', // MANTENUTO: ombra pulita
    shadowOffset: { width: 0, height: 2 }, // RIDOTTO: ombra più sottile
    shadowOpacity: 0.3, // BILANCIATO: ombra discreta
    shadowRadius: 4, // RIDOTTO: ombra più contenuta
    elevation: 4, // RIDOTTO: elevazione più naturale
  },

  storyScroll: {
    height: 500, // CAMBIATO: da flex a height fisso per evitare collasso dell'area scroll
    minHeight: 500, // AUMENTATO: da 300 a 500px per area scrollabile molto più alta
  },

  storyContainer: {
    padding: Spacing[6],
    gap: Spacing[4],
    minHeight: 800, // AUMENTATO: da 600 a 800px per contenuto molto più alto
    flexGrow: 1, // AGGIUNTO: permette al contenuto di crescere se necessario
    paddingBottom: Spacing[12], // AGGIUNTO: padding extra in basso per respiro
  },

  storyTitle: {
    fontSize: TypographyTokens.styles.body.large,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: Spacing[2],
  },

  storyText: {
    fontSize: TypographyTokens.styles.body.medium,
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
    fontSize: TypographyTokens.styles.body.medium,
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
    fontSize: TypographyTokens.styles.body.small,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.3,
  },

  introText: {
    fontSize: TypographyTokens.styles.body.medium,
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
    fontSize: TypographyTokens.styles.title.medium,
    marginTop: 2,
  },

  pillarTitle: {
    fontSize: TypographyTokens.styles.body.medium,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing[1],
  },

  pillarContent: {
    flex: 1,
  },

  pillarText: {
    fontSize: TypographyTokens.styles.body.small,
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
    backgroundColor:
      Platform.OS === 'android'
        ? '#FEF2F2' // ANDROID: Colore solido equivalente a rgba(220, 38, 38, 0.03)
        : 'rgba(220, 38, 38, 0.03)', // iOS: Mantiene rgba originale
    paddingVertical: Spacing[3], // RIDOTTO per eleganza
    paddingHorizontal: Spacing[5], // RIDOTTO per coerenza
    borderRadius: 16, // MODERNO
    borderWidth: 1,
    borderColor:
      Platform.OS === 'android'
        ? '#FECACA' // ANDROID: Colore solido equivalente a rgba(220, 38, 38, 0.12)
        : 'rgba(220, 38, 38, 0.12)', // iOS: Mantiene rgba originale
    shadowColor: '#DC2626', // OMBRA ROSSA COORDINATA
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 2 : 3, // RIDOTTO su Android per stabilità
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
    // fontSize rimosso - ora gestito da Text
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
    fontSize: TypographyTokens.styles.body.medium, // INGRANDITO: da sm a base per maggiore leggibilità
    fontWeight: Typography.weights.medium,
    color: '#B91C1C', // ROSSO PIÙ SCURO COORDINATO
    textAlign: 'center',
    letterSpacing: 0.2,
    marginTop: Spacing[1],
    opacity: 0.8,
  },

  // SUBTITLE - SPACING E STILE OTTIMIZZATI (LEGACY)
  mainSubtitle: {
    fontSize: TypographyTokens.styles.body.medium,
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
    ...PlatformShadows.primary, // CONVERTITO: ombra primaria ottimizzata per entrambe le piattaforme
    // BORDO PULITO
    borderWidth: 2,
    borderColor: Colors.neutral[0],
  },

  categorySubtitle: {
    fontSize: TypographyTokens.styles.body.medium,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight:
      Typography.lineHeights.relaxed * TypographyTokens.styles.body.medium,
    marginBottom: Spacing[3],
    paddingHorizontal: Spacing[4],
    fontStyle: 'normal',
    color: '#DC2626',
    backgroundColor:
      Platform.OS === 'android'
        ? '#FEF7F7' // ANDROID: Colore solido equivalente a rgba(220, 38, 38, 0.04)
        : 'rgba(220, 38, 38, 0.04)', // iOS: Mantiene rgba originale
    paddingVertical: Spacing[3],
    borderRadius: 12,
    borderWidth: 1,
    borderColor:
      Platform.OS === 'android'
        ? '#FBE5E5' // ANDROID: Colore solido equivalente a rgba(220, 38, 38, 0.15)
        : 'rgba(220, 38, 38, 0.15)', // iOS: Mantiene rgba originale
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: Platform.OS === 'android' ? 1 : 2, // RIDOTTO su Android per stabilità
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
    // fontSize rimosso - ora gestito da Text
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
    fontSize: TypographyTokens.styles.body.medium, // INGRANDITO: da sm a base per I nostri contatti
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
    paddingHorizontal: Spacing[2], // AGGIUNTO: padding laterale per evitare schiacciamento ai bordi
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
    fontSize: TypographyTokens.styles.body.medium, // RIMPICCIOLITO: da lg a base
    fontWeight: Typography.weights.bold, // RIDOTTO: da black a bold
    color: Colors.neutral[900],
    marginBottom: 2, // RIDOTTO: da 3 a 2
    textShadowColor: 'rgba(0, 0, 0, 0.08)', // RIDOTTO: opacità più leggera
    textShadowOffset: { width: 0, height: 1 }, // RIDOTTO: più sottile
    textShadowRadius: 3, // RIDOTTO: meno morbido
    letterSpacing: -0.2, // RIDOTTO: meno compresso
  },
  contactButtonSubtitle: {
    fontSize: TypographyTokens.styles.body.small, // RIMPICCIOLITO: da base a sm
    fontWeight: Typography.weights.medium, // RIDOTTO: da semibold a medium
    color: Colors.neutral[600], // PIÙ CHIARO: da 700 a 600
    letterSpacing: 0.2, // RIDOTTO: meno spaziato
  },
});
