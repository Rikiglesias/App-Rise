import { StyleSheet } from 'react-native';

import { PerfectSpacing, BorderRadius, Shadows } from '../../shared/constants';
import { scale } from '../../shared/constants/perfectScale';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

/** Stili del bottom-sheet di dettaglio destinazione (mappa impatto). */
export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    // Sfondo del sheet (angoli alti arrotondati) + grabber.
    sheetBackground: {
      backgroundColor: colors.neutral[0],
      borderTopLeftRadius: BorderRadius.xl,
      borderTopRightRadius: BorderRadius.xl,
    },
    handleIndicator: {
      backgroundColor: colors.neutral[300],
      width: scale(40),
      height: scale(4),
    },
    // Header gradient brand: primo elemento, angoli alti coerenti col sheet.
    header: {
      paddingTop: PerfectSpacing.base,
      paddingBottom: PerfectSpacing.lg,
      paddingHorizontal: PerfectSpacing.base,
      borderTopLeftRadius: BorderRadius.xl,
      borderTopRightRadius: BorderRadius.xl,
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
      paddingBottom: PerfectSpacing['3xl'],
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
    statsNote: {
      color: colors.neutral[500],
      fontStyle: 'italic',
      marginTop: scale(-PerfectSpacing.sm),
      marginBottom: PerfectSpacing.lg,
    },
    description: {
      color: colors.neutral[700],
      marginBottom: PerfectSpacing.lg,
    },
    // Traccia di tracciabilità origine → hub → destinazione (concept "Ibrido").
    traceSection: {
      backgroundColor: colors.neutral[50],
      borderRadius: scale(16),
      borderWidth: scale(1),
      borderColor: colors.neutral[200],
      padding: PerfectSpacing.base,
      marginBottom: PerfectSpacing.lg,
    },
    traceHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: PerfectSpacing.sm,
    },
    traceHeaderIcon: {
      marginRight: PerfectSpacing.sm,
    },
    traceStep: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    traceStepIcon: {
      width: scale(28),
      alignItems: 'center',
      marginRight: PerfectSpacing.sm,
    },
    traceStepText: {
      color: colors.neutral[800],
      flex: 1,
    },
    traceStepCaption: {
      color: colors.neutral[500],
      flex: 1,
    },
    traceConnector: {
      width: scale(2),
      height: PerfectSpacing.base,
      backgroundColor: colors.primary[300],
      marginLeft: scale(13),
      marginVertical: scale(2),
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
