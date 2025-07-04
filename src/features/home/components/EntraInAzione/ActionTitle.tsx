import React from 'react';
import { View, StyleSheet } from 'react-native';

import { FormattedText } from '../../../../components/ui';
import { Spacing } from '../../../../shared/constants/designTokens';
import { scaleFont } from '../../../../shared/constants/responsiveSystem';

export const ActionTitle: React.FC = () => {
  return (
    <View style={styles.titleSection}>
      <View style={styles.titleContainer}>
        <FormattedText
          fontSize={scaleFont(35)}
          wrapMode="auto"
          style={[styles.titleText, { fontWeight: 'bold' }]}
        >
          ⚡ Entra in
        </FormattedText>
        <FormattedText
          fontSize={scaleFont(35)}
          wrapMode="auto"
          style={[styles.titleText, { fontWeight: 'bold', color: '#DC2626' }]}
        >
          Azione
        </FormattedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  titleSection: {
    alignItems: 'center',
    marginBottom: Spacing[5], // AUMENTATO: da Spacing[4] a Spacing[5] per più respiro
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: Spacing[3],
  },

  titleText: {
    // fontSize gestito da variant="headline-large" (scaleFont(30)) - IDENTICO a "Il Nostro Impatto"
    color: '#DC2626',
  },
});
