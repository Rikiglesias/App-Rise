import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { BorderRadius, Spacing, Typography } from '../constants/designTokens';
import { useAnimatedPress } from '../hooks/useAnimatedPress';
import { useTheme } from '../hooks/useTheme';

interface ModernHomeImpactProps {
  onImpactPress: () => void;
  isLoaded: boolean;
}

const ModernHomeImpact: React.FC<ModernHomeImpactProps> = ({
  onImpactPress,
  isLoaded,
}) => {
  const { colors } = useTheme();

  // Animation references - ottimizzate
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current; // Ridotto
  const scaleAnim = useRef(new Animated.Value(0.98)).current; // Più sottile

  const { animatedStyle, handlePressIn, handlePressOut } = useAnimatedPress({
    scaleValue: 0.98, // Scale ridotta
    minOpacity: 0.95,
  });

  // Start animations when component is loaded
  useEffect(() => {
    if (isLoaded) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500, // Più veloce
          delay: 150, // Delay ridotto
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          delay: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 450,
          delay: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoaded, fadeAnim, slideAnim, scaleAnim]);

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: Spacing[2], // Ridotto da 4
    },

    impactCard: {
      borderRadius: BorderRadius.lg, // Ridotto da xl
      backgroundColor: colors.neutral[0],
      shadowColor: colors.neutral[900],
      shadowOffset: { width: 0, height: 2 }, // Shadow ridotta
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },

    cardContentWrapper: {
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
    },

    cardContent: {
      padding: Spacing[4], // Ridotto da 6
    },

    header: {
      alignItems: 'center',
      marginBottom: Spacing[5], // Ridotto da 8
    },

    badge: {
      backgroundColor: colors.primary[100],
      paddingHorizontal: Spacing[3],
      paddingVertical: Spacing[1],
      borderRadius: BorderRadius.full,
      marginBottom: Spacing[2], // Ridotto da 3
    },

    badgeText: {
      color: colors.primary[700],
      fontSize: Typography.sizes.xs, // Ridotto da sm
      fontWeight: Typography.weights.semibold,
      letterSpacing: 0.5,
    },

    title: {
      fontSize: Typography.sizes.xl, // Ridotto da 2xl
      fontWeight: Typography.weights.bold,
      color: colors.neutral[900],
      textAlign: 'center',
      marginBottom: Spacing[1], // Ridotto da 2
      letterSpacing: -0.3,
    },

    subtitle: {
      fontSize: Typography.sizes.sm, // Ridotto da base
      fontWeight: Typography.weights.medium,
      color: colors.neutral[600],
      textAlign: 'center',
      lineHeight: Typography.sizes.sm * 1.4,
    },

    statsContainer: {
      flexDirection: 'row',
      gap: Spacing[3], // Ridotto da 4
      marginBottom: Spacing[4], // Ridotto da 6
    },

    statCard: {
      flex: 1,
      backgroundColor: colors.primary[50],
      borderRadius: BorderRadius.md, // Ridotto da lg
      padding: Spacing[3], // Ridotto da 4
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.primary[100],
    },

    statNumber: {
      fontSize: Typography.sizes['2xl'], // Ridotto da 3xl
      fontWeight: Typography.weights.black,
      color: colors.primary[700],
      marginBottom: Spacing[1],
      letterSpacing: -0.5,
    },

    statLabel: {
      fontSize: Typography.sizes.xs, // Ridotto da sm
      fontWeight: Typography.weights.semibold,
      color: colors.primary[600],
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    statTarget: {
      fontSize: Typography.sizes.xs,
      fontWeight: Typography.weights.medium,
      color: colors.neutral[500],
      textAlign: 'center',
      marginTop: 1, // Ridotto da 2
    },

    ctaButton: {
      backgroundColor: colors.primary[600],
      borderRadius: BorderRadius.md, // Ridotto da lg
      paddingVertical: Spacing[2], // Ridotto da 3
      paddingHorizontal: Spacing[5], // Ridotto da 6
      alignItems: 'center',
      shadowColor: colors.primary[600],
      shadowOffset: { width: 0, height: 1 }, // Shadow ridotta
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 1,
    },

    ctaText: {
      color: colors.neutral[0],
      fontSize: Typography.sizes.sm, // Ridotto da base
      fontWeight: Typography.weights.semibold,
      letterSpacing: 0.3,
    },
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onImpactPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Vedi dettagli impatto 2024"
      >
        <Surface style={[styles.impactCard, animatedStyle]} elevation={3}>
          <View style={styles.cardContentWrapper}>
            <View style={styles.cardContent}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>IMPATTO 2024</Text>
                </View>

                <Text style={styles.title}>I Nostri Risultati</Text>

                <Text style={styles.subtitle}>
                  Insieme abbiamo fatto la differenza
                </Text>
              </View>

              {/* Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Animated.Text style={styles.statNumber}>3.1M</Animated.Text>
                  <Text style={styles.statLabel}>Pasti</Text>
                  <Text style={styles.statTarget}>Target: 4M</Text>
                </View>

                <View style={styles.statCard}>
                  <Animated.Text style={styles.statNumber}>13K</Animated.Text>
                  <Text style={styles.statLabel}>Volontari</Text>
                  <Text style={styles.statTarget}>Target: 20K</Text>
                </View>
              </View>

              {/* CTA Button */}
              <View style={styles.ctaButton}>
                <Text style={styles.ctaText}>Scopri di Più</Text>
              </View>
            </View>
          </View>
        </Surface>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default ModernHomeImpact;
