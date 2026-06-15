import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { IMPACT_DATA } from '../data/impactData';
import type { StatButtonProps } from '../types/ImpactScreenTypes';
import {
  PerfectIcon,
  PlatformTouchable,
  PerfectText,
  PerfectContainer,
  PerfectImage,
} from '@/components/ui';

import {
  BorderRadius,
  Colors,
  Shadows,
  PerfectSpacing,
} from '@/shared/constants';
import { scaleTouch } from '@/shared/constants/perfectScale';
import { IMAGE_DIMENSIONS } from '@/shared/constants/dimensions';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

export const StatButton: React.FC<StatButtonProps> = ({
  icon,
  label,
  value,
  onPress,
  color,
}) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <PlatformTouchable
      onPress={onPress}
      style={styles.statButton}
      activeOpacity={0.8}
    >
      <PerfectContainer style={styles.statButtonContent}>
        <PerfectContainer
          style={[styles.iconContainer, { backgroundColor: color }]}
        >
          {/* Icona bianca fissa: sta su cerchio brand colorato (color prop) */}
          <PerfectIcon name={icon} size={28} color={Colors.accent.white} />
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
        <PerfectIcon
          name="chevron-right"
          size={24}
          color={colors.neutral[400]}
        />
      </PerfectContainer>
    </PlatformTouchable>
  );
};

export const StoryCard: React.FC<(typeof IMPACT_DATA.stories)[number]> = ({
  title,
  location,
  text,
  image,
}) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <PerfectContainer style={styles.storyCard}>
      <PerfectImage
        width={280}
        height={360}
        borderRadius={24}
        source={{ uri: image }}
      />
      {/* Scrim fisso scuro: leggibilità del testo bianco sopra la foto (theme-independent) */}
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
};

export const MilestoneCard: React.FC<
  (typeof IMPACT_DATA.milestones)[number]
> = ({ title, value, icon }) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <PerfectContainer style={styles.milestoneCard}>
      <PerfectIcon name={icon} size={24} color={colors.primary[600]} />
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
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    statButton: {
      backgroundColor: colors.neutral[0],
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
      color: colors.neutral[800],
    },
    statLabel: {
      color: colors.neutral[600],
    },
    storyCard: {
      width: IMAGE_DIMENSIONS.STORY_WIDTH,
      height: IMAGE_DIMENSIONS.STORY_HEIGHT,
      backgroundColor: colors.neutral[200],
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
    // Testo su foto: colori fissi (chiari), indipendenti dal tema
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
      backgroundColor: colors.neutral[0],
      borderRadius: BorderRadius.lg,
      padding: PerfectSpacing.base,
      ...Shadows.sm,
    },
    milestoneContent: {
      marginLeft: PerfectSpacing.base,
      flex: 1,
    },
    milestoneTitle: {
      color: colors.neutral[800],
    },
    milestoneValue: {
      color: colors.neutral[600],
    },
  });
