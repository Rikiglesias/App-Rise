/**
 * HEADER IMAGE SECTION - Componente modulare
 * Sezione immagine del header con animazioni parallax
 */

import React from 'react';
import { Animated } from 'react-native';

import { PerfectContainer } from '@/components/ui/PerfectContainer';
import { PerfectImage } from '@/components/ui/PerfectImage';
import { type HeaderImageSectionProps } from '@/features/home/types/HomeHeaderTypes';
import { BorderRadius } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';

const imageContainerStyle = {
  width: '100%' as const,
  alignItems: 'center' as const,
  borderRadius: BorderRadius.xl,
  overflow: 'hidden' as const,
};

export const HeaderImageSection: React.FC<HeaderImageSectionProps> = React.memo(
  ({ imageAnim, imageParallax, imageScale, imageRotation, styles }) => {
    const animatedStyle = {
      opacity: imageAnim,
      transform: [
        { translateY: imageParallax },
        { scale: imageScale },
        { rotate: imageRotation },
      ],
    };

    return (
      <PerfectContainer
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        style={styles.imageSection as any}
      >
        <Animated.View
          style={[imageContainerStyle, animatedStyle]}
          renderToHardwareTextureAndroid
          needsOffscreenAlphaCompositing
        >
          <PerfectImage
            width={393}
            aspectRatio={1131 / 1567}
            borderRadius={scale(24)}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            source={require('@assets/images/hero-banner.png')}
            resizeMode="cover"
          />
        </Animated.View>
      </PerfectContainer>
    );
  }
);

HeaderImageSection.displayName = 'HeaderImageSection';
