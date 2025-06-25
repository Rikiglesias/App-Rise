import React from 'react';
import { Animated, Platform, View } from 'react-native';

import {
  useHomeHeaderAnimations,
  useScrollInterpolations,
} from '../../hooks/useHomeHeaderHooks';
import { useHomeHeaderStyles } from '../../hooks/useHomeHeaderStyles';
import { useTheme } from '../../shared/hooks/useTheme';
import { type HomeHeaderSectionProps } from '../../types/HomeHeaderTypes';
import {
  HeaderImageSection,
  HeaderTextSection,
} from './HomeHeaderSubComponents';

// Main Component - Now under 60 lines
export const HomeHeaderSection: React.FC<HomeHeaderSectionProps> = ({
  scrollY,
}) => {
  const { colors } = useTheme();
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

  // Android: Rendering completamente statico per evitare tutti gli artefatti
  if (Platform.OS === 'android') {
    return (
      <View style={styles.container}>
        <HeaderTextSection
          colors={colors}
          titleAnim={new Animated.Value(1)} // Valore statico
          titleOpacity={new Animated.Value(1)} // Valore statico
          titleTransform={new Animated.Value(0)} // Valore statico
          styles={styles}
        />

        <HeaderImageSection
          imageAnim={new Animated.Value(1)} // Valore statico
          imageParallax={new Animated.Value(0)} // Valore statico
          imageScale={new Animated.Value(1)} // Valore statico
          gradientOpacity={new Animated.Value(0)} // Valore statico
          imageRotation={scrollY.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '0deg'],
            extrapolate: 'clamp',
          })} // Statico
          styles={styles}
        />
      </View>
    );
  }

  // iOS: Mantiene tutte le animazioni
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
        imageRotation={imageRotation}
        styles={styles}
      />

      {/* HeaderMissionSection rimossa - spostata nella pagina impatto */}
    </Animated.View>
  );
};

export default HomeHeaderSection;
