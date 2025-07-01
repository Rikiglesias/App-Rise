import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

import { Typography, Spacing } from '../../../../shared/constants/designTokens';

export const ActionTitle: React.FC = () => {
  return (
    <View style={styles.titleSection}>
      <Text style={styles.titleText}>⚡ Entra in Azione</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  titleSection: {
    alignItems: 'center',
    marginBottom: Spacing[4],
  },

  titleText: {
    fontSize: 32, // INGRANDITO: da default a 32px per maggiore impatto
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
