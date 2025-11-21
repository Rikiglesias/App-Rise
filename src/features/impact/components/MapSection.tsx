import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';

import {
  PerfectIcon,
  PerfectText,
  PlatformTouchable,
  PerfectContainer,
  PerfectImage,
} from '@/components/ui';
import { Colors, BorderRadius, Shadows } from '@/shared/constants/designTokens';
import { PerfectSpacing, IconClamps } from '@/shared/constants';
import { getWindowDimensions, scale } from '@/shared/constants/perfectScale';
import { IMAGE_DIMENSIONS } from '@/shared/constants/dimensions';
import { sectionHeaderBackground } from '@/shared/styles';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useDeviceType } from '@/shared/hooks/useDeviceType';

interface Props {
  onMapPress: () => void;
}

// Sezione mappa geografica con header decorativo e immagine interattiva
export const MapSection: React.FC<Props> = React.memo(({ onMapPress }) => {
  const { t } = useTranslation();
  const { isTablet } = useDeviceType();
  const window = getWindowDimensions();
  const horizontalPadding = PerfectSpacing.base * 2; // as used in section/container
  const baseContainerWidth = Math.max(
    0,
    Math.floor(Math.min(window.width, window.height) - horizontalPadding)
  );
  // TABLET: Riduci all'80% larghezza e altezza. PHONE: 100%
  const containerWidth = isTablet
    ? Math.round(baseContainerWidth * 0.8)
    : baseContainerWidth;
  // TABLET: aspect ratio ridotto per meno altezza. PHONE: originale
  const aspectRatio = isTablet ? 361 / 220 : 361 / 280;
  const computedHeight = Math.round(containerWidth / aspectRatio);

  const handleMapImagePress = useCallback(() => {
    onMapPress(); // Apre la mappa completa con tutti i pin
  }, [onMapPress]);

  return (
    <PerfectContainer style={styles.mapSection}>
      {/* Header GEOGRAFICO con elementi di location */}
      <PerfectContainer style={styles.mapHeaderContainer}>
        <PerfectContainer style={styles.mapHeaderBackground}>
          <PerfectText
            size={22}
            lines={1}
            fontWeight="700"
            immunity={true}
            style={styles.mapTitle}
          >
            🌍 {t('impact.whereWeOperate')}
          </PerfectText>
          <PerfectText
            size={16}
            immunity={true}
            lines={2}
            style={styles.mapSubtitle}
          >
            {t('impact.ourOperationsWorld')}
          </PerfectText>
        </PerfectContainer>
      </PerfectContainer>

      {/* CONTAINER MAPPA CLICCABILE - RIEMPIE TUTTO */}
      <PlatformTouchable
        style={[styles.mapImageContainer, { height: computedHeight }]}
        onPress={handleMapImagePress}
        activeOpacity={0.85}
      >
        <PerfectImage
          width={containerWidth}
          height={computedHeight}
          absoluteDimensions
          borderRadius={20}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          source={require('@assets/images/mappa.png')}
        />

        {/* INDICATORE CLICCABILE */}
        <PerfectContainer style={styles.mapClickIndicator}>
          <PerfectText
            size={12}
            lines={1}
            fontWeight="500"
            immunity={true}
            style={styles.mapClickText}
          >
            {t('impact.tapToExplore')}
          </PerfectText>
          <PerfectIcon
            name="map-search"
            size={28}
            {...IconClamps.mapIndicator}
            color={Colors.neutral[600]}
          />
        </PerfectContainer>
      </PlatformTouchable>
    </PerfectContainer>
  );
});

MapSection.displayName = 'MapSection';

const styles = StyleSheet.create({
  // Map Section - SENZA CONTAINER GRIGIO
  mapSection: {
    paddingHorizontal: PerfectSpacing.base,
    marginTop: PerfectSpacing.lg, // spazio tra linea e titolo "Dove Operiamo"
  },

  // MAP CONTAINER CLICCABILE - RIDOTTO E CENTRATO
  mapImageContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.xl,
    marginTop: PerfectSpacing.base,
    marginHorizontal: 0,
    padding: 0,
    ...Shadows.lg,
    position: 'relative',
    overflow: 'hidden',
    height: IMAGE_DIMENSIONS.MAP_PREVIEW_HEIGHT,
    alignSelf: 'center', // Centra la mappa ridotta
  },
  // INDICATORE CLICCABILE
  mapClickIndicator: {
    position: 'absolute',
    top: PerfectSpacing.sm,
    right: PerfectSpacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
    paddingHorizontal: PerfectSpacing.sm,
    paddingVertical: PerfectSpacing.xs,
    borderRadius: BorderRadius.lg,
    gap: PerfectSpacing.xs,
    zIndex: 2,
    elevation: 8,
  },
  mapClickText: {
    color: Colors.neutral[600],
  },

  // Map Section - GEOGRAFICO
  mapHeaderContainer: {
    alignItems: 'center',
    marginBottom: PerfectSpacing.lg,
  },

  mapHeaderBackground: {
    ...sectionHeaderBackground('white'),
    width: scale(314), // Perfect System: 80% di 393px (iPhone 15)
    alignSelf: 'center',
  },
  mapTitle: {
    color: Colors.neutral[900],
    textAlign: 'center',
    letterSpacing: 0,
    includeFontPadding: false,
  },
  mapSubtitle: {
    color: Colors.neutral[700],
    textAlign: 'center',
    marginTop: PerfectSpacing.sm,
    opacity: 0.8,
    letterSpacing: 0,
  },
});
