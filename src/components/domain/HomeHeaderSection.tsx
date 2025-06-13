import React from 'react';
import { Animated } from 'react-native';

import {
  useHomeHeaderAnimations,
  useScrollInterpolations,
} from '../../hooks/useHomeHeaderHooks';
import { useHomeHeaderStyles } from '../../hooks/useHomeHeaderStyles';
import { useTheme } from '../../shared/hooks/useTheme';
import { type HomeHeaderSectionProps } from '../../types/HomeHeaderTypes';
import {
  HeaderImageSection,
  HeaderMissionSection,
  HeaderTextSection,
} from './HomeHeaderSubComponents';

// Main Component - Now under 60 lines
export const HomeHeaderSection: React.FC<HomeHeaderSectionProps> = ({
  scrollY,
}) => {
  const { colors } = useTheme();
  const { titleAnim, imageAnim, containerAnim, pulseAnim } =
    useHomeHeaderAnimations();
  const {
    titleOpacity,
    titleTransform,
    imageParallax,
    imageScale,
    gradientOpacity,
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
    >
      <HeaderTextSection
        colors={colors}
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
        pulseAnim={pulseAnim}
        styles={styles}
      />

      <HeaderMissionSection styles={styles} />
    </Animated.View>
  );
};

export default HomeHeaderSection;
