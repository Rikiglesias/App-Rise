import React from 'react';
import { StyleSheet } from 'react-native';
import { PerfectContainer, PerfectText } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';

const ActionTitleComponent: React.FC = () => {
  return (
    <PerfectContainer
      preset="section"
      alignItems="center"
      marginBottom={PerfectSpacing.xs}
    >
      <PerfectText
        size={35}
        lines={1}
        fontWeight="900"
        color={Colors.primary[500]}
        textAlign="center"
        style={styles.titleWithShadow}
        accessibilityRole="header"
        testID="action-title"
      >
        ⚡ Entra in Azione
      </PerfectText>
    </PerfectContainer>
  );
};

const styles = StyleSheet.create({
  titleWithShadow: {
    textShadowColor: 'rgba(255, 30, 0, 0.2)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
});

export const ActionTitle = React.memo(ActionTitleComponent);
