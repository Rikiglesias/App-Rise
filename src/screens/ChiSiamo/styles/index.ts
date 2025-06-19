import { Dimensions, StyleSheet } from 'react-native';

import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from '../../../shared/constants/designTokens';

const { width: screenWidth } = Dimensions.get('window');

// Main Screen Styles
export const mainStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: Spacing[4],
    padding: Spacing[2],
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[0],
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 10,
  },
  contentContainer: {
    paddingHorizontal: Spacing[4],
    gap: Spacing[4], // Ridotto da 8 a 4
    paddingTop: Spacing[12], // Ridotto da 20 a 12
    paddingBottom: Spacing[12],
  },
});

// Modal Styles
export const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
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
    maxWidth: screenWidth * 0.9,
    width: '100%',
    maxHeight: '80%',
  },

  modalGradientBorder: {
    borderRadius: 24,
    padding: 3,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },

  modalWhiteContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 21,
    overflow: 'hidden',
  },

  modalContent: {
    maxHeight: '100%',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },

  modalTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.black,
    color: '#DC2626',
    letterSpacing: -0.8,
  },

  closeButton: {
    padding: Spacing[1],
  },

  storyScroll: {
    maxHeight: '85%',
  },

  storyContainer: {
    padding: Spacing[6],
    gap: Spacing[4],
  },

  storyTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: Spacing[2],
  },

  storyText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[700],
    lineHeight: 24,
    textAlign: 'justify',
    letterSpacing: 0.3,
  },

  highlightText: {
    color: '#DC2626',
    fontWeight: Typography.weights.bold,
  },

  sectionTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing[2],
  },

  sectionDivider: {
    height: 1,
    backgroundColor: Colors.neutral[200],
    marginVertical: Spacing[4],
  },

  finalMessageContainer: {
    marginTop: Spacing[6],
    alignItems: 'center',
  },

  finalMessage: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.3,
  },

  introText: {
    fontSize: Typography.sizes.base,
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
    fontSize: Typography.sizes.xl,
    marginTop: 2,
  },

  pillarTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing[1],
  },

  pillarContent: {
    flex: 1,
  },

  pillarText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[700],
    lineHeight: 22,
  },
});

// ChiSiamo Section Styles
export const chiSiamoSectionStyles = StyleSheet.create({
  categoryContainer: {
    marginBottom: Spacing[3], // Ridotto da 6 a 3
  },
  titleContainer: {
    position: 'relative',
  },
  categoryTitle: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.black,
    color: '#DC2626', // Rosso per titolo principale
    textAlign: 'center',
    letterSpacing: -0.8,
    marginBottom: Spacing[1], // Ridotto per avvicinare icona
    // Text shadow per profondità
    textShadowColor: 'rgba(220, 38, 38, 0.15)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  infoIcon: {
    position: 'absolute',
    right: 80, // Avvicinato al titolo come richiesto
    top: 8,
    padding: Spacing[1],
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.full,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categorySubtitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
    marginBottom: Spacing[3],
    paddingHorizontal: Spacing[4],
    fontStyle: 'italic',
    color: '#374151',
    backgroundColor: 'rgba(55, 65, 81, 0.06)',
    paddingVertical: Spacing[2],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.12)',
    shadowColor: '#374151',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  titleSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing[2],
    paddingHorizontal: Spacing[6],
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.neutral[300],
    opacity: 0.4,
  },
  separatorIcon: {
    fontSize: 16,
    marginHorizontal: Spacing[3],
    opacity: 0.5,
    color: Colors.neutral[500],
  },
  categoryDivider: {
    height: 1,
    backgroundColor: Colors.neutral[200],
    marginHorizontal: Spacing[8],
    marginBottom: Spacing[2], // Ridotto da 6 a 2
  },
});

// Contact Section Styles
export const contactSectionStyles = StyleSheet.create({
  categoryContainer: {
    marginBottom: Spacing[3], // Ridotto da 6 a 3
  },
  categoryTitle: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.black,
    color: '#1F2937', // Grigio scuro per "Contatti"
    textAlign: 'center',
    letterSpacing: -0.8,
    marginBottom: Spacing[2],
    // Text shadow per profondità
    textShadowColor: 'rgba(31, 41, 55, 0.15)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  categorySubtitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
    marginBottom: Spacing[3],
    paddingHorizontal: Spacing[4],
    fontStyle: 'italic',
    color: '#374151',
    backgroundColor: 'rgba(55, 65, 81, 0.06)',
    paddingVertical: Spacing[2],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.12)',
    shadowColor: '#374151',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  titleSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing[2],
    paddingHorizontal: Spacing[6],
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.neutral[300],
    opacity: 0.4,
  },
  separatorIcon: {
    fontSize: 16,
    marginHorizontal: Spacing[3],
    opacity: 0.5,
    color: Colors.neutral[500],
  },
  categoryDivider: {
    height: 1,
    backgroundColor: Colors.neutral[200],
    marginHorizontal: Spacing[8],
    marginBottom: Spacing[2], // Ridotto da 6 a 2
  },
  contactsGrid: {
    gap: Spacing[4],
  },
});

// Animated Contact Styles
export const animatedContactStyles = StyleSheet.create({
  contactButtonContainer: {
    width: '100%',
  },
  contactTouchable: {
    width: '100%',
  },
  // GRADIENT CONTAINER PATTERN per bottoni (clickabili)
  gradientBorder: {
    borderRadius: 24,
    padding: 3, // Bordo gradient
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  whiteContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 21, // 24-3 per effetto bordo
    overflow: 'hidden',
  },
  contactContent: {
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[4],
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contactIcon: {
    marginRight: Spacing[3],
  },
  contactTextContainer: {
    flex: 1,
  },
  contactButtonTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  contactButtonSubtitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[600],
  },
});
