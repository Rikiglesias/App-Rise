import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { StatCard } from './StatCard';
import { PerfectContainer, PerfectText } from '@/components/ui';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { sectionHeaderBackground } from '@/shared/styles';
import { useDeviceType } from '@/shared/hooks/useDeviceType';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

interface Props {
  onVolunteersPress: () => void;
  onPartnersPress: () => void;
}

/**
 * Sezione community con volontari e partner, header decorativo e card interattive
 */
export const CommunitySection: React.FC<Props> = ({
  onVolunteersPress,
  onPartnersPress,
}) => {
  const { t } = useTranslation();
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
          value="13.323"
          label={t('impact.volunteers2024')}
          subtitle={t('impact.volunteersActive')}
          gradientColors={[
            colors.gradients.success[0],
            colors.gradients.success[2],
          ]}
          onPress={onVolunteersPress}
        />
        <StatCard
          icon="handshake"
          iconColor={colors.gradients.purple[0]}
          value="150+"
          label={t('impact.partnersActive')}
          subtitle={t('impact.partnersCollaboration')}
          gradientColors={[
            colors.gradients.purple[0],
            colors.gradients.purple[2],
          ]}
          onPress={onPartnersPress}
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
