import { Dimensions, Platform, StyleSheet } from 'react-native';
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from '../shared/constants/designTokens';
import { useTheme } from '../shared/hooks/useTheme';
import { ADVANCED_CONFIG } from '../types/HomeHeaderTypes';

const { width: windowWidth } = Dimensions.get('window');

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
      paddingVertical: Spacing[0], // AZZERA PADDING: da Spacing[1] a Spacing[0] - compattezza estrema
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
      fontSize: windowWidth < 375 ? 32 : 36,
      fontWeight: Typography.weights.bold,
      fontFamily: Typography.families.heading,
      textAlign: 'center',
      lineHeight: windowWidth < 375 ? 38 : 42,
      letterSpacing: -0.8,
      marginBottom: Spacing[4],
    },
    subtitle: {
      color: colors.neutral[600],
      fontSize: Typography.sizes.lg,
      fontWeight: Typography.weights.regular,
      textAlign: 'center',
      lineHeight: Typography.lineHeights.relaxed * Typography.sizes.lg,
      letterSpacing: 0.2,
      paddingHorizontal: Spacing[6],
    },
  });

export const createImageStyles = (
  colors: ReturnType<typeof useTheme>['colors']
) =>
  /* eslint-disable react-native/no-unused-styles */
  StyleSheet.create({
    // Tutti questi stili sono utilizzati nel componente HeaderImageSection
    // ma ESLint non riesce a rilevarlo perché vengono passati tramite props
    imageSection: {
      height: ADVANCED_CONFIG.imageSection.height * 1.1, // AUMENTATA: da 0.75 a 1.1 - più spazio verticale per evitare ritagli
      width: '100%',
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      marginTop: Spacing[0], // AZZERA MARGINE: da Spacing[2] a Spacing[0] - massima vicinanza immagine-titolo
      marginBottom: Spacing[4], // Spazio maggiore per evitare overlap
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
      // iOS: Shadows sottili per profondità
      ...Platform.select({
        ios: {
          shadowColor: colors.neutral[400],
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        android: {
          // Android: Rendering pulito senza shadows
        },
      }),
    },
    image: {
      width: '100%',
      height: '100%', // Mantiene l'altezza completa
      resizeMode: 'cover', // RIPRISTINATO: da 'contain' a 'cover' - riempie tutto lo spazio senza bande vuote
    },
    imageGradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    // Stile estratto per evitare inline style warning
    flexOne: {
      flex: 1,
    },
  });
/* eslint-enable react-native/no-unused-styles */

export const createMissionStyles = (
  colors: ReturnType<typeof useTheme>['colors']
) =>
  /* eslint-disable react-native/no-unused-styles */
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
      fontSize: Typography.sizes.xl,
      fontWeight: Typography.weights.bold,
      color: colors.neutral[900],
      textAlign: 'center',
      marginBottom: Spacing[3],
    },
    missionDescription: {
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.regular,
      color: colors.neutral[700],
      textAlign: 'center',
      lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
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
      fontSize: Typography.sizes['2xl'],
      fontWeight: Typography.weights.bold,
      color: colors.primary[600],
      marginBottom: Spacing[1],
    },
    statLabel: {
      fontSize: Typography.sizes.sm,
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
    fontSize: Typography.sizes.base,
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
    borderColor: '#DC2626',
    shadowColor: '#DC2626',
  },
  volunteersBox: {
    borderColor: '#1F2937',
    shadowColor: '#1F2937',
  },
  statNumber: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.black,
    color: Colors.neutral[900],
    marginBottom: Spacing[1],
  },
  statLabel: {
    fontSize: Typography.sizes.sm,
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
    fontSize: Typography.sizes.xl,
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
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
  },
  breakdownLabel: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[700],
    marginTop: 2,
  },
  breakdownDescription: {
    fontSize: Typography.sizes.sm,
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
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutral[700],
  },
  totalNumber: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.black,
    color: '#DC2626',
  },
});
