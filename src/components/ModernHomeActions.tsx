import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Text,
  View,
  type DimensionValue,
} from 'react-native';
import { Surface } from 'react-native-paper';

import { BorderRadius, Spacing, Typography } from '../constants/designTokens';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { useTheme } from '../hooks/useTheme';

import EnhancedTouchable from './EnhancedTouchable';

const { width: screenWidth } = Dimensions.get('window');

interface ModernHomeActionsProps {
  onShopPress: () => void;
  onGiftCardPress: () => void;
  onEventsPress: () => void;
  onProjectsPress: () => void;
  onSocialPress: () => void;
  onChiSiamoPress: () => void;
  isLoaded: boolean;
}

// Hook for animations
const useModernHomeActionsAnimations = (isLoaded: boolean) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    if (isLoaded) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          delay: 100,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          delay: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoaded, fadeAnim, slideAnim]);

  return { fadeAnim, slideAnim };
};

// Hook for actions data
const useModernHomeActionsData = (
  props: Omit<ModernHomeActionsProps, 'isLoaded'>
) => {
  const { colors } = useTheme();

  return useMemo(
    () => [
      {
        id: 'shop',
        title: 'Shop Solidale',
        subtitle: 'Acquista',
        icon: '🛍️',
        onPress: props.onShopPress,
        color: colors.semantic.info.main,
      },
      {
        id: 'gift',
        title: 'Gift Card',
        subtitle: 'Regala',
        icon: '🎁',
        onPress: props.onGiftCardPress,
        color: colors.semantic.success.main,
      },
      {
        id: 'events',
        title: 'Eventi',
        subtitle: 'Partecipa',
        icon: '📅',
        onPress: props.onEventsPress,
        color: colors.semantic.warning.main,
      },
      {
        id: 'projects',
        title: 'Progetti',
        subtitle: 'Esplora',
        icon: '🌱',
        onPress: props.onProjectsPress,
        color: colors.primary[600],
      },
      {
        id: 'social',
        title: 'Seguici',
        subtitle: 'Social',
        icon: '💬',
        onPress: props.onSocialPress,
        color: colors.semantic.info.main,
      },
      {
        id: 'chisiamo',
        title: 'Chi Siamo',
        subtitle: 'Conosci',
        icon: '👥',
        onPress: props.onChiSiamoPress,
        color: colors.semantic.warning.main,
      },
    ],
    [colors, props]
  );
};

// Hook for responsive layout calculations
const useResponsiveLayout = () => {
  const isTablet = screenWidth >= 768;
  const isLargePhone = screenWidth >= 414;
  const cardWidth: DimensionValue = isTablet ? '31%' : '47.5%';

  return { isTablet, isLargePhone, cardWidth };
};

interface ActionCardProps {
  action: {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    color: string;
    onPress: () => void;
  };
  _index: number;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
}

// Style factories for action cards - Split for max-lines-per-function compliance
const createCardContainerStyles = (
  colors: ReturnType<typeof useTheme>['colors'],
  cardWidth: DimensionValue,
  isLargePhone: boolean,
  fadeAnim: Animated.Value,
  slideAnim: Animated.Value
) => ({
  actionCard: {
    width: cardWidth,
    minHeight: isLargePhone ? 100 : 95,
    marginBottom: Spacing[2],
    opacity: fadeAnim,
    transform: [
      {
        translateY: slideAnim.interpolate({
          inputRange: [0, 15],
          outputRange: [0, 15],
        }),
      },
    ],
  },
  cardSurface: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    backgroundColor: colors.neutral[0],
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardContentWrapper: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden' as const,
  },
  cardContent: {
    flex: 1,
    padding: Spacing[3],
    justifyContent: 'space-between' as const,
    position: 'relative' as const,
  },
});

const createCardHeaderStyles = (
  colors: ReturnType<typeof useTheme>['colors']
) => ({
  cardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: Spacing[1],
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.md,
    backgroundColor: colors.neutral[100],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: Spacing[2],
  },
  textContainer: {
    flex: 1,
  },
});

const createCardTextStyles = (
  colors: ReturnType<typeof useTheme>['colors']
) => ({
  iconText: {
    fontSize: 14,
  },
  cardSubtitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: colors.neutral[500],
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  cardTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: colors.neutral[900],
    letterSpacing: -0.2,
    lineHeight: Typography.sizes.sm * 1.2,
  },
});

// Hook for action card styles - Now under 60 lines
const useActionCardStyles = (
  colors: ReturnType<typeof useTheme>['colors'],
  cardWidth: DimensionValue,
  isLargePhone: boolean,
  fadeAnim: Animated.Value,
  slideAnim: Animated.Value
) => {
  return useMemo(
    () => ({
      ...createCardContainerStyles(
        colors,
        cardWidth,
        isLargePhone,
        fadeAnim,
        slideAnim
      ),
      ...createCardHeaderStyles(colors),
      ...createCardTextStyles(colors),
    }),
    [colors, cardWidth, isLargePhone, fadeAnim, slideAnim]
  );
};

const ActionCard: React.FC<ActionCardProps> = ({
  action,
  _index,
  fadeAnim,
  slideAnim,
}) => {
  const { triggerHaptic } = useHapticFeedback();
  const { colors } = useTheme();
  const { isLargePhone, cardWidth } = useResponsiveLayout();

  const handlePress = useCallback(() => {
    void triggerHaptic('light');
    action.onPress();
  }, [action, triggerHaptic]);

  const cardStyles = useActionCardStyles(
    colors,
    cardWidth,
    isLargePhone,
    fadeAnim,
    slideAnim
  );

  return (
    <Animated.View style={cardStyles.actionCard}>
      <Surface style={cardStyles.cardSurface}>
        <View style={cardStyles.cardContentWrapper}>
          <EnhancedTouchable
            style={cardStyles.cardContent}
            onPress={handlePress}
          >
            <View style={cardStyles.cardHeader}>
              <View style={cardStyles.iconContainer}>
                <Text style={cardStyles.iconText}>{action.icon}</Text>
              </View>
              <View style={cardStyles.textContainer}>
                <Text style={cardStyles.cardSubtitle}>{action.subtitle}</Text>
                <Text style={cardStyles.cardTitle}>{action.title}</Text>
              </View>
            </View>
          </EnhancedTouchable>
        </View>
      </Surface>
    </Animated.View>
  );
};

// Header section component - Extracted for max-lines-per-function compliance
interface ModernHomeActionsHeaderProps {
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  colors: ReturnType<typeof useTheme>['colors'];
}

const ModernHomeActionsHeader: React.FC<ModernHomeActionsHeaderProps> =
  React.memo(({ fadeAnim, slideAnim, colors }) => {
    const headerStyles = useMemo(
      () => ({
        header: {
          alignItems: 'center' as const,
          marginBottom: Spacing[6],
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
        title: {
          fontSize: Typography.sizes['2xl'],
          fontWeight: Typography.weights.bold,
          color: colors.neutral[900],
          textAlign: 'center' as const,
          marginBottom: Spacing[2],
          letterSpacing: -0.4,
        },
        subtitle: {
          fontSize: Typography.sizes.sm,
          fontWeight: Typography.weights.medium,
          color: colors.neutral[600],
          textAlign: 'center' as const,
          maxWidth: 280,
          lineHeight: Typography.sizes.sm * 1.4,
        },
      }),
      [colors, fadeAnim, slideAnim]
    );

    return (
      <Animated.View style={headerStyles.header}>
        <Text style={headerStyles.title}>Cosa Puoi Fare</Text>
        <Text style={headerStyles.subtitle}>
          Scegli come contribuire alla lotta contro la fame
        </Text>
      </Animated.View>
    );
  });

ModernHomeActionsHeader.displayName = 'ModernHomeActionsHeader';

// Main Component - Now under 60 lines
const ModernHomeActions: React.FC<ModernHomeActionsProps> = ({
  onShopPress,
  onGiftCardPress,
  onEventsPress,
  onProjectsPress,
  onSocialPress,
  onChiSiamoPress,
  isLoaded,
}) => {
  const { fadeAnim, slideAnim } = useModernHomeActionsAnimations(isLoaded);
  const actions = useModernHomeActionsData({
    onShopPress,
    onGiftCardPress,
    onEventsPress,
    onProjectsPress,
    onSocialPress,
    onChiSiamoPress,
  });
  const { colors } = useTheme();
  const { isTablet } = useResponsiveLayout();

  // Simplified styles for main component
  const mainStyles = useMemo(
    () => ({
      container: {
        paddingHorizontal: Spacing[2],
      },
      grid: {
        flexDirection: 'row' as const,
        flexWrap: 'wrap' as const,
        justifyContent: 'space-between' as const,
        gap: isTablet ? Spacing[3] : Spacing[2],
        paddingHorizontal: Spacing[2],
      },
    }),
    [isTablet]
  );

  return (
    <View style={mainStyles.container}>
      <ModernHomeActionsHeader
        fadeAnim={fadeAnim}
        slideAnim={slideAnim}
        colors={colors}
      />

      <View style={mainStyles.grid}>
        {actions.map((action, index) => (
          <ActionCard
            key={action.id}
            action={action}
            _index={index}
            fadeAnim={fadeAnim}
            slideAnim={slideAnim}
          />
        ))}
      </View>
    </View>
  );
};

export default ModernHomeActions;
