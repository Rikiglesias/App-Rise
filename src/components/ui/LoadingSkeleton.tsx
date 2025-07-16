import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { BorderRadius, Spacing } from '../../shared/constants/designTokens';
import { useTheme } from '../../shared/hooks/useTheme';

interface LoadingSkeletonProps {
  readonly width?: number | `${number}%`;
  readonly height?: number;
  readonly borderRadius?: number;
  readonly style?: object;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.md,
  style,
}) => {
  const { colors } = useTheme();
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startShimmer = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnimation, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: false,
          }),
          Animated.timing(shimmerAnimation, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };

    startShimmer();
  }, [shimmerAnimation]);

  const shimmerTranslateX = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  const styles = StyleSheet.create({
    skeleton: {
      width,
      height,
      borderRadius,
      backgroundColor: colors.neutral[200],
      overflow: 'hidden',
      position: 'relative',
    },
    shimmer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      transform: [{ translateX: shimmerTranslateX }],
    },
    gradientFill: {
      flex: 1,
    },
  });

  return (
    <View style={[styles.skeleton, style]}>
      <Animated.View style={styles.shimmer}>
        <LinearGradient
          colors={[
            'transparent',
            colors.neutral[100],
            colors.neutral[50],
            colors.neutral[100],
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientFill}
        />
      </Animated.View>
    </View>
  );
};

// Skeleton specifici per diverse sezioni
export const HeaderSkeleton: React.FC = () => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.neutral[50],
      padding: Spacing[6],
      height: 280,
    },
    titleSkeleton: {
      marginBottom: Spacing[4],
    },
    subtitleSkeleton: {
      marginBottom: Spacing[6],
    },
    buttonSkeleton: {
      width: 140,
      height: 44,
    },
  });

  return (
    <View style={styles.container}>
      <LoadingSkeleton width="80%" height={32} style={styles.titleSkeleton} />
      <LoadingSkeleton
        width="60%"
        height={18}
        style={styles.subtitleSkeleton}
      />
      <LoadingSkeleton
        width={140}
        height={44}
        borderRadius={BorderRadius.full}
        style={styles.buttonSkeleton}
      />
    </View>
  );
};

export const ActionsSkeleton: React.FC = () => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      padding: Spacing[4],
      backgroundColor: colors.neutral[0],
      margin: Spacing[4],
      borderRadius: BorderRadius.xl,
    },
    titleSkeleton: {
      alignSelf: 'center',
      marginBottom: Spacing[4],
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: Spacing[3],
    },
    cardSkeleton: {
      width: '48%',
      height: 100,
    },
  });

  return (
    <View style={styles.container}>
      <LoadingSkeleton width="60%" height={28} style={styles.titleSkeleton} />
      <View style={styles.grid}>
        {[1, 2, 3, 4].map(i => (
          <LoadingSkeleton
            key={i}
            width="48%"
            height={100}
            style={styles.cardSkeleton}
          />
        ))}
      </View>
    </View>
  );
};

export const StoriesSkeleton: React.FC = () => {
  const styles = StyleSheet.create({
    container: {
      padding: Spacing[4],
    },
    titleSkeleton: {
      alignSelf: 'center',
      marginBottom: Spacing[4],
    },
    storiesContainer: {
      flexDirection: 'row',
      gap: Spacing[3],
    },
    storySkeleton: {
      width: 200,
      height: 120,
    },
  });

  return (
    <View style={styles.container}>
      <LoadingSkeleton width="70%" height={24} style={styles.titleSkeleton} />
      <View style={styles.storiesContainer}>
        {[1, 2, 3].map(i => (
          <LoadingSkeleton
            key={i}
            width={200}
            height={120}
            style={styles.storySkeleton}
          />
        ))}
      </View>
    </View>
  );
};

export default LoadingSkeleton;
