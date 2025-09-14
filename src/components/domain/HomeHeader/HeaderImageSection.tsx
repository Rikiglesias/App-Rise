/**
 * HEADER IMAGE SECTION - Componente modulare
 * Sezione immagine del header con animazioni parallax
 */

import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, Image, ImageStyle, View } from 'react-native';

import { type HeaderImageSectionProps } from '../../../features/home/types/HomeHeaderTypes';
import { HomeHeaderDesignTokens } from '../design-tokens/HomeHeaderTokens';

export const HeaderImageSection: React.FC<HeaderImageSectionProps> = React.memo(
  ({
    imageAnim,
    imageParallax,
    imageScale,
    gradientOpacity: _gradientOpacity,
    imageRotation,
    styles,
  }) => {
    const imageStyle: ImageStyle = {
      transform: [
        { translateY: imageParallax },
        { scale: imageScale },
        { rotate: imageRotation },
      ],
    };

    return (
      <View style={styles.imageSection}>
        <View style={styles.imageContainer}>
          <Animated.View style={[styles.flexOne, { opacity: imageAnim }]}>
            <Animated.View style={[styles.flexOne, imageStyle]}>
              <Image
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                source={require('../../../../assets/images/hero-banner.png')}
                style={styles.image as ImageStyle}
                resizeMode="cover"
              />
              <LinearGradient
                colors={HomeHeaderDesignTokens.gradients.header}
                style={styles.imageGradientOverlay}
              />
            </Animated.View>
          </Animated.View>
        </View>
      </View>
    );
  }
);

HeaderImageSection.displayName = 'HeaderImageSection';
