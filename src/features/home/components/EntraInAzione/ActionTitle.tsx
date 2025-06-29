import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ResponsiveText } from '../../../../components/ui/ResponsiveText';
import { Typography, Spacing } from '../../../../shared/constants/designTokens';

export const ActionTitle: React.FC = () => {
  return (
    <View style={styles.titleSection}>
      <ResponsiveText
        style={styles.titleText}
        responsiveFontSize={Typography.sizes['4xl']}
      >
        ⚡ Entra in Azione
      </ResponsiveText>
    </View>
  );
};

const styles = StyleSheet.create({
  titleSection: {
    alignItems: 'center',
    marginBottom: Spacing[4],
  },

  titleText: {
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
