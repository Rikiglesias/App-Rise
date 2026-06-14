import React, { useMemo } from 'react';
import { PerfectText, PerfectContainer, PerfectIcon } from '@/components/ui';
import { PerfectSpacing } from '@/shared/constants';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { scale } from '@/shared/constants/perfectScale';
import { useDeviceType } from '@/shared/hooks/useDeviceType';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

export const HeaderSection: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const { isTablet } = useDeviceType();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <PerfectContainer
      style={[styles.headerContainer, isTablet ? { paddingHorizontal: 0 } : {}]}
    >
      <PerfectContainer style={styles.headerIconContainer}>
        <PerfectIcon
          name="account-group"
          size={32}
          color={colors.primary[600]}
        />
      </PerfectContainer>

      <PerfectContainer
        paddingVertical={PerfectSpacing.md}
        paddingHorizontal={PerfectSpacing.lg}
        style={styles.titleContainer}
      >
        <PerfectText
          size={28}
          lines={1}
          fontWeight="700"
          style={styles.headerTitle}
        >
          {t('social.title')}
        </PerfectText>

        <PerfectText
          size={16}
          lines={2}
          fontWeight="500"
          style={styles.headerSubtitle}
        >
          {t('social.subtitle')}
        </PerfectText>
      </PerfectContainer>
    </PerfectContainer>
  );
});

HeaderSection.displayName = 'HeaderSection';

const createStyles = (colors: ThemeColors) => ({
  headerContainer: {
    alignItems: 'center' as const,
    marginBottom: PerfectSpacing.xl,
    paddingHorizontal: PerfectSpacing.base,
  },
  headerIconContainer: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: colors.primary[50],
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: PerfectSpacing.base,
  },
  titleContainer: {
    alignItems: 'center' as const,
    backgroundColor: colors.neutral[100],
    borderWidth: scale(1),
    borderColor: colors.neutral[400],
    borderRadius: scale(16),
    width: '100%' as const,
  },
  headerTitle: {
    color: colors.neutral[900],
    textAlign: 'center' as const,
    marginBottom: PerfectSpacing.md,
    letterSpacing: scale(-0.5),
  },
  headerSubtitle: {
    color: colors.neutral[600],
    textAlign: 'center' as const,
    paddingHorizontal: PerfectSpacing.sm,
  },
});
