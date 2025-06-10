import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import {
  Animation,
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from '../constants/designTokens';

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
    // Premium animation values
    const scaleValue = useRef(new Animated.Value(0.9)).current;
    const opacityValue = useRef(new Animated.Value(0)).current;
    const slideValue = useRef(new Animated.Value(20)).current;
    const pulseValue = useRef(new Animated.Value(1)).current;

    // Memoize expensive style calculations
    const { cardStyle, iconContainerStyle } = useMemo(
      () => ({
        cardStyle: [
          styles.card,
          styles[`${variant}Card`],
          styles[`${size}Card`],
        ],
        iconContainerStyle: [
          styles.iconContainer,
          styles[`${size}IconContainer`],
          { backgroundColor: color },
        ],
      }),
      [variant, size, color]
    );

    // Staggered entrance animation with proper cleanup
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

      // Subtle pulse animation for icon
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
            {/* Premium Icon with pulse animation */}
            <Animated.View
              style={[
                iconContainerStyle,
                {
                  transform: [{ scale: pulseValue }],
                },
              ]}
            >
              <Text style={[styles.icon, styles[`${size}Icon`]]}>{icon}</Text>
            </Animated.View>

            {/* Value with emphasis */}
            <Text
              style={[
                styles.value,
                styles[`${variant}Value`],
                styles[`${size}Value`],
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {value}
            </Text>

            {/* Title */}
            <Text
              style={[
                styles.title,
                styles[`${variant}Title`],
                styles[`${size}Title`],
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Text>

            {/* Optional description */}
            {description && (
              <Text
                style={[
                  styles.description,
                  styles[`${variant}Description`],
                  styles[`${size}Description`],
                ]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {description}
              </Text>
            )}

            {/* Subtle accent line */}
            {variant === 'elevated' && (
              <View style={[styles.accentLine, { backgroundColor: color }]} />
            )}
          </View>
        </View>
      </Animated.View>
    );
  }
);

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
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },

  elevatedCard: {
    borderWidth: 0,
    ...Platform.select({
      ios: Shadows.lg,
      android: {
        shadowColor: Colors.neutral[900],
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
      },
    }),
  },

  // Size Variants
  compactCard: {
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[3],
    minHeight: 100,
  },

  standardCard: {
    paddingVertical: Spacing[5],
    paddingHorizontal: Spacing[4],
    minHeight: 120,
  },

  // Content Layout
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },

  // Icon Styles
  iconContainer: {
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing[3],
    ...Platform.select({
      ios: Shadows.xs,
      android: {
        shadowColor: Colors.neutral[900],
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
        elevation: 1,
      },
    }),
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
    color: Colors.neutral[0],
  },

  compactIcon: {
    fontSize: Typography.sizes.base,
  },

  standardIcon: {
    fontSize: Typography.sizes.lg,
  },

  // Value Typography
  value: {
    fontWeight: Typography.weights.extrabold,
    textAlign: 'center',
    marginBottom: Spacing[1],
    includeFontPadding: false,
  },

  compactValue: {
    fontSize: Typography.sizes.lg,
    lineHeight: Typography.lineHeights.tight * Typography.sizes.lg,
  },

  standardValue: {
    fontSize: Typography.sizes.xl,
    lineHeight: Typography.lineHeights.tight * Typography.sizes.xl,
  },

  defaultValue: {
    color: Colors.neutral[900],
  },

  elevatedValue: {
    color: Colors.neutral[900],
  },

  // Title Typography
  title: {
    fontWeight: Typography.weights.semibold,
    textAlign: 'center',
    marginBottom: Spacing[1],
    includeFontPadding: false,
  },

  compactTitle: {
    fontSize: Typography.sizes.xs,
    lineHeight: Typography.lineHeights.normal * Typography.sizes.xs,
  },

  standardTitle: {
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.lineHeights.normal * Typography.sizes.sm,
  },

  defaultTitle: {
    color: Colors.neutral[600],
  },

  elevatedTitle: {
    color: Colors.neutral[700],
  },

  // Description Typography
  description: {
    fontWeight: Typography.weights.regular,
    textAlign: 'center',
    includeFontPadding: false,
  },

  compactDescription: {
    fontSize: Typography.sizes.xs,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.xs,
  },

  standardDescription: {
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.sm,
  },

  defaultDescription: {
    color: Colors.neutral[500],
  },

  elevatedDescription: {
    color: Colors.neutral[600],
  },

  // Premium accent line
  accentLine: {
    width: 24,
    height: 2,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing[2],
    opacity: 0.8,
  },
});

export default ImpactCard;
