import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, Image, ImageStyle, Platform, View } from 'react-native';

import { HomeHeaderTokens } from './design-tokens/HomeHeaderTokens';

interface Props {
  imageAnim: Animated.Value;
  imageParallax: Animated.AnimatedNode;
  imageScale: Animated.AnimatedNode;
  gradientOpacity: Animated.AnimatedNode;
  imageRotation: Animated.AnimatedNode;
  styles: {
    imageSection: object;
    imageContainer: object;
    image: object;
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
            <Image
              source={require('../../../assets/images/hero-banner.png')}
              style={styles.image as ImageStyle}
              resizeMode="cover"
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
          <Image
            source={require('../../../assets/images/hero-banner.png')}
            style={styles.image as ImageStyle}
            resizeMode="cover"
          />

          <Animated.View
            style={[styles.imageGradientOverlay, { opacity: gradientOpacity }]}
          >
            <LinearGradient
              colors={HomeHeaderTokens.gradients.header}
              style={styles.flexOne}
            />
          </Animated.View>
        </Animated.View>
      </View>
    );
  }
);

HeaderImageSection.displayName = 'HeaderImageSection';
