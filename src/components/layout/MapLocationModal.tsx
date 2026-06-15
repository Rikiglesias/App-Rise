import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, Linking } from 'react-native';
import {
  PerfectIcon,
  PlatformTouchable,
  PerfectText,
  PerfectContainer,
  PerfectModal,
} from '../ui';

import { PerfectSpacing, BorderRadius, Shadows } from '../../shared/constants';
import { scale } from '../../shared/constants/perfectScale';
import { logError } from '../../shared/utils/logger';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';
import type { MapModalData } from '@/features/impact/data/mapModalData';

interface MapLocationModalProps {
  visible: boolean;
  data: MapModalData | null;
  onClose: () => void;
}

const gradientStart = { x: 0, y: 0 };
const gradientEnd = { x: 1, y: 1 };

const MapLocationModal: React.FC<MapLocationModalProps> = ({
  visible,
  data,
  onClose,
}) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const trackingUrl = data?.trackingUrl;

  const handleCTAPress = useCallback(() => {
    if (!trackingUrl) return;
    Linking.openURL(trackingUrl).catch(error => {
      logError(
        'Impossibile aprire il link di tracciamento',
        error instanceof Error ? error.message : String(error)
      );
    });
  }, [trackingUrl]);

  if (!data) return null;

  return (
    <PerfectModal visible={visible} onRequestClose={onClose} size="medium">
      <PerfectContainer style={styles.modalContainer}>
        {/* Header compatto con gradient */}
        <LinearGradient
          colors={[
            colors.primary[600],
            colors.primary[700],
            colors.primary[800],
          ]}
          start={gradientStart}
          end={gradientEnd}
          style={styles.header}
        >
          <PerfectContainer style={styles.headerContent}>
            <PerfectContainer style={styles.headerLeft}>
              <PerfectText
                size={32}
                lines={1}
                fontWeight="400"
                style={styles.flag}
              >
                {data.flag}
              </PerfectText>
              <PerfectContainer style={styles.headerTextContainer}>
                <PerfectText
                  size={20}
                  lines={1}
                  fontWeight="400"
                  style={styles.title}
                >
                  {data.title}
                </PerfectText>
                <PerfectText
                  size={14}
                  lines={1}
                  fontWeight="400"
                  style={styles.subtitle}
                >
                  {data.subtitle}
                </PerfectText>
              </PerfectContainer>
            </PerfectContainer>

            <PlatformTouchable
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Chiudi mappa"
            >
              <PerfectIcon
                name="close"
                size={24}
                color={colors.accent.white}
              />
            </PlatformTouchable>
          </PerfectContainer>
        </LinearGradient>

        {/* Contenuto semplificato */}
        <PerfectContainer style={styles.content}>
          {/* Descrizione reale del paese */}
          <PerfectText
            size={16}
            lines={5}
            fontWeight="400"
            style={styles.description}
          >
            {data.description}
          </PerfectText>

          {/* Call to Action: solo se esiste un link di tracciamento reale */}
          {trackingUrl ? (
            <PlatformTouchable
              style={styles.ctaButton}
              activeOpacity={0.8}
              onPress={handleCTAPress}
              accessibilityRole="link"
              accessibilityLabel={`Apri il tracciamento di ${data.title}`}
            >
              <PerfectIcon
                name="open-in-new"
                size={20}
                color={colors.accent.white}
                style={styles.ctaIcon}
              />
              <PerfectText
                size={16}
                lines={1}
                fontWeight="400"
                style={styles.ctaText}
              >
                Segui il tracciamento
              </PerfectText>
            </PlatformTouchable>
          ) : null}
        </PerfectContainer>
      </PerfectContainer>
    </PerfectModal>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: colors.neutral[0],
    },

    // Header compatto
    header: {
      paddingTop: PerfectSpacing['3xl'],
      paddingBottom: PerfectSpacing.lg,
      paddingHorizontal: PerfectSpacing.base,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    flag: {
      marginRight: PerfectSpacing.md,
    },
    headerTextContainer: {
      flex: 1,
    },
    // Testo SU gradient brand (rosso): bianco fisso, leggibile in light e dark.
    title: {
      color: colors.accent.white,
      marginBottom: PerfectSpacing.lg,
    },
    subtitle: {
      color: colors.accent.white,
      opacity: 0.9,
    },
    closeButton: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
      // rgba necessario per background semi-trasparente senza rendere opaca l'icona
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Contenuto semplificato
    content: {
      flex: 1,
      paddingHorizontal: PerfectSpacing.lg,
      paddingTop: PerfectSpacing.xl,
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Descrizione breve (su superficie neutra → adattiva)
    description: {
      color: colors.neutral[700],
      textAlign: 'center',
      marginBottom: PerfectSpacing['2xl'],
      paddingHorizontal: PerfectSpacing.base,
    },

    // Call to Action button (brand)
    ctaButton: {
      backgroundColor: colors.primary[600],
      paddingVertical: PerfectSpacing.base,
      paddingHorizontal: PerfectSpacing.xl,
      borderRadius: BorderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadows.md,
      minWidth: scale(280),
    },
    ctaIcon: {
      marginRight: PerfectSpacing.sm,
    },
    // Testo su bottone brand (rosso): bianco fisso.
    ctaText: {
      color: colors.accent.white,
      textAlign: 'center',
    },
  });

export default MapLocationModal;
