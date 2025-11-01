import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet } from 'react-native';
import type { StatButtonProps } from '../types/ImpactScreenTypes';
import { IMPACT_DATA } from '../data/impactData';
import {
  PlatformTouchable,
  PerfectText,
  PerfectContainer,
} from '@/components/ui';
import { PerfectImage } from '@/components/ui/PerfectImage';

import {
  BorderRadius,
  Colors,
  Shadows,
  PerfectSpacing,
} from '@/shared/constants';
import { scale, scaleTouch } from '@/shared/constants/perfectScale';
import { IMAGE_DIMENSIONS } from '@/shared/constants/dimensions';

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
      colors={['transparent', Colors.neutral[900]]}
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
    padding: PerfectSpacing.base,
    ...Shadows.md,
  },
  statButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: scaleTouch(50),
    height: scaleTouch(50),
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: PerfectSpacing.base,
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
    padding: PerfectSpacing.base,
  },
  storyLocation: {
    color: Colors.neutral[200],
    textTransform: 'uppercase',
  },
  storyTitle: {
    color: Colors.neutral[0],
    marginTop: PerfectSpacing.xs,
  },
  storyText: {
    color: Colors.neutral[100],
    marginTop: PerfectSpacing.sm,
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.lg,
    padding: PerfectSpacing.base,
    ...Shadows.sm,
  },
  milestoneContent: {
    marginLeft: PerfectSpacing.base,
    flex: 1,
  },
  milestoneTitle: {
    color: Colors.neutral[800],
  },
  milestoneValue: {
    color: Colors.neutral[600],
  },
});
