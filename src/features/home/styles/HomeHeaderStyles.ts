import { Platform, StyleSheet } from 'react-native';
import {
  BorderColors,
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from '../../../shared/constants';
import { TypographyTokens } from '../../../shared/constants/responsiveSystem';
import { useTheme } from '../../../shared/hooks/useTheme';
import { ADVANCED_CONFIG } from '../types/HomeHeaderTypes';

// Removed hardcoded windowWidth - now using responsive typography

// Style factories split for max-lines-per-function compliance
export const createContainerStyles = (
  colors: ReturnType<typeof useTheme>['colors']
) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.neutral[0], // Sfondo bianco per continuità
      overflow: 'hidden',
    },
    headerSection: {
      paddingVertical: Spacing[1], // RIPRISTINATO: padding normale per spaziatura adeguata
      paddingHorizontal: ADVANCED_CONFIG.headerSection.paddingHorizontal,
      minHeight: ADVANCED_CONFIG.headerSection.minHeight,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    gradientBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.05,
    },
    textContainer: {
      alignItems: 'center',
      zIndex: 2,
    },
  });

export const createTextStyles = (
  colors: ReturnType<typeof useTheme>['colors']
) =>
  StyleSheet.create({
    title: {
      color: colors.neutral[900],
      fontSize: TypographyTokens.styles.headline.large, // Responsive 32px (hybrid system)
      fontWeight: Typography.weights.bold,
      fontFamily: Typography.families.heading,
      textAlign: 'center',
      lineHeight: TypographyTokens.styles.headline.large * 1.17, // Responsive line height
      letterSpacing: -0.8,
      marginBottom: Spacing[4],
    },
    subtitle: {
      color: colors.neutral[600],
      fontSize: TypographyTokens.styles.body.large,
      fontWeight: Typography.weights.regular,
      textAlign: 'center',
      lineHeight:
        Typography.lineHeights.relaxed * TypographyTokens.styles.body.large,
      letterSpacing: 0.2,
      paddingHorizontal: Spacing[6],
    },
  });

export const createImageStyles = (
  colors: ReturnType<typeof useTheme>['colors']
) =>
  StyleSheet.create({
    // Tutti questi stili sono utilizzati nel componente HeaderImageSection
    // ma ESLint non riesce a rilevarlo perché vengono passati tramite props
    imageSection: {
      height: ADVANCED_CONFIG.imageSection.height * 1.0, // ← RIDOTTO DA 1.2 A 1.0 per dimensioni normali
      width: '100%',
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      marginTop: Spacing[1], // ← RIDOTTO DA Spacing[2] per meno spazio sopra
      marginBottom: Spacing[3], // ← RIDOTTO DA Spacing[4] per bilanciare
      borderRadius: 24, // Bordi arrotondati per eleganza
      // iOS: Shadows complete per effetto premium
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
        },
        android: {
          // Android: ZERO shadows per evitare bordi scuri
        },
      }),
    },

    imageContainer: {
      width: '100%',
      height: '100%',
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
      // iOS: Shadow per container immagine
      ...Platform.select({
        ios: {
          shadowColor: colors.neutral[400],
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        android: {
          // Android: ZERO shadows per evitare artefatti
        },
      }),
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover', // Copre l'intero container senza distorsioni
    },
    imageGradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    // Utility style per flex: 1
    flexOne: {
      flex: 1,
    },
  });
/* eslint-enable react-native/no-unused-styles */

export const createMissionStyles = (
  colors: ReturnType<typeof useTheme>['colors']
) =>
  StyleSheet.create({
    // Tutti questi stili sono utilizzati nel componente HeaderMissionSection
    // ma ESLint non riesce a rilevarlo perché vengono passati tramite props
    missionSection: {
      paddingHorizontal: Spacing[4],
      paddingTop: Spacing[1], // Minimo spazio sopra per continuità
      paddingBottom: Spacing[2], // Ridotto spazio sotto
    },
    missionCard: {
      backgroundColor: colors.neutral[0],
      borderRadius: BorderRadius.lg,
      padding: Spacing[4],
      shadowColor: colors.neutral[400],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.neutral[100],
    },
    missionTitle: {
      fontSize: TypographyTokens.styles.title.medium,
      fontWeight: Typography.weights.bold,
      color: colors.neutral[900],
      textAlign: 'center',
      marginBottom: Spacing[3],
    },
    missionDescription: {
      fontSize: TypographyTokens.styles.body.medium,
      fontWeight: Typography.weights.regular,
      color: colors.neutral[700],
      textAlign: 'center',
      lineHeight:
        Typography.lineHeights.relaxed * TypographyTokens.styles.body.medium,
      marginBottom: Spacing[4],
    },
    missionStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: TypographyTokens.styles.title.large,
      fontWeight: Typography.weights.bold,
      color: colors.primary[600],
      marginBottom: Spacing[1],
    },
    statLabel: {
      fontSize: TypographyTokens.styles.body.small,
      fontWeight: Typography.weights.medium,
      color: colors.neutral[600],
      textAlign: 'center',
    },
  });
/* eslint-enable react-native/no-unused-styles */

// Stili per la missione con stats containers affiancati
export const baseMissionStyles = StyleSheet.create({
  missionContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 16,
    padding: Spacing[4],
    marginTop: Spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  missionText: {
    fontSize: TypographyTokens.styles.body.medium,
    color: Colors.neutral[700],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing[4],
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  statsBox: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
    borderRadius: 16,
    borderWidth: 2,
    padding: Spacing[3],
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  mealsBox: {
    borderColor: BorderColors.brandElegant, // ← AGGIORNATO A BORDO BRAND ELEGANTE
    shadowColor: '#DC2626',
  },
  volunteersBox: {
    borderColor: BorderColors.sophisticated, // ← AGGIORNATO A BORDO SOFISTICATO
    shadowColor: Colors.neutral[700], // ← MIGRATO DA HARDCODED '#1F2937'
  },
  statNumber: {
    fontSize: TypographyTokens.styles.title.large,
    fontWeight: Typography.weights.black,
    color: Colors.neutral[900],
    marginBottom: Spacing[1],
  },
  statLabel: {
    fontSize: TypographyTokens.styles.body.small,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing[4],
  },
  modalContainer: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 3,
  },
  modalContent: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 21,
    padding: Spacing[5],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  modalTitle: {
    fontSize: TypographyTokens.styles.title.medium,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  breakdownText: {
    flex: 1,
  },
  breakdownNumber: {
    fontSize: TypographyTokens.styles.body.large,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
  },
  breakdownLabel: {
    fontSize: TypographyTokens.styles.body.medium,
    color: Colors.neutral[700],
    marginTop: 2,
  },
  breakdownDescription: {
    fontSize: TypographyTokens.styles.body.small,
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
    fontSize: TypographyTokens.styles.body.medium,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutral[700],
  },
  totalNumber: {
    fontSize: TypographyTokens.styles.title.medium,
    fontWeight: Typography.weights.black,
    color: '#DC2626',
  },
});
