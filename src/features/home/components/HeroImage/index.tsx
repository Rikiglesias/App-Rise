import React from 'react';
import { Animated, Image, Platform, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { type HeroImageProps } from '../../types';
import { useHeroImageStyles } from './HeroImage.styles';

export const HeroImage: React.FC<HeroImageProps> = ({
  imageAnim,
  imageParallax,
  imageScale,
  gradientOpacity,
  imageRotation,
}) => {
  const styles = useHeroImageStyles();

  // Android: Rendering completamente statico per evitare artefatti
  if (Platform.OS === 'android') {
    return (
      <View style={styles.imageSection}>
        <View style={styles.imageContainer}>
          <Image
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            source={require('../../../../../assets/images/hero-banner.png')}
            style={styles.image}
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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          source={require('../../../../../assets/images/hero-banner.png')}
          style={styles.image}
          resizeMode="cover"
        />

        <Animated.View
          style={[styles.imageGradientOverlay, { opacity: gradientOpacity }]}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.1)']}
            style={styles.flexOne}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default HeroImage;
