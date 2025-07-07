import { StyleSheet } from 'react-native';

import {
  Colors,
  Spacing,
  Typography,
} from '../../../shared/constants/designTokens';
import { HomeHeaderTokens } from '../design-tokens/HomeHeaderTokens';

/**
 * Stili per la sezione Mission del header
 * Utilizza i design tokens centralizzati
 */
export const headerMissionStyles = StyleSheet.create({
  // Gradient Container Pattern del Design System
  outerGradientContainer: {
    marginTop: Spacing[4],
    marginHorizontal: Spacing[4],
    borderRadius: HomeHeaderTokens.borderRadius.large,
    ...HomeHeaderTokens.shadows.large,
  },
  gradientBorder: {
    borderRadius: HomeHeaderTokens.borderRadius.large,
    padding: 3,
  },
  missionContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: HomeHeaderTokens.borderRadius.medium,
    padding: Spacing[5],
  },

  // 🎨 NUOVI STILI GRADIENT TITLE - DESIGN SYSTEM 2025
  titleGradientContainer: {
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  // CORREZIONE UX: Stile titolo NON cliccabile - Design System
  titleContent: {
    backgroundColor: HomeHeaderTokens.colors.transparent,
    borderRadius: HomeHeaderTokens.borderRadius.small,
    borderWidth: 1,
    borderColor: HomeHeaderTokens.colors.primaryLight,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2] + 2,
    alignItems: 'center',
    ...HomeHeaderTokens.shadows.medium,
  },
  // Underline decorativo per separazione - DESIGN SYSTEM
  titleUnderline: {
    marginTop: Spacing[2],
    height: 3,
    width: HomeHeaderTokens.dimensions.separatorWidth,
    backgroundColor: HomeHeaderTokens.colors.primary,
    borderRadius: 2,
    ...HomeHeaderTokens.shadows.light,
  },
  impactTitleGradient: {
    fontWeight: Typography.weights.black,
    color: HomeHeaderTokens.colors.primary,
    textAlign: 'center',
    letterSpacing: -0.6,
    lineHeight: 30,
    textShadowColor: HomeHeaderTokens.colors.primaryShadow,
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  // Typography Smart per il testo descrittivo - RESPONSIVE
  missionText: {
    fontWeight: Typography.weights.bold,
    color: HomeHeaderTokens.colors.secondary,
    textAlign: 'center',
    letterSpacing: 0.4,
    marginBottom: Spacing[5],
    textShadowColor: HomeHeaderTokens.colors.secondaryLight,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  statsBox: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
    borderRadius: HomeHeaderTokens.borderRadius.small,
    borderWidth: 2,
    padding: Spacing[3],
    alignItems: 'center',
    ...HomeHeaderTokens.shadows.card,
  },
  mealsBox: {
    borderColor: HomeHeaderTokens.colors.primary,
    shadowColor: HomeHeaderTokens.colors.primary,
  },
  volunteersBox: {
    borderColor: HomeHeaderTokens.colors.secondary,
    shadowColor: HomeHeaderTokens.colors.secondary,
  },
  statNumber: {
    fontWeight: Typography.weights.black,
    color: Colors.neutral[900],
    marginBottom: Spacing[1],
  },
  statLabel: {
    color: Colors.neutral[700],
    textAlign: 'center',
  },
  infoIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },

  // Stili per il modal
  modalOverlay: {
    flex: 1,
    backgroundColor: HomeHeaderTokens.colors.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing[4],
  },
  modalContainer: {
    width: '100%',
    maxWidth: HomeHeaderTokens.dimensions.modalMaxWidth,
    borderRadius: HomeHeaderTokens.borderRadius.large,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 3,
  },
  modalContent: {
    backgroundColor: Colors.neutral[0],
    borderRadius: HomeHeaderTokens.borderRadius.medium,
    padding: Spacing[5],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  modalTitle: {
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
  },
  closeButton: {
    padding: Spacing[1],
  },
  breakdownContainer: {
    gap: Spacing[3],
    marginBottom: Spacing[4],
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  breakdownBadge: {
    width: HomeHeaderTokens.dimensions.logoSmall,
    height: HomeHeaderTokens.dimensions.logoSmall,
    borderRadius: HomeHeaderTokens.borderRadius.round,
    backgroundColor: Colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: HomeHeaderTokens.colors.primary,
  },
  breakdownText: {
    flex: 1,
  },
  breakdownNumber: {
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
  },
  breakdownLabel: {
    color: Colors.neutral[700],
    marginTop: 2,
  },
  breakdownDescription: {
    color: Colors.neutral[500],
    marginTop: 1,
  },
  totalContainer: {
    paddingTop: Spacing[3],
  },
  totalLine: {
    height: 1,
    backgroundColor: Colors.neutral[200],
    marginBottom: Spacing[3],
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontWeight: Typography.weights.semibold,
    color: Colors.neutral[700],
  },
  totalNumber: {
    fontWeight: Typography.weights.black,
    color: HomeHeaderTokens.colors.primary,
  },
});
