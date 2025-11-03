import React from 'react';
import { StyleSheet } from 'react-native';

import { StatCard } from './StatCard';
import { PerfectText, PerfectContainer } from '@/components/ui';
import { Colors, BorderRadius } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';

interface Props {
  onMealsPress: () => void;
  onKitsPress: () => void;
}

/**
 * Sezione dei numeri totali con header decorativo e card interattive
 */
export const TotalMealsSection: React.FC<Props> = ({
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
      <PerfectContainer style={styles.numbersHeaderContainer}>
        <PerfectContainer style={styles.numbersHeaderBackground}>
          <PerfectText
            size={24}
            lines={1}
            fontWeight="700"
            style={styles.numbersTitle}
          >
            📊 I Nostri Numeri
          </PerfectText>
          <PerfectText size={16} lines={2} style={styles.numbersSubtitle}>
            Milioni di vite cambiate, un pasto alla volta
          </PerfectText>
        </PerfectContainer>
      </PerfectContainer>

      <PerfectContainer style={styles.totalStatsRow}>
        <StatCard
          icon="food-apple"
          iconColor={Colors.primary[600]}
          value="15.8M"
          label="Pasti Totali"
          subtitle="Dal 2012 - Meals"
          gradientColors={[Colors.primary[600], Colors.primary[800]]}
          onPress={onMealsPress}
        />
        <StatCard
          icon="package-variant"
          iconColor={Colors.neutral[800]}
          value="142K"
          label="Kit Totali"
          subtitle="Dal 2020 - Kits"
          gradientColors={[Colors.neutral[700], Colors.neutral[900]]}
          onPress={onKitsPress}
        />
      </PerfectContainer>
    </PerfectContainer>
  );
};

const styles = StyleSheet.create({
  // Header Divider - ALLARGATO PER COMPENSARE
  titleSeparator: {
    height: scale(2),
    backgroundColor: Colors.neutral[200],
    marginVertical: PerfectSpacing.sm,
    marginHorizontal: PerfectSpacing.lg,
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
    paddingHorizontal: PerfectSpacing.base,
    marginBottom: PerfectSpacing.sm, // Compact sections spacing
  },

  totalStatsRow: {
    flexDirection: 'row',
    gap: PerfectSpacing.base,
  },

  // Total Meals Section - SPAZIATURE IDENTICHE PAGINA AZIONI
  numbersHeaderContainer: {
    alignItems: 'center',
    marginTop: PerfectSpacing.lg, // Generous spacing before section title
    marginBottom: PerfectSpacing['2xl'], // ULTERIORMENTE AUMENTATO: spazio ottimale tra titolo e bottoni IDENTICO PAGINA AZIONI
  },
  numbersHeaderBackground: {
    alignSelf: 'stretch',
    backgroundColor: Colors.neutral[0],
    borderRadius: scale(16),
    paddingVertical: PerfectSpacing.base,
    paddingHorizontal: PerfectSpacing.lg,
    borderWidth: scale(1),
    borderColor: Colors.neutral[300],
  },
  numbersTitle: {
    color: Colors.neutral[900],
    textAlign: 'center',
    letterSpacing: 0,
  },
  numbersSubtitle: {
    color: Colors.neutral[700],
    textAlign: 'center',
    marginTop: PerfectSpacing.sm,
    opacity: 0.8,
    letterSpacing: 0,
  },
});
