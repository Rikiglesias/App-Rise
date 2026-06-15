import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { PerfectText, PerfectContainer } from '@/components/ui';
import { BorderRadius, Typography, PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

const ActionDescriptionComponent: React.FC = () => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <PerfectContainer
      style={styles.wrapper}
      accessibilityRole="summary"
      testID="action-description-card"
    >
      <PerfectText
        size={20}
        lines={3}
        color={colors.neutral[900]}
        style={styles.mainText}
        accessibilityRole="text"
        testID="action-description-main"
      >
        {t('home.actionMainText')}
      </PerfectText>
      <View style={styles.divider} />

      <PerfectText
        size={16}
        lines={3}
        color={colors.neutral[600]}
        style={styles.subText}
        accessibilityRole="text"
        testID="action-description-sub"
      >
        {t('home.actionSubText')}
      </PerfectText>
    </PerfectContainer>
  );
};

export const ActionDescription = React.memo(ActionDescriptionComponent);

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: {
      width: '100%',
      marginTop: PerfectSpacing.base,
      marginBottom: PerfectSpacing.sm,
      paddingVertical: PerfectSpacing.base,
      paddingHorizontal: PerfectSpacing.base,
      backgroundColor: colors.neutral[0],
      borderRadius: BorderRadius.xl,
      borderWidth: scale(1),
      borderColor: colors.neutral[200],
      borderLeftWidth: scale(4),
      borderLeftColor: colors.neutral[900],
    },
    mainText: {
      fontWeight: Typography.weights.bold,
      marginBottom: PerfectSpacing.xs,
      textAlign: 'center',
    },
    subText: {
      fontWeight: Typography.weights.regular,
      lineHeight: scale(18),
      textAlign: 'center',
    },
    divider: {
      width: '65%',
      height: scale(2),
      backgroundColor: colors.neutral[100],
      borderRadius: BorderRadius.full,
      alignSelf: 'center',
      marginVertical: PerfectSpacing.xs,
    },
  });
