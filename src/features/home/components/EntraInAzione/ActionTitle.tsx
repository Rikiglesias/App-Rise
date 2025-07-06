import React from 'react';
import { View, StyleSheet } from 'react-native';

import { FormattedText } from '../../../../components/ui';
import { Spacing } from '../../../../shared/constants/designTokens';

export const ActionTitle: React.FC = () => {
  return (
    <View style={styles.titleSection}>
      <View style={styles.titleContainer}>
        <FormattedText
          fontSize={35}
          fixedLines={1}
          style={[styles.titleText, { fontWeight: 'bold' }]}
        >
          ⚡ Entra in
        </FormattedText>
        <FormattedText
          fontSize={35}
          fixedLines={1}
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
    marginBottom: Spacing[5],
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: Spacing[3],
  },

  titleText: {
    color: '#DC2626',
  },
});
