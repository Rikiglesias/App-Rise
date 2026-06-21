import { StyleSheet } from 'react-native';

import { PerfectSpacing, BorderRadius, Shadows } from '../../shared/constants';
import { scale } from '../../shared/constants/perfectScale';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

/** Stili del modal di dettaglio location (mappa impatto). */
export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: colors.neutral[0],
    },
    header: {
      paddingTop: PerfectSpacing['3xl'],
      paddingBottom: PerfectSpacing.lg,
      paddingHorizontal: PerfectSpacing.base,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    flag: {
      marginRight: PerfectSpacing.md,
    },
    headerTextContainer: {
      flex: 1,
    },
    // Testo SU gradient brand (rosso): bianco fisso, leggibile in light e dark.
    title: {
      color: colors.accent.white,
    },
    subtitle: {
      color: colors.accent.white,
      opacity: 0.9,
    },
    closeButton: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
      backgroundColor: colors.glass.medium,
      justifyContent: 'center',
      alignItems: 'center',
    },
    yearBadge: {
      alignSelf: 'flex-start',
      marginTop: PerfectSpacing.md,
      backgroundColor: colors.glass.medium,
      paddingHorizontal: PerfectSpacing.sm,
      paddingVertical: scale(4),
      borderRadius: BorderRadius.full,
    },
    yearText: {
      color: colors.accent.white,
    },
    content: {
      padding: PerfectSpacing.lg,
      paddingBottom: PerfectSpacing['2xl'],
    },
    statGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: PerfectSpacing.sm,
      marginBottom: PerfectSpacing.lg,
    },
    statCell: {
      flex: 1,
      minWidth: scale(96),
      backgroundColor: colors.neutral[50],
      borderRadius: scale(16),
      borderWidth: scale(1),
      borderColor: colors.neutral[200],
      paddingVertical: PerfectSpacing.base,
      paddingHorizontal: PerfectSpacing.sm,
      alignItems: 'center',
    },
    statValue: {
      color: colors.primary[600],
    },
    statLabel: {
      color: colors.neutral[600],
      marginTop: scale(4),
    },
    description: {
      color: colors.neutral[700],
      marginBottom: PerfectSpacing.lg,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: PerfectSpacing.base,
    },
    infoIcon: {
      marginRight: PerfectSpacing.sm,
      marginTop: scale(2),
    },
    infoTextWrap: {
      flex: 1,
    },
    infoLabel: {
      color: colors.neutral[500],
      letterSpacing: scale(0.5),
      marginBottom: scale(2),
    },
    infoValue: {
      color: colors.neutral[800],
    },
    achievements: {
      marginTop: PerfectSpacing.sm,
      marginBottom: PerfectSpacing.lg,
    },
    achievementRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: PerfectSpacing.sm,
    },
    achievementIcon: {
      marginRight: PerfectSpacing.sm,
      marginTop: scale(2),
    },
    achievementText: {
      color: colors.neutral[700],
      flex: 1,
    },
    ctaButton: {
      backgroundColor: colors.primary[500],
      paddingVertical: PerfectSpacing.base,
      paddingHorizontal: PerfectSpacing.xl,
      borderRadius: BorderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadows.primary,
      marginTop: PerfectSpacing.sm,
    },
    ctaIcon: {
      marginRight: PerfectSpacing.sm,
    },
    ctaText: {
      color: colors.accent.white,
      textAlign: 'center',
    },
  });
