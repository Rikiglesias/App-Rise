import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ImageSourcePropType,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Surface, Text } from 'react-native-paper';
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from '../constants/designTokens';

interface Story {
  id: string;
  title: string;
  location: string;
  impact: string;
  image: ImageSourcePropType;
  accessibilityLabel: string;
  color: string;
}

interface HeroStoriesCarouselProps {
  stories: Story[];
  autoRotate?: boolean;
  rotateInterval?: number;
  onStoryPress?: (story: Story) => void;
}

export const HeroStoriesCarousel: React.FC<HeroStoriesCarouselProps> = ({
  stories,
  autoRotate = true,
  rotateInterval = 6000,
  onStoryPress,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!autoRotate || stories.length <= 1) return;

    let isMounted = true;

    const interval = setInterval(() => {
      if (!isMounted) return;

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (!isMounted) return;

        setCurrentIndex(prevIndex =>
          prevIndex === stories.length - 1 ? 0 : prevIndex + 1
        );

        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, rotateInterval);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [autoRotate, rotateInterval, stories.length, fadeAnim, scaleAnim]);

  const currentStory = stories[currentIndex];

  if (!currentStory) {
    return null;
  }

  const handleStoryPress = () => {
    if (onStoryPress) {
      onStoryPress(currentStory);
    }
  };

  const dynamicStyles = StyleSheet.create({
    locationBadge: {
      backgroundColor: Colors.neutral[0],
      borderRadius: BorderRadius.full,
      paddingHorizontal: Spacing[3],
      paddingVertical: Spacing[1],
      alignSelf: 'flex-start',
      marginBottom: Spacing[3],
      shadowColor: 'rgba(0, 0, 0, 0.3)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 4,
    },
    indicatorActive: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: Colors.neutral[0],
    },
  });

  return (
    <Surface
      style={styles.container}
      elevation={5}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Storia di impatto: ${currentStory.title}. ${currentStory.impact}`}
    >
      <TouchableOpacity
        style={styles.touchableContainer}
        onPress={handleStoryPress}
        activeOpacity={0.95}
      >
        <View style={styles.overflowContainer}>
          <Animated.View
            style={[
              styles.storyCard,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Image source={currentStory.image} style={styles.storyImage} />

            <LinearGradient
              colors={[
                'transparent',
                'rgba(0, 0, 0, 0.3)',
                'rgba(0, 0, 0, 0.7)',
                'rgba(0, 0, 0, 0.85)',
              ]}
              locations={[0, 0.4, 0.7, 1]}
              style={styles.overlay}
            />

            <View style={styles.textContent}>
              <View style={dynamicStyles.locationBadge}>
                <Text style={styles.locationText}>
                  📍 {currentStory.location}
                </Text>
              </View>

              <Text style={styles.title} numberOfLines={2}>
                {currentStory.title}
              </Text>

              <Text style={styles.impact} numberOfLines={2}>
                ✨ {currentStory.impact}
              </Text>
            </View>

            <View
              style={styles.indicators}
              accessible={true}
              accessibilityLabel={`Storia ${currentIndex + 1} di ${
                stories.length
              }`}
            >
              {stories.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentIndex
                      ? dynamicStyles.indicatorActive
                      : styles.indicatorInactive,
                  ]}
                />
              ))}
            </View>
          </Animated.View>
        </View>
      </TouchableOpacity>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    marginHorizontal: Spacing[4],
    marginTop: Spacing[4],
    borderRadius: BorderRadius.xl,
  },
  touchableContainer: {
    flex: 1,
  },
  overflowContainer: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  storyCard: {
    flex: 1,
    position: 'relative',
  },
  storyImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  textContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing[5],
  },
  locationText: {
    color: Colors.primary[700],
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  title: {
    color: Colors.neutral[0],
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    lineHeight: Typography.lineHeights.tight * Typography.sizes.lg,
    marginBottom: Spacing[2],
    textShadowColor: 'rgba(0, 0, 0, 1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  impact: {
    color: Colors.neutral[0],
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  indicators: {
    position: 'absolute',
    bottom: Spacing[3],
    right: Spacing[5],
    flexDirection: 'row',
    gap: Spacing[2],
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  indicatorInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
});

export default HeroStoriesCarousel;
