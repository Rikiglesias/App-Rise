import React, { useRef } from 'react';
import { SafeAreaView, StyleSheet, View, Animated } from 'react-native';
import { PlatformScrollView } from '../../../components/ui';
import { HeaderSection, HeroImage, EntraInAzione } from '../components';
import { useHomeAnimations, useScrollInterpolations } from '../hooks';
import { useTheme } from '../../../shared/hooks/useTheme';
import { Spacing } from '../../../shared/constants/designTokens';
import type { HomeScreenProps } from '../types';

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;
  const {
    titleAnim,
    imageAnim,
    containerAnim: _containerAnim,
  } = useHomeAnimations();
  const {
    titleOpacity,
    titleTransform,
    imageParallax,
    imageScale,
    gradientOpacity,
    imageRotation,
  } = useScrollInterpolations(scrollY);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.neutral[0],
    },
    content: {
      flexGrow: 1,
      paddingBottom: Spacing[20],
    },
    heroSection: {
      marginBottom: Spacing[3],
    },
    ctaSection: {
      marginHorizontal: Spacing[4],
      paddingTop: 0,
      paddingBottom: Spacing[6],
      marginTop: 0,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <PlatformScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.content}>
          {/* Header Section con titolo e logo */}
          <View style={styles.heroSection}>
            <HeaderSection
              scrollY={scrollY}
              titleAnim={titleAnim}
              titleOpacity={titleOpacity}
              titleTransform={titleTransform}
            />

            {/* Hero Image */}
            <HeroImage
              imageAnim={imageAnim}
              imageParallax={imageParallax}
              imageScale={imageScale}
              gradientOpacity={gradientOpacity}
              imageRotation={imageRotation}
            />
          </View>

          {/* Sezione Entra in Azione con CTA */}
          <View style={styles.ctaSection}>
            <EntraInAzione navigation={navigation} />
          </View>
        </View>
      </PlatformScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
