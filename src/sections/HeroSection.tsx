import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Logo from '../components/Logo';
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from '../constants/designTokens';
import { useThemeStyles } from '../hooks/useTheme';

interface HeroSectionProps {
  readonly accessibilityLabel?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  accessibilityLabel = 'Sezione hero Rise Against Hunger Italia',
}) => {
  const themeStyles = useThemeStyles();

  return (
    <View
      style={[
        styles.heroSection,
        { backgroundColor: themeStyles.container.backgroundColor },
      ]}
    >
      {/* Minimal gradient with solid background */}
      <LinearGradient
        colors={
          themeStyles.isDark
            ? ['rgba(220, 38, 38, 0.05)', 'rgba(0, 0, 0, 0.9)']
            : ['rgba(220, 38, 38, 0.02)', 'rgba(255, 255, 255, 1)']
        }
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <View style={styles.content} accessibilityLabel={accessibilityLabel}>
        <View style={styles.logoContainer}>
          <Logo size={80} showBackground />

          {/* Solid badge without glassmorphism */}
          <View style={styles.logoBadge}>
            <Text style={[styles.badgeText, { color: Colors.neutral[0] }]}>
              ITALIA
            </Text>
          </View>
        </View>

        <View style={styles.brandContainer}>
          {/* 2025 ENHANCED TYPOGRAPHY */}
          <Text
            style={[
              styles.brandTitle,
              {
                color: themeStyles.text.primary,
                fontSize: Typography.sizes['4xl'], // Increased size
                fontFamily: Typography.families.heading,
              },
            ]}
          >
            Rise Against Hunger
          </Text>

          <Text
            style={[
              styles.brandSubtitle,
              {
                color: themeStyles.text.secondary,
                fontFamily: Typography.families.body,
              },
            ]}
          >
            Tutto comincia da un pasto
          </Text>

          {/* Solid mission container without glassmorphism */}
          <View style={styles.missionContainer}>
            <View style={styles.missionIcon}>
              <Text
                style={styles.missionEmoji}
                accessibilityLabel="Icona del mondo"
                accessibilityElementsHidden
              >
                🌍
              </Text>
            </View>
            <Text
              style={[
                styles.missionText,
                {
                  color: Colors.primary[700],
                  fontFamily: Typography.families.body,
                },
              ]}
            >
              Combattiamo la fame nel mondo
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroSection: {
    backgroundColor: Colors.neutral[0], // Solid white background
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[8],
    paddingBottom: Spacing[6], // Reduced padding to prevent overlap
    alignItems: 'center',
    overflow: 'hidden', // Prevent any content overflow
    ...Shadows.md, // Reduced shadow for better performance
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },

  content: {
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },

  logoContainer: {
    position: 'relative',
    marginBottom: Spacing[8],
  },

  logoBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    ...Shadows.lg,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },

  badgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[0],
    letterSpacing: Typography.letterSpacing.wide,
  },

  brandContainer: {
    alignItems: 'center',
  },

  brandTitle: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.extrabold,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: Spacing[2],
    letterSpacing: Typography.letterSpacing.tight,
  },

  brandSubtitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold, // Increased for better readability
    color: Colors.neutral[700], // Darker for better contrast
    textAlign: 'center',
    marginBottom: Spacing[4], // Further reduced margin to prevent overlap
    lineHeight: Typography.lineHeights.relaxed,
  },

  missionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[100], // More opaque background
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[4],
    borderRadius: BorderRadius.full,
    borderWidth: 2, // Stronger border
    borderColor: Colors.primary[300], // More visible border
    ...Shadows.sm, // Add shadow for depth
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  missionIcon: {
    marginRight: Spacing[3],
  },

  missionEmoji: {
    fontSize: 20,
  },

  missionText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary[700],
    letterSpacing: Typography.letterSpacing.wide,
  },
});
