import { StyleSheet } from 'react-native';

import {
  BorderRadius,
  Colors,
  PerfectSpacing,
  Shadows,
  Typography,
} from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';

export const impactScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: PerfectSpacing.lg,
    paddingTop: PerfectSpacing['3xl'],
  },
  headerTitle: {
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: PerfectSpacing.sm,
  },
  headerSubtitle: {
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: PerfectSpacing.xl,
  },
  mainStatCard: {
    borderRadius: BorderRadius['2xl'],
    padding: PerfectSpacing.lg,
    alignItems: 'center',
    ...Shadows.lg,
    marginBottom: PerfectSpacing.lg,
  },
  mainIcon: {
    marginBottom: PerfectSpacing.md,
    opacity: 0.8,
  },
  mainStatValue: {
    fontWeight: Typography.weights.black,
    color: Colors.neutral[0],
  },
  mainStatLabel: {
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[0],
    opacity: 0.9,
    marginTop: PerfectSpacing.xs,
  },
  quickStatsContainer: {
    gap: PerfectSpacing.base,
  },
  section: {
    marginTop: PerfectSpacing.xl,
  },
  sectionTitle: {
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
    marginBottom: PerfectSpacing.base,
    paddingHorizontal: PerfectSpacing.sm,
  },
  storiesScroll: {
    paddingHorizontal: PerfectSpacing.sm,
    paddingBottom: PerfectSpacing.base,
    gap: PerfectSpacing.base,
  },
  milestonesContainer: {
    gap: PerfectSpacing.md,
  },
  mapSection: {
    marginTop: PerfectSpacing.xl,
    marginBottom: PerfectSpacing.lg,
  },
  mapPreview: {
    backgroundColor: Colors.primary[100],
    borderRadius: BorderRadius.xl,
    height: scale(140),
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
    position: 'relative',
    overflow: 'hidden',
  },
  mapOverlay: {
    alignItems: 'center',
    zIndex: 1,
  },
  mapPreviewText: {
    fontWeight: Typography.weights.semibold,
    color: Colors.neutral[0],
    marginTop: PerfectSpacing.sm,
    textAlign: 'center',
  },
});
