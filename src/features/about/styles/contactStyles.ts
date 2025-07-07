import { StyleSheet } from 'react-native';

import {
  SpacingTokens as Spacing,
  TypographyTokens,
} from '../../../shared/constants/responsiveSystem';
import { Colors, Typography } from '../../../shared/constants';

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

  // Grid contatti - AGGIUNTO per compatibilità
  contactsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
});

/**
 * Stili per i contatti animati
 */
export const animatedContactStyles = StyleSheet.create({
  contactButtonContainer: {
    flex: 1,
    minWidth: '48%',
    marginBottom: Spacing[3],
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
    padding: Spacing[4],
  },

  contactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },

  contactIcon: {
    marginRight: Spacing[1],
  },

  contactTextContainer: {
    flex: 1,
  },

  contactButtonTitle: {
    fontSize: TypographyTokens.styles.body.medium,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
    marginBottom: Spacing[1],
  },

  contactButtonSubtitle: {
    fontSize: TypographyTokens.styles.body.small,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[600],
  },
});
