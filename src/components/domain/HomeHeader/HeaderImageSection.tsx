/**
 * HEADER IMAGE SECTION - Componente modulare
 * Sezione immagine del header con animazioni parallax
 */

import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, type ImageStyle, type ViewStyle } from 'react-native';
import { PerfectContainer } from '../../ui/PerfectContainer';

import { type HeaderImageSectionProps } from '../../../features/home/types/HomeHeaderTypes';
import { HomeHeaderDesignTokens } from '../design-tokens/HomeHeaderTokens';
import { PerfectImage } from '../../ui/PerfectImage';

export const HeaderImageSection: React.FC<HeaderImageSectionProps> = React.memo(
  ({ imageAnim, imageParallax, imageScale, imageRotation, styles }) => {
    // Applica direttamente le props Android su Animated.View
    const imageStyle: ImageStyle | ViewStyle = {
      transform: [
        { translateY: imageParallax },
        { scale: imageScale },
        { rotate: imageRotation },
      ],
    };

    return (
      <PerfectContainer style={styles.imageSection as ViewStyle}>
        <PerfectContainer style={styles.imageContainer as ViewStyle}>
          <Animated.View style={[styles.flexOne, { opacity: imageAnim }]}>
            <Animated.View
              style={[
                styles.flexOne,
                imageStyle,
                {
                  borderRadius: 24,
                  overflow: 'hidden',
                  backgroundColor: '#FFFFFF',
                },
              ]}
              renderToHardwareTextureAndroid
              needsOffscreenAlphaCompositing
            >
              <PerfectImage
                // iPhone 15 reference full width, ~1.1x height
                width={393}
                height={432}
                borderRadius={24}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                source={require('../../../../assets/images/hero-banner.png')}
              />
              <LinearGradient
                colors={HomeHeaderDesignTokens.gradients.header}
                style={styles.imageGradientOverlay}
              />
            </Animated.View>
          </Animated.View>
        </PerfectContainer>
      </PerfectContainer>
    );
  }
);

HeaderImageSection.displayName = 'HeaderImageSection';
