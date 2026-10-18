import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { IMPACT_DATA } from '../data/impactData';
import { StatCard } from './StatCard';
import { PerfectContainer, PerfectText } from '@/components/ui';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { BorderRadius } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { sectionHeaderBackground } from '@/shared/styles';
import { useDeviceType } from '@/shared/hooks/useDeviceType';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { formatNumber } from '@/shared/utils/numberFormat';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

/**
 * Sezione dei numeri dalla nascita di RAH Italia (IMPACT_DATA), con header decorativo.
 * Le card sono solo numeri: le schede di dettaglio non esistono ancora e il tocco
 * apriva la schermata "In fase di sviluppo", da non mostrare nella versione store.
 */
export const TotalMealsSection: React.FC = () => {
  const { t, locale } = useTranslation();
  const { isTablet } = useDeviceType();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <PerfectContainer
      style={[
        styles.totalMealsSection,
        isTablet ? { paddingHorizontal: 0 } : {},
      ]}
    >
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
          iconColor={colors.primary[600]}
          value={formatNumber(IMPACT_DATA.mealsProducedLifetime, locale)}
          label={t('impact.totalMealsLabel')}
          subtitle={t('impact.totalMealsSubtitle2')}
          gradientColors={[colors.primary[600], colors.primary[800]]}
          pressable={false}
          showChevron={false}
        />
        <StatCard
          icon="package-variant"
          iconColor={colors.neutral[800]}
          value={formatNumber(IMPACT_DATA.kitsProducedLifetime, locale)}
          label={t('impact.totalKits')}
          subtitle={t('impact.totalKitsSubtitle')}
          gradientColors={[colors.neutral[700], colors.neutral[900]]}
          pressable={false}
          showChevron={false}
        />
      </PerfectContainer>
    </PerfectContainer>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    // Header Divider - IDENTICA ALLA PRIMA LINEA PAGINA AZIONI
    titleSeparator: {
      height: scale(4),
      backgroundColor: colors.neutral[200],
      width: scale(314), // Perfect System: 80% di 393px (iPhone 15), identico a HeaderDivider
      marginVertical: PerfectSpacing.sm,
      borderRadius: BorderRadius.sm,
      alignSelf: 'center',
    },
    // Container divisorio - allineato a pagina Azioni (HeaderDivider)
    titleSeparatorContainer: {
      paddingHorizontal: 0,
      paddingTop: PerfectSpacing.lg,
      paddingBottom: PerfectSpacing.xl,
      alignItems: 'center',
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
      marginTop: PerfectSpacing.sm, // Spacing ridotto per avvicinare alla linea
      marginBottom: PerfectSpacing['2xl'], // ULTERIORMENTE AUMENTATO: spazio ottimale tra titolo e bottoni IDENTICO PAGINA AZIONI
    },
    numbersHeaderBackground: {
      ...sectionHeaderBackground('white', colors),
      width: scale(314), // Perfect System: 80% di 393px (iPhone 15)
      alignSelf: 'center',
    },
    numbersTitle: {
      color: colors.neutral[900],
      textAlign: 'center',
      letterSpacing: 0,
    },
    numbersSubtitle: {
      color: colors.neutral[700],
      textAlign: 'center',
      marginTop: PerfectSpacing.sm,
      opacity: 0.8,
      letterSpacing: 0,
    },
  });
