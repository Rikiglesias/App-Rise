import { StyleSheet } from 'react-native';

import {
  Spacing,
  Colors,
  Typography,
  Shadows,
} from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';

/**
 * Stili per la sezione Chi Siamo
 * Design coordinato con la pagina azioni per consistenza
 */
export const chiSiamoSectionStyles = StyleSheet.create({
  categoryContainer: {
    marginBottom: Spacing[2],
  },

  headerContainer: {
    paddingTop: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[2],
    alignItems: 'center',
    position: 'relative',
  },

  titleHeaderContainer: {
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    borderWidth: scale(1),
    borderColor: Colors.primary[100],
    shadowColor: Colors.primary[600],
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.08,
    shadowRadius: scale(8),
    elevation: 3,
    width: '100%',
  },

  titleWithInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
    marginBottom: Spacing[4],
  },

  titleTouchableArea: {
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
  },

  titleContainer: {
    position: 'relative',
    alignItems: 'center',
  },

  categoryTitle: {
    fontWeight: Typography.weights.black,
    color: Colors.neutral[900],
    textAlign: 'center',
    letterSpacing: scale(-1.0),
    includeFontPadding: false,
    textShadowColor: Colors.neutral[900],
    textShadowOffset: { width: 0, height: scale(2) },
    textShadowRadius: scale(6),
  },

  titleAccent: {
    color: Colors.primary[600],
    textShadowColor: Colors.primary[600],
    textShadowOffset: { width: 0, height: scale(3) },
    textShadowRadius: scale(8),
  },

  subtitleWithInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  titleClickableContainer: {
    alignItems: 'center',
    flex: 1,
  },

  mainSubtitleInline: {
    fontWeight: Typography.weights.medium,
    color: Colors.primary[700],
    textAlign: 'center',
    letterSpacing: scale(0.2),
    marginTop: Spacing[1],
    opacity: 0.8,
  },

  mainSubtitle: {
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[700],
    textAlign: 'center',
    letterSpacing: scale(0.3),
    fontStyle: 'italic',
    lineHeight: scale(24),
    textShadowColor: Colors.neutral[900],
    textShadowOffset: { width: 0, height: scale(1) },
    textShadowRadius: scale(2),
  },

  infoIconSubtitle: {
    marginLeft: Spacing[2],
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    backgroundColor: Colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary[600],
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.3,
    shadowRadius: scale(4),
    elevation: 4,
    borderWidth: scale(1),
    borderColor: Colors.primary[500],
  },

  infoIconImproved: {
    position: 'absolute',
    right: Spacing[1],
    top: Spacing[1],
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: Colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
    borderWidth: scale(2),
    borderColor: Colors.neutral[0],
  },

  categorySubtitle: {
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    letterSpacing: scale(0.3),
    lineHeight: scale(21),
    marginBottom: Spacing[3],
    paddingHorizontal: Spacing[4],
    fontStyle: 'normal',
    color: Colors.primary[600],
    backgroundColor: Colors.primary[50],
    paddingVertical: Spacing[3],
    borderRadius: scale(12),
    borderWidth: scale(1),
    borderColor: Colors.primary[100],
    shadowColor: Colors.primary[600],
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.08,
    shadowRadius: scale(4),
    elevation: 2,
  },
});
