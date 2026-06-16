import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { PerfectText, PerfectContainer } from '@/components/ui';
import { PerfectSpacing } from '@/shared/constants';
import { scale, LOGICAL_REFERENCE } from '@/shared/constants/perfectScale';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

// Header sizes - OTTIMIZZATI PER SCALING UNIFORME
const TITLE_SIZE = 32;
const SUBTITLE_SIZE = 16; // Ridotto da 18 per evitare limite minimo su small devices
const REF_WIDTH = LOGICAL_REFERENCE.width;
const HEADER_INNER_HEIGHT = scale(REF_WIDTH * 0.43);

export const ImpactHeader: React.FC = () => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <PerfectContainer style={styles.headerContainer} accessibilityRole="header">
      <PerfectContainer style={styles.mainHeaderContainer}>
        <PerfectText
          size={TITLE_SIZE}
          lines={1}
          fontWeight="900"
          style={styles.titleText}
          accessibilityLabel={t('impact.impactAccessibility')}
        >
          {t('impact.impactTitle1')}
        </PerfectText>
        <PerfectText
          size={TITLE_SIZE}
          lines={1}
          fontWeight="900"
          style={[styles.titleText, styles.titleAccent]}
        >
          {t('impact.impactTitle2')}
        </PerfectText>
        <PerfectText
          size={SUBTITLE_SIZE}
          lines={2}
          fontWeight="500"
          style={styles.mainSubtitle}
        >
          {t('impact.description')}
        </PerfectText>
      </PerfectContainer>
    </PerfectContainer>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    headerContainer: {
      alignSelf: 'stretch',
      width: '100%',
      paddingTop: PerfectSpacing['5xl'] + scale(12),
      paddingHorizontal: PerfectSpacing.base,
      paddingBottom: PerfectSpacing.lg,
      alignItems: 'center',
    },
    mainHeaderContainer: {
      alignSelf: 'stretch',
      width: '100%',
      alignItems: 'center',
      minHeight: HEADER_INNER_HEIGHT,
      backgroundColor: colors.neutral[0],
      paddingHorizontal: PerfectSpacing.base,
      paddingTop: PerfectSpacing.sm,
      paddingBottom: PerfectSpacing.lg,
      borderRadius: scale(16),
      borderWidth: scale(1),
      borderColor: colors.neutral[300],
    },
    titleText: {
      color: colors.neutral[900],
      textAlign: 'center',
      letterSpacing: 0,
    },
    titleAccent: {
      color: colors.primary[500],
    },
    mainSubtitle: {
      color: colors.neutral[700],
      textAlign: 'center',
      letterSpacing: 0,
      marginTop: PerfectSpacing.md,
      opacity: 0.8,
    },
  });
