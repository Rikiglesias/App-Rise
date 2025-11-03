import { StyleSheet, Platform } from 'react-native';

import { PerfectSpacing, BorderRadius, Colors } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { decorativeSeparator } from '@/shared/styles';

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
    top: PerfectSpacing['2xl'],
    left: PerfectSpacing.base,
    padding: PerfectSpacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[0],
    borderWidth: scale(1),
    borderColor: Colors.neutral[300],
    zIndex: 10,
    ...Platform.select({
      android: {
        elevation: 10,
      },
      ios: {
        shadowColor: Colors.neutral[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },

  contentContainer: {
    paddingHorizontal: PerfectSpacing.base,
    gap: PerfectSpacing.none,
    paddingTop: PerfectSpacing['4xl'],
    paddingBottom: PerfectSpacing['3xl'],
  },

  sectionDividerContainer: {
    paddingHorizontal: PerfectSpacing.base,
    paddingVertical: PerfectSpacing.base,
    alignItems: 'center',
  },

  sectionDivider: {
    ...decorativeSeparator(),
    width: '60%',
  },
});
