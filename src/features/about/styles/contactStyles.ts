import { StyleSheet } from 'react-native';

import { Spacing, Colors, Typography } from '../../../shared/constants';

/**
 * Stili per la sezione contatti
 * Design semplice e coordinato con la pagina azioni
 */
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
    // paddingVertical e paddingHorizontal ora gestiti da props diretti (SCALA!)
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

  // SUBTITLE INLINE INGRANDITA (fontSize gestito da PerfectText)
  exploreSubtitleInline: {
    fontWeight: Typography.weights.medium,
    color: '#374151',
    textAlign: 'center',
    letterSpacing: 0.3,
    fontStyle: 'italic',
    lineHeight: 24, // AUMENTATO per proportional spacing
  },

  // SEPARATORE HEADER - NON UTILIZZATO MA MANTENUTO PER COMPATIBILITÀ
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

  // Grid contatti - LAYOUT OTTIMIZZATO
  contactsGrid: {
    flexDirection: 'column',
    alignItems: 'center',
    // paddingHorizontal e paddingVertical ora gestiti da props diretti (SCALA!)
    gap: Spacing[4], // AUMENTATO: da Spacing[2] a Spacing[4] per più spazio tra i bottoni grandi
  },
});

/**
 * Stili per i contatti animati
 */
export const animatedContactStyles = StyleSheet.create({
  contactButtonContainer: {
    width: '100%',
    maxWidth: 400, // AUMENTATO: da 300 a 400 per bottoni più larghi
    alignSelf: 'center',
  },

  contactTouchable: {
    borderRadius: 16,
    overflow: 'hidden',
  },

  gradientBorder: {
    padding: 2,
    borderRadius: 16,
  },

  whiteContainer: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 14,
    padding: Spacing[5], // AUMENTATO: da Spacing[3] a Spacing[5] per più spazio interno
    minHeight: 90, // AUMENTATO: da 70 a 90 per bottoni più alti
    justifyContent: 'center',
    alignItems: 'stretch',
  },

  contactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[2], // AUMENTATO: da Spacing[1] a Spacing[2]
    paddingVertical: Spacing[1], // AUMENTATO: da Spacing[0.5] a Spacing[1]
  },

  contactIcon: {
    width: 36, // AUMENTATO: da 28 a 36 per icone più grandi
    height: 36, // AUMENTATO: da 28 a 36 per icone più grandi
    marginRight: Spacing[5], // AUMENTATO: da Spacing[4] a Spacing[5] per più spazio
  },

  contactTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  contactButtonTitle: {
    fontSize: 16, // Body large
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
    marginBottom: Spacing[1],
    letterSpacing: 0.3,
  },

  contactButtonSubtitle: {
    fontSize: 14, // Body medium
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[600],
    lineHeight: 22, // AUMENTATO: da 20 a 22 per migliore leggibilità
  },
});
