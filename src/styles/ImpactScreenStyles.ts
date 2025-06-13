import { StyleSheet } from 'react-native';
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from '../shared/constants/designTokens';

export const impactScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: Spacing[6],
    paddingTop: Spacing[12],
  },
  headerTitle: {
    fontSize: Typography.sizes['4xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: Spacing[2],
  },
  headerSubtitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: Spacing[8],
  },
  mainStatCard: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[6],
    alignItems: 'center',
    ...Shadows.lg,
    marginBottom: Spacing[6],
  },
  mainIcon: {
    marginBottom: Spacing[3],
    opacity: 0.8,
  },
  mainStatValue: {
    fontSize: Typography.sizes['5xl'],
    fontWeight: Typography.weights.black,
    color: Colors.neutral[0],
  },
  mainStatLabel: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[0],
    opacity: 0.9,
    marginTop: Spacing[1],
  },
  quickStatsContainer: {
    gap: Spacing[4],
  },
  section: {
    marginTop: Spacing[8],
  },
  sectionTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
    marginBottom: Spacing[4],
    paddingHorizontal: Spacing[2],
  },
  storiesScroll: {
    paddingHorizontal: Spacing[2],
    paddingBottom: Spacing[4],
    gap: Spacing[4],
  },
  milestonesContainer: {
    gap: Spacing[3],
  },
  mapSection: {
    marginTop: Spacing[8],
    marginBottom: Spacing[6],
  },
  mapPreview: {
    backgroundColor: Colors.primary[100],
    borderRadius: BorderRadius.xl,
    height: 140,
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
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutral[0],
    marginTop: Spacing[2],
    textAlign: 'center',
  },
});
