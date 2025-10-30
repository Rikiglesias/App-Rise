import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet } from 'react-native';
import {
  PlatformTouchable,
  PerfectText,
  PerfectContainer,
} from '../../../components/ui';
// ELIMINATO: scaleDimensionLinear from '../../../shared/constants/responsiveSystem';
import { PerfectImage } from '../../../components/ui/PerfectImage';

import { IMPACT_DATA } from '../../../data/impactData';
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
} from '../../../shared/constants';
import { IMAGE_DIMENSIONS } from '../../../shared/constants/dimensions';
import type { StatButtonProps } from '../types/ImpactScreenTypes';

export const StatButton: React.FC<StatButtonProps> = ({
  icon,
  label,
  value,
  onPress,
  color,
}) => (
  <PlatformTouchable
    onPress={onPress}
    style={styles.statButton}
    activeOpacity={0.8}
  >
    <PerfectContainer style={styles.statButtonContent}>
      <PerfectContainer
        style={[styles.iconContainer, { backgroundColor: color }]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={28}
          color={Colors.neutral[0]}
        />
      </PerfectContainer>
      <PerfectContainer style={styles.textContainer}>
        <PerfectText
          size={22}
          lines={1}
          fontWeight="700"
          immunity={true}
          style={styles.statValue}
        >
          {value}
        </PerfectText>
        <PerfectText
          size={15}
          lines={1}
          immunity={true}
          style={styles.statLabel}
        >
          {label}
        </PerfectText>
      </PerfectContainer>
      <MaterialCommunityIcons
        name="chevron-right"
        size={24}
        color={Colors.neutral[400]}
      />
    </PerfectContainer>
  </PlatformTouchable>
);

export const StoryCard: React.FC<(typeof IMPACT_DATA.stories)[number]> = ({
  title,
  location,
  text,
  image,
}) => (
  <PerfectContainer style={styles.storyCard}>
    <PerfectImage
      width={280}
      height={360}
      borderRadius={24}
      source={{ uri: image }}
    />
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.7)']}
      style={styles.storyGradient}
    />
    <PerfectContainer style={styles.storyContent}>
      <PerfectText
        size={12}
        lines={1}
        fontWeight="600"
        immunity={true}
        style={styles.storyLocation}
      >
        {location}
      </PerfectText>
      <PerfectText
        size={22}
        lines={1}
        fontWeight="700"
        immunity={true}
        style={styles.storyTitle}
      >
        {title}
      </PerfectText>
      <PerfectText size={14} lines={2} immunity={true} style={styles.storyText}>
        {text}
      </PerfectText>
    </PerfectContainer>
  </PerfectContainer>
);

export const MilestoneCard: React.FC<
  (typeof IMPACT_DATA.milestones)[number]
> = ({ title, value, icon }) => (
  <PerfectContainer style={styles.milestoneCard}>
    <MaterialCommunityIcons name={icon} size={24} color={Colors.primary[600]} />
    <PerfectContainer style={styles.milestoneContent}>
      <PerfectText
        size={15}
        lines={1}
        fontWeight="600"
        immunity={true}
        style={styles.milestoneTitle}
      >
        {title}
      </PerfectText>
      <PerfectText
        size={12}
        lines={1}
        immunity={true}
        style={styles.milestoneValue}
      >
        {value}
      </PerfectText>
    </PerfectContainer>
  </PerfectContainer>
);

const styles = StyleSheet.create({
  statButton: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    ...Shadows.md,
  },
  statButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing[4],
  },
  textContainer: {
    flex: 1,
  },
  statValue: {
    color: Colors.neutral[800],
  },
  statLabel: {
    color: Colors.neutral[600],
  },
  storyCard: {
    width: IMAGE_DIMENSIONS.STORY_WIDTH,
    height: IMAGE_DIMENSIONS.STORY_HEIGHT,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.xl,
    ...Shadows.lg,
    overflow: 'hidden',
  },
  storyImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  storyGradient: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  storyContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: Spacing[4],
  },
  storyLocation: {
    color: Colors.neutral[200],
    textTransform: 'uppercase',
  },
  storyTitle: {
    color: Colors.neutral[0],
    marginTop: Spacing[1],
  },
  storyText: {
    color: Colors.neutral[100],
    marginTop: Spacing[2],
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.lg,
    padding: Spacing[4],
    ...Shadows.sm,
  },
  milestoneContent: {
    marginLeft: Spacing[4],
    flex: 1,
  },
  milestoneTitle: {
    color: Colors.neutral[800],
  },
  milestoneValue: {
    color: Colors.neutral[600],
  },
});
