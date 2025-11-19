import React from 'react';
import { StyleSheet } from 'react-native';

import { PerfectText, PerfectContainer } from '@/components/ui';
import {
  Colors,
  BorderRadius,
  Typography,
  PerfectSpacing,
} from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useTranslation } from '@/shared/hooks/useTranslation';

const ActionDescriptionComponent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <PerfectContainer
      style={styles.wrapper}
      accessibilityRole="summary"
      testID="action-description-card"
    >
      <PerfectText
        size={20}
        lines={3}
        color={Colors.neutral[900]}
        style={styles.mainText}
        accessibilityRole="text"
        testID="action-description-main"
      >
        {t('home.actionMainText')}
      </PerfectText>

      <PerfectText
        size={16}
        lines={3}
        color={Colors.neutral[600]}
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

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: PerfectSpacing.sm,
    marginTop: PerfectSpacing.base,
    marginBottom: PerfectSpacing.sm,
    paddingVertical: PerfectSpacing.base,
    paddingHorizontal: PerfectSpacing.base,
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.xl,
    borderWidth: scale(1),
    borderColor: Colors.neutral[200],
    borderLeftWidth: scale(4),
    borderLeftColor: Colors.neutral[900],
  },
  mainText: {
    fontWeight: Typography.weights.bold,
    marginBottom: PerfectSpacing.xs,
  },
  subText: {
    fontWeight: Typography.weights.regular,
    lineHeight: scale(18),
  },
});
