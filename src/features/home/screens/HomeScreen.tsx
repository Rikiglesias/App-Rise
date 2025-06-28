import React, { useRef } from 'react';
import { SafeAreaView, StyleSheet, View, Animated } from 'react-native';
import { PlatformScrollView } from '../../../components/ui';
import { HeroImage, EntraInAzione } from '../components';
import { useHomeAnimations } from '../hooks';
import { useTheme } from '../../../shared/hooks/useTheme';
import { Spacing } from '../../../shared/constants/designTokens';
import { HomeHeaderSection } from '../../../components/domain/HomeHeaderSection';
import type { HomeScreenProps } from '../types';

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;
  const {
    titleAnim: _titleAnim,
    imageAnim,
    containerAnim: _containerAnim,
  } = useHomeAnimations();
  // Temporarily disabled scroll animations to fix onScroll error
  // const scrollInterpolations = useScrollInterpolations(scrollY);

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
      <PlatformScrollView>
        <View style={styles.content}>
          {/* Header Section con titolo e logo */}
          <View style={styles.heroSection}>
            <HomeHeaderSection scrollY={scrollY} />

            {/* Hero Image */}
            <HeroImage
              imageAnim={imageAnim}
              imageParallax={new Animated.Value(0)}
              imageScale={new Animated.Value(1)}
              gradientOpacity={new Animated.Value(0)}
              imageRotation={new Animated.Value(0).interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '0deg'],
              })}
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
