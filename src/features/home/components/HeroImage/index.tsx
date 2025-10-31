import React from 'react';
import { Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BorderRadius, Colors } from '../../../../shared/constants/designTokens';
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
            borderRadius: BorderRadius.xl,
            overflow: 'hidden',
            backgroundColor: Colors.neutral[0],
          },
        ]}
        renderToHardwareTextureAndroid
        needsOffscreenAlphaCompositing
      >
        <PerfectImage
          // iPhone 15 reference full width, ~1.1x height
          width={393}
          height={432}
          borderRadius={BorderRadius.xl}
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
