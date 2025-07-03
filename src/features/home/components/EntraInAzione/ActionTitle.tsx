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
    marginBottom: Spacing[4],
  },

  titleText: {
    // fontSize handled by variant="headline-large" - already responsive scaleFont(32)
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
