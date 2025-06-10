import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Surface } from 'react-native-paper';
import {
  BorderRadius,
  Shadows,
  Spacing,
  Typography,
} from '../constants/designTokens';
import { useAnimatedPress } from '../hooks/useAnimatedPress';
import { useTheme } from '../hooks/useTheme';

interface HomeInfoSectionProps {
  onNavigateToSeguici: () => void;
  onNavigateToChiSiamo: () => void;
}

const HomeInfoSection: React.FC<HomeInfoSectionProps> = ({
  onNavigateToSeguici,
  onNavigateToChiSiamo,
}) => {
  const { colors } = useTheme();

  // 🎯 CARD DATA - Configurazione ottimizzata per Bento Layout
  const cards = [
    {
      id: 'social',
      title: 'Social',
      subtitle: 'Seguici',
      description: 'Unisciti alla nostra community',
      icon: '📱',
      onPress: onNavigateToSeguici,
      gradient: [colors.primary[500], colors.primary[600]],
      accentColor: colors.primary[400],
    },
    {
      id: 'about',
      title: 'Chi Siamo',
      subtitle: 'Scopri',
      description: 'La nostra storia e missione',
      icon: '🌍',
      onPress: onNavigateToChiSiamo,
      gradient: [colors.semantic.info.main, colors.primary[600]],
      accentColor: colors.semantic.info.main,
    },
  ];

  const styles = StyleSheet.create({
    // 🏗️ BENTO CONTAINER PRINCIPALE
    bentoContainer: {
      gap: Spacing[3], // Gap uniforme per fluidità
    },

    // 📱 BENTO ROW - Layout orizzontale
    bentoRow: {
      flexDirection: 'row',
      gap: Spacing[3],
    },

    // 🎨 BENTO CARD - Design premium per ogni card
    bentoCard: {
      flex: 1, // Distribuisce spazio equamente
      minHeight: 140, // Altezza ottimizzata
    },

    cardSurface: {
      flex: 1,
      borderRadius: BorderRadius['2xl'],
      backgroundColor: colors.neutral[0],
      ...Shadows.primary,
    },

    // 🔧 CONTENT WRAPPER - Separato per overflow corretto
    cardContentWrapper: {
      flex: 1,
      borderRadius: BorderRadius['2xl'],
      overflow: 'hidden',
    },

    // 🌈 GRADIENT OVERLAY
    gradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.03, // Overlay molto sottile
    },

    // 📦 CARD CONTENT CONTAINER
    cardContent: {
      flex: 1,
      padding: Spacing[4],
      position: 'relative',
      zIndex: 2,
    },

    // 🎯 CARD HEADER
    cardHeader: {
      marginBottom: Spacing[2],
    },

    // 📍 ICON CONTAINER - Ottimizzato per Bento
    iconContainer: {
      width: 42,
      height: 42,
      borderRadius: BorderRadius.xl,
      backgroundColor: colors.neutral[100],
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing[3],
      borderWidth: 1.5,
      borderColor: colors.neutral[200],
      ...Shadows.sm,
    },

    iconText: {
      fontSize: 18,
      lineHeight: 20,
    },

    // 🏷️ TYPOGRAPHY SYSTEM
    cardTitle: {
      fontSize: Typography.sizes.lg,
      fontWeight: Typography.weights.bold,
      color: colors.neutral[900],
      marginBottom: 2,
      letterSpacing: Typography.letterSpacing.tight,
      lineHeight: Typography.lineHeights.tight * Typography.sizes.lg,
    },

    cardSubtitle: {
      fontSize: Typography.sizes.sm,
      fontWeight: Typography.weights.semibold,
      color: colors.neutral[600],
      textTransform: 'uppercase',
      letterSpacing: Typography.letterSpacing.wide,
      marginBottom: Spacing[1],
    },

    cardDescription: {
      fontSize: Typography.sizes.sm,
      fontWeight: Typography.weights.regular,
      color: colors.neutral[700],
      lineHeight: Typography.lineHeights.normal * Typography.sizes.sm,
      letterSpacing: Typography.letterSpacing.normal,
    },

    // 🎨 ACCENT BORDER - Design distintivo
    accentBorder: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 3,
      zIndex: 3,
    },

    // 🌟 PRESS STATE OVERLAY
    pressOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.neutral[900],
      opacity: 0,
      zIndex: 1,
    },
  });

  // 🎨 BENTO CARD COMPONENT
  const BentoCard: React.FC<{
    card: (typeof cards)[0];
  }> = ({ card }) => {
    const { animatedStyle, handlePressIn, handlePressOut } = useAnimatedPress({
      scaleValue: 0.98,
      minOpacity: 0.9,
    });

    return (
      <TouchableOpacity
        style={styles.bentoCard}
        onPress={card.onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${card.title}: ${card.description}`}
      >
        <Surface style={[styles.cardSurface, animatedStyle]} elevation={3}>
          <View style={styles.cardContentWrapper}>
            {/* 🌈 Gradient Background */}
            <View
              style={[
                styles.gradientOverlay,
                { backgroundColor: card.accentColor },
              ]}
            />

            {/* 🎨 Accent Border */}
            <View
              style={[
                styles.accentBorder,
                { backgroundColor: card.accentColor },
              ]}
            />

            {/* 📦 Content */}
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                {/* 📍 Icon */}
                <View style={styles.iconContainer}>
                  <Text style={styles.iconText}>{card.icon}</Text>
                </View>

                {/* 🏷️ Titles */}
                <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                <Text style={styles.cardTitle}>{card.title}</Text>
              </View>

              {/* 📝 Description */}
              <Text style={styles.cardDescription}>{card.description}</Text>
            </View>

            {/* 🌟 Press Overlay */}
            <View style={styles.pressOverlay} />
          </View>
        </Surface>
      </TouchableOpacity>
    );
  };

  // 🚀 BENTO BOX LAYOUT RENDER
  return (
    <View style={styles.bentoContainer}>
      <View style={styles.bentoRow}>
        {cards.map(card => (
          <BentoCard key={card.id} card={card} />
        ))}
      </View>
    </View>
  );
};

export default HomeInfoSection;
