import { StyleSheet } from 'react-native';

import { SpacingTokens as Spacing, scaleDimensionLinear, LOGICAL_REFERENCE } from '../../../shared/constants/responsiveSystem';
import { Colors, Typography } from '../../../shared/constants';

/**
 * Stili per i modal della sezione About
 * Ottimizzati per contenuto lungo e scrolling
 */
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
    maxWidth: scaleDimensionLinear(LOGICAL_REFERENCE.width * 0.9), // 90% iPhone 15 scalato millimetricamente
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
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: Spacing[2],
  },

  storyText: {
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
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.3,
  },

  introText: {
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
    marginTop: 2,
  },

  pillarTitle: {
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing[1],
  },

  pillarContent: {
    flex: 1,
  },

  pillarText: {
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[700],
    lineHeight: 22,
  },
});
