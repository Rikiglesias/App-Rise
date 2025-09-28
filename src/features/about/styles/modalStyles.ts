import { StyleSheet } from 'react-native';

import responsiveSystem, {
  SpacingTokens as Spacing,
  DesignTokens,
  ShadowTokens,
  scaleDimensionLinear,
} from '../../../shared/constants/responsiveSystem';
import { Colors, Typography } from '../../../shared/constants';

/**
 * Stili per i modal della sezione About
 * Ottimizzati per contenuto lungo e scrolling - SISTEMA COERENTE
 */
export const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },

  modalContainer: {
    maxWidth: scaleDimensionLinear(
      (responsiveSystem?.LOGICAL_REFERENCE?.width ?? 393) * 0.9
    ),
    width: '100%',
    maxHeight: '90%',
    minHeight: scaleDimensionLinear(700), // Sistema responsive
    height: '85%',
  },

  modalGradientBorder: {
    borderRadius: DesignTokens.borderRadius.xlarge, // Sistema responsive
    padding: Spacing[1], // Sistema responsive (4dp)
    ...ShadowTokens.xl, // Sistema ombre coerente
    height: '100%',
    minHeight: scaleDimensionLinear(700), // Sistema responsive
  },

  modalWhiteContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: Math.max(0, DesignTokens.borderRadius.xlarge - Spacing[1]), // Sistema responsive
    overflow: 'hidden',
    height: '100%',
    minHeight: scaleDimensionLinear(650), // Sistema responsive
  },

  modalContent: {
    height: '100%',
    flexDirection: 'column',
    minHeight: scaleDimensionLinear(600), // Sistema responsive
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing[4],
    borderBottomWidth: DesignTokens.borderRadius.none + 1, // 1dp responsive
    borderBottomColor: Colors.neutral[200],
    position: 'relative',
    height: DesignTokens.components.buttonHeight.large + Spacing[4], // Sistema responsive
    minHeight: DesignTokens.components.buttonHeight.large + Spacing[4], // Sistema responsive
    flexShrink: 0,
  },

  modalTitle: {
    fontWeight: Typography.weights.black,
    color: '#DC2626',
    letterSpacing: -0.8,
    flex: 1,
    textAlign: 'center',
    paddingRight: Spacing[8],
  },

  closeButton: {
    position: 'absolute',
    top: Spacing[3],
    right: Spacing[3],
    width: DesignTokens.components.iconSize.large, // Sistema responsive (32dp)
    height: DesignTokens.components.iconSize.large, // Sistema responsive (32dp)
    borderRadius: DesignTokens.components.iconSize.large / 2, // Sistema responsive
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    ...ShadowTokens.sm, // Sistema ombre coerente
  },

  storyScroll: {
    height: scaleDimensionLinear(500), // Sistema responsive
    minHeight: scaleDimensionLinear(500), // Sistema responsive
  },

  storyContainer: {
    padding: Spacing[6],
    gap: Spacing[4],
    minHeight: scaleDimensionLinear(800), // Sistema responsive
    flexGrow: 1,
    paddingBottom: Spacing[12],
  },

  storyTitle: {
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: Spacing[2],
  },

  storyText: {
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[700],
    lineHeight: DesignTokens.layout.unit * 3, // Sistema responsive (24dp)
    textAlign: 'justify',
    letterSpacing: 0.3,
  },

  highlightText: {
    color: '#DC2626',
    fontWeight: Typography.weights.bold,
  },

  sectionTitle: {
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing[2],
  },

  sectionDivider: {
    height: DesignTokens.borderRadius.none + 1, // 1dp responsive
    backgroundColor: Colors.neutral[200],
    marginVertical: Spacing[4],
  },

  finalMessageContainer: {
    marginTop: Spacing[6],
    alignItems: 'center',
  },

  finalMessage: {
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: DesignTokens.layout.unit * 2.5, // Sistema responsive (20dp)
    letterSpacing: 0.3,
  },

  introText: {
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: Spacing[4],
    fontStyle: 'italic',
  },

  pillarsContainer: {
    gap: Spacing[4],
  },

  pillarItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
    marginBottom: Spacing[3],
  },

  pillarIcon: {
    marginTop: Spacing[1] / 2, // Sistema responsive (2dp)
  },

  pillarTitle: {
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing[1],
  },

  pillarContent: {
    flex: 1,
  },

  pillarText: {
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[700],
    lineHeight: DesignTokens.layout.unit * 2.75, // Sistema responsive (22dp)
  },
});
