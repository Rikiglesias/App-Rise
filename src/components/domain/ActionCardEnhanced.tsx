import * as Haptics from 'expo-haptics';
import React, { useCallback, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import {
  BorderRadius,
  Spacing,
  Typography,
} from '../../shared/constants/designTokens';
import { PerfectText, UnifiedCard } from '../ui';
import { useTheme } from '../../shared/hooks/useTheme';

interface ActionCardEnhancedProps {
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly onPress: () => void;
  readonly variant: 'info' | 'success' | 'warning' | 'brand';
}

// Type for variant styles
interface VariantStyles {
  backgroundColor: string;
  iconBg: string;
  iconBorder: string;
  shadowColor: string;
}

// Hook for animations - Separated to reduce function length
const useActionCardAnimations = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const iconScaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    // Light haptic feedback on press
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    void Animated.parallel([
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
        toValue: 0.9,
        useNativeDriver: true,
        tension: 500,
        friction: 6,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim, iconScaleAnim]);

  const handlePressOut = useCallback(() => {
    void Animated.parallel([
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
  }, [scaleAnim, opacityAnim, iconScaleAnim]);

  return {
    scaleAnim,
    opacityAnim,
    iconScaleAnim,
    handlePressIn,
    handlePressOut,
  };
};

// Hook for variant styles - Separated to reduce function length
const useVariantStyles = (
  variant: ActionCardEnhancedProps['variant']
): VariantStyles => {
  const { colors } = useTheme();

  const variantConfig: Record<
    ActionCardEnhancedProps['variant'],
    VariantStyles
  > = {
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

  return variantConfig[variant];
};

// Icon Container Component - Extracted from main component
const ActionCardIcon: React.FC<{
  iconScaleAnim: Animated.Value;
  variantStyles: VariantStyles;
  icon: string;
}> = ({ iconScaleAnim, variantStyles, icon }) => {
  return (
    <Animated.View
      style={[
        styles.iconContainer,
        {
          backgroundColor: variantStyles.iconBg,
          borderColor: variantStyles.iconBorder,
          transform: [{ scale: iconScaleAnim }],
        },
      ]}
    >
      <PerfectText
        size={28}
        lines={1}
        fontWeight="400"
        immunity={true}
        style={styles.icon}
      >
        {icon}
      </PerfectText>
    </Animated.View>
  );
};

// Content Text Component - Extracted from main component
const ActionCardContent: React.FC<{
  title: string;
  description: string;
}> = ({ title, description }) => (
  <>
    <PerfectText
      size={16}
      lines={1}
      fontWeight="400"
      immunity={true}
      style={styles.title}
      accessible={false}
    >
      {title}
    </PerfectText>
    <PerfectText
      size={14}
      lines={2}
      fontWeight="400"
      immunity={true}
      style={styles.description}
      accessible={false}
    >
      {description}
    </PerfectText>
  </>
);

export const ActionCardEnhanced: React.FC<ActionCardEnhancedProps> = ({
  title,
  description,
  icon,
  onPress,
  variant,
}) => {
  const {
    scaleAnim,
    opacityAnim,
    iconScaleAnim,
    handlePressIn,
    handlePressOut,
  } = useActionCardAnimations();

  const variantStyles = useVariantStyles(variant);

  const handlePress = useCallback(() => {
    // Success haptic feedback on successful action
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }, [onPress]);

  // Contenuto comune per iOS e Android
  const cardContent = (
    <>
      <ActionCardIcon
        iconScaleAnim={iconScaleAnim}
        variantStyles={variantStyles}
        icon={icon}
      />
      <ActionCardContent title={title} description={description} />
    </>
  );

  // Animazioni e interazione identiche su entrambe le piattaforme
  // Android rendering props are applied directly on Animated.View

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
          shadowColor: variantStyles.shadowColor,
        },
      ]}
      renderToHardwareTextureAndroid
      needsOffscreenAlphaCompositing
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={styles.pressable}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`${title}: ${description}`}
        accessibilityHint="Tocca per accedere a questa funzionalita"
      >
        <UnifiedCard
          designVariant="material"
          variant="elevated"
          elevation="level2"
          style={styles.iosCard}
        >
          <View
            style={[
              styles.content,
              { backgroundColor: variantStyles.backgroundColor },
            ]}
          >
            {cardContent}
          </View>
        </UnifiedCard>
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
  pressable: {
    width: '100%',
    borderRadius: BorderRadius.xl,
  },
  iosCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[4],
    borderRadius: BorderRadius.xl,
    minHeight: 120,
  },
  // Android Material Design styles
  materialCard: {
    width: '100%',
    marginBottom: Spacing[4],
  },
  materialContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[4],
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
  icon: {},
  title: {
    textAlign: 'center',
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing[1],
  },
  description: {
    textAlign: 'center',
    color: '#666',
  },
});

export default ActionCardEnhanced;
