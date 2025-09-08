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
      <View style={styles.imageContainer}>
        <Animated.View style={[styles.imageWrapper, { opacity: imageAnim }]}>
          <Animated.View style={[styles.imageInner, imageStyle]}>
            <Image
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              source={require('../../../../assets/images/hero-banner.png')}
              style={styles.heroImage as ImageStyle}
              resizeMode="cover"
            />
            <LinearGradient
              colors={HomeHeaderDesignTokens.gradients.header}
              style={styles.flexOne}
            />
          </Animated.View>
        </Animated.View>
      </View>
    );
  }
);

HeaderImageSection.displayName = 'HeaderImageSection';
