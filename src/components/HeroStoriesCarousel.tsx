import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  readonly stories: Story[];
  readonly autoRotate?: boolean;
  readonly rotateInterval?: number;
  readonly onStoryPress?: (story: Story) => void;
}

// Hook per le animazioni del carousel
const useCarouselAnimation = (
  stories: Story[],
  autoRotate: boolean,
  rotateInterval: number
) => {
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
        setCurrentIndex(prev => (prev === stories.length - 1 ? 0 : prev + 1));
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

  return { currentIndex, fadeAnim, scaleAnim };
};

// Componente per gli indicatori
const StoryIndicators: React.FC<{
  stories: Story[];
  currentIndex: number;
}> = ({ stories, currentIndex }) => (
  <View style={styles.indicators}>
    {stories.map((story, index) => (
      <View
        key={`indicator-${story.id}`}
        style={[
          styles.indicator,
          index === currentIndex
            ? styles.indicatorActive
            : styles.indicatorInactive,
        ]}
      />
    ))}
  </View>
);

// Componente per il contenuto del testo
const StoryTextContent: React.FC<{ story: Story }> = ({ story }) => (
  <View style={styles.textContent}>
    <View style={styles.locationBadge}>
      <Text style={styles.locationText}>📍 {story.location}</Text>
    </View>
    <Text style={styles.title} numberOfLines={2}>
      {story.title}
    </Text>
    <Text style={styles.impact} numberOfLines={2}>
      ✨ {story.impact}
    </Text>
  </View>
);

// Componente principale della storia
const StoryCard: React.FC<{
  story: Story;
  fadeAnim: Animated.Value;
  scaleAnim: Animated.Value;
  onPress: () => void;
  stories: Story[];
  currentIndex: number;
}> = ({ story, fadeAnim, scaleAnim, onPress, stories, currentIndex }) => (
  <TouchableOpacity
    style={styles.touchableContainer}
    onPress={onPress}
    activeOpacity={0.95}
  >
    <View style={styles.overflowContainer}>
      <Animated.View
        style={[
          styles.storyCard,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Image source={story.image} style={styles.storyImage} />
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
        <StoryTextContent story={story} />
        <StoryIndicators stories={stories} currentIndex={currentIndex} />
      </Animated.View>
    </View>
  </TouchableOpacity>
);

export const HeroStoriesCarousel: React.FC<HeroStoriesCarouselProps> = ({
  stories,
  autoRotate = true,
  rotateInterval = 6000,
  onStoryPress,
}) => {
  const { currentIndex, fadeAnim, scaleAnim } = useCarouselAnimation(
    stories,
    autoRotate,
    rotateInterval
  );

  const currentStory = stories[currentIndex];

  const handleStoryPress = useCallback(() => {
    if (onStoryPress && currentStory) {
      onStoryPress(currentStory);
    }
  }, [onStoryPress, currentStory]);

  if (!currentStory) return null;

  return (
    <Surface
      style={styles.container}
      elevation={5}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`Storia di impatto: ${currentStory.title}. ${currentStory.impact}`}
    >
      <StoryCard
        story={currentStory}
        fadeAnim={fadeAnim}
        scaleAnim={scaleAnim}
        onPress={handleStoryPress}
        stories={stories}
        currentIndex={currentIndex}
      />
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
  touchableContainer: { flex: 1 },
  overflowContainer: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  storyCard: { flex: 1, position: 'relative' },
  storyImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: { ...StyleSheet.absoluteFillObject },
  textContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing[4],
  },
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
  locationText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutral[700],
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[0],
    marginBottom: Spacing[2],
    lineHeight: Typography.sizes.lg * 1.3,
  },
  impact: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[100],
    lineHeight: Typography.sizes.sm * 1.4,
  },
  indicators: {
    position: 'absolute',
    bottom: Spacing[4],
    right: Spacing[4],
    flexDirection: 'row',
    gap: Spacing[1],
  },
  indicator: { width: 8, height: 8, borderRadius: 4 },
  indicatorActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.neutral[0],
  },
  indicatorInactive: { backgroundColor: 'rgba(255, 255, 255, 0.5)' },
});
