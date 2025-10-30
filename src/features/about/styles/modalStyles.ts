import { StyleSheet } from 'react-native';

// ELIMINATO: import vecchi responsiveSystem
import { Colors, Typography, Spacing } from '../../../shared/constants/designTokens';

/**
 * Stili per i modal della sezione About
 * Ottimizzati per contenuto lungo e scrolling - SISTEMA COERENTE
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
    maxWidth: 350,
    width: '100%',
    maxHeight: '90%',
    minHeight: 700,
    height: '85%',
  },

  modalGradientBorder: {
    borderRadius: 24,
    padding: Spacing[1],
    height: '100%',
    minHeight: 700,
  },

  modalWhiteContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 20,
    overflow: 'hidden',
    height: '100%',
    minHeight: 650,
  },

  modalContent: {
    height: '100%',
    flexDirection: 'column',
    minHeight: 600,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    position: 'relative',
    height: 56,
    minHeight: 56,
    flexShrink: 0,
  },

  modalTitle: {
    fontWeight: Typography.weights.black,
    color: '#DC2626',
    letterSpacing: -0.8,
    flex: 1,
    textAlign: 'center',
    paddingRight: Spacing[8],
  },

  closeButton: {
    position: 'absolute',
    top: Spacing[3],
    right: Spacing[3],
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  storyScroll: {
    height: 500,
    minHeight: 500,
  },

  storyContainer: {
    padding: Spacing[6],
    gap: Spacing[4],
    minHeight: 800,
    flexGrow: 1,
    paddingBottom: Spacing[12],
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
