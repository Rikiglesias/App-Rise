import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Image, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { BorderRadius, Spacing, Typography } from '../constants/designTokens';
import { useTheme } from '../hooks/useTheme';

const { height: windowHeight, width: windowWidth } = Dimensions.get('window');

// Configuration inline
const ADVANCED_CONFIG = {
  headerSection: {
    paddingVertical: Spacing[6],
    paddingHorizontal: Spacing[4],
    minHeight: 120,
  },
  imageSection: {
    height: windowHeight * 0.5,
  },
  typography: {
    title: windowWidth < 375 ? 28 : 32,
    lineHeight: windowWidth < 375 ? 32 : 36,
  },
  animations: {
    staggerDelay: 200,
    fadeInDuration: 1200,
  },
  scrollEffects: {
    fadeRange: [0, 150],
    translateRange: [0, 80],
    parallaxRange: [0, 350],
    scaleRange: [1, 1.05],
  },
};

// Hook for animations
const useHomeHeaderAnimations = (): {
  titleAnim: Animated.Value;
  imageAnim: Animated.Value;
  containerAnim: Animated.Value;
  pulseAnim: Animated.Value;
} => {
  const titleAnim = useRef(new Animated.Value(0)).current;
  const imageAnim = useRef(new Animated.Value(0)).current;
  const containerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation for hero banner
    const pulseAnimation = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.02,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]);

    // Main entrance animation
    Animated.sequence([
      Animated.timing(containerAnim, {
        toValue: 1,
        duration: ADVANCED_CONFIG.animations.fadeInDuration * 0.6,
        useNativeDriver: true,
      }),
      Animated.stagger(ADVANCED_CONFIG.animations.staggerDelay, [
        Animated.spring(titleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 120,
          friction: 8,
        }),
        Animated.timing(imageAnim, {
          toValue: 1,
          duration: ADVANCED_CONFIG.animations.fadeInDuration,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Start continuous pulse animation
    Animated.loop(pulseAnimation).start();
  }, [containerAnim, titleAnim, imageAnim, pulseAnim]);

  return { titleAnim, imageAnim, containerAnim, pulseAnim };
};

// Hook for scroll interpolations
const useScrollInterpolations = (
  scrollY: Animated.Value
): {
  titleOpacity: Animated.AnimatedInterpolation<number>;
  titleTransform: Animated.AnimatedInterpolation<number>;
  imageParallax: Animated.AnimatedInterpolation<number>;
  imageScale: Animated.AnimatedInterpolation<number>;
  gradientOpacity: Animated.AnimatedInterpolation<number>;
} => {
  const titleOpacity = scrollY.interpolate({
    inputRange: ADVANCED_CONFIG.scrollEffects.fadeRange,
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const titleTransform = scrollY.interpolate({
    inputRange: ADVANCED_CONFIG.scrollEffects.translateRange,
    outputRange: [0, -40],
    extrapolate: 'clamp',
  });

  const imageParallax = scrollY.interpolate({
    inputRange: ADVANCED_CONFIG.scrollEffects.parallaxRange,
    outputRange: [0, -100],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: ADVANCED_CONFIG.scrollEffects.scaleRange,
    extrapolate: 'clamp',
  });

  const gradientOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0.1, 0.3],
    extrapolate: 'clamp',
  });

  return {
    titleOpacity,
    titleTransform,
    imageParallax,
    imageScale,
    gradientOpacity,
  };
};

// Style factories split for max-lines-per-function compliance
const createContainerStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.neutral[50],
      overflow: 'hidden',
    },
    headerSection: {
      paddingVertical: ADVANCED_CONFIG.headerSection.paddingVertical,
      paddingHorizontal: ADVANCED_CONFIG.headerSection.paddingHorizontal,
      minHeight: ADVANCED_CONFIG.headerSection.minHeight,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    gradientBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.05,
    },
    textContainer: {
      alignItems: 'center',
      zIndex: 2,
    },
  });

const createTextStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    title: {
      color: colors.neutral[900],
      fontSize: windowWidth < 375 ? 32 : 36,
      fontWeight: Typography.weights.bold,
      fontFamily: Typography.families.heading,
      textAlign: 'center',
      lineHeight: windowWidth < 375 ? 38 : 42,
      letterSpacing: -0.8,
      marginBottom: Spacing[4],
    },
    subtitle: {
      color: colors.neutral[600],
      fontSize: Typography.sizes.lg,
      fontWeight: Typography.weights.regular,
      textAlign: 'center',
      lineHeight: Typography.lineHeights.relaxed * Typography.sizes.lg,
      letterSpacing: 0.2,
      paddingHorizontal: Spacing[6],
    },
  });

const createImageStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  /* eslint-disable react-native/no-unused-styles */
  StyleSheet.create({
    // Tutti questi stili sono utilizzati nel componente HeaderImageSection
    // ma ESLint non riesce a rilevarlo perché vengono passati tramite props
    imageSection: {
      height: ADVANCED_CONFIG.imageSection.height,
      width: '100%',
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      marginVertical: Spacing[4],
    },
    imageContainer: {
      width: '100%',
      height: '100%',
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
      shadowColor: colors.neutral[400],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    imageGradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    // Stile estratto per evitare inline style warning
    flexOne: {
      flex: 1,
    },
  });
/* eslint-enable react-native/no-unused-styles */

const createMissionStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  /* eslint-disable react-native/no-unused-styles */
  StyleSheet.create({
    // Tutti questi stili sono utilizzati nel componente HeaderMissionSection
    // ma ESLint non riesce a rilevarlo perché vengono passati tramite props
    missionSection: {
      paddingHorizontal: Spacing[4],
      paddingVertical: Spacing[6],
    },
    missionCard: {
      backgroundColor: colors.neutral[0],
      borderRadius: BorderRadius.lg,
      padding: Spacing[4],
      shadowColor: colors.neutral[400],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.neutral[100],
    },
    missionTitle: {
      fontSize: Typography.sizes.xl,
      fontWeight: Typography.weights.bold,
      color: colors.neutral[900],
      textAlign: 'center',
      marginBottom: Spacing[3],
    },
    missionDescription: {
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.regular,
      color: colors.neutral[700],
      textAlign: 'center',
      lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
      marginBottom: Spacing[4],
    },
    missionStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: Typography.sizes['2xl'],
      fontWeight: Typography.weights.bold,
      color: colors.primary[600],
      marginBottom: Spacing[1],
    },
    statLabel: {
      fontSize: Typography.sizes.sm,
      fontWeight: Typography.weights.medium,
      color: colors.neutral[600],
      textAlign: 'center',
    },
  });
/* eslint-enable react-native/no-unused-styles */

// Hook for styles - now under 60 lines
const useHomeHeaderStyles = () => {
  const { colors } = useTheme();

  return useMemo(
    () => ({
      ...createContainerStyles(colors),
      ...createTextStyles(colors),
      ...createImageStyles(colors),
      ...createMissionStyles(colors),
    }),
    [colors]
  );
};

interface HomeHeaderSectionProps {
  readonly scrollY: Animated.Value;
  readonly onJoinPress?: () => void;
}

// Sub-components for max-lines-per-function compliance
interface HeaderTextSectionProps {
  readonly colors: ReturnType<typeof useTheme>['colors'];
  readonly titleAnim: Animated.Value;
  readonly titleOpacity: Animated.AnimatedInterpolation<number>;
  readonly titleTransform: Animated.AnimatedInterpolation<number>;
  readonly styles: ReturnType<typeof useHomeHeaderStyles>;
}

const HeaderTextSection: React.FC<HeaderTextSectionProps> = React.memo(
  ({ colors, titleAnim, titleOpacity, titleTransform, styles }) => (
    <View style={styles.headerSection}>
      <LinearGradient
        colors={[colors.primary[100], colors.primary[50], colors.neutral[50]]}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.textContainer}>
        <Animated.View
          style={{
            opacity: Animated.multiply(titleAnim, titleOpacity),
            transform: [
              {
                translateY: Animated.add(
                  titleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                  titleTransform
                ),
              },
              { scale: titleAnim },
            ],
          }}
        >
          <Text style={styles.title}>Rise Against Hunger Italia</Text>
        </Animated.View>
      </View>
    </View>
  )
);

HeaderTextSection.displayName = 'HeaderTextSection';

interface HeaderImageSectionProps {
  readonly imageAnim: Animated.Value;
  readonly imageParallax: Animated.AnimatedInterpolation<number>;
  readonly imageScale: Animated.AnimatedInterpolation<number>;
  readonly gradientOpacity: Animated.AnimatedInterpolation<number>;
  readonly pulseAnim: Animated.Value;
  readonly styles: ReturnType<typeof useHomeHeaderStyles>;
}

const HeaderImageSection: React.FC<HeaderImageSectionProps> = React.memo(
  ({
    imageAnim,
    imageParallax,
    imageScale,
    gradientOpacity,
    pulseAnim,
    styles,
  }) => (
    <View style={styles.imageSection}>
      <Animated.View
        style={[
          styles.imageContainer,
          {
            opacity: imageAnim,
            transform: [
              { translateY: imageParallax },
              { scale: Animated.multiply(imageScale, pulseAnim) },
            ],
          },
        ]}
      >
        <Image
          source={require('../../assets/images/hero-banner.png')}
          style={styles.image}
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
  )
);

HeaderImageSection.displayName = 'HeaderImageSection';

interface HeaderMissionSectionProps {
  readonly styles: ReturnType<typeof useHomeHeaderStyles>;
}

const HeaderMissionSection: React.FC<HeaderMissionSectionProps> = React.memo(
  ({ styles }) => (
    <View style={styles.missionSection}>
      <View style={styles.missionCard}>
        <Text style={styles.missionTitle}>🌍 La nostra missione</Text>
        <Text style={styles.missionDescription}>
          Combattiamo la fame nel mondo attraverso programmi alimentari
          concreti, coinvolgendo comunità locali e volontari per creare un
          impatto duraturo.
        </Text>
        <View style={styles.missionStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>3.1M</Text>
            <Text style={styles.statLabel}>Pasti distribuiti</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>13K</Text>
            <Text style={styles.statLabel}>Volontari attivi</Text>
          </View>
        </View>
      </View>
    </View>
  )
);

HeaderMissionSection.displayName = 'HeaderMissionSection';

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
