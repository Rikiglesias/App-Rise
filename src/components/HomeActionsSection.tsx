import React from 'react';
import {
  Dimensions,
  DimensionValue,
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

interface HomeActionsSectionProps {
  onShopPress: () => void;
  onGiftCardPress: () => void;
  onEventsPress: () => void;
  onProjectsPress: () => void;
}

export const HomeActionsSection: React.FC<HomeActionsSectionProps> = ({
  onShopPress,
  onGiftCardPress,
  onEventsPress,
  onProjectsPress,
}) => {
  const { colors } = useTheme();

  // 🎯 ACTIONS DATA - Configurazione ottimizzata per Bento
  const actions = [
    {
      id: 'shop',
      title: 'Shop',
      subtitle: 'Solidale',
      description: 'Acquista con impatto',
      icon: '🛍️',
      onPress: onShopPress,
      gradient: [colors.semantic.info.main, colors.primary[500]],
      accentColor: colors.semantic.info.main,
    },
    {
      id: 'gift',
      title: 'Gift Card',
      subtitle: 'Regala',
      description: 'Dona solidarietà',
      icon: '🎁',
      onPress: onGiftCardPress,
      gradient: [colors.semantic.success.main, colors.primary[600]],
      accentColor: colors.semantic.success.main,
    },
    {
      id: 'events',
      title: 'Eventi',
      subtitle: 'Partecipa',
      description: 'Unisciti a noi',
      icon: '📅',
      onPress: onEventsPress,
      gradient: [colors.semantic.warning.main, colors.primary[500]],
      accentColor: colors.semantic.warning.main,
    },
    {
      id: 'projects',
      title: 'Progetti',
      subtitle: 'Scopri',
      description: 'Le nostre iniziative',
      icon: '🌱',
      onPress: onProjectsPress,
      gradient: [colors.primary[500], colors.primary[700]],
      accentColor: colors.primary[600],
    },
  ];

  // 🚀 Layout responsivo INTELLIGENTE basato su breakpoint reali
  const getLayoutConfig = () => {
    // Breakpoint intelligenti basati su device reali
    if (screenWidth >= 768) {
      // Tablet e desktop: 2x2 griglia con gap generoso
      return {
        numColumns: 2,
        cardWidth: '48%',
        gap: Spacing[3],
        justifyContent: 'space-between' as const,
      };
    } else if (screenWidth >= 430) {
      // iPhone Pro Max, telefoni large: 2x2 ottimizzata
      return {
        numColumns: 2,
        cardWidth: '47%', // Leggermente ridotta per più spazio
        gap: Spacing[3],
        justifyContent: 'space-between' as const,
      };
    } else if (screenWidth >= 375) {
      // iPhone standard, telefoni medi: 2x2 compatta
      return {
        numColumns: 2,
        cardWidth: '46%', // Ridotta per spazio ottimale
        gap: Spacing[2],
        justifyContent: 'space-between' as const,
      };
    } else {
      // Telefoni piccoli: layout verticale 1 colonna
      return {
        numColumns: 1,
        cardWidth: '100%',
        gap: Spacing[3],
        justifyContent: 'center' as const,
      };
    }
  };

  const layout = getLayoutConfig();

  const styles = StyleSheet.create({
    // 🏗️ BENTO CONTAINER PRINCIPALE
    bentoContainer: {
      // Rimuovo completamente Surface e SectionContainer
      // Layout fluido senza contenitori tradizionali
    },

    // 🎪 HEADER MODERNO E COMPATTO
    headerSection: {
      alignItems: 'center',
      marginBottom: Spacing[6], // Ridotto per compattezza
    },

    // 🔥 TITOLO BENTO - Più moderno e integrato
    bentoTitle: {
      fontSize: Typography.sizes['4xl'], // Ridotto per integrazione
      fontWeight: Typography.weights.black,
      color: colors.primary[800],
      textAlign: 'center',
      marginBottom: Spacing[2],
      letterSpacing: Typography.letterSpacing.tight,
      lineHeight: Typography.lineHeights.tight * Typography.sizes['4xl'],
    },

    // ✨ SOTTOTITOLO BENTO - Più compatto
    bentoSubtitle: {
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.medium,
      color: colors.neutral[600],
      textAlign: 'center',
      lineHeight: Typography.lineHeights.normal * Typography.sizes.base,
      letterSpacing: Typography.letterSpacing.normal,
    },

    // 🏗️ GRID BENTO - Sistema fluido
    bentoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: layout.justifyContent,
      gap: layout.gap, // Gap diretto per fluidità
    },

    // 🎨 BENTO CARD - Design card moderno
    bentoCard: {
      width: layout.cardWidth as DimensionValue,
      minHeight: 120, // Altezza ottimizzata per Bento
    },

    cardSurface: {
      flex: 1,
      borderRadius: BorderRadius.xl,
      backgroundColor: colors.neutral[0],
      shadowColor: colors.neutral[900],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },

    // 🔧 CONTENT WRAPPER - Separato per overflow corretto
    cardContentWrapper: {
      flex: 1,
      borderRadius: BorderRadius.xl,
      overflow: 'hidden',
    },

    // 🌈 GRADIENT OVERLAY
    gradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.04, // Overlay molto sottile
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
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing[2],
    },

    // 📍 ICON CONTAINER - Compatto per Bento
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: BorderRadius.lg,
      backgroundColor: colors.neutral[100],
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing[3],
      borderWidth: 1,
      borderColor: colors.neutral[200],
    },

    iconText: {
      fontSize: 16,
      lineHeight: 18,
    },

    // 📝 TEXT CONTAINER
    textContainer: {
      flex: 1,
    },

    // 🏷️ TYPOGRAPHY SYSTEM
    cardTitle: {
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.bold,
      color: colors.neutral[900],
      marginBottom: 1,
      letterSpacing: Typography.letterSpacing.tight,
      lineHeight: Typography.lineHeights.tight * Typography.sizes.base,
    },

    cardSubtitle: {
      fontSize: Typography.sizes.xs,
      fontWeight: Typography.weights.semibold,
      color: colors.neutral[500],
      textTransform: 'uppercase',
      letterSpacing: Typography.letterSpacing.wide,
    },

    cardDescription: {
      fontSize: Typography.sizes.sm,
      fontWeight: Typography.weights.regular,
      color: colors.neutral[600],
      lineHeight: Typography.lineHeights.snug * Typography.sizes.sm,
      letterSpacing: Typography.letterSpacing.normal,
    },

    // 🎨 ACCENT BORDER - Design distintivo
    accentBorder: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 2,
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

  // 🎨 BENTO ACTION CARD COMPONENT
  const BentoActionCard: React.FC<{
    action: (typeof actions)[0];
  }> = ({ action }) => {
    const { animatedStyle, handlePressIn, handlePressOut } = useAnimatedPress({
      scaleValue: 0.97,
      minOpacity: 0.9,
    });

    return (
      <TouchableOpacity
        style={styles.bentoCard}
        onPress={action.onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${action.title}: ${action.description}`}
      >
        <Surface style={[styles.cardSurface, animatedStyle]} elevation={2}>
          <View style={styles.cardContentWrapper}>
            {/* 🌈 Gradient Background */}
            <View
              style={[
                styles.gradientOverlay,
                { backgroundColor: action.accentColor },
              ]}
            />

            {/* 🎨 Accent Border */}
            <View
              style={[
                styles.accentBorder,
                { backgroundColor: action.accentColor },
              ]}
            />

            {/* 📦 Content */}
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                {/* 📍 Icon */}
                <View style={styles.iconContainer}>
                  <Text style={styles.iconText}>{action.icon}</Text>
                </View>

                {/* 📝 Text Container */}
                <View style={styles.textContainer}>
                  <Text style={styles.cardSubtitle}>{action.subtitle}</Text>
                  <Text style={styles.cardTitle}>{action.title}</Text>
                </View>
              </View>

              {/* 📝 Description */}
              <Text style={styles.cardDescription}>{action.description}</Text>
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
      {/* 🎪 Header Moderno */}
      <View style={styles.headerSection}>
        <Text style={styles.bentoTitle}>🚀 Come Puoi Aiutare</Text>
        <Text style={styles.bentoSubtitle}>
          Ogni gesto conta per costruire un mondo senza fame
        </Text>
      </View>

      {/* 🏗️ Bento Grid */}
      <View style={styles.bentoGrid}>
        {actions.map(action => (
          <BentoActionCard key={action.id} action={action} />
        ))}
      </View>
    </View>
  );
};

export default HomeActionsSection;
