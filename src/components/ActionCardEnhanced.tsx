import * as Haptics from 'expo-haptics';
import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { BorderRadius, Spacing, Typography } from '../constants/designTokens';
import { useTheme } from '../hooks/useTheme';

interface ActionCardEnhancedProps {
  title: string;
  description: string;
  icon: string;
  onPress: () => void;
  variant: 'info' | 'success' | 'warning' | 'brand';
}

export const ActionCardEnhanced: React.FC<ActionCardEnhancedProps> = ({
  title,
  description,
  icon,
  onPress,
  variant,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const iconScaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    // Light haptic feedback on press
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        tension: 400,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.85,
        duration: 120,
        useNativeDriver: true,
      }),
      // Subtle icon scale animation
      Animated.spring(iconScaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 500,
        friction: 6,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 400,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(iconScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 500,
        friction: 6,
      }),
    ]).start();
  };

  const handlePress = () => {
    // Success haptic feedback on successful action
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const variantStyles = {
    info: {
      backgroundColor: colors.semantic.info.light + '40',
      iconBg: colors.semantic.info.main + '15',
      iconBorder: colors.semantic.info.main + '25',
      shadowColor: colors.semantic.info.main,
    },
    success: {
      backgroundColor: colors.semantic.success.light + '40',
      iconBg: colors.semantic.success.main + '15',
      iconBorder: colors.semantic.success.main + '25',
      shadowColor: colors.semantic.success.main,
    },
    warning: {
      backgroundColor: colors.semantic.warning.light + '40',
      iconBg: colors.semantic.warning.main + '15',
      iconBorder: colors.semantic.warning.main + '25',
      shadowColor: colors.semantic.warning.main,
    },
    brand: {
      backgroundColor: colors.primary[100] + '60',
      iconBg: colors.primary[500] + '15',
      iconBorder: colors.primary[500] + '25',
      shadowColor: colors.primary[500],
    },
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
          shadowColor: variantStyles[variant].shadowColor,
        },
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[
          styles.content,
          { backgroundColor: variantStyles[variant].backgroundColor },
        ]}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${title}: ${description}`}
        accessibilityHint="Tocca per accedere a questa funzionalità"
      >
        <Animated.View
          style={[
            styles.iconContainer,
            {
              backgroundColor: variantStyles[variant].iconBg,
              borderColor: variantStyles[variant].iconBorder,
              transform: [{ scale: iconScaleAnim }],
            },
          ]}
        >
          <Text
            style={styles.icon}
            accessible={false} // Icon is decorative, description is in accessibilityLabel
          >
            {icon}
          </Text>
        </Animated.View>
        <Text
          variant="titleMedium"
          style={styles.title}
          accessible={false} // Combined in parent accessibilityLabel
        >
          {title}
        </Text>
        <Text
          style={styles.description}
          accessible={false} // Combined in parent accessibilityLabel
        >
          {description}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    marginBottom: Spacing[4],
    elevation: 4, // Android shadow
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[4],
    borderRadius: BorderRadius.xl,
    minHeight: 120,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[3],
    borderWidth: 1,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    textAlign: 'center',
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing[1],
  },
  description: {
    textAlign: 'center',
    fontSize: Typography.sizes.xs,
    lineHeight: Typography.sizes.xs * 1.4,
    color: '#666',
  },
});

export default ActionCardEnhanced;
