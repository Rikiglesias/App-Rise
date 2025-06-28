import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { PlatformTouchable } from '../../../components/ui';

import { IMPACT_DATA } from '../../../data/impactData';
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from '../../../shared/constants/designTokens';
import type { StatButtonProps } from '../types/ImpactScreenTypes';
import FormattedText from '../../../components/ui/FormattedText';

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
    <View style={styles.statButtonContent}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <MaterialCommunityIcons
          name={icon}
          size={28}
          color={Colors.neutral[0]}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={24}
        color={Colors.neutral[400]}
      />
    </View>
  </PlatformTouchable>
);

export const StoryCard: React.FC<(typeof IMPACT_DATA.stories)[number]> = ({
  title,
  location,
  text,
  image,
}) => (
  <View style={styles.storyCard}>
    <Image source={{ uri: image }} style={styles.storyImage} />
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.7)']}
      style={styles.storyGradient}
    />
    <View style={styles.storyContent}>
      <Text style={styles.storyLocation}>{location}</Text>
      <Text style={styles.storyTitle}>{title}</Text>
      <FormattedText text={text} style={styles.storyText} />
    </View>
  </View>
);

export const MilestoneCard: React.FC<
  (typeof IMPACT_DATA.milestones)[number]
> = ({ title, value, icon }) => (
  <View style={styles.milestoneCard}>
    <MaterialCommunityIcons name={icon} size={24} color={Colors.primary[600]} />
    <View style={styles.milestoneContent}>
      <Text style={styles.milestoneTitle}>{title}</Text>
      <Text style={styles.milestoneValue}>{value}</Text>
    </View>
  </View>
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
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
  },
  statLabel: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
  },
  storyCard: {
    width: 280,
    height: 360,
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
    fontWeight: Typography.weights.semibold,
    fontSize: Typography.sizes.sm,
    textTransform: 'uppercase',
  },
  storyTitle: {
    color: Colors.neutral[0],
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes['2xl'],
    marginTop: Spacing[1],
  },
  storyText: {
    color: Colors.neutral[100],
    fontSize: Typography.sizes.sm,
    marginTop: Spacing[2],
    lineHeight: Typography.lineHeights.snug,
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
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutral[800],
  },
  milestoneValue: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
  },
});
