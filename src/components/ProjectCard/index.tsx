import React from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Surface } from 'react-native-paper';

import { BorderRadius, Spacing } from '../../shared/constants/designTokens';
import { useAnimatedPress } from '../../shared/hooks/useAnimatedPress';
import { useTheme } from '../../shared/hooks/useTheme';

import { ProjectContent } from './ProjectContent';
import { ProjectHeader } from './ProjectHeader';
import { ProjectProgress } from './ProjectProgress';
import type { ProjectCardProps, ProjectStatus } from './types';

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================
const getStatusColor = (
  status: ProjectStatus,
  colors: ReturnType<typeof useTheme>['colors']
): string => {
  switch (status) {
    case 'active':
      return colors.semantic.success.main;
    case 'completed':
      return colors.primary[500];
    case 'upcoming':
      return colors.semantic.warning.main;
    default:
      return colors.neutral[400];
  }
};

const getStatusText = (status: ProjectStatus): string => {
  switch (status) {
    case 'active':
      return 'In Corso';
    case 'completed':
      return 'Completato';
    case 'upcoming':
      return 'Prossimo';
    default:
      return '';
  }
};

// ===================================================================
// MAIN COMPONENT
// ===================================================================
export const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  location,
  description,
  impact,
  status,
  progress,
  onPress,
}) => {
  const { colors } = useTheme();
  const { animatedStyle, handlePressIn, handlePressOut } = useAnimatedPress();

  const statusColor = getStatusColor(status, colors);
  const statusText = getStatusText(status);
  const isDisabled = !onPress;

  const styles = StyleSheet.create({
    container: {
      marginBottom: Spacing[4],
    },
    surface: {
      borderRadius: BorderRadius.xl,
      backgroundColor: colors.neutral[0],
      shadowColor: colors.neutral[900],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      borderWidth: 1,
      borderColor: colors.neutral[100],
      elevation: 3,
    },
    content: {
      padding: Spacing[6],
    },
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={`Progetto ${title} in ${location}`}
      >
        <Surface style={styles.surface}>
          <View style={styles.content}>
            <ProjectHeader
              title={title}
              location={location}
              statusColor={statusColor}
              statusText={statusText}
            />

            <ProjectContent description={description} impact={impact} />

            {progress !== undefined && (
              <ProjectProgress progress={progress} statusColor={statusColor} />
            )}
          </View>
        </Surface>
      </Pressable>
    </Animated.View>
  );
};

export default ProjectCard;
