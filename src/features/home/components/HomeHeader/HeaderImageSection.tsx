/**
 * HEADER IMAGE SECTION - Componente modulare
 * Sezione immagine del header con animazioni parallax
 */

import React, { useMemo } from 'react';
import { Animated, StyleSheet, Platform } from 'react-native';

import { PerfectContainer } from '@/components/ui/PerfectContainer';
import { PerfectImage } from '@/components/ui/PerfectImage';
import { type HeaderImageSectionProps } from '@/features/home/types/HomeHeaderTypes';
import { BorderRadius } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';

const localStyles = StyleSheet.create({
  animatedContainer: {
    width: '100%',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
});

export const HeaderImageSection: React.FC<HeaderImageSectionProps> = React.memo(
  ({
    imageAnim,
    imageParallax,
    imageScale,
    imageRotation,
    gradientOpacity,
    styles,
  }) => {
    const animatedStyle = useMemo(
      () => ({
        opacity: imageAnim,
        transform: [
          { translateY: imageParallax },
          { scale: imageScale },
          { rotate: imageRotation },
        ],
      }),
      [imageAnim, imageParallax, imageScale, imageRotation]
    );

    return (
      <PerfectContainer style={styles.imageSection}>
        <Animated.View
          style={[localStyles.animatedContainer, animatedStyle]}
          accessibilityRole="image"
          accessibilityLabel="Hero Rise Against Hunger"
        >
          <PerfectImage
            width={393}
            aspectRatio={1131 / 1567}
            borderRadius={scale(24)}
            source={require('@assets/images/hero-banner.png')}
            resizeMode="cover"
            // Su Android rimuoviamo la shadow per evitare contorni/grigi visibili
            shadow={Platform.OS === 'android' ? false : 'light'}
          />
          <Animated.View
            pointerEvents="none"
            style={[styles.imageGradientOverlay, { opacity: gradientOpacity }]}
          />
        </Animated.View>
      </PerfectContainer>
    );
  }
);

HeaderImageSection.displayName = 'HeaderImageSection';
