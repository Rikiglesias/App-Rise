import { StyleSheet } from 'react-native';

import { Colors, Typography } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
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
    paddingHorizontal: PerfectSpacing.base,
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
    // rgba necessario per backdrop modal semi-trasparente
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },

  modalContainer: {
    maxWidth: scale(350),
    width: '100%',
    maxHeight: '90%',
    minHeight: scale(700),
    height: '85%',
  },

  modalCard: {
    backgroundColor: Colors.neutral[0],
    borderRadius: scale(24),
    borderWidth: 2,
    borderColor: Colors.neutral[700],
    overflow: 'hidden',
    height: '100%',
    minHeight: scale(700),
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
    padding: PerfectSpacing.base,
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
    letterSpacing: 0,
    flex: 1,
    textAlign: 'center',
    paddingRight: PerfectSpacing.lg,
  },

  closeButton: {
    position: 'absolute',
    top: PerfectSpacing.md,
    right: PerfectSpacing.md,
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: Colors.neutral[900],
    justifyContent: 'center',
    alignItems: 'center',
  },

  storyScroll: {
    height: scale(500),
    minHeight: scale(500),
  },

  storyContainer: {
    padding: PerfectSpacing.lg,
    gap: PerfectSpacing.lg,
    minHeight: scale(800),
    flexGrow: 1,
    paddingBottom: PerfectSpacing['3xl'],
  },

  storyTitle: {
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: PerfectSpacing.sm,
  },

  storyText: {
    fontWeight: Typography.weights.regular,
    color: Colors.neutral[800],
    lineHeight: scale(28),
    textAlign: 'left',
    letterSpacing: 0,
  },

  highlightText: {
    color: Colors.primary[600],
    fontWeight: Typography.weights.bold,
  },

  sectionTitle: {
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: PerfectSpacing.md,
    marginTop: PerfectSpacing.sm,
    letterSpacing: 0,
  },

  sectionDivider: {
    height: scale(1),
    backgroundColor: Colors.neutral[200],
    marginVertical: PerfectSpacing.lg,
  },

  finalCard: {
    backgroundColor: Colors.primary[50],
    borderRadius: scale(16),
    padding: PerfectSpacing.lg,
    borderWidth: 2,
    borderColor: Colors.primary[200],
    gap: PerfectSpacing.md,
  },

  finalMessage: {
    fontWeight: Typography.weights.regular,
    color: Colors.neutral[700],
    textAlign: 'center',
    lineHeight: scale(24),
    letterSpacing: 0,
  },

  finalHighlight: {
    fontWeight: Typography.weights.bold,
    color: Colors.primary[700],
    textAlign: 'center',
    lineHeight: scale(24),
    letterSpacing: 0,
  },

  introCard: {
    backgroundColor: Colors.primary[50],
    borderRadius: scale(12),
    padding: PerfectSpacing.md,
    borderLeftWidth: scale(4),
    borderLeftColor: Colors.primary[500],
  },

  introText: {
    fontWeight: Typography.weights.semibold,
    color: Colors.primary[700],
    textAlign: 'left',
    letterSpacing: 0,
    lineHeight: scale(20),
  },

  italyCard: {
    backgroundColor: Colors.neutral[50],
    borderRadius: scale(16),
    padding: PerfectSpacing.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },

  cardText: {
    fontWeight: Typography.weights.regular,
    color: Colors.neutral[700],
    lineHeight: scale(24),
    letterSpacing: 0,
    marginTop: PerfectSpacing.sm,
  },

  mainSectionTitle: {
    fontWeight: Typography.weights.black,
    color: Colors.neutral[900],
    textAlign: 'center',
    letterSpacing: 0,
    marginBottom: PerfectSpacing.md,
  },

  pillarsContainer: {
    gap: PerfectSpacing.lg,
  },

  pillarCard: {
    backgroundColor: Colors.neutral[0],
    borderRadius: scale(16),
    padding: PerfectSpacing.lg,
    borderWidth: 2,
    borderColor: Colors.neutral[300],
    alignItems: 'center',
    gap: PerfectSpacing.md,
  },

  pillarIcon: {
    textAlign: 'center',
  },

  pillarTitle: {
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    textAlign: 'center',
    letterSpacing: 0,
    lineHeight: scale(22),
  },

  pillarText: {
    fontWeight: Typography.weights.regular,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: scale(22),
    letterSpacing: 0,
  },
});
