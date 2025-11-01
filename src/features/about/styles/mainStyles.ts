import { StyleSheet } from 'react-native';

import { Spacing } from '@/shared/constants/designTokens';
import { BorderRadius, Colors } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';

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
    top: scale(60),
    left: Spacing[4],
    padding: Spacing[2],
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
    paddingHorizontal: Spacing[4],
    gap: Spacing[0],
    paddingTop: Spacing[12],
    paddingBottom: Spacing[12],
  },

  sectionDividerContainer: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
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
