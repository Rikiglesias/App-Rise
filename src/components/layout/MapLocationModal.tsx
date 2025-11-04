import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import {
  PerfectIcon,
  PlatformTouchable,
  PerfectText,
  PerfectContainer,
  PerfectModal,
} from '../ui';

import {
  Colors,
  PerfectSpacing,
  BorderRadius,
  Shadows,
} from '../../shared/constants';
import { scale } from '../../shared/constants/perfectScale';
import { logDebug } from '../../shared/utils/logger';
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
  const handleCTAPress = useCallback(() => {
    logDebug('MapLocationModal', 'CTA pressed', { title: data?.title });
    // Note: External links functionality would require extending MapModalData interface
  }, [data?.title]);

  if (!data) return null;

  return (
    <PerfectModal visible={visible} onRequestClose={onClose} size="medium">
      <PerfectContainer style={styles.modalContainer}>
        {/* Header compatto con gradient */}
        <LinearGradient
          colors={[
            Colors.primary[600],
            Colors.primary[700],
            Colors.primary[800],
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
              <PerfectIcon name="close" size={24} color={Colors.neutral[0]} />
            </PlatformTouchable>
          </PerfectContainer>
        </LinearGradient>

        {/* Contenuto semplificato */}
        <PerfectContainer style={styles.content}>
          {/* Descrizione breve - max 2 righe */}
          <PerfectText
            size={16}
            lines={3}
            fontWeight="400"
            style={styles.description}
          >
            Scopri il nostro impatto in {data.title} attraverso programmi di
            lotta alla fame e sviluppo sostenibile.
          </PerfectText>

          {/* Call to Action per link esterno */}
          <PlatformTouchable
            style={styles.ctaButton}
            activeOpacity={0.8}
            onPress={handleCTAPress}
          >
            <PerfectIcon
              name="open-in-new"
              size={20}
              color={Colors.neutral[0]}
              style={styles.ctaIcon}
            />
            <PerfectText
              size={16}
              lines={1}
              fontWeight="400"
              style={styles.ctaText}
            >
              Clicca qui per saperne di più
            </PerfectText>
          </PlatformTouchable>
        </PerfectContainer>
      </PerfectContainer>
    </PerfectModal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
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
  title: {
    color: Colors.neutral[0],
    marginBottom: PerfectSpacing.lg,
  },
  subtitle: {
    color: Colors.neutral[100],
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

  // Descrizione breve
  description: {
    color: Colors.neutral[700],
    textAlign: 'center',
    marginBottom: PerfectSpacing['2xl'],
    paddingHorizontal: PerfectSpacing.base,
  },

  // Call to Action button
  ctaButton: {
    backgroundColor: Colors.primary[600],
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
  ctaText: {
    color: Colors.neutral[0],
    textAlign: 'center',
  },
});

export default MapLocationModal;
