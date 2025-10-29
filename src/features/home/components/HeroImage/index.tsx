import React from 'react';
import { Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PerfectImage, PerfectContainer } from '../../../../components/ui';
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

  // Props Android per stabilità durante le animazioni applicate su Animated.View

  // Animazioni attive su entrambe le piattaforme
  return (
    <PerfectContainer style={styles.imageSection}>
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
          source={require('../../../../../assets/images/hero-banner.png')}
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
    </PerfectContainer>
  );
};

export default HeroImage;
