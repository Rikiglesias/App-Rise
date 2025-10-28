import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, Platform, View, type ImageStyle } from 'react-native';

import { PerfectImage } from '../ui/PerfectImage';
import { HomeHeaderDesignTokens } from './design-tokens/HomeHeaderTokens';

interface Props {
  imageAnim: Animated.Value;
  imageParallax: Animated.AnimatedNode;
  imageScale: Animated.AnimatedNode;
  gradientOpacity: Animated.AnimatedNode;
  imageRotation: Animated.AnimatedNode;
  styles: {
    imageSection: object;
    imageContainer: object;
    image: ImageStyle;
    imageGradientOverlay: object;
    flexOne: object;
  };
}

/**
 * Sezione immagine header con animazioni ottimizzate per piattaforma
 * Android: Rendering statico per performance
 * iOS: Animazioni complete
 */
export const HeaderImageSection: React.FC<Props> = React.memo(
  ({
    imageAnim,
    imageParallax,
    imageScale,
    gradientOpacity,
    imageRotation,
    styles,
  }) => {
    // Android: Rendering completamente statico per evitare artefatti
    if (Platform.OS === 'android') {
      return (
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            <PerfectImage
              // iPhone 15 reference full width, ~1.1x height
              width={393}
              height={432}
              borderRadius={24}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              source={require('../../../assets/images/hero-banner.png')}
            />
          </View>
        </View>
      );
    }

    // iOS: Mantiene tutte le animazioni
    return (
      <View style={styles.imageSection}>
        <Animated.View
          style={[
            styles.imageContainer,
            {
              opacity: imageAnim,
              transform: [
                { translateY: imageParallax },
                { scale: imageScale },
                { rotate: imageRotation },
              ],
            },
          ]}
        >
          <PerfectImage
            // iPhone 15 reference full width, ~1.1x height
            width={393}
            height={432}
            borderRadius={24}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            source={require('../../../assets/images/hero-banner.png')}
          />

          <Animated.View
            style={[styles.imageGradientOverlay, { opacity: gradientOpacity }]}
          >
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
