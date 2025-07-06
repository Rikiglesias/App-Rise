import * as Haptics from 'expo-haptics';
import React, { useCallback, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  Platform,
  View,
} from 'react-native';

import {
  BorderRadius,
  Spacing,
  Typography,
} from '../../shared/constants/designTokens';
import { TypographyTokens } from '../../shared/constants/responsiveSystem';
import { MaterialActionCard } from '../ui';
import { FormattedText } from '../ui/FormattedText';
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
  }, [scaleAnim, opacityAnim, iconScaleAnim]);

  const handlePressOut = useCallback(() => {
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
      <FormattedText fontSize={28} fixedLines={1} style={styles.icon}>
        {icon}
      </FormattedText>
    </Animated.View>
  );
};

// Content Text Component - Extracted from main component
const ActionCardContent: React.FC<{
  title: string;
  description: string;
}> = ({ title, description }) => (
  <>
    <Text
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

  // Android: usa MaterialActionCard con Material Design 3
  if (Platform.OS === 'android') {
    return (
      <MaterialActionCard
        variant="elevated"
        elevation="level2"
        onPress={handlePress}
        style={styles.materialCard}
      >
        <View
          style={[
            styles.materialContent,
            { backgroundColor: variantStyles.backgroundColor },
          ]}
        >
          {cardContent}
        </View>
      </MaterialActionCard>
    );
  }

  // iOS: mantiene comportamento esistente (animazioni complete)
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
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[
          styles.content,
          { backgroundColor: variantStyles.backgroundColor },
        ]}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`${title}: ${description}`}
        accessibilityHint="Tocca per accedere a questa funzionalità"
      >
        {cardContent}
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
    fontSize: TypographyTokens.styles.body.medium,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing[1],
  },
  description: {
    textAlign: 'center',
    fontSize: TypographyTokens.styles.body.small,
    lineHeight: TypographyTokens.styles.body.small * 1.4,
    color: '#666',
  },
});

export default ActionCardEnhanced;
