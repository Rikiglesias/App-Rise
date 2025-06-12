import React from 'react';
import type { ImageSourcePropType } from 'react-native';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { Spacing, Typography } from '../constants/designTokens';
import { useTheme } from '../hooks/useTheme';

import { HeroStoriesCarousel } from './HeroStoriesCarousel';
import SectionContainer from './SectionContainer';

interface Story {
  id: string;
  title: string;
  location: string;
  impact: string;
  image: ImageSourcePropType;
  accessibilityLabel: string;
  color: string;
}

interface HomeHeroStoriesSectionProps {
  readonly stories: Story[];
  readonly onStoryPress?: (story: Story) => void;
}

export const HomeHeroStoriesSection: React.FC<HomeHeroStoriesSectionProps> = ({
  stories,
  onStoryPress,
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    sectionTitlePrimary: {
      color: colors.primary[700],
      textAlign: 'center',
      marginBottom: Spacing[8],
      fontWeight: Typography.weights.extrabold,
      fontSize: Typography.sizes['3xl'],
      letterSpacing: -0.8,
      lineHeight: Typography.sizes['3xl'] * 1.1,
    },
    sectionSubtitle: {
      color: colors.neutral[600],
      textAlign: 'center',
      marginBottom: Spacing[6],
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.medium,
      letterSpacing: 0.2,
      marginTop: -Spacing[4],
    },
  });

  return (
    <SectionContainer spacing="standard">
      <Text variant="displaySmall" style={styles.sectionTitlePrimary}>
        🌟 Storie di Impatto
      </Text>
      <Text style={styles.sectionSubtitle}>
        Scopri come stiamo cambiando vite in tutto il mondo
      </Text>
      <HeroStoriesCarousel
        stories={stories}
        autoRotate
        rotateInterval={6000}
        {...(onStoryPress && { onStoryPress })}
      />
    </SectionContainer>
  );
};

export default HomeHeroStoriesSection;
