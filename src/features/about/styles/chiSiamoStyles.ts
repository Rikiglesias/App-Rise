import { StyleSheet } from 'react-native';

import { PerfectSpacing, Colors } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';

/**
 * Stili per la sezione Chi Siamo
 * Design coordinato con la pagina azioni per consistenza
 */
export const chiSiamoSectionStyles = StyleSheet.create({
  categoryContainer: {
    marginBottom: PerfectSpacing.sm,
  },

  headerContainer: {
    paddingTop: PerfectSpacing.md,
    paddingHorizontal: PerfectSpacing.base,
    paddingBottom: PerfectSpacing.sm,
    alignItems: 'center',
    position: 'relative',
  },

  titleHeaderContainer: {
    alignItems: 'center',
    backgroundColor: Colors.neutral[100],
    borderWidth: scale(1),
    borderColor: Colors.neutral[400],
    borderRadius: scale(16),
    width: '100%',
  },

  titleClickableContainer: {
    alignItems: 'center',
    flex: 1,
  },

  categoryTitle: {
    color: Colors.neutral[900],
    textAlign: 'center',
    letterSpacing: scale(-1.0),
    includeFontPadding: false,
  },

  descriptionText: {
    color: Colors.neutral[700],
    textAlign: 'center',
    letterSpacing: scale(0.2),
    marginTop: PerfectSpacing.xs,
    opacity: 0.9,
  },

  infoIconImproved: {
    position: 'absolute',
    right: scale(8),
    top: '30%',
    transform: [{ translateY: -14 }],
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: Colors.neutral[0],
    borderWidth: 2,
    borderColor: Colors.neutral[400],
    justifyContent: 'center',
    alignItems: 'center',
  },
});
