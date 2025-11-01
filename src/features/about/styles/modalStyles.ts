import { StyleSheet } from 'react-native';

import {
  Colors,
  Typography,
} from '@/shared/constants/designTokens';
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

  modalGradientBorder: {
    borderRadius: scale(24),
    padding: PerfectSpacing.xs,
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
    letterSpacing: scale(-0.8),
    flex: 1,
    textAlign: 'center',
    paddingRight: PerfectSpacing.xl,
  },

  closeButton: {
    position: 'absolute',
    top: PerfectSpacing.md,
    right: PerfectSpacing.md,
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
    padding: PerfectSpacing.lg,
    gap: PerfectSpacing.base,
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
    marginBottom: PerfectSpacing.sm,
  },

  sectionDivider: {
    height: scale(1),
    backgroundColor: Colors.neutral[200],
    marginVertical: PerfectSpacing.base,
  },

  finalMessageContainer: {
    marginTop: PerfectSpacing.lg,
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
    marginBottom: PerfectSpacing.base,
    fontStyle: 'italic',
  },

  pillarsContainer: {
    gap: PerfectSpacing.base,
  },

  pillarItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: PerfectSpacing.md,
    marginBottom: PerfectSpacing.md,
  },

  pillarIcon: {
    marginTop: scale(2),
  },

  pillarTitle: {
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: PerfectSpacing.xs,
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
