/* eslint-disable react-native/no-unused-styles */
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Colors, Spacing, Typography } from '../constants/designTokens';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface HomeTabScreenProps {
  navigation: StackNavigationProp<Record<string, object | undefined>>;
}

export type { HomeTabScreenProps };

// Modern Animation Hook
const useModernAnimations = () => {
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(-20)).current;
  const imageFade = useRef(new Animated.Value(0)).current;
  const imageSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const sequence = Animated.sequence([
      // Prima il titolo
      Animated.parallel([
        Animated.timing(titleFade, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(titleSlide, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
      ]),
      // Poi l'immagine con un piccolo delay
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(imageFade, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(imageSlide, {
          toValue: 0,
          useNativeDriver: true,
          tension: 40,
          friction: 8,
        }),
      ]),
    ]);

    sequence.start();

    return () => {
      sequence.stop();
    };
  }, [titleFade, titleSlide, imageFade, imageSlide]);

  return { titleFade, titleSlide, imageFade, imageSlide };
};

// Modern Header Section
const ModernHeaderSection: React.FC<{
  animations: ReturnType<typeof useModernAnimations>;
}> = ({ animations }) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        headerContainer: {
          paddingTop: Spacing[8],
          paddingHorizontal: Spacing[6],
          paddingBottom: Spacing[6],
          backgroundColor: Colors.neutral[0],
        },
        titleText: {
          fontSize: screenWidth > 375 ? 42 : 36,
          fontWeight: Typography.weights.black,
          color: '#DC2626', // Rosso moderno
          textAlign: 'center',
          letterSpacing: -0.8,
          lineHeight: screenWidth > 375 ? 48 : 42,
        },
      }),
    []
  );

  return (
    <View style={styles.headerContainer}>
      <Animated.Text
        style={[
          styles.titleText,
          {
            opacity: animations.titleFade,
            transform: [{ translateY: animations.titleSlide }],
          },
        ]}
      >
        Rise Against Hunger Italia
      </Animated.Text>
    </View>
  );
};

// Clean Image Section
const CleanImageSection: React.FC<{
  animations: ReturnType<typeof useModernAnimations>;
}> = ({ animations }) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        imageContainer: {
          flex: 1,
        },
        heroImage: {
          width: '100%',
          height: screenHeight * 0.7,
          resizeMode: 'cover',
        },
      }),
    []
  );

  return (
    <Animated.View
      style={[
        styles.imageContainer,
        {
          opacity: animations.imageFade,
          transform: [{ translateY: animations.imageSlide }],
        },
      ]}
    >
      <Image
        source={require('../../assets/images/hero-banner.png')}
        style={styles.heroImage}
      />
    </Animated.View>
  );
};

// Main Component
export const HomeTabScreen: React.FC<HomeTabScreenProps> = ({
  navigation: _,
}) => {
  const animations = useModernAnimations();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: Colors.neutral[0],
        },
        scrollView: {
          flex: 1,
        },
        content: {
          flex: 1,
        },
      }),
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        bounces={false}
      >
        <View style={styles.content}>
          <ModernHeaderSection animations={animations} />
          <CleanImageSection animations={animations} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
