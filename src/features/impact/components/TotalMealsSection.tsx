import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';

import type { useImpactAnimations } from '../hooks/useImpactAnimations';
import {
  PerfectText,
  PlatformTouchable,
  PerfectContainer,
} from '@/components/ui';
import { Colors, Spacing, BorderRadius, Shadows } from '@/shared/constants/designTokens';
import { scale } from '@/shared/constants/perfectScale';

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
    <PerfectContainer style={styles.totalMealsSection}>
      {/* Linea divisoria tra header e sezione Dal 2012 */}
      <PerfectContainer style={styles.titleSeparatorContainer}>
        <PerfectContainer style={styles.titleSeparator} />
      </PerfectContainer>

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
        <PerfectContainer style={styles.numbersHeaderBackground}>
          <PerfectText
            size={24}
            lines={1}
            fontWeight="700"
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
        </PerfectContainer>
      </Animated.View>

      <PerfectContainer style={styles.totalStatsRow}>
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
              colors={[
                Colors.primary[600],
                Colors.primary[700],
                Colors.primary[800],
              ]}
              style={styles.totalGradientContainer}
            >
              <PerfectContainer style={styles.totalCardContent}>
                <MaterialCommunityIcons
                  name="food-apple"
                  size={28}
                  color={Colors.primary[600]}
                  style={styles.totalCardIcon}
                />
                <PerfectText
                  size={22}
                  lines={1}
                  fontWeight="900"
                  immunity={true}
                  style={styles.totalStatValue}
                >
                  15.8M
                </PerfectText>
                <PerfectText
                  size={16}
                  lines={1}
                  fontWeight="700"
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
                  color={Colors.primary[600]}
                  style={styles.chevronIcon}
                />
              </PerfectContainer>
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
              colors={[
                Colors.neutral[800],
                Colors.neutral[700],
                Colors.neutral[900],
              ]}
              style={styles.totalGradientContainer}
            >
              <PerfectContainer style={styles.totalCardContent}>
                <MaterialCommunityIcons
                  name="package-variant"
                  size={28}
                  color={Colors.neutral[800]}
                  style={styles.totalCardIcon}
                />
                <PerfectText
                  size={22}
                  lines={1}
                  fontWeight="900"
                  immunity={true}
                  style={styles.totalStatValue}
                >
                  142K
                </PerfectText>
                <PerfectText
                  size={16}
                  lines={1}
                  fontWeight="700"
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
                  color={Colors.neutral[800]}
                  style={styles.chevronIcon}
                />
              </PerfectContainer>
            </LinearGradient>
          </PlatformTouchable>
        </Animated.View>
      </PerfectContainer>
    </PerfectContainer>
  );
};

const styles = StyleSheet.create({
  // Header Divider - ALLARGATO PER COMPENSARE
  titleSeparator: {
    height: scale(2),
    backgroundColor: Colors.neutral[200],
    marginVertical: Spacing[2],
    marginHorizontal: Spacing[6],
    borderRadius: BorderRadius.sm,
  }, 
  // Container divisorio - allineato a pagina Azioni (sectionDivider)
  titleSeparatorContainer: {
    paddingHorizontal: 0,
    paddingVertical: 0, 
    alignItems: 'stretch', 
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
    borderRadius: BorderRadius.xl,
    padding: scale(2),
    ...Shadows.lg,
  },
  totalCardContent: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.xl - scale(2),
    paddingVertical: Spacing[3],
    alignItems: 'center',
  },
  totalCardIcon: {
    marginBottom: Spacing[3],
  },
  totalStatValue: {
    color: Colors.neutral[800],
    marginBottom: Spacing[1],
  },
  totalStatLabel: {
    color: Colors.neutral[700],
    marginBottom: Spacing[2],
  },
  totalStatSubtitle: {
    color: Colors.neutral[500],
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
        ? Colors.neutral[100]
        : Colors.neutral[50],
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[6],
    borderWidth: scale(1),
    borderColor:
      Platform.OS === 'android'
        ? Colors.neutral[200]
        : Colors.neutral[100],
    ...Shadows.sm,
  },
  numbersTitle: {
    color: Colors.neutral[700],
    textAlign: 'center',
    letterSpacing: scale(-0.4),
    includeFontPadding: false,
    ...Shadows.sm,
  },
  numbersSubtitle: {
    // fontSize rimosso - ora gestito da Text
    color: Colors.neutral[600], // GRIGIO MEDIO per leggibilità
    textAlign: 'center',
    marginTop: Spacing[3],
    opacity: 0.9,
    letterSpacing: scale(0.1),
  },

  chevronIcon: {
    position: 'absolute',
    top: Spacing[2],
    right: Spacing[2],
  },
});
