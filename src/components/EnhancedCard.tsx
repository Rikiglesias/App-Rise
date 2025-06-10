import React from 'react';
import {
  Animated,
  GestureResponderEvent,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {
  Accessibility,
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from '../constants/designTokens';
import { useAnimatedPress } from '../hooks/useAnimatedPress';

interface EnhancedCardProps {
  title: string;
  subtitle?: string;
  icon: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: 'default' | 'primary' | 'elevated';
  size?: 'compact' | 'standard' | 'large';
  disabled?: boolean;
  showArrow?: boolean;
  customStyle?: ViewStyle;
  children?: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  variant = 'default',
  size = 'standard',
  disabled = false,
  showArrow = true,
  customStyle,
  children,
  accessibilityLabel,
  accessibilityHint,
}) => {
  // Use custom hook for animations - eliminates 40+ lines of duplicate code
  const { shadowValue, handlePressIn, handlePressOut, animatedStyle } =
    useAnimatedPress({ scaleValue: 0.98, minOpacity: 0.85 });

  // Dynamic styles based on variant and size
  const getCardStyle = () => {
    const baseStyles = [
      styles.baseCard,
      styles[`${variant}Card`],
      styles[`${size}Card`],
      customStyle,
    ];

    // Add conditional styles separately to avoid type conflicts
    if (disabled) {
      baseStyles.push(styles.disabledCard);
    }

    return baseStyles;
  };

  // Accessibility configuration
  const accessibilityConfig = {
    accessible: true,
    accessibilityLabel:
      accessibilityLabel || `${title}${subtitle ? `, ${subtitle}` : ''}`,
    accessibilityHint:
      accessibilityHint || (onPress ? 'Tocca per aprire' : undefined),
    accessibilityState: { disabled },
    ...Accessibility.touchTarget,
  };

  return (
    <Animated.View style={[animatedStyle]}>
      <TouchableOpacity
        style={getCardStyle()}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
        {...accessibilityConfig}
      >
        <View style={styles.cardContent}>
          {/* Icon Section */}
          <View style={styles.iconSection}>
            <View
              style={[
                styles.iconContainer,
                styles[`${variant}IconContainer`],
                styles[`${size}IconContainer`],
              ]}
            >
              <Text
                style={[
                  styles.icon,
                  styles[`${variant}Icon`],
                  styles[`${size}Icon`],
                ]}
              >
                {icon}
              </Text>
            </View>
          </View>

          {/* Text Section */}
          <View style={styles.textSection}>
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

            {children}
          </View>

          {/* Arrow Section */}
          {showArrow && onPress && !disabled && (
            <View style={styles.arrowSection}>
              <Animated.Text
                style={[
                  styles.arrow,
                  styles[`${variant}Arrow`],
                  {
                    transform: [
                      {
                        translateX: shadowValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 2],
                        }),
                      },
                    ],
                  },
                ]}
              >
                →
              </Animated.Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

/* eslint-disable react-native/no-unused-styles */
const styles = StyleSheet.create({
  // Base Card Styles
  baseCard: {
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing[4],
    overflow: 'hidden',
    ...Platform.select({
      ios: Shadows.sm,
      android: Shadows.sm,
    }),
  },

  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconSection: {
    marginRight: Spacing[4],
  },

  iconContainer: {
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: Shadows.xs,
      android: Shadows.xs,
    }),
  },

  textSection: {
    flex: 1,
    paddingRight: Spacing[2],
  },

  arrowSection: {
    justifyContent: 'center',
    alignItems: 'center',
    ...Accessibility.touchTarget,
  },

  // Size Variants
  compactCard: {
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
  },

  standardCard: {
    paddingVertical: Spacing[5],
    paddingHorizontal: Spacing[6],
  },

  largeCard: {
    paddingVertical: Spacing[6],
    paddingHorizontal: Spacing[8],
  },

  // Icon Styles
  icon: {
    textAlign: 'center',
  },

  compactIcon: {
    fontSize: Typography.sizes.lg,
  },

  standardIcon: {
    fontSize: Typography.sizes['2xl'],
  },

  largeIcon: {
    fontSize: Typography.sizes['3xl'],
  },

  compactIconContainer: {
    width: 32,
    height: 32,
  },

  standardIconContainer: {
    width: 48,
    height: 48,
  },

  largeIconContainer: {
    width: 56,
    height: 56,
  },

  // Typography Styles
  title: {
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing[1],
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  compactTitle: {
    fontSize: Typography.sizes.base,
    lineHeight: Typography.lineHeights.snug * Typography.sizes.base,
  },

  standardTitle: {
    fontSize: Typography.sizes.lg,
    lineHeight: Typography.lineHeights.snug * Typography.sizes.lg,
  },

  largeTitle: {
    fontSize: Typography.sizes.xl,
    lineHeight: Typography.lineHeights.snug * Typography.sizes.xl,
  },

  subtitle: {
    fontWeight: Typography.weights.medium,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  compactSubtitle: {
    fontSize: Typography.sizes.xs,
    lineHeight: Typography.lineHeights.normal * Typography.sizes.xs,
  },

  standardSubtitle: {
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.lineHeights.normal * Typography.sizes.sm,
  },

  largeSubtitle: {
    fontSize: Typography.sizes.base,
    lineHeight: Typography.lineHeights.normal * Typography.sizes.base,
  },

  arrow: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
  },

  // Default Variant
  defaultCard: {
    backgroundColor: Colors.neutral[0],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },

  defaultIconContainer: {
    backgroundColor: Colors.neutral[100],
  },

  defaultIcon: {
    color: Colors.neutral[700],
  },

  defaultTitle: {
    color: Colors.neutral[900],
  },

  defaultSubtitle: {
    color: Colors.neutral[600],
  },

  defaultArrow: {
    color: Colors.primary[500],
  },

  // Primary Variant
  primaryCard: {
    backgroundColor: Colors.primary[500],
    borderWidth: 0,
    ...Platform.select({
      ios: Shadows.primary,
      android: Shadows.primary,
    }),
  },

  primaryIconContainer: {
    backgroundColor: Colors.primary[600],
  },

  primaryIcon: {
    color: Colors.neutral[0],
  },

  primaryTitle: {
    color: Colors.neutral[0],
  },

  primarySubtitle: {
    color: Colors.primary[100],
  },

  primaryArrow: {
    color: Colors.neutral[0],
  },

  // Elevated Variant
  elevatedCard: {
    backgroundColor: Colors.neutral[0],
    borderWidth: 0,
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: Colors.neutral[900],
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        }
      : {}),
    ...(Platform.OS === 'android' ? { elevation: 6 } : {}),
  },

  elevatedIconContainer: {
    backgroundColor: Colors.primary[50],
  },

  elevatedIcon: {
    color: Colors.primary[600],
  },

  elevatedTitle: {
    color: Colors.neutral[900],
  },

  elevatedSubtitle: {
    color: Colors.neutral[600],
  },

  elevatedArrow: {
    color: Colors.primary[500],
  },

  // Disabled State
  disabledCard: {
    opacity: 0.6,
  },
});

export default EnhancedCard;
