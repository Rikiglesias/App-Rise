import React from 'react';
import { StyleSheet } from 'react-native';

import {
  PerfectText,
  PerfectContainer,
  PerfectCardContainer,
} from '@/components/ui';
import {
  Colors,
  BorderRadius,
  Typography,
  PerfectSpacing,
} from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';

const ActionDescriptionComponent: React.FC = () => {
  return (
    <PerfectContainer
      preset="section"
      marginVertical={PerfectSpacing.base}
      marginHorizontal={PerfectSpacing.xs}
    >
      <PerfectCardContainer
        backgroundColor="card"
        padding={PerfectSpacing.lg}
        borderRadius={BorderRadius.xl}
        style={styles.cardContainer}
        accessibilityRole="summary"
        testID="action-description-card"
      >
        <PerfectText
          size={18}
          lines={2}
          containerWidth={0}
          color={Colors.neutral[800]}
          textAlign="center"
          style={styles.mainText}
          accessibilityRole="text"
          testID="action-description-main"
        >
          Unisciti a noi nella lotta {'\n'}contro la fame nel mondo
        </PerfectText>

        <PerfectContainer style={styles.divider} />

        <PerfectText
          size={16}
          lines={2}
          containerWidth={0}
          color={Colors.neutral[500]}
          textAlign="center"
          style={styles.subtitleText}
          accessibilityRole="text"
          testID="action-description-sub"
        >
          Ogni azione conta per{'\n'}cambiare vite
        </PerfectText>
      </PerfectCardContainer>
    </PerfectContainer>
  );
};

export const ActionDescription = React.memo(ActionDescriptionComponent);

const styles = StyleSheet.create({
  cardContainer: {
    alignSelf: 'center',
    width: '90%',
  },
  mainText: {
    fontWeight: Typography.weights.bold,
  },
  divider: {
    alignSelf: 'center',
    width: '40%',
    height: scale(2),
    marginVertical: PerfectSpacing.base,
    borderRadius: scale(1),
    backgroundColor: Colors.neutral[300],
    opacity: 0.8,
  },
  subtitleText: {
    fontWeight: Typography.weights.semibold,
    fontStyle: 'italic',
  },
});
