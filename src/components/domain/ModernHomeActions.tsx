// ===================================================================
// MODERNHOMEACTIONS - CLEAN ARCHITECTURE BRIDGE v1.0
// Reduced from 413 lines to ~50 lines using clean architecture principles
// ===================================================================

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Text,
  View,
  type DimensionValue,
} from 'react-native';
import { Surface } from 'react-native-paper';

import {
  BorderRadius,
  Spacing,
  Typography,
} from '../../shared/constants/designTokens';
import { useHapticFeedback } from '../../shared/hooks/useHapticFeedback';
import { useTheme } from '../../shared/hooks/useTheme';
import EnhancedTouchable from '../ui/EnhancedTouchable';

const { width: screenWidth } = Dimensions.get('window');

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
const ModernHomeActions: React.FC<ModernHomeActionsProps> = ({
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

  // Responsive layout
  const isTablet = screenWidth >= 768;
  const cardWidth = isTablet ? '31%' : '47.5%';

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
        width: cardWidth as DimensionValue,
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
        fontSize: 24,
        marginBottom: Spacing[1],
      },
      title: {
        fontSize: Typography.sizes.sm,
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
        <EnhancedTouchable onPress={action.onPress} style={styles.touchable}>
          <Surface style={styles.card}>
            <Text style={styles.icon}>{action.icon}</Text>
            <Text style={styles.title}>{action.title}</Text>
          </Surface>
        </EnhancedTouchable>
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

export default ModernHomeActions;
