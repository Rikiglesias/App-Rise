import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';

import {
  Animation,
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from '../../shared/constants/designTokens';

interface ImpactCardProps {
  title: string;
  value: string;
  icon: string;
  color?: string;
  description?: string;
  variant?: 'default' | 'elevated';
  size?: 'compact' | 'standard';
  delay?: number;
}

// Hook per le animazioni
const useImpactCardAnimations = (delay: number) => {
  const scaleValue = useRef(new Animated.Value(0.9)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const slideValue = useRef(new Animated.Value(20)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const staggerDelay = delay * 100;
    let isMounted = true;

    const entranceAnimation = Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        delay: staggerDelay,
        useNativeDriver: true,
        ...Animation.spring.gentle,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        delay: staggerDelay,
        duration: Animation.duration.normal,
        useNativeDriver: true,
      }),
      Animated.timing(slideValue, {
        toValue: 0,
        delay: staggerDelay + 100,
        duration: Animation.duration.slow,
        useNativeDriver: true,
      }),
    ]);

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    entranceAnimation.start();
    const pulseTimeout = setTimeout(() => {
      if (isMounted) {
        pulseAnimation.start();
      }
    }, staggerDelay + 500);

    return () => {
      isMounted = false;
      clearTimeout(pulseTimeout);
      entranceAnimation.stop();
      pulseAnimation.stop();
    };
  }, [delay, scaleValue, opacityValue, slideValue, pulseValue]);

  return { scaleValue, opacityValue, slideValue, pulseValue };
};

// Componente per l'icona animata
const AnimatedIcon: React.FC<{
  icon: string;
  color: string;
  size: 'compact' | 'standard';
  pulseValue: Animated.Value;
}> = ({ icon, color, size, pulseValue }) => (
  <Animated.View
    style={[
      styles.iconContainer,
      size === 'compact'
        ? styles.compactIconContainer
        : styles.standardIconContainer,
      { backgroundColor: color, transform: [{ scale: pulseValue }] },
    ]}
  >
    <Text
      style={[
        styles.icon,
        size === 'compact' ? styles.compactIcon : styles.standardIcon,
      ]}
    >
      {icon}
    </Text>
  </Animated.View>
);

// Componente per il contenuto della card
const CardContent: React.FC<{
  value: string;
  title: string;
  description: string | undefined;
  variant: 'default' | 'elevated';
  size: 'compact' | 'standard';
  color: string;
}> = ({ value, title, description, variant, size, color }) => (
  <>
    <Text
      style={[
        styles.value,
        variant === 'default' ? styles.defaultValue : styles.elevatedValue,
        size === 'compact' ? styles.compactValue : styles.standardValue,
      ]}
      numberOfLines={1}
      adjustsFontSizeToFit
    >
      {value}
    </Text>

    <Text
      style={[
        styles.title,
        variant === 'default' ? styles.defaultTitle : styles.elevatedTitle,
        size === 'compact' ? styles.compactTitle : styles.standardTitle,
      ]}
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      {title}
    </Text>

    {description && (
      <Text
        style={[
          styles.description,
          variant === 'default'
            ? styles.defaultDescription
            : styles.elevatedDescription,
          size === 'compact'
            ? styles.compactDescription
            : styles.standardDescription,
        ]}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {description}
      </Text>
    )}

    {variant === 'elevated' && (
      <View style={[styles.accentLine, { backgroundColor: color }]} />
    )}
  </>
);

export const ImpactCard: React.FC<ImpactCardProps> = React.memo(
  ({
    title,
    value,
    icon,
    color = Colors.primary[500],
    description,
    variant = 'default',
    size = 'standard',
    delay = 0,
  }) => {
    const { scaleValue, opacityValue, slideValue, pulseValue } =
      useImpactCardAnimations(delay);

    const { cardStyle } = useMemo(
      () => ({
        cardStyle: [
          styles.card,
          styles[`${variant}Card`],
          styles[`${size}Card`],
        ],
      }),
      [variant, size]
    );

    return (
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale: scaleValue }, { translateY: slideValue }],
            opacity: opacityValue,
          },
        ]}
      >
        <View style={cardStyle}>
          <View style={styles.content}>
            <AnimatedIcon
              icon={icon}
              color={color}
              size={size}
              pulseValue={pulseValue}
            />
            <CardContent
              value={value}
              title={title}
              description={description}
              variant={variant}
              size={size}
              color={color}
            />
          </View>
        </View>
      </Animated.View>
    );
  }
);

ImpactCard.displayName = 'ImpactCard';

/* eslint-disable react-native/no-unused-styles */
const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    margin: Spacing[2],
    minWidth: 100,
    maxWidth: 160,
  },

  // Base Card Styles
  card: {
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.neutral[0],
    overflow: 'hidden',
  },

  defaultCard: {
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    ...Platform.select({
      ios: Shadows.sm,
      android: {
        shadowColor: Colors.neutral[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },

  elevatedCard: {
    borderWidth: 0,
    ...Platform.select({
      ios: Shadows.lg,
      android: {
        shadowColor: Colors.neutral[900],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
      },
    }),
  },

  // Size Variants
  compactCard: {
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[3],
  },

  standardCard: {
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[4],
  },

  // Content Layout
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },

  // Icon Styles
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2],
  },

  compactIconContainer: {
    width: 32,
    height: 32,
  },

  standardIconContainer: {
    width: 40,
    height: 40,
  },

  icon: {
    textAlign: 'center',
    includeFontPadding: false,
  },

  compactIcon: {
    fontSize: 16,
  },

  standardIcon: {
    fontSize: 20,
  },

  // Value Styles
  value: {
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing[1],
    includeFontPadding: false,
  },

  defaultValue: {
    color: Colors.neutral[900],
  },

  elevatedValue: {
    color: Colors.primary[600],
  },

  compactValue: {
    fontSize: Typography.sizes.lg,
    lineHeight: Typography.sizes.lg * 1.2,
  },

  standardValue: {
    fontSize: Typography.sizes.xl,
    lineHeight: Typography.sizes.xl * 1.2,
  },

  // Title Styles
  title: {
    fontWeight: Typography.weights.semibold,
    textAlign: 'center',
    marginBottom: Spacing[1],
    includeFontPadding: false,
  },

  defaultTitle: {
    color: Colors.neutral[700],
  },

  elevatedTitle: {
    color: Colors.neutral[800],
  },

  compactTitle: {
    fontSize: Typography.sizes.xs,
    lineHeight: Typography.sizes.xs * 1.3,
  },

  standardTitle: {
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.sizes.sm * 1.3,
  },

  // Description Styles
  description: {
    fontWeight: Typography.weights.regular,
    textAlign: 'center',
    marginTop: Spacing[1],
    includeFontPadding: false,
  },

  defaultDescription: {
    color: Colors.neutral[600],
  },

  elevatedDescription: {
    color: Colors.neutral[600],
  },

  compactDescription: {
    fontSize: Typography.sizes.xs,
    lineHeight: Typography.sizes.xs * 1.4,
  },

  standardDescription: {
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.sizes.sm * 1.4,
  },

  // Accent Elements
  accentLine: {
    width: 24,
    height: 2,
    borderRadius: 1,
    marginTop: Spacing[2],
  },
});
