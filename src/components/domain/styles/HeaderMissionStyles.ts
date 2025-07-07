import { StyleSheet } from 'react-native';
import {
  Colors,
  Spacing,
  Typography,
} from '../../../shared/constants/designTokens';
import { HomeHeaderDesignTokens } from '../design-tokens/HomeHeaderTokens';

// Stili per il modal dei pasti e sezione impatto - CON DESIGN TOKENS
export const baseMissionStyles = StyleSheet.create({
  // Gradient Container Pattern del Design System
  outerGradientContainer: {
    marginTop: Spacing[4],
    marginHorizontal: Spacing[4],
    borderRadius: HomeHeaderDesignTokens.borderRadius.large,
    ...HomeHeaderDesignTokens.shadows.large,
  },
  gradientBorder: {
    borderRadius: HomeHeaderDesignTokens.borderRadius.large,
    padding: 3,
  },
  missionContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: HomeHeaderDesignTokens.borderRadius.medium,
    padding: Spacing[5],
  },
  // Titolo principale "Il nostro impatto sul mondo" - ROSSO

  // 🎨 NUOVI STILI GRADIENT TITLE - DESIGN SYSTEM 2025
  titleGradientContainer: {
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  // CORREZIONE UX: Stile titolo NON cliccabile - Design System
  titleContent: {
    backgroundColor: HomeHeaderDesignTokens.colors.transparent,
    borderRadius: HomeHeaderDesignTokens.borderRadius.small,
    borderWidth: 1,
    borderColor: HomeHeaderDesignTokens.colors.primaryLight,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2] + 2,
    alignItems: 'center',
    ...HomeHeaderDesignTokens.shadows.medium,
  },
  // Underline decorativo per separazione - DESIGN SYSTEM
  titleUnderline: {
    marginTop: Spacing[2],
    height: 3,
    width: HomeHeaderDesignTokens.dimensions.separatorWidth,
    backgroundColor: HomeHeaderDesignTokens.colors.primary,
    borderRadius: 2,
    ...HomeHeaderDesignTokens.shadows.light,
  },
  impactTitleGradient: {
    fontWeight: Typography.weights.black,
    color: HomeHeaderDesignTokens.colors.primary,
    textAlign: 'center',
    letterSpacing: -0.6,
    lineHeight: 30,
    textShadowColor: HomeHeaderDesignTokens.colors.primaryShadow,
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  // Typography Smart per il testo descrittivo - RESPONSIVE
  missionText: {
    fontWeight: Typography.weights.bold,
    color: HomeHeaderDesignTokens.colors.secondary,
    textAlign: 'center',
    letterSpacing: 0.4,
    marginBottom: Spacing[5],
    textShadowColor: HomeHeaderDesignTokens.colors.secondaryLight,
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
    borderRadius: HomeHeaderDesignTokens.borderRadius.small,
    borderWidth: 2,
    padding: Spacing[3],
    alignItems: 'center',
    ...HomeHeaderDesignTokens.shadows.card,
  },
  mealsBox: {
    borderColor: HomeHeaderDesignTokens.colors.primary,
    shadowColor: HomeHeaderDesignTokens.colors.primary,
  },
  volunteersBox: {
    borderColor: HomeHeaderDesignTokens.colors.secondary,
    shadowColor: HomeHeaderDesignTokens.colors.secondary,
  },
  statNumber: {
    // fontSize rimosso - ora gestito da Text
    fontWeight: Typography.weights.black,
    color: Colors.neutral[900],
    marginBottom: Spacing[1],
  },
  statLabel: {
    // fontSize gestito da FormattedText variant="body-small"
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
    backgroundColor: HomeHeaderDesignTokens.colors.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing[4],
  },
  modalContainer: {
    width: '100%',
    maxWidth: HomeHeaderDesignTokens.dimensions.modalMaxWidth,
    borderRadius: HomeHeaderDesignTokens.borderRadius.large,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 3,
  },
  modalContent: {
    backgroundColor: Colors.neutral[0],
    borderRadius: HomeHeaderDesignTokens.borderRadius.medium,
    padding: Spacing[5],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  modalTitle: {
    fontWeight: Typography.weights.black,
    color: HomeHeaderDesignTokens.colors.primary,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  modalCloseButton: {
    backgroundColor: Colors.neutral[100],
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...HomeHeaderDesignTokens.shadows.card,
  },
  modalSection: {
    marginBottom: Spacing[4],
  },
  modalSectionTitle: {
    fontWeight: Typography.weights.bold,
    color: HomeHeaderDesignTokens.colors.secondary,
    marginBottom: Spacing[2],
    textAlign: 'center',
  },
  modalText: {
    color: Colors.neutral[700],
    textAlign: 'center',
    lineHeight: 22,
  },
  modalHighlight: {
    backgroundColor: Colors.primary[50],
    borderRadius: HomeHeaderDesignTokens.borderRadius.small,
    padding: Spacing[3],
    marginVertical: Spacing[2],
    borderLeftWidth: 4,
    borderLeftColor: HomeHeaderDesignTokens.colors.primary,
    ...HomeHeaderDesignTokens.shadows.light,
  },
  modalHighlightText: {
    fontWeight: Typography.weights.bold,
    color: HomeHeaderDesignTokens.colors.primary,
    textAlign: 'center',
  },
  modalActions: {
    marginTop: Spacing[4],
    alignItems: 'center',
  },
  modalButton: {
    backgroundColor: HomeHeaderDesignTokens.colors.primary,
    borderRadius: HomeHeaderDesignTokens.borderRadius.small,
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[3],
    ...HomeHeaderDesignTokens.shadows.medium,
  },
  modalButtonText: {
    color: Colors.neutral[0],
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
  },
  // STILI MANCANTI AGGIUNTI
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
    width: HomeHeaderDesignTokens.dimensions.logoSmall,
    height: HomeHeaderDesignTokens.dimensions.logoSmall,
    borderRadius: HomeHeaderDesignTokens.borderRadius.round,
    backgroundColor: Colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: HomeHeaderDesignTokens.colors.primary,
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
    color: HomeHeaderDesignTokens.colors.primary,
  },
});
