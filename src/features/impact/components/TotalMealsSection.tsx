import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

import { FormattedText, PlatformTouchable } from '../../../components/ui';
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
          <FormattedText variant="headline-small" style={styles.numbersTitle}>
            📊 I Nostri Numeri
          </FormattedText>
          <FormattedText variant="body-large" style={styles.numbersSubtitle}>
            Milioni di vite cambiate, un pasto alla volta
          </FormattedText>
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
                  size={28} // RIDOTTO: da 32 a 28 per proporzioni migliori
                  color="#DC2626"
                  style={styles.totalCardIcon}
                />
                <FormattedText
                  variant="headline-small"
                  style={styles.totalStatValue}
                >
                  15.8M
                </FormattedText>
                <FormattedText
                  variant="body-large"
                  style={styles.totalStatLabel}
                >
                  Pasti Totali
                </FormattedText>
                <FormattedText
                  variant="body-medium"
                  style={styles.totalStatSubtitle}
                >
                  Dal 2012 - Meals
                </FormattedText>
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
                  size={28} // RIDOTTO: da 32 a 28 per proporzioni migliori
                  color="#1F2937"
                  style={styles.totalCardIcon}
                />
                <FormattedText
                  variant="headline-small"
                  style={styles.totalStatValue}
                >
                  142K
                </FormattedText>
                <FormattedText
                  variant="body-large"
                  style={styles.totalStatLabel}
                >
                  Kit Totali
                </FormattedText>
                <FormattedText
                  variant="body-medium"
                  style={styles.totalStatSubtitle}
                >
                  Dal 2020 - Kits
                </FormattedText>
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
    height: 3, // PIÙ GROSSA: prima linea più prominente (IDENTICO PAGINA AZIONI)
    backgroundColor: Colors.neutral[300], // PIÙ SOFT per eleganza (IDENTICO PAGINA AZIONI)
    width: '90%', // ALLARGATO: da 80% a 90% per compensare eventuali padding extra
    borderRadius: 1, // IDENTICO PAGINA AZIONI
    opacity: 0.8, // SOTTILE trasparenza per delicatezza (IDENTICO PAGINA AZIONI)
    alignSelf: 'center',
    // OMBRA ELEGANTE per profondità sottile (IDENTICA PAGINA AZIONI)
    shadowColor: Colors.neutral[400],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  // Container divisorio IDENTICO PAGINA AZIONI
  titleSeparatorContainer: {
    paddingHorizontal: Spacing[4], // IDENTICO PAGINA AZIONI
    paddingVertical: Spacing[4], // IDENTICO PAGINA AZIONI: stesso spacing del HeaderDivider (16px)
    alignItems: 'center', // IDENTICO PAGINA AZIONI
  },

  // Total Meals Section - SPAZIATURE IDENTICHE PAGINA AZIONI
  totalMealsSection: {
    paddingHorizontal: Spacing[4],
    marginBottom: Spacing[2], // RIDOTTO: sezioni più compatte IDENTICO PAGINA AZIONI
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
    padding: 3,
    ...PlatformShadows.xl, // CONVERTITO: da shadow manuale a PlatformShadows per Android ottimizzato
  },
  totalCardContent: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 21,
    paddingVertical: Spacing[3], // RIDOTTO: da Spacing[5] a Spacing[3] per bottoni più compatti
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
    lineHeight: 28, // AGGIUNTO: lineHeight per headline-small
  },
  totalStatLabel: {
    // fontSize rimosso - ora gestito da Text
    fontWeight: Typography.weights.bold,
    color: '#374151',
    marginBottom: Spacing[2], // AUMENTATO: da Spacing[1] a Spacing[2] per più spazio
    lineHeight: 22, // AGGIUNTO: lineHeight per body-large
  },
  totalStatSubtitle: {
    // fontSize rimosso - ora gestito da Text
    color: '#6B7280',
    lineHeight: 18, // AGGIUNTO: lineHeight per body-medium
  },

  // Total Meals Section - SPAZIATURE IDENTICHE PAGINA AZIONI
  numbersHeaderContainer: {
    alignItems: 'center',
    marginTop: Spacing[6], // AGGIUNTO: spazio generoso tra linea principale e titolo "I Nostri Numeri"
    marginBottom: Spacing[10], // ULTERIORMENTE AUMENTATO: spazio ottimale tra titolo e bottoni IDENTICO PAGINA AZIONI
  },
  numbersHeaderBackground: {
    backgroundColor:
      Platform.OS === 'android'
        ? '#F4F5F5' // ANDROID: Grigio leggermente più scuro
        : 'rgba(55, 65, 81, 0.03)', // iOS: Mantiene rgba originale
    borderRadius: 20,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[6],
    borderWidth: 1,
    borderColor:
      Platform.OS === 'android'
        ? '#E6E8EA' // ANDROID: Bordo grigio leggermente più scuro
        : 'rgba(55, 65, 81, 0.08)', // iOS: Mantiene rgba originale
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
