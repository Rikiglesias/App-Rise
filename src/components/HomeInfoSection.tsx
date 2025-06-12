import React from 'react';
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
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

// 🎨 BENTO CARD COMPONENT - Extracted to avoid unstable nested component
interface BentoCardProps {
  card: {
    id: string;
    icon: string;
    title: string;
    subtitle: string;
    description: string;
    accentColor: string;
    onPress: () => void;
  };
  styles: Record<string, ViewStyle | TextStyle>;
}

const BentoCard: React.FC<BentoCardProps> = ({ card, styles }) => {
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
            style={[styles.accentBorder, { backgroundColor: card.accentColor }]}
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

// 🎯 CARD DATA FACTORY - Extracted for max-lines-per-function compliance
const createCardsData = (
  colors: ReturnType<typeof useTheme>['colors'],
  onNavigateToSeguici: () => void,
  onNavigateToChiSiamo: () => void
) => [
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

// 📍 ICON AND TEXT STYLES - Extracted as constants for max-lines-per-function compliance
const ICON_STYLES = {
  iconText: {
    fontSize: 18,
    lineHeight: 20,
  },
};

// 🏷️ TYPOGRAPHY STYLES - Extracted as constants for max-lines-per-function compliance
const TYPOGRAPHY_STYLES = {
  cardTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    marginBottom: 2,
    letterSpacing: Typography.letterSpacing.tight,
    lineHeight: Typography.lineHeights.tight * Typography.sizes.lg,
  },

  cardSubtitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: Typography.letterSpacing.wide,
    marginBottom: Spacing[1],
  },

  cardDescription: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.regular,
    lineHeight: Typography.lineHeights.normal * Typography.sizes.sm,
    letterSpacing: Typography.letterSpacing.normal,
  },
};

/* eslint-disable react-native/no-unused-styles */
// 🎨 STYLES FACTORY - Extracted for max-lines-per-function compliance
const createHomeInfoStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    // Tutti questi stili sono utilizzati nel componente BentoCard
    // ma ESLint non riesce a rilevarlo perché vengono passati tramite props
    bentoContainer: {
      gap: Spacing[3],
    },

    bentoRow: {
      flexDirection: 'row',
      gap: Spacing[3],
    },

    bentoCard: {
      flex: 1,
      minHeight: 140,
    },

    cardSurface: {
      flex: 1,
      borderRadius: BorderRadius['2xl'],
      backgroundColor: colors.neutral[0],
      ...Shadows.primary,
    },

    cardContentWrapper: {
      flex: 1,
      borderRadius: BorderRadius['2xl'],
      overflow: 'hidden',
    },

    gradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.03,
    },

    cardContent: {
      flex: 1,
      padding: Spacing[4],
      position: 'relative',
      zIndex: 2,
    },

    cardHeader: {
      marginBottom: Spacing[2],
    },

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

    cardTitle: {
      ...TYPOGRAPHY_STYLES.cardTitle,
      color: colors.neutral[900],
    },

    cardSubtitle: {
      ...TYPOGRAPHY_STYLES.cardSubtitle,
      color: colors.neutral[600],
    },

    cardDescription: {
      ...TYPOGRAPHY_STYLES.cardDescription,
      color: colors.neutral[700],
    },

    accentBorder: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 3,
      zIndex: 3,
    },

    pressOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.neutral[0],
      opacity: 0.1,
      borderRadius: BorderRadius['2xl'],
    },

    ...ICON_STYLES,
  });
/* eslint-enable react-native/no-unused-styles */

const HomeInfoSection: React.FC<HomeInfoSectionProps> = ({
  onNavigateToSeguici,
  onNavigateToChiSiamo,
}) => {
  const { colors } = useTheme();

  // 🎯 CARD DATA - Configurazione ottimizzata per Bento Layout
  const cards = createCardsData(
    colors,
    onNavigateToSeguici,
    onNavigateToChiSiamo
  );
  const styles = createHomeInfoStyles(colors);

  // 🚀 BENTO BOX LAYOUT RENDER
  return (
    <View style={styles.bentoContainer}>
      <View style={styles.bentoRow}>
        {cards.map(card => (
          <BentoCard key={card.id} card={card} styles={styles} />
        ))}
      </View>
    </View>
  );
};

export default HomeInfoSection;
