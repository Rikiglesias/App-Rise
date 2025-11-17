import React from 'react';
import { StyleSheet } from 'react-native';

import { StatCard } from './StatCard';
import { PerfectText, PerfectContainer } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { sectionHeaderBackground } from '@/shared/styles';

/**
 * Sezione dei risultati 2024 con header decorativo e statistiche annuali
 */
export const Results2024Section: React.FC = () => {
  const { t } = useTranslation();
  return (
    <PerfectContainer style={styles.record2024Section}>
      {/* Header DRAMATICALLY ENHANCED */}
      <PerfectContainer style={styles.results2024HeaderContainer}>
        <PerfectContainer style={styles.results2024HeaderBackground}>
          <PerfectText
            size={24}
            lines={1}
            fontWeight="700"
            immunity={true}
            style={styles.results2024Title}
          >
            {t('impact.resultsAchieved')}
          </PerfectText>
          <PerfectText
            size={16}
            lines={2}
            fontWeight="500"
            immunity={true}
            style={styles.results2024Subtitle}
          >
            {t('impact.description')}
          </PerfectText>
        </PerfectContainer>
      </PerfectContainer>

      {/* Cards informative senza "superato" */}
      <PerfectContainer style={styles.record2024Grid}>
        <StatCard
          icon="food-apple"
          iconColor={Colors.primary[600]}
          value="3.14M"
          label={t('impact.mealsPackagedLabel')}
          subtitle={t('impact.mealsPackagedSubtitle')}
          gradientColors={[Colors.primary[500], Colors.primary[700]]}
          pressable={false}
          showChevron={false}
          withGradientBorder={false}
        />
        <StatCard
          icon="package-variant"
          iconColor={Colors.neutral[800]}
          value="16.3K"
          label={t('impact.kitsPackaged')}
          subtitle={t('impact.kitsPackagedSubtitle')}
          gradientColors={[Colors.neutral[600], Colors.neutral[800]]}
          pressable={false}
          showChevron={false}
          withGradientBorder={false}
        />
      </PerfectContainer>
    </PerfectContainer>
  );
};

const styles = StyleSheet.create({
  // Record 2024 Section - INGRANDITA
  record2024Section: {
    paddingHorizontal: PerfectSpacing.base,
    marginTop: PerfectSpacing.lg,
    marginBottom: PerfectSpacing.xl,
  },
  record2024Grid: {
    flexDirection: 'row',
    gap: PerfectSpacing.base,
  },

  // Results 2024 Section - DRAMATICALLY ENHANCED
  results2024HeaderContainer: {
    alignItems: 'center',
    marginBottom: PerfectSpacing.lg,
  },
  results2024HeaderBackground: {
    ...sectionHeaderBackground('white'),
    width: scale(314), // Perfect System: 80% di 393px (iPhone 15)
    alignSelf: 'center',
  },
  results2024Title: {
    color: Colors.neutral[900],
    textAlign: 'center',
    letterSpacing: 0,
  },
  results2024Subtitle: {
    color: Colors.neutral[700],
    textAlign: 'center',
    marginTop: PerfectSpacing.sm,
    opacity: 0.8,
    letterSpacing: 0,
  },
});
