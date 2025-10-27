import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

import { PerfectText, PlatformTouchable } from '../../../components/ui';
// Responsive system available from Perfect System when needed
import {
  Colors,
  Spacing,
  Typography,
} from '../../../shared/constants/designTokens';
import { PlatformShadows } from '../../../shared/constants/platformDesignTokens';
import type { useImpactAnimations } from '../hooks/useImpactAnimations';

interface Props {
  animations: ReturnType<typeof useImpactAnimations>;
  onMealsPress: () => void;
  onKitsPress: () => void;
}

/**
 * Sezione dei numeri totali con header decorativo e card interattive
 */
export const TotalMealsSection: React.FC<Props> = ({
  animations,
  onMealsPress,
  onKitsPress,
}) => {
  return (
    <View style={styles.totalMealsSection}>
      {/* Linea divisoria tra header e sezione Dal 2012 */}
      <View style={styles.titleSeparatorContainer}>
        <View style={styles.titleSeparator} />
      </View>

      {/* Header POTENZIATO con decorazioni eleganti */}
      <Animated.View
        style={[
          styles.numbersHeaderContainer,
          {
            opacity: animations.statsAnimations[0],
            transform: [{ scale: animations.statsAnimations[0] }],
          },
        ]}
      >
        <View style={styles.numbersHeaderBackground}>
          <PerfectText
            size={24}
            lines={1}
            immunity={true}
            style={styles.numbersTitle}
          >
            📊 I Nostri Numeri
          </PerfectText>
          <PerfectText
            size={16}
            lines={2}
            immunity={true}
            style={styles.numbersSubtitle}
          >
            Milioni di vite cambiate, un pasto alla volta
          </PerfectText>
        </View>
      </Animated.View>

      <View style={styles.totalStatsRow}>
        <Animated.View
          style={[
            styles.totalStatCard,
            {
              opacity: animations.statsAnimations[0],
              transform: [{ scale: animations.statsAnimations[0] }],
            },
          ]}
        >
          <PlatformTouchable onPress={onMealsPress} activeOpacity={0.9}>
            <LinearGradient
              colors={['#DC2626', '#B91C1C', '#991B1B']}
              style={styles.totalGradientContainer}
            >
              <View style={styles.totalCardContent}>
                <MaterialCommunityIcons
                  name="food-apple"
                  size={28} // Optimized size for better proportions
                  color="#DC2626"
                  style={styles.totalCardIcon}
                />
                <PerfectText
                  size={22}
                  lines={1}
                  immunity={true}
                  style={styles.totalStatValue}
                >
                  15.8M
                </PerfectText>
                <PerfectText
                  size={16}
                  lines={1}
                  immunity={true}
                  style={styles.totalStatLabel}
                >
                  Pasti Totali
                </PerfectText>
                <PerfectText
                  size={14}
                  lines={1}
                  immunity={true}
                  style={styles.totalStatSubtitle}
                >
                  Dal 2012 - Meals
                </PerfectText>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#DC2626"
                  style={styles.chevronIcon}
                />
              </View>
            </LinearGradient>
          </PlatformTouchable>
        </Animated.View>

        <Animated.View
          style={[
            styles.totalStatCard,
            {
              opacity: animations.statsAnimations[1],
              transform: [{ scale: animations.statsAnimations[1] }],
            },
          ]}
        >
          <PlatformTouchable onPress={onKitsPress} activeOpacity={0.9}>
            <LinearGradient
              colors={['#1F2937', '#374151', '#111827']}
              style={styles.totalGradientContainer}
            >
              <View style={styles.totalCardContent}>
                <MaterialCommunityIcons
                  name="package-variant"
                  size={28} // Optimized size for better proportions
                  color="#1F2937"
                  style={styles.totalCardIcon}
                />
                <PerfectText
                  size={22}
                  lines={1}
                  immunity={true}
                  style={styles.totalStatValue}
                >
                  142K
                </PerfectText>
                <PerfectText
                  size={16}
                  lines={1}
                  immunity={true}
                  style={styles.totalStatLabel}
                >
                  Kit Totali
                </PerfectText>
                <PerfectText
                  size={14}
                  lines={1}
                  immunity={true}
                  style={styles.totalStatSubtitle}
                >
                  Dal 2020 - Kits
                </PerfectText>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#1F2937"
                  style={styles.chevronIcon}
                />
              </View>
            </LinearGradient>
          </PlatformTouchable>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Header Divider - ALLARGATO PER COMPENSARE
  titleSeparator: {
    height: 2, // IDENTICO a sectionDivider (Azioni)
    backgroundColor: Colors.neutral[200], // IDENTICO a Azioni
    marginVertical: Spacing[2], // IDENTICO a Azioni
    marginHorizontal: Spacing[6], // IDENTICO a Azioni
    alignSelf: 'stretch', // garantisce larghezza piena anche con alignItems:'center'
  },
  // Container divisorio - allineato a pagina Azioni (sectionDivider)
  titleSeparatorContainer: {
    paddingHorizontal: 0,
    paddingVertical: 0, // Nessun padding: linea gestisce i margini come in Azioni
    alignItems: 'stretch', // per imitare il comportamento della pagina Azioni
  },

  // Total Meals Section - SPAZIATURE IDENTICHE PAGINA AZIONI
  totalMealsSection: {
    paddingHorizontal: Spacing[4],
    marginBottom: Spacing[2], // Compact sections spacing
  },

  totalStatsRow: {
    flexDirection: 'row',
    gap: Spacing[4],
  },
  totalStatCard: {
    flex: 1,
  },
  totalGradientContainer: {
    borderRadius: 24,
    padding: 2,
    ...PlatformShadows.xl, // Platform-optimized shadow system
  },
  totalCardContent: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 22,
    paddingVertical: Spacing[3], // Compact button padding
    alignItems: 'center',
  },
  totalCardIcon: {
    marginBottom: Spacing[3],
  },
  totalStatValue: {
    // fontSize rimosso - ora gestito da Text
    fontWeight: Typography.weights.black,
    color: '#1F2937', // NERO invece che rosso
    marginBottom: Spacing[1],
    lineHeight: 28, // Improved readability for headlines
  },
  totalStatLabel: {
    // fontSize rimosso - ora gestito da Text
    fontWeight: Typography.weights.bold,
    color: '#374151',
    marginBottom: Spacing[2], // Balanced spacing for content
    lineHeight: 22, // Enhanced readability for body text
  },
  totalStatSubtitle: {
    // fontSize rimosso - ora gestito da Text
    color: '#6B7280',
    lineHeight: 18, // Consistent line height for medium text
  },

  // Total Meals Section - SPAZIATURE IDENTICHE PAGINA AZIONI
  numbersHeaderContainer: {
    alignItems: 'center',
    marginTop: Spacing[6], // Generous spacing before section title
    marginBottom: Spacing[10], // ULTERIORMENTE AUMENTATO: spazio ottimale tra titolo e bottoni IDENTICO PAGINA AZIONI
  },
  numbersHeaderBackground: {
    backgroundColor:
      Platform.OS === 'android'
        ? '#F4F5F5' // Android: Optimized solid color
        : 'rgba(55, 65, 81, 0.03)', // iOS: Transparent background
    borderRadius: 20,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[6],
    borderWidth: 1,
    borderColor:
      Platform.OS === 'android'
        ? '#E6E8EA' // Android: Consistent border color
        : 'rgba(55, 65, 81, 0.08)', // iOS: Subtle border transparency
    shadowColor: '#374151',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 1 : 2, // RIDOTTO su Android per stabilità
  },
  numbersTitle: {
    // fontSize rimosso - ora gestito da Text
    fontWeight: Typography.weights.bold, // BOLD normale
    color: '#374151', // GRIGIO ELEGANTE
    textAlign: 'center',
    letterSpacing: -0.4,
    includeFontPadding: false,
    textShadowColor: 'rgba(55, 65, 81, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  numbersSubtitle: {
    // fontSize rimosso - ora gestito da Text
    color: '#4B5563', // GRIGIO MEDIO per leggibilità
    textAlign: 'center',
    marginTop: Spacing[3],
    opacity: 0.9,
    letterSpacing: 0.1,
  },

  chevronIcon: {
    position: 'absolute',
    top: Spacing[2],
    right: Spacing[2],
  },
});
