import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { BorderRadius, Spacing, Typography } from '../constants/designTokens';
import { useTheme } from '../hooks/useTheme';

interface ProjectCardProps {
  title: string;
  location: string;
  description: string;
  impact: string;
  status: 'active' | 'completed' | 'upcoming';
  progress?: number | undefined; // 0-100
  imageUrl?: string;
  onPress?: () => void;
}

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
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
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
  };

  const handlePressOut = () => {
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
  };

  const getStatusColor = () => {
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

  const getStatusText = () => {
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
      marginBottom: progress !== undefined ? Spacing[4] : 0,
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

  return (
    <Animated.View
      style={[
        styles.container,
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
        disabled={!onPress}
      >
        <Surface style={styles.surface} elevation={0}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.location}>📍 {location}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor() },
                ]}
              >
                <Text style={styles.statusText}>{getStatusText()}</Text>
              </View>
            </View>

            <Text style={styles.description}>{description}</Text>

            <View style={styles.impactContainer}>
              <Text style={styles.impactLabel}>Impatto</Text>
              <Text style={styles.impactText}>✨ {impact}</Text>
            </View>

            {progress !== undefined && (
              <View style={styles.progressContainer}>
                <Text style={styles.progressLabel}>Progresso: {progress}%</Text>
                <View style={styles.progressBar}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        width: `${progress}%`,
                        backgroundColor: getStatusColor(),
                      },
                    ]}
                  />
                </View>
              </View>
            )}
          </View>
        </Surface>
      </Pressable>
    </Animated.View>
  );
};

export default ProjectCard;
