import { StyleSheet } from 'react-native';

import { Spacing, Colors, Typography } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';

/**
 * Stili per la sezione contatti
 * Design semplice e coordinato con la pagina azioni
 */
export const contactSectionStyles = StyleSheet.create({
  categoryContainer: {
    marginBottom: Spacing[1],
  },

  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[12],
    position: 'relative',
  },

  exploreHeaderContainer: {
    alignItems: 'center',
  },

  categoryTitle: {
    fontWeight: Typography.weights.black,
    color: Colors.neutral[800],
    textAlign: 'center',
    letterSpacing: scale(-0.8),
    marginBottom: Spacing[1],
    textShadowColor: Colors.neutral[800],
    textShadowOffset: { width: 0, height: scale(3) },
    textShadowRadius: scale(8),
  },

  exploreSubtitleInline: {
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[700],
    textAlign: 'center',
    letterSpacing: scale(0.3),
    fontStyle: 'italic',
    lineHeight: scale(24),
  },

  headerDivider: {
    width: '70%',
    height: scale(3),
    backgroundColor: Colors.neutral[900],
    borderRadius: scale(2),
    alignSelf: 'center',
    marginTop: Spacing[3],
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: scale(1) },
    shadowOpacity: 0.2,
    shadowRadius: scale(3),
    elevation: 2,
  },

  contactsGrid: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: Spacing[4],
  },
});

/**
 * Stili per i contatti animati
 */
export const animatedContactStyles = StyleSheet.create({
  contactButtonContainer: {
    width: '100%',
    maxWidth: scale(400),
    alignSelf: 'center',
  },

  contactTouchable: {
    borderRadius: scale(16),
    overflow: 'hidden',
  },

  gradientBorder: {
    padding: scale(2),
    borderRadius: scale(16),
  },

  whiteContainer: {
    backgroundColor: Colors.neutral[50],
    borderRadius: scale(14),
    padding: Spacing[5],
    minHeight: scale(90),
    justifyContent: 'center',
    alignItems: 'stretch',
  },

  contactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
  },

  contactIcon: {
    width: scale(36),
    height: scale(36),
    marginRight: Spacing[5],
  },

  contactTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  contactButtonTitle: {
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
    marginBottom: Spacing[1],
    letterSpacing: scale(0.3),
  },

  contactButtonSubtitle: {
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[600],
    lineHeight: scale(22),
  },
});
