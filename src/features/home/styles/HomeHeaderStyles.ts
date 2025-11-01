import { Platform, StyleSheet } from 'react-native';
import { ADVANCED_CONFIG } from '../types/HomeHeaderTypes';
import {
  BorderRadius,
  Spacing,
  Typography,
} from '@/shared/constants';
import { getPerfectShadow } from '@/shared/constants/perfectShadow';
// TypographyTokens rimosso - usa Typography.sizes
import { useTheme } from '@/shared/hooks/useTheme';

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
      fontSize: 32, // Headline large
      fontWeight: Typography.weights.bold,
      fontFamily: Typography.families.heading,
      textAlign: 'center',
      lineHeight: 32 * 1.17, // Headline large * 1.17
      letterSpacing: -0.8,
      marginBottom: Spacing[4],
    },
    subtitle: {
      color: colors.neutral[600],
      fontSize: 16, // Body large
      fontWeight: Typography.weights.regular,
      textAlign: 'center',
      lineHeight: Typography.lineHeights.relaxed * 16,
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
      // iOS: Shadows complete per effetto premium, Android: ZERO shadows
      ...(Platform.OS === 'ios' ? getPerfectShadow('strong') : {}),
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
