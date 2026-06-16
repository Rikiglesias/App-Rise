import { StyleSheet } from 'react-native';

import { Typography } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { circularCloseButton } from '@/shared/styles';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

/**
 * Stili per i modal della sezione About
 * Ottimizzati per contenuto lungo e scrolling - SISTEMA COERENTE
 */
export const createModalStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 0,
      paddingVertical: 0,
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
      width: '90%',
      maxHeight: '85%',
    },

    modalCard: {
      backgroundColor: colors.neutral[0], // Bianco
      borderRadius: scale(24),
      borderWidth: scale(3),
      borderColor: colors.primary[500], // Bordo rosso
      overflow: 'hidden',
      height: '100%',
      width: '100%',
    },

    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: PerfectSpacing.lg,
      paddingTop: PerfectSpacing.lg,
      paddingBottom: PerfectSpacing.base,
      borderBottomWidth: scale(1),
      borderBottomColor: colors.neutral[200],
      position: 'relative',
      minHeight: scale(56),
      height: 'auto',
      flexShrink: 0,
    },

    modalTitle: {
      fontWeight: Typography.weights.black,
      color: colors.neutral[900], // Nero su bianco
      letterSpacing: 0,
      flex: 1,
      textAlign: 'center',
      paddingRight: PerfectSpacing.lg,
    },

    closeButton: {
      position: 'absolute',
      top: PerfectSpacing.md,
      right: PerfectSpacing.md,
      zIndex: 9999,
      elevation: 10,
      ...circularCloseButton(32, colors.neutral[900]),
    },

    storyContainer: {
      padding: PerfectSpacing.lg,
      gap: PerfectSpacing.lg,
      paddingBottom: PerfectSpacing['3xl'],
    },

    storyTitle: {
      fontWeight: Typography.weights.bold,
      color: colors.neutral[900],
      textAlign: 'center',
      marginBottom: PerfectSpacing.sm,
    },

    storyText: {
      fontWeight: Typography.weights.regular,
      color: colors.neutral[900], // Nero su bianco
      lineHeight: scale(28),
      textAlign: 'left',
      letterSpacing: 0,
    },

    highlightText: {
      color: colors.primary[500],
      fontWeight: Typography.weights.bold,
    },

    sectionTitle: {
      fontWeight: Typography.weights.bold,
      color: colors.neutral[900], // Nero su bianco
      marginBottom: PerfectSpacing.md,
      marginTop: PerfectSpacing.sm,
      letterSpacing: 0,
    },

    sectionDivider: {
      height: scale(1),
      backgroundColor: colors.neutral[200],
      marginVertical: PerfectSpacing.lg,
    },

    finalCard: {
      backgroundColor: colors.neutral[100], // Grigio chiaro
      borderRadius: scale(16),
      padding: PerfectSpacing.lg,
      borderWidth: scale(2),
      borderColor: colors.primary[500], // Rosso
      gap: PerfectSpacing.md,
    },

    finalMessage: {
      fontWeight: Typography.weights.regular,
      color: colors.neutral[900], // Nero
      textAlign: 'center',
      lineHeight: scale(24),
      letterSpacing: 0,
    },

    finalHighlight: {
      fontWeight: Typography.weights.bold,
      color: colors.neutral[900], // Nero
      textAlign: 'center',
      lineHeight: scale(24),
      letterSpacing: 0,
    },

    introCard: {
      backgroundColor: colors.neutral[50], // Grigio chiarissimo
      borderRadius: scale(12),
      padding: PerfectSpacing.md,
      borderLeftWidth: scale(4),
      borderLeftColor: colors.primary[500], // Rosso
    },

    introText: {
      fontWeight: Typography.weights.semibold,
      color: colors.neutral[900], // Nero
      textAlign: 'left',
      letterSpacing: 0,
      lineHeight: scale(20),
    },

    italyCard: {
      backgroundColor: colors.neutral[50],
      borderRadius: scale(16),
      padding: PerfectSpacing.lg,
      borderWidth: scale(1),
      borderColor: colors.neutral[300],
    },

    cardText: {
      fontWeight: Typography.weights.regular,
      color: colors.neutral[900], // Nero
      lineHeight: scale(24),
      letterSpacing: 0,
      marginTop: PerfectSpacing.sm,
    },

    mainSectionTitle: {
      fontWeight: Typography.weights.black,
      color: colors.neutral[900], // Nero
      textAlign: 'center',
      letterSpacing: 0,
      marginBottom: PerfectSpacing.md,
    },

    pillarsContainer: {
      gap: PerfectSpacing.lg,
    },

    pillarCard: {
      backgroundColor: colors.neutral[50],
      borderRadius: scale(16),
      padding: PerfectSpacing.lg,
      borderWidth: scale(2),
      borderColor: colors.neutral[300],
      alignItems: 'center',
      gap: PerfectSpacing.md,
    },

    pillarIcon: {
      textAlign: 'center',
    },

    pillarTitle: {
      fontWeight: Typography.weights.bold,
      color: colors.neutral[900], // Nero
      textAlign: 'center',
      letterSpacing: 0,
      lineHeight: scale(22),
    },

    pillarText: {
      fontWeight: Typography.weights.regular,
      color: colors.neutral[900], // Nero
      textAlign: 'center',
      lineHeight: scale(22),
      letterSpacing: 0,
    },
  });
