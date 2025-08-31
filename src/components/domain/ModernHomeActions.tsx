// ===================================================================
// MODERNHOMEACTIONS - CLEAN ARCHITECTURE BRIDGE v1.0
// Reduced from 413 lines to ~50 lines using clean architecture principles
// ===================================================================

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, View } from 'react-native';

import { Surface } from 'react-native-paper';

import {
  BorderRadius,
  Spacing,
  Typography,
} from '../../shared/constants/designTokens';
import responsiveSystem, {
  scaleDimensionLinear,
} from '../../shared/constants/responsiveSystem';
import { useHapticFeedback } from '../../shared/hooks/useHapticFeedback';
import { useTheme } from '../../shared/hooks/useTheme';
import { PlatformTouchable, PerfectText } from '../ui';

// ===================================================================
// INTERFACES
// ===================================================================
interface ModernHomeActionsProps {
  onShopPress: () => void;
  onGiftCardPress: () => void;
  onEventsPress: () => void;
  onProjectsPress: () => void;
  onSocialPress: () => void;
  onChiSiamoPress: () => void;
  isLoaded: boolean;
}

// ===================================================================
// CLEAN ARCHITECTURE COMPONENT - SIMPLIFIED
// ===================================================================
const ModernHomeActionsComponent: React.FC<ModernHomeActionsProps> = ({
  onShopPress,
  onGiftCardPress,
  onEventsPress,
  onProjectsPress,
  onSocialPress,
  onChiSiamoPress,
  isLoaded,
}) => {
  const { colors } = useTheme();
  const { triggerHaptic } = useHapticFeedback();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Simplified animation
  useEffect(() => {
    if (isLoaded) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoaded, fadeAnim]);

  // Larghezza card millimetrica basata su riferimento iPhone 15
  const referenceWidth = responsiveSystem?.LOGICAL_REFERENCE?.width ?? 393;
  // 2 colonne con gap minimo → larghezza base ~ 47% su iPhone 15
  const cardWidthPx = referenceWidth * 0.475;
  const cardWidth = scaleDimensionLinear(cardWidthPx);

  const handlePress = useCallback(
    (onPress: () => void) => {
      void triggerHaptic('light');
      onPress();
    },
    [triggerHaptic]
  );

  // Clean data structure with integrated haptic feedback
  const actions = useMemo(
    () => [
      {
        id: 'shop',
        title: 'Shop Solidale',
        icon: '🛍️',
        onPress: () => handlePress(onShopPress),
      },
      {
        id: 'gift',
        title: 'Gift Card',
        icon: '🎁',
        onPress: () => handlePress(onGiftCardPress),
      },
      {
        id: 'events',
        title: 'Eventi',
        icon: '📅',
        onPress: () => handlePress(onEventsPress),
      },
      {
        id: 'projects',
        title: 'Progetti',
        icon: '🌱',
        onPress: () => handlePress(onProjectsPress),
      },
      {
        id: 'social',
        title: 'Seguici',
        icon: '💬',
        onPress: () => handlePress(onSocialPress),
      },
      {
        id: 'chisiamo',
        title: 'Chi Siamo',
        icon: '👥',
        onPress: () => handlePress(onChiSiamoPress),
      },
    ],
    [
      handlePress,
      onShopPress,
      onGiftCardPress,
      onEventsPress,
      onProjectsPress,
      onSocialPress,
      onChiSiamoPress,
    ]
  );

  // Clean extracted styles - no more inline-styles warnings
  const styles = useMemo(
    () => ({
      container: {
        opacity: fadeAnim,
        padding: Spacing[4],
      },
      grid: {
        flexDirection: 'row' as const,
        flexWrap: 'wrap' as const,
        justifyContent: 'space-between' as const,
        gap: Spacing[2],
      },
      cardContainer: {
        width: cardWidth,
        marginBottom: Spacing[2],
      },
      touchable: {
        flex: 1,
      },
      card: {
        flex: 1,
        borderRadius: BorderRadius.lg,
        backgroundColor: colors.neutral[0],
        padding: Spacing[3],
        minHeight: 100,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
      },
      icon: {
        marginBottom: Spacing[1],
      },
      title: {
        fontWeight: Typography.weights.bold,
        color: colors.neutral[900],
        textAlign: 'center' as const,
      },
    }),
    [fadeAnim, cardWidth, colors]
  );

  const renderAction = useCallback(
    (action: {
      id: string;
      title: string;
      icon: string;
      onPress: () => void;
    }) => (
      <View key={action.id} style={styles.cardContainer}>
        <PlatformTouchable onPress={action.onPress} style={styles.touchable}>
          <Surface style={styles.card}>
            <PerfectText
              size={24}
              lines={1}
              immunity={true}
              style={styles.icon}
            >
              {action.icon}
            </PerfectText>
            <PerfectText
              size={14}
              lines={1}
              immunity={true}
              style={styles.title}
            >
              {action.title}
            </PerfectText>
          </Surface>
        </PlatformTouchable>
      </View>
    ),
    [styles]
  );

  return (
    <Animated.View style={styles.container}>
      <View style={styles.grid}>{actions.map(renderAction)}</View>
    </Animated.View>
  );
};

const ModernHomeActions = React.memo(ModernHomeActionsComponent);

export default ModernHomeActions;
