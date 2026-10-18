import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { IMPACT_DATA } from '../data/impactData';
import { StatCard } from './StatCard';
import { PerfectText, PerfectContainer } from '@/components/ui';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { sectionHeaderBackground } from '@/shared/styles';
import { useDeviceType } from '@/shared/hooks/useDeviceType';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { formatNumber } from '@/shared/utils/numberFormat';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

/**
 * Sezione dei risultati dell'anno di IMPACT_DATA (resultsYear), con header decorativo.
 */
export const AnnualResultsSection: React.FC = () => {
  const { t, locale } = useTranslation();
  const year = IMPACT_DATA.resultsYear;
  const { isTablet } = useDeviceType();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <PerfectContainer
      style={[
        styles.annualResultsSection,
        isTablet ? { paddingHorizontal: 0 } : {},
      ]}
    >
      {/* Header DRAMATICALLY ENHANCED */}
      <PerfectContainer style={styles.annualResultsHeaderContainer}>
        <PerfectContainer style={styles.annualResultsHeaderBackground}>
          <PerfectText
            size={24}
            lines={1}
            fontWeight="700"
            immunity={true}
            style={styles.annualResultsTitle}
          >
            {t('impact.resultsAchieved', { year })}
          </PerfectText>
          <PerfectText
            size={16}
            lines={2}
            fontWeight="500"
            immunity={true}
            style={styles.annualResultsSubtitle}
          >
            {t('impact.description')}
          </PerfectText>
        </PerfectContainer>
      </PerfectContainer>

      {/* Pasti prodotti nell'anno e vite impattate da quei pasti */}
      <PerfectContainer style={styles.annualResultsGrid}>
        <StatCard
          icon="food-apple"
          iconColor={colors.primary[600]}
          value={formatNumber(IMPACT_DATA.mealsProduced, locale)}
          label={t('impact.mealsPackagedLabel')}
          subtitle={t('impact.mealsPackagedSubtitle', { year })}
          gradientColors={[colors.primary[500], colors.primary[700]]}
          pressable={false}
          showChevron={false}
          withGradientBorder={false}
        />
        <StatCard
          icon="account-heart"
          iconColor={colors.neutral[800]}
          value={formatNumber(IMPACT_DATA.livesImpactedMeals, locale)}
          label={t('impact.livesImpactedLabel')}
          subtitle={t('impact.livesImpactedSubtitle', { year })}
          gradientColors={[colors.neutral[600], colors.neutral[800]]}
          pressable={false}
          showChevron={false}
          withGradientBorder={false}
        />
      </PerfectContainer>
    </PerfectContainer>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    // Risultati dell'anno - INGRANDITA
    annualResultsSection: {
      paddingHorizontal: PerfectSpacing.base,
      marginTop: PerfectSpacing.lg,
      marginBottom: PerfectSpacing.xl,
    },
    annualResultsGrid: {
      flexDirection: 'row',
      gap: PerfectSpacing.base,
    },

    // Header dei risultati dell'anno
    annualResultsHeaderContainer: {
      alignItems: 'center',
      marginBottom: PerfectSpacing.lg,
    },
    annualResultsHeaderBackground: {
      ...sectionHeaderBackground('white', colors),
      width: scale(314), // Perfect System: 80% di 393px (iPhone 15)
      alignSelf: 'center',
    },
    annualResultsTitle: {
      color: colors.neutral[900],
      textAlign: 'center',
      letterSpacing: 0,
    },
    annualResultsSubtitle: {
      color: colors.neutral[700],
      textAlign: 'center',
      marginTop: PerfectSpacing.sm,
      opacity: 0.8,
      letterSpacing: 0,
    },
  });
