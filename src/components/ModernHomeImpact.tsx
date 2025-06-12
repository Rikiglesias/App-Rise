import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Surface } from 'react-native-paper';

import { BorderRadius, Spacing, Typography } from '../constants/designTokens';
import { useAnimatedPress } from '../hooks/useAnimatedPress';
import { useTheme } from '../hooks/useTheme';

interface ModernHomeImpactProps {
  readonly onImpactPress: () => void;
  readonly isLoaded: boolean;
}

// Hook for animations
const useModernHomeImpactAnimations = (isLoaded: boolean) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;

  const { animatedStyle, handlePressIn, handlePressOut } = useAnimatedPress({
    scaleValue: 0.98,
    minOpacity: 0.95,
  });

  useEffect(() => {
    if ((isLoaded !== null) !== null) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          delay: 150,
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

  return {
    fadeAnim,
    slideAnim,
    scaleAnim,
    animatedStyle,
    handlePressIn,
    handlePressOut,
  };
};

// Hook for main styles
const useMainStyles = () => {
  const { colors } = useTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        container: {
          opacity: 1,
        },
        impactCard: {
          borderRadius: BorderRadius.xl,
          backgroundColor: colors.neutral[0],
          shadowColor: colors.neutral[400],
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 3,
          overflow: 'hidden',
        },
        cardContentWrapper: {
          padding: Spacing[6],
        },
        cardContent: {
          alignItems: 'center',
        },
      }),
    [colors]
  );
};

// Hook for header styles
const useHeaderStyles = () => {
  const { colors } = useTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        header: {
          alignItems: 'center',
          marginBottom: Spacing[6],
        },
        badge: {
          backgroundColor: colors.primary[50],
          paddingHorizontal: Spacing[4],
          paddingVertical: Spacing[2],
          borderRadius: BorderRadius.full,
          marginBottom: Spacing[4],
          borderWidth: 1,
          borderColor: colors.primary[200],
        },
        badgeText: {
          color: colors.primary[700],
          fontSize: Typography.sizes.sm,
          fontWeight: Typography.weights.medium,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        },
        title: {
          fontSize: Typography.sizes['2xl'],
          fontWeight: Typography.weights.semibold,
          color: colors.neutral[900],
          textAlign: 'center',
          marginBottom: Spacing[2],
          letterSpacing: -0.3,
        },
        subtitle: {
          fontSize: Typography.sizes.base,
          fontWeight: Typography.weights.regular,
          color: colors.neutral[600],
          textAlign: 'center',
          lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
          paddingHorizontal: Spacing[4],
        },
      }),
    [colors]
  );
};

// Hook for stats styles
const useStatsStyles = () => {
  const { colors } = useTheme();

  return useMemo(
    () =>
      /* eslint-disable react-native/no-unused-styles */
      StyleSheet.create({
        // Tutti questi stili sono utilizzati nei componenti ImpactStats e ImpactCTA
        // ma ESLint non riesce a rilevarlo perché vengono passati tramite props
        statsContainer: {
          flexDirection: 'row',
          gap: Spacing[4],
          marginBottom: Spacing[6],
        },
        statCard: {
          flex: 1,
          alignItems: 'center',
          padding: Spacing[4],
          backgroundColor: colors.neutral[50],
          borderRadius: BorderRadius.lg,
          borderWidth: 1,
          borderColor: colors.neutral[100],
        },
        statNumber: {
          fontSize: Typography.sizes['3xl'],
          fontWeight: Typography.weights.bold,
          color: colors.primary[700],
          marginBottom: Spacing[1],
        },
        statLabel: {
          fontSize: Typography.sizes.base,
          fontWeight: Typography.weights.medium,
          color: colors.neutral[900],
          marginBottom: Spacing[1],
        },
        statTarget: {
          fontSize: Typography.sizes.sm,
          fontWeight: Typography.weights.regular,
          color: colors.neutral[500],
        },
        ctaButton: {
          backgroundColor: colors.primary[600],
          paddingHorizontal: Spacing[6],
          paddingVertical: Spacing[3],
          borderRadius: BorderRadius.lg,
          shadowColor: colors.primary[600],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 2,
        },
        ctaText: {
          color: colors.neutral[0],
          fontSize: Typography.sizes.base,
          fontWeight: Typography.weights.medium,
          textAlign: 'center',
        },
      }),
    /* eslint-enable react-native/no-unused-styles */
    [colors]
  );
};

// Hook for combined styles
const useModernHomeImpactStyles = () => {
  const mainStyles = useMainStyles();
  const headerStyles = useHeaderStyles();
  const statsStyles = useStatsStyles();

  return useMemo(
    () => ({
      ...mainStyles,
      ...headerStyles,
      ...statsStyles,
    }),
    [mainStyles, headerStyles, statsStyles]
  );
};

// Sub-components for max-lines-per-function compliance
interface ImpactHeaderProps {
  readonly styles: ReturnType<typeof useModernHomeImpactStyles>;
}

const ImpactHeader: React.FC<ImpactHeaderProps> = React.memo(({ styles }) => (
  <View style={styles.header}>
    <View style={styles.badge}>
      <Text style={styles.badgeText}>RISULTATI 2024</Text>
    </View>
    <Text style={styles.title}>Il Nostro Impatto</Text>
    <Text style={styles.subtitle}>
      Dati concreti sui risultati raggiunti insieme
    </Text>
  </View>
));

ImpactHeader.displayName = 'ImpactHeader';

interface ImpactStatsProps {
  readonly styles: ReturnType<typeof useModernHomeImpactStyles>;
}

const ImpactStats: React.FC<ImpactStatsProps> = React.memo(({ styles }) => (
  <View style={styles.statsContainer}>
    <View style={styles.statCard}>
      <Text style={styles.statNumber}>3.1M</Text>
      <Text style={styles.statLabel}>Pasti</Text>
      <Text style={styles.statTarget}>Distribuiti</Text>
    </View>
    <View style={styles.statCard}>
      <Text style={styles.statNumber}>13K</Text>
      <Text style={styles.statLabel}>Volontari</Text>
      <Text style={styles.statTarget}>Attivi</Text>
    </View>
    <View style={styles.statCard}>
      <Text style={styles.statNumber}>47</Text>
      <Text style={styles.statLabel}>Progetti</Text>
      <Text style={styles.statTarget}>Completati</Text>
    </View>
  </View>
));

ImpactStats.displayName = 'ImpactStats';

interface ImpactCTAProps {
  readonly styles: ReturnType<typeof useModernHomeImpactStyles>;
}

const ImpactCTA: React.FC<ImpactCTAProps> = React.memo(({ styles }) => (
  <View style={styles.ctaButton}>
    <Text style={styles.ctaText}>Vedi Impatto 2024</Text>
  </View>
));

ImpactCTA.displayName = 'ImpactCTA';

// Main Component - Now under 60 lines
const ModernHomeImpact: React.FC<ModernHomeImpactProps> = ({
  onImpactPress,
  isLoaded,
}) => {
  const {
    fadeAnim,
    slideAnim,
    scaleAnim,
    animatedStyle,
    handlePressIn,
    handlePressOut,
  } = useModernHomeImpactAnimations(isLoaded);

  const styles = useModernHomeImpactStyles();

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
        accessible
        accessibilityRole="button"
        accessibilityLabel="Vedi dettagli impatto 2024"
      >
        <Surface style={[styles.impactCard, animatedStyle]} elevation={3}>
          <View style={styles.cardContentWrapper}>
            <View style={styles.cardContent}>
              <ImpactHeader styles={styles} />
              <ImpactStats styles={styles} />
              <ImpactCTA styles={styles} />
            </View>
          </View>
        </Surface>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default ModernHomeImpact;
