import React from 'react';
import { StyleSheet } from 'react-native';

import { StatCard } from './StatCard';
import { PerfectContainer, PerfectText } from '@/components/ui';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { Colors, BorderRadius } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { sectionHeaderBackground } from '@/shared/styles';

interface Props {
  onMealsPress: () => void;
  onKitsPress: () => void;
}

/**
 * Sezione dei numeri totali con header decorativo e card interattive
 */
export const TotalMealsSection: React.FC<Props> = ({ onMealsPress, onKitsPress }) => {
  const { t } = useTranslation();

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
            immunity={true}
            style={styles.numbersTitle}
          >
            {t('impact.ourNumbers')}
          </PerfectText>
          <PerfectText 
            size={16} 
            lines={2}
            immunity={true}
            style={styles.numbersSubtitle}
          >
            {t('impact.numbersSubtitle')}
          </PerfectText>
        </PerfectContainer>
      </PerfectContainer>

      <PerfectContainer style={styles.totalStatsRow}>
        <StatCard
          icon="food-apple"
          iconColor={Colors.primary[600]}
          value="15.8M"
          label={t('impact.totalMealsLabel')}
          subtitle={t('impact.totalMealsSubtitle2')}
          gradientColors={[Colors.primary[600], Colors.primary[800]]}
          onPress={onMealsPress}
        />
        <StatCard
          icon="package-variant"
          iconColor={Colors.neutral[800]}
          value="142K"
          label={t('impact.totalKits')}
          subtitle={t('impact.totalKitsSubtitle')}
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
    ...sectionHeaderBackground('white'),
    width: scale(314),  // Perfect System: 80% di 393px (iPhone 15)
    alignSelf: 'center',
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
