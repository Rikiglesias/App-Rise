import { StyleSheet } from 'react-native';

import { PerfectSpacing, Typography } from '@/shared/constants';
import { scale, scaleTouch } from '@/shared/constants/perfectScale';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

/**
 * Stili per la sezione contatti (dark-aware via factory).
 * Light byte-identico (createX(Colors) === StyleSheet originale).
 */
export const createContactSectionStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    categoryContainer: {
      marginBottom: PerfectSpacing.xs,
    },

    categoryHeader: {
      paddingTop: PerfectSpacing.md,
      paddingHorizontal: PerfectSpacing.base,
      paddingBottom: PerfectSpacing.sm,
      alignItems: 'center',
      marginBottom: PerfectSpacing.lg,
    },

    categoryTitle: {
      color: colors.primary[500],
      textAlign: 'center',
      letterSpacing: scale(-1.0),
      includeFontPadding: false,
    },

    descriptionText: {
      color: colors.neutral[700],
      textAlign: 'center',
      letterSpacing: 0,
      marginTop: PerfectSpacing.xs,
      opacity: 0.9,
    },

    contactsGrid: {
      flexDirection: 'column',
      alignItems: 'center',
      gap: PerfectSpacing.base,
    },
  });

/**
 * Stili per i contatti animati (dark-aware via factory).
 */
export const createAnimatedContactStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    contactButtonContainer: {
      width: '100%',
      maxWidth: scale(400),
      alignSelf: 'center',
    },

    contactTouchable: {
      borderRadius: scale(16),
      overflow: 'hidden',
    },

    contactCard: {
      backgroundColor: colors.neutral[0],
      borderRadius: scale(16),
      borderWidth: 2,
      borderColor: colors.neutral[700],
      padding: scale(16),
      minHeight: scaleTouch(72),
      justifyContent: 'center',
      alignItems: 'stretch',
    },

    contactContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: PerfectSpacing.base,
    },

    contactTextContainer: {
      flex: 1,
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
    },

    contactButtonTitle: {
      fontWeight: Typography.weights.bold,
      color: colors.neutral[800],
      marginBottom: PerfectSpacing.xs,
      letterSpacing: 0,
      textAlign: 'left',
      alignSelf: 'flex-start',
    },

    contactButtonSubtitle: {
      fontWeight: Typography.weights.medium,
      color: colors.neutral[600],
      letterSpacing: 0,
      textAlign: 'left',
      alignSelf: 'flex-start',
    },
  });
