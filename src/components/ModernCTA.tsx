// ===================================================================
// PREMIUM MODERN CTA COMPONENT - Enterprise Grade
// Ultra-premium call-to-action with 2025 trends
// ===================================================================

import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Accessibility,
  Animation,
  BorderRadius,
  Shadows,
  Spacing,
  Typography,
} from '../constants/designTokens';
import { useTheme } from '../hooks/useTheme';

/* eslint-disable react-native/no-unused-styles */
// All styles are used dynamically via template literals: styles[`${variant}Button`]

interface ModernCTAProps {
  title: string;
  subtitle?: string;
  description?: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'gradient';
  size?: 'compact' | 'standard' | 'large';
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const ModernCTA: React.FC<ModernCTAProps> = ({
  title,
  subtitle,
  description,
  onPress,
  variant = 'primary',
  size = 'standard',
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { colors } = useTheme();

  // Memoize styles to prevent recalculation on every render
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        // Container Styles
        container: {
          marginHorizontal: Spacing[6],
          marginVertical: Spacing[4],
        },
        compactContainer: {
          marginHorizontal: Spacing[4],
          marginVertical: Spacing[3],
        },
        standardContainer: {
          marginHorizontal: Spacing[6],
          marginVertical: Spacing[4],
        },
        largeContainer: {
          marginHorizontal: Spacing[8],
          marginVertical: Spacing[6],
        },
        baseButton: {
          borderRadius: BorderRadius['2xl'],
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          ...Platform.select({
            ios: Shadows.md,
            android: {
              shadowColor: colors.neutral[900],
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 6,
              elevation: 3,
            },
          }),
        },
        // Size Variants
        compactButton: {
          paddingVertical: Spacing[4],
          paddingHorizontal: Spacing[6],
          minHeight: 56,
        },
        standardButton: {
          paddingVertical: Spacing[6],
          paddingHorizontal: Spacing[8],
          minHeight: 72,
        },
        largeButton: {
          paddingVertical: Spacing[8],
          paddingHorizontal: Spacing[10],
          minHeight: 88,
        },
        content: {
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        },
        description: {
          fontWeight: Typography.weights.medium,
          textAlign: 'center',
          marginBottom: Spacing[2],
          includeFontPadding: false,
        },
        title: {
          fontWeight: Typography.weights.bold,
          textAlign: 'center',
          marginBottom: Spacing[1],
          letterSpacing: Typography.letterSpacing.wide,
          includeFontPadding: false,
        },
        subtitle: {
          fontWeight: Typography.weights.regular,
          textAlign: 'center',
          includeFontPadding: false,
        },
        // Size-specific Typography
        compactDescription: {
          fontSize: Typography.sizes.xs,
          lineHeight: Typography.lineHeights.normal * Typography.sizes.xs,
        },
        compactTitle: {
          fontSize: Typography.sizes.lg,
          lineHeight: Typography.lineHeights.tight * Typography.sizes.lg,
        },
        compactSubtitle: {
          fontSize: Typography.sizes.sm,
          lineHeight: Typography.lineHeights.normal * Typography.sizes.sm,
        },
        standardDescription: {
          fontSize: Typography.sizes.sm,
          lineHeight: Typography.lineHeights.normal * Typography.sizes.sm,
        },
        standardTitle: {
          fontSize: Typography.sizes['2xl'],
          lineHeight: Typography.lineHeights.tight * Typography.sizes['2xl'],
        },
        standardSubtitle: {
          fontSize: Typography.sizes.base,
          lineHeight: Typography.lineHeights.normal * Typography.sizes.base,
        },
        largeDescription: {
          fontSize: Typography.sizes.base,
          lineHeight: Typography.lineHeights.normal * Typography.sizes.base,
        },
        largeTitle: {
          fontSize: Typography.sizes['3xl'],
          lineHeight: Typography.lineHeights.tight * Typography.sizes['3xl'],
        },
        largeSubtitle: {
          fontSize: Typography.sizes.lg,
          lineHeight: Typography.lineHeights.normal * Typography.sizes.lg,
        },
        // THEMED VARIANTS
        primaryButton: {
          backgroundColor: colors.primary[500],
          borderWidth: 0,
          ...Platform.select({
            ios: Shadows.primary,
            android: {
              shadowColor: colors.primary[500],
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            },
          }),
        },
        primaryDescription: {
          color: colors.primary[100],
        },
        primaryTitle: {
          color: colors.neutral[0],
        },
        primarySubtitle: {
          color: colors.primary[50],
        },
        secondaryButton: {
          backgroundColor: colors.neutral[0],
          borderWidth: 2,
          borderColor: colors.primary[500],
        },
        secondaryDescription: {
          color: colors.neutral[600],
        },
        secondaryTitle: {
          color: colors.primary[600],
        },
        secondarySubtitle: {
          color: colors.neutral[500],
        },
        gradientButton: {
          borderWidth: 0,
          position: 'relative',
          ...Platform.select({
            ios: Shadows.xl,
            android: {
              shadowColor: colors.neutral[900],
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.18,
              shadowRadius: 16,
              elevation: 6,
            },
          }),
        },
        gradientDescription: {
          color: colors.neutral[0],
          opacity: 0.95,
        },
        gradientTitle: {
          color: colors.neutral[0],
          textShadowColor: 'rgba(0, 0, 0, 0.2)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        },
        gradientSubtitle: {
          color: colors.neutral[0],
          opacity: 0.9,
        },
        shimmerOverlay: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colors.neutral[0],
          borderRadius: BorderRadius['2xl'],
        },
        accentLine: {
          width: 40,
          height: 2,
          backgroundColor: colors.neutral[0],
          borderRadius: BorderRadius.sm,
          marginTop: Spacing[3],
        },
        disabledButton: {
          opacity: 0.6,
        },
      }),
    [colors]
  );

  // Premium animation values
  const scaleValue = useRef(new Animated.Value(1)).current;
  const glowValue = useRef(new Animated.Value(0)).current;
  const shimmerValue = useRef(new Animated.Value(0)).current;

  // Start shimmer effect on mount
  React.useEffect(() => {
    if (variant === 'gradient') {
      const shimmerAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerValue, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      shimmerAnimation.start();
      return () => shimmerAnimation.stop();
    }
    // Return undefined when variant is not gradient
    return undefined;
  }, [variant, shimmerValue]);

  // Premium press interactions
  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 0.96,
        useNativeDriver: true,
        ...Animation.spring.snappy,
      }),
      Animated.timing(glowValue, {
        toValue: 1,
        duration: Animation.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        ...Animation.spring.gentle,
      }),
      Animated.timing(glowValue, {
        toValue: 0,
        duration: Animation.duration.normal,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Accessibility configuration
  const accessibilityConfig = {
    accessible: true,
    accessibilityRole: 'button' as const,
    accessibilityLabel: accessibilityLabel || title,
    accessibilityHint: accessibilityHint || 'Tocca per continuare',
    accessibilityState: { disabled },
    ...Accessibility.touchTarget,
  };

  // Dynamic styles
  const containerStyle = [styles.container, styles[`${size}Container`]];

  const buttonStyle = [
    styles.baseButton,
    styles[`${variant}Button`],
    styles[`${size}Button`],
    disabled && styles.disabledButton,
  ];

  // Content renderer
  const renderContent = () => {
    return (
      <View style={styles.content}>
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

        <Text
          style={[
            styles.title,
            styles[`${variant}Title`],
            styles[`${size}Title`],
          ]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {title}
        </Text>

        {subtitle && (
          <Text
            style={[
              styles.subtitle,
              styles[`${variant}Subtitle`],
              styles[`${size}Subtitle`],
            ]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {subtitle}
          </Text>
        )}

        {/* Premium accent indicator */}
        {variant === 'gradient' && (
          <Animated.View
            style={[
              styles.accentLine,
              {
                opacity: shimmerValue.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.3, 1, 0.3],
                }),
              },
            ]}
          />
        )}
      </View>
    );
  };

  // Gradient variant with premium effects
  if (variant === 'gradient') {
    return (
      <View style={containerStyle}>
        <Animated.View
          style={[
            {
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            activeOpacity={1}
            {...accessibilityConfig}
          >
            <LinearGradient
              colors={colors.gradients.energy}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[buttonStyle, styles.gradientButton]}
            >
              {/* Shimmer overlay */}
              <Animated.View
                style={[
                  styles.shimmerOverlay,
                  {
                    opacity: shimmerValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.3],
                    }),
                  },
                ]}
              />
              {renderContent()}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  // Standard variants
  return (
    <View style={containerStyle}>
      <Animated.View
        style={[
          {
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        <TouchableOpacity
          style={buttonStyle}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          activeOpacity={1}
          {...accessibilityConfig}
        >
          {renderContent()}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default ModernCTA;
