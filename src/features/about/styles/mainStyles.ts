import { StyleSheet } from 'react-native';

import { PerfectSpacing, BorderRadius, Colors } from '@/shared/constants';
import { scale, scaleSpacing } from '@/shared/constants/perfectScale';

/**
 * Stili principali per la sezione About
 * Layout base, containers e separatori comuni
 */
export const mainStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },

  backButton: {
    position: 'absolute',
    top: scaleSpacing(60),
    left: PerfectSpacing.base,
    padding: PerfectSpacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[0],
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: scale(3) },
    shadowOpacity: 0.25,
    shadowRadius: scale(8),
    elevation: 6,
    zIndex: 10,
  },

  contentContainer: {
    paddingHorizontal: PerfectSpacing.base,
    gap: PerfectSpacing.none,
    paddingTop: PerfectSpacing['3xl'],
    paddingBottom: PerfectSpacing['3xl'],
  },

  sectionDividerContainer: {
    paddingHorizontal: PerfectSpacing.base,
    paddingVertical: PerfectSpacing.base,
    alignItems: 'center',
  },

  sectionDivider: {
    height: scale(2),
    backgroundColor: Colors.neutral[300],
    width: '60%',
    borderRadius: scale(1),
    opacity: 0.8,
    shadowColor: Colors.neutral[400],
    shadowOffset: { width: 0, height: scale(1) },
    shadowOpacity: 0.15,
    shadowRadius: scale(3),
    elevation: 2,
  },
});
