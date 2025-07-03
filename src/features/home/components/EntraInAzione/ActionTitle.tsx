import React from 'react';
import { View, StyleSheet } from 'react-native';

import { FormattedText } from '../../../../components/ui';
import { Typography, Spacing } from '../../../../shared/constants/designTokens';

export const ActionTitle: React.FC = () => {
  return (
    <View style={styles.titleSection}>
      <FormattedText variant="headline-large" style={styles.titleText}>
        ⚡ Entra in Azione
      </FormattedText>
    </View>
  );
};

const styles = StyleSheet.create({
  titleSection: {
    alignItems: 'center',
    marginBottom: Spacing[5], // AUMENTATO: da Spacing[4] a Spacing[5] per più respiro
  },

  titleText: {
    // fontSize handled by variant="headline-large" - already responsive scaleFont(30)
    fontWeight: Typography.weights.bold,
    color: '#DC2626',
    textAlign: 'center' as const,
    letterSpacing: -0.4,
    lineHeight: 36, // AGGIUNTO: lineHeight appropriato per headline-large
    includeFontPadding: false,
    textShadowColor: 'rgba(220, 38, 38, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
