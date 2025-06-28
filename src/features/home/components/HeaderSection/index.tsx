import React from 'react';
import { Animated, Platform, View } from 'react-native';
import { HeaderTitle } from './HeaderTitle';
import { type HeaderSectionProps } from '../../types';
import { useHeaderSectionStyles } from '../../hooks/useHeaderSectionStyles';

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  scrollY: _scrollY,
  titleAnim,
  titleOpacity,
  titleTransform,
}) => {
  const styles = useHeaderSectionStyles();

  // Android: Rendering completamente statico per evitare artefatti
  if (Platform.OS === 'android') {
    return (
      <View style={styles.container}>
        <HeaderTitle
          titleAnim={new Animated.Value(1)} // Valore statico
          titleOpacity={new Animated.Value(1)} // Valore statico
          titleTransform={new Animated.Value(0)} // Valore statico
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
          opacity: titleAnim,
          transform: [{ scale: titleAnim }],
        },
      ]}
    >
      <HeaderTitle
        titleAnim={titleAnim}
        titleOpacity={titleOpacity}
        titleTransform={titleTransform}
      />
    </Animated.View>
  );
};

export default HeaderSection;
