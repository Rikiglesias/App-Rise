import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Surface, Text } from 'react-native-paper';

import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from '../constants/designTokens';
import { useTheme } from '../hooks/useTheme';

interface ProjectCardProps {
  readonly title: string;
  readonly location: string;
  readonly description: string;
  readonly impact: string;
  readonly status: 'active' | 'completed' | 'upcoming';
  readonly progress?: number | undefined; // 0-100
  readonly onPress?: () => void;
}

// ===================================================================
// TYPE DEFINITIONS
// ===================================================================
type ProjectStatus = 'active' | 'completed' | 'upcoming';

// ===================================================================
// HELPER FUNCTIONS - Pure functions extracted
// ===================================================================
const getStatusColor = (
  status: ProjectStatus,
  colors: typeof Colors
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
// STYLE FACTORIES - Extracted from component
// ===================================================================
const createContainerStyles = (colors: typeof Colors) =>
  StyleSheet.create({
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

const createHeaderStyles = (colors: typeof Colors) =>
  /* eslint-disable react-native/no-unused-styles */
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: Spacing[4],
    },
    titleContainer: {
      flex: 1,
      marginRight: Spacing[3],
    },
    title: {
      fontSize: Typography.sizes.lg,
      fontWeight: Typography.weights.bold,
      color: colors.neutral[900],
      marginBottom: Spacing[1],
      lineHeight: Typography.sizes.lg * 1.2,
    },
    location: {
      fontSize: Typography.sizes.sm,
      color: colors.neutral[500],
      fontWeight: Typography.weights.medium,
    },
    statusBadge: {
      paddingHorizontal: Spacing[3],
      paddingVertical: Spacing[1],
      borderRadius: BorderRadius.full,
      minWidth: 80,
      alignItems: 'center',
    },
    statusText: {
      fontSize: Typography.sizes.xs,
      fontWeight: Typography.weights.bold,
      color: colors.neutral[0],
    },
  });

const createContentStyles = (colors: typeof Colors) =>
  /* eslint-disable react-native/no-unused-styles */
  StyleSheet.create({
    description: {
      fontSize: Typography.sizes.base,
      color: colors.neutral[700],
      lineHeight: Typography.sizes.base * 1.4,
      marginBottom: Spacing[4],
    },
    impactContainer: {
      backgroundColor: colors.primary[50],
      borderRadius: BorderRadius.lg,
      padding: Spacing[4],
      marginBottom: Spacing[4],
      borderWidth: 1,
      borderColor: colors.primary[200],
    },
    impactLabel: {
      fontSize: Typography.sizes.xs,
      fontWeight: Typography.weights.bold,
      color: colors.primary[700],
      marginBottom: Spacing[1],
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    impactText: {
      fontSize: Typography.sizes.sm,
      color: colors.primary[800],
      fontWeight: Typography.weights.medium,
    },
  });

const createProgressStyles = (colors: typeof Colors) =>
  /* eslint-disable react-native/no-unused-styles */
  StyleSheet.create({
    progressContainer: {
      marginTop: Spacing[2],
    },
    progressLabel: {
      fontSize: Typography.sizes.xs,
      color: colors.neutral[600],
      marginBottom: Spacing[2],
      textAlign: 'center',
    },
    progressBar: {
      height: 6,
      backgroundColor: colors.neutral[200],
      borderRadius: BorderRadius.full,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: BorderRadius.full,
    },
  });

// ===================================================================
// CUSTOM HOOKS - Split for max-lines-per-function compliance
// ===================================================================
const useProjectCardAnimations = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = React.useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const handlePressOut = React.useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  return {
    scaleAnim,
    opacityAnim,
    handlePressIn,
    handlePressOut,
  };
};

const useProjectCardStyles = () => {
  const { colors } = useTheme();

  return React.useMemo(
    () => ({
      containerStyles: createContainerStyles(colors),
      headerStyles: createHeaderStyles(colors),
      contentStyles: createContentStyles(colors),
      progressStyles: createProgressStyles(colors),
    }),
    [colors]
  );
};

const useProjectCardStatus = (
  status: ProjectStatus,
  progress: number | undefined
) => {
  const { colors } = useTheme();
  const { contentStyles } = useProjectCardStyles();

  const statusColor = React.useMemo(
    () => getStatusColor(status, colors),
    [status, colors]
  );

  const statusText = React.useMemo(() => getStatusText(status), [status]);

  const impactContainerStyle = React.useMemo(
    () => ({
      ...contentStyles.impactContainer,
      marginBottom: progress !== undefined ? Spacing[4] : 0,
    }),
    [contentStyles.impactContainer, progress]
  );

  return {
    statusColor,
    statusText,
    impactContainerStyle,
  };
};

const useProjectCardLogic = (
  status: ProjectStatus,
  progress: number | undefined,
  onPress: (() => void) | undefined
) => {
  const animations = useProjectCardAnimations();
  const styles = useProjectCardStyles();
  const statusData = useProjectCardStatus(status, progress);

  return {
    ...animations,
    ...styles,
    ...statusData,
    isDisabled: onPress === undefined,
  };
};

// ===================================================================
// SUB-COMPONENTS - Extracted for max-lines-per-function compliance
// ===================================================================
interface ProjectHeaderProps {
  readonly title: string;
  readonly location: string;
  readonly statusColor: string;
  readonly statusText: string;
  readonly headerStyles: ReturnType<typeof createHeaderStyles>;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = React.memo(
  ({ title, location, statusColor, statusText, headerStyles }) => (
    <View style={headerStyles.header}>
      <View style={headerStyles.titleContainer}>
        <Text style={headerStyles.title}>{title}</Text>
        <Text style={headerStyles.location}>📍 {location}</Text>
      </View>
      <View
        style={[headerStyles.statusBadge, { backgroundColor: statusColor }]}
      >
        <Text style={headerStyles.statusText}>{statusText}</Text>
      </View>
    </View>
  )
);

ProjectHeader.displayName = 'ProjectHeader';

interface ProjectContentProps {
  readonly description: string;
  readonly impact: string;
  readonly contentStyles: ReturnType<typeof createContentStyles>;
  readonly impactContainerStyle: ViewStyle;
}

const ProjectContent: React.FC<ProjectContentProps> = React.memo(
  ({ description, impact, contentStyles, impactContainerStyle }) => (
    <>
      <Text style={contentStyles.description}>{description}</Text>
      <View style={impactContainerStyle}>
        <Text style={contentStyles.impactLabel}>Impatto</Text>
        <Text style={contentStyles.impactText}>✨ {impact}</Text>
      </View>
    </>
  )
);

ProjectContent.displayName = 'ProjectContent';

interface ProjectProgressProps {
  readonly progress: number;
  readonly statusColor: string;
  readonly progressStyles: ReturnType<typeof createProgressStyles>;
}

const ProjectProgress: React.FC<ProjectProgressProps> = React.memo(
  ({ progress, statusColor, progressStyles }) => (
    <View style={progressStyles.progressContainer}>
      <Text style={progressStyles.progressLabel}>Progresso: {progress}%</Text>
      <View style={progressStyles.progressBar}>
        <Animated.View
          style={[
            progressStyles.progressFill,
            {
              width: `${progress}%`,
              backgroundColor: statusColor,
            },
          ]}
        />
      </View>
    </View>
  )
);

ProjectProgress.displayName = 'ProjectProgress';

// ===================================================================
// RENDER LOGIC - Extracted for max-lines-per-function compliance
// ===================================================================
const renderProjectCard = (
  containerStyles: ReturnType<typeof createContainerStyles>,
  scaleAnim: Animated.Value,
  opacityAnim: Animated.Value,
  handlePressIn: () => void,
  handlePressOut: () => void,
  onPress: (() => void) | undefined,
  isDisabled: boolean,
  title: string,
  location: string,
  statusColor: string,
  statusText: string,
  headerStyles: ReturnType<typeof createHeaderStyles>,
  description: string,
  impact: string,
  contentStyles: ReturnType<typeof createContentStyles>,
  impactContainerStyle: ViewStyle,
  progress: number | undefined,
  progressStyles: ReturnType<typeof createProgressStyles>
) => (
  <Animated.View
    style={[
      containerStyles.container,
      {
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      },
    ]}
  >
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={isDisabled}
    >
      <Surface style={containerStyles.surface} elevation={0}>
        <View style={containerStyles.content}>
          <ProjectHeader
            title={title}
            location={location}
            statusColor={statusColor}
            statusText={statusText}
            headerStyles={headerStyles}
          />

          <ProjectContent
            description={description}
            impact={impact}
            contentStyles={contentStyles}
            impactContainerStyle={impactContainerStyle}
          />

          {progress !== undefined && (
            <ProjectProgress
              progress={progress}
              statusColor={statusColor}
              progressStyles={progressStyles}
            />
          )}
        </View>
      </Surface>
    </Pressable>
  </Animated.View>
);

// ===================================================================
// MAIN COMPONENT - Now under 60 lines
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
  const {
    containerStyles,
    headerStyles,
    contentStyles,
    progressStyles,
    scaleAnim,
    opacityAnim,
    handlePressIn,
    handlePressOut,
    statusColor,
    statusText,
    impactContainerStyle,
    isDisabled,
  } = useProjectCardLogic(status, progress, onPress);

  return renderProjectCard(
    containerStyles,
    scaleAnim,
    opacityAnim,
    handlePressIn,
    handlePressOut,
    onPress,
    isDisabled,
    title,
    location,
    statusColor,
    statusText,
    headerStyles,
    description,
    impact,
    contentStyles,
    impactContainerStyle,
    progress,
    progressStyles
  );
};

export default ProjectCard;
