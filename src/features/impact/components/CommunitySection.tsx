import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { IMPACT_DATA } from '../data/impactData';
import { StatCard } from './StatCard';
import { PerfectContainer, PerfectText } from '@/components/ui';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { sectionHeaderBackground } from '@/shared/styles';
import { useDeviceType } from '@/shared/hooks/useDeviceType';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { formatNumber } from '@/shared/utils/numberFormat';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

/**
 * Sezione community: volontari dell'anno e associazioni partner (IMPACT_DATA), con header decorativo.
 * Card solo numeri, senza tocco: vedi TotalMealsSection.
 */
export const CommunitySection: React.FC = () => {
  const { t, locale } = useTranslation();
  const year = IMPACT_DATA.resultsYear;
  const { isTablet } = useDeviceType();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <PerfectContainer
      style={[
        styles.communitySection,
        isTablet ? { paddingHorizontal: 0 } : {},
      ]}
    >
      {/* Header con elementi community */}
      <PerfectContainer style={styles.communityHeaderContainer}>
        <PerfectContainer style={styles.communityHeaderBackground}>
          <PerfectText
            size={24}
            lines={1}
            fontWeight="700"
            immunity={true}
            style={styles.communityTitle}
          >
            🤝 {t('impact.communityTitle')}
          </PerfectText>
          <PerfectText
            size={16}
            lines={2}
            immunity={true}
            style={styles.communitySubtitle}
          >
            {t('impact.communitySubtitle')}
          </PerfectText>
        </PerfectContainer>
      </PerfectContainer>

      <PerfectContainer style={styles.communityRow}>
        <StatCard
          icon="account-group"
          iconColor={colors.semantic.success.main}
          value={formatNumber(IMPACT_DATA.volunteers, locale)}
          label={t('impact.volunteersLabel')}
          subtitle={t('impact.volunteersInvolvedIn', { year })}
          gradientColors={[
            colors.gradients.success[0],
            colors.gradients.success[2],
          ]}
          pressable={false}
          showChevron={false}
        />
        <StatCard
          icon="handshake"
          iconColor={colors.gradients.purple[0]}
          value={formatNumber(IMPACT_DATA.partnerAssociations.length, locale)}
          label={t('impact.partnerAssociationsLabel')}
          subtitle={t('impact.partnerAssociationsSubtitle', { year })}
          gradientColors={[
            colors.gradients.purple[0],
            colors.gradients.purple[2],
          ]}
          pressable={false}
          showChevron={false}
        />
      </PerfectContainer>
    </PerfectContainer>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    // Community Section
    communitySection: {
      paddingHorizontal: PerfectSpacing.base,
      marginTop: PerfectSpacing.lg,
      marginBottom: PerfectSpacing.lg,
    },

    communityRow: {
      flexDirection: 'row',
      gap: PerfectSpacing.base,
    },

    // Community Header
    communityHeaderContainer: {
      alignItems: 'center',
      marginBottom: PerfectSpacing.lg,
    },
    communityHeaderBackground: {
      ...sectionHeaderBackground('white', colors),
      width: scale(314), // Perfect System: 80% di 393px (iPhone 15)
      alignSelf: 'center',
    },
    communityTitle: {
      color: colors.neutral[900],
      textAlign: 'center',
      letterSpacing: 0,
    },
    communitySubtitle: {
      color: colors.neutral[700],
      textAlign: 'center',
      marginTop: PerfectSpacing.sm,
      opacity: 0.8,
      letterSpacing: 0,
    },
  });
