import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import WorldMapSvg from '@/components/layout/WorldMapSvg';
import {
  PerfectIcon,
  PerfectText,
  PlatformTouchable,
  PerfectContainer,
} from '@/components/ui';
import { BorderRadius, Shadows } from '@/shared/constants/designTokens';
import { PerfectSpacing, IconClamps } from '@/shared/constants';
import { getWindowDimensions, scale } from '@/shared/constants/perfectScale';
import { sectionHeaderBackground } from '@/shared/styles';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useDeviceType } from '@/shared/hooks/useDeviceType';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';
import type { Location } from '@/shared/types/location';

interface Props {
  locations: Location[];
  onMapPress: () => void;
}

// La preview è una vista (non-interattiva): il tap apre la mappa fullscreen.
const noop = (): void => {
  /* no-op: i tap sulla preview sono gestiti dal container, non dai paesi */
};

// Sezione mappa: anteprima SVG live (theme-aware) che apre la mappa completa.
export const MapSection: React.FC<Props> = React.memo(
  ({ locations, onMapPress }) => {
    const { t } = useTranslation();
    const { isTablet } = useDeviceType();
    const colors = useThemeColors();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const window = getWindowDimensions();
    const horizontalPadding = PerfectSpacing.base * 2;
    const baseContainerWidth = Math.max(
      0,
      Math.floor(Math.min(window.width, window.height) - horizontalPadding)
    );
    const containerWidth = isTablet
      ? Math.round(Math.min(window.width, window.height) * 0.7)
      : baseContainerWidth;
    const aspectRatio = isTablet ? 361 / 220 : 361 / 280;
    const computedHeight = Math.round(containerWidth / aspectRatio);

    return (
      <PerfectContainer
        style={[styles.mapSection, isTablet ? { paddingHorizontal: 0 } : {}]}
      >
        {/* Header geografico */}
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

        {/* Anteprima mappa SVG live → apre la fullscreen al tap */}
        <PlatformTouchable
          style={[styles.mapImageContainer, { height: computedHeight }]}
          onPress={onMapPress}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={t('impact.tapToExplore')}
        >
          <View style={styles.mapPreview} pointerEvents="none">
            <WorldMapSvg
              locations={locations}
              onMarkerPress={noop}
              isFullScreen={false}
            />
          </View>

          {/* Indicatore "tocca per esplorare" */}
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
              color={colors.neutral[600]}
            />
          </PerfectContainer>
        </PlatformTouchable>
      </PerfectContainer>
    );
  }
);

MapSection.displayName = 'MapSection';

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    mapSection: {
      paddingHorizontal: PerfectSpacing.base,
      marginTop: PerfectSpacing.lg,
    },
    mapImageContainer: {
      backgroundColor: colors.neutral[0],
      borderRadius: BorderRadius.xl,
      marginTop: PerfectSpacing.base,
      marginHorizontal: 0,
      padding: 0,
      ...Shadows.lg,
      position: 'relative',
      overflow: 'hidden',
      alignSelf: 'center',
    },
    mapPreview: {
      ...StyleSheet.absoluteFillObject,
    },
    mapClickIndicator: {
      position: 'absolute',
      top: PerfectSpacing.sm,
      right: PerfectSpacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.neutral[50],
      paddingHorizontal: PerfectSpacing.sm,
      paddingVertical: PerfectSpacing.xs,
      borderRadius: BorderRadius.lg,
      gap: PerfectSpacing.xs,
      zIndex: 2,
      elevation: 8,
    },
    mapClickText: {
      color: colors.neutral[600],
    },
    mapHeaderContainer: {
      alignItems: 'center',
      marginBottom: PerfectSpacing.lg,
    },
    mapHeaderBackground: {
      ...sectionHeaderBackground('white', colors),
      width: scale(314),
      alignSelf: 'center',
    },
    mapTitle: {
      color: colors.neutral[900],
      textAlign: 'center',
      letterSpacing: 0,
      includeFontPadding: false,
    },
    mapSubtitle: {
      color: colors.neutral[700],
      textAlign: 'center',
      marginTop: PerfectSpacing.sm,
      opacity: 0.8,
      letterSpacing: 0,
    },
  });
