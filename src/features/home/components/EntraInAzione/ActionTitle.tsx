import React from 'react';
import { View, StyleSheet } from 'react-native';

import { FormattedText } from '../../../../components/ui';
import { Typography, Spacing } from '../../../../shared/constants/designTokens';
import { useResponsive } from '../../../../shared/hooks/useResponsive';

export const ActionTitle: React.FC = () => {
  const { scaleFont } = useResponsive();

  return (
    <View style={styles.titleSection}>
      <FormattedText
        variant="headline-large"
        style={[styles.titleText, { fontSize: scaleFont(32) }]}
      >
        ⚡ Entra in Azione
      </FormattedText>
    </View>
  );
};

const styles = StyleSheet.create({
  titleSection: {
    alignItems: 'center',
    marginBottom: Spacing[4],
  },

  titleText: {
    // fontSize moved to dynamic scaleFont(32) - responsive scaling
    fontWeight: Typography.weights.bold,
    color: '#DC2626',
    textAlign: 'center' as const,
    letterSpacing: -0.4,
    includeFontPadding: false,
    textShadowColor: 'rgba(220, 38, 38, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
