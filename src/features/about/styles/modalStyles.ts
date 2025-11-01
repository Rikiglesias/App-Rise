import { StyleSheet } from 'react-native';

import {
  Colors,
  Typography,
  Spacing,
} from '@/shared/constants/designTokens';
import { scale } from '@/shared/constants/perfectScale';

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
    maxWidth: scale(350),
    width: '100%',
    maxHeight: '90%',
    minHeight: scale(700),
    height: '85%',
  },

  modalGradientBorder: {
    borderRadius: scale(24),
    padding: Spacing[1],
    height: '100%',
    minHeight: scale(700),
  },

  modalWhiteContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: scale(20),
    overflow: 'hidden',
    height: '100%',
    minHeight: scale(650),
  },

  modalContent: {
    height: '100%',
    flexDirection: 'column',
    minHeight: scale(600),
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing[4],
    borderBottomWidth: scale(1),
    borderBottomColor: Colors.neutral[200],
    position: 'relative',
    height: scale(56),
    minHeight: scale(56),
    flexShrink: 0,
  },

  modalTitle: {
    fontWeight: Typography.weights.black,
    color: Colors.primary[600],
    letterSpacing: scale(-0.8),
    flex: 1,
    textAlign: 'center',
    paddingRight: Spacing[8],
  },

  closeButton: {
    position: 'absolute',
    top: Spacing[3],
    right: Spacing[3],
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: Colors.neutral[900],
    justifyContent: 'center',
    alignItems: 'center',
  },

  storyScroll: {
    height: scale(500),
    minHeight: scale(500),
  },

  storyContainer: {
    padding: Spacing[6],
    gap: Spacing[4],
    minHeight: scale(800),
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
    lineHeight: scale(24),
    textAlign: 'justify',
    letterSpacing: scale(0.3),
  },

  highlightText: {
    color: Colors.primary[600],
    fontWeight: Typography.weights.bold,
  },

  sectionTitle: {
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing[2],
  },

  sectionDivider: {
    height: scale(1),
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
    lineHeight: scale(20),
    letterSpacing: scale(0.3),
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
    marginTop: scale(2),
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
    lineHeight: scale(22),
  },
});
