import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Surface } from 'react-native-paper';
import { BorderRadius, Spacing, Typography } from '../constants/designTokens';
import { useAnimatedPress } from '../hooks/useAnimatedPress';
import { useTheme } from '../hooks/useTheme';

const { width: screenWidth } = Dimensions.get('window');

interface ModernHomeActionsProps {
  onShopPress: () => void;
  onGiftCardPress: () => void;
  onEventsPress: () => void;
  onProjectsPress: () => void;
  isLoaded: boolean;
}

const ModernHomeActions: React.FC<ModernHomeActionsProps> = ({
  onShopPress,
  onGiftCardPress,
  onEventsPress,
  onProjectsPress,
  isLoaded,
}) => {
  const { colors } = useTheme();

  // Animation references - ottimizzate
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current; // Ridotto movimento

  // Start animations when component is loaded
  useEffect(() => {
    if (isLoaded) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500, // Più veloce
          delay: 100, // Delay ridotto
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400, // Più veloce
          delay: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoaded, fadeAnim, slideAnim]);

  // Actions configuration - ottimizzata
  const actions = [
    {
      id: 'shop',
      title: 'Shop Solidale',
      subtitle: 'Acquista',
      icon: '🛍️',
      onPress: onShopPress,
      color: colors.semantic.info.main,
    },
    {
      id: 'gift',
      title: 'Gift Card',
      subtitle: 'Regala',
      icon: '🎁',
      onPress: onGiftCardPress,
      color: colors.semantic.success.main,
    },
    {
      id: 'events',
      title: 'Eventi',
      subtitle: 'Partecipa',
      icon: '📅',
      onPress: onEventsPress,
      color: colors.semantic.warning.main,
    },
    {
      id: 'projects',
      title: 'Progetti',
      subtitle: 'Scopri',
      icon: '🌱',
      onPress: onProjectsPress,
      color: colors.primary[600],
    },
  ];

  // Layout responsivo ottimizzato
  const isTablet = screenWidth >= 768;
  const isLargePhone = screenWidth >= 414;
  const cardWidth = isTablet ? '23%' : '47.5%'; // Ottimizzato

  const styles = StyleSheet.create({
    container: {
      // Ripristino padding per sezione con header
      paddingHorizontal: Spacing[2],
    },

    // Header della sezione
    header: {
      alignItems: 'center',
      marginBottom: Spacing[6], // Spacing compatto
    },

    title: {
      fontSize: Typography.sizes['2xl'], // Compatto ma visibile
      fontWeight: Typography.weights.bold,
      color: colors.neutral[900],
      textAlign: 'center',
      marginBottom: Spacing[2],
      letterSpacing: -0.4,
    },

    subtitle: {
      fontSize: Typography.sizes.sm, // Ridotto per compattezza
      fontWeight: Typography.weights.medium,
      color: colors.neutral[600],
      textAlign: 'center',
      maxWidth: 280, // Ridotto
      lineHeight: Typography.sizes.sm * 1.4,
    },

    // Grid ottimizzata
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: isTablet ? Spacing[3] : Spacing[2], // Gap ridotto
      paddingHorizontal: Spacing[2], // Padding interno minimale
    },

    actionCard: {
      width: cardWidth,
      minHeight: isLargePhone ? 100 : 95, // Altezza ridotta
      marginBottom: Spacing[2], // Margine ridotto
    },

    cardSurface: {
      flex: 1,
      borderRadius: BorderRadius.lg, // Radius ridotto per compattezza
      backgroundColor: colors.neutral[0],
      shadowColor: colors.neutral[900],
      shadowOffset: { width: 0, height: 1 }, // Shadow ridotta
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },

    cardContentWrapper: {
      flex: 1,
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
    },

    cardContent: {
      flex: 1,
      padding: Spacing[3], // Padding ridotto
      justifyContent: 'space-between',
      position: 'relative',
    },

    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing[1], // Margine ridotto
    },

    iconContainer: {
      width: 28, // Dimensione ridotta
      height: 28,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.neutral[100],
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing[2], // Margine ridotto
    },

    iconText: {
      fontSize: 14, // Dimensione ridotta
    },

    textContainer: {
      flex: 1,
    },

    cardSubtitle: {
      fontSize: Typography.sizes.xs,
      fontWeight: Typography.weights.semibold,
      color: colors.neutral[500],
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 1,
    },

    cardTitle: {
      fontSize: Typography.sizes.sm, // Dimensione ridotta
      fontWeight: Typography.weights.bold,
      color: colors.neutral[900],
      letterSpacing: -0.2,
      lineHeight: Typography.sizes.sm * 1.2,
    },

    accentLine: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 2, // Altezza ridotta
    },
  });

  // Action Card Component ottimizzato
  const ActionCard: React.FC<{
    action: (typeof actions)[0];
    index: number;
  }> = ({ action, index }) => {
    const { animatedStyle, handlePressIn, handlePressOut } = useAnimatedPress({
      scaleValue: 0.98, // Scale ridotta
      minOpacity: 0.95,
    });

    return (
      <Animated.View
        style={[
          styles.actionCard,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: Animated.add(
                  slideAnim,
                  new Animated.Value(index * 2) // Stagger ridotto
                ),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={action.onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`${action.title}: ${action.subtitle}`}
        >
          <Surface style={[styles.cardSurface, animatedStyle]} elevation={2}>
            <View style={styles.cardContentWrapper}>
              <View style={styles.cardContent}>
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.iconText}>{action.icon}</Text>
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.cardSubtitle}>{action.subtitle}</Text>
                    <Text style={styles.cardTitle}>{action.title}</Text>
                  </View>
                </View>

                {/* Accent Line */}
                <View
                  style={[styles.accentLine, { backgroundColor: action.color }]}
                />
              </View>
            </View>
          </Surface>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Section Header - Ripristinato */}
      <View style={styles.header}>
        <Text style={styles.title}>Come Puoi Aiutare</Text>
        <Text style={styles.subtitle}>
          Ogni gesto conta per costruire un mondo senza fame
        </Text>
      </View>

      {/* Actions Grid */}
      <View style={styles.grid}>
        {actions.map((action, index) => (
          <ActionCard key={action.id} action={action} index={index} />
        ))}
      </View>
    </Animated.View>
  );
};

export default ModernHomeActions;
