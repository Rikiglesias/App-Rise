import { StyleSheet } from 'react-native';

import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

/**
 * Stili per la sezione Chi Siamo (dark-aware via factory)
 * Design coordinato con la pagina azioni per consistenza.
 * In light i colori sono identici a prima (useThemeColors(false) === Colors).
 */
export const createChiSiamoSectionStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
      backgroundColor: colors.neutral[100],
      borderWidth: scale(1),
      borderColor: colors.neutral[400],
      borderRadius: scale(16),
      width: '100%',
    },

    titleClickableContainer: {
      alignItems: 'center',
      flex: 1,
    },

    categoryTitle: {
      color: colors.neutral[900],
      textAlign: 'center',
      letterSpacing: scale(-1.0),
      includeFontPadding: false,
    },

    descriptionText: {
      color: colors.neutral[700],
      textAlign: 'center',
      letterSpacing: scale(0.2),
      marginTop: PerfectSpacing.xs,
      opacity: 0.9,
    },

    infoIconImproved: {
      position: 'absolute',
      right: scale(8),
      top: '30%',
      transform: [{ translateY: scale(-14) }],
      width: scale(32),
      height: scale(32),
      borderRadius: 999,
      backgroundColor: colors.neutral[0],
      borderWidth: 2,
      borderColor: colors.neutral[400],
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
