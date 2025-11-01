import React from 'react';
import { Animated } from 'react-native';

import {
  useHomeHeaderAnimations,
  useScrollInterpolations,
} from '../hooks/useHomeHeaderHooks';
import { useHomeHeaderStyles } from '../hooks/useHomeHeaderStyles';
import { type HomeHeaderSectionProps } from '../types/HomeHeaderTypes';
import { HeaderImageSection, HeaderTextSection } from './HomeHeader';

// Main Component - Now under 60 lines
const HomeHeaderSectionComponent: React.FC<HomeHeaderSectionProps> = ({
  scrollY,
}) => {
  const { titleAnim, imageAnim, containerAnim } = useHomeHeaderAnimations();
  const {
    titleOpacity,
    titleTransform,
    imageParallax,
    imageScale,
    gradientOpacity,
    imageRotation,
  } = useScrollInterpolations(scrollY);
  const styles = useHomeHeaderStyles();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: containerAnim,
          transform: [{ scale: containerAnim }],
        },
      ]}
      renderToHardwareTextureAndroid
      needsOffscreenAlphaCompositing
      collapsable={false}
    >
      <HeaderTextSection
        titleAnim={titleAnim}
        titleOpacity={titleOpacity}
        titleTransform={titleTransform}
        styles={styles}
      />

      <HeaderImageSection
        imageAnim={imageAnim}
        imageParallax={imageParallax}
        imageScale={imageScale}
        gradientOpacity={gradientOpacity}
        imageRotation={imageRotation}
        styles={styles}
      />
    </Animated.View>
  );
};

export const HomeHeaderSection = React.memo(HomeHeaderSectionComponent);
