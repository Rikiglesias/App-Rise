import React from 'react';
import { View, StyleSheet } from 'react-native';

import { FormattedText } from '../../../../components/ui';
import { Spacing } from '../../../../shared/constants/designTokens';

export const ActionTitle: React.FC = () => {
  return (
    <View style={styles.titleSection}>
      <View style={styles.titleContainer}>
        <FormattedText
          fontSize={28}
          fontWeight="bold"
          intelligentAccessibilityScaling={true} // ← SISTEMA BI-DIREZIONALE ATTIVO
          fixed={true}
          fixedLines={1} // ← SEMPRE 1 riga esatta
          allowSystemFontScaling={false} // ← CONSISTENCY ASSOLUTA
          lineBreakStrategyIOS="push-out"
          breakStrategyAndroid="highQuality"
          hyphenationFrequencyAndroid="full"
          style={styles.titleText}
        >
          ⚡ Entra in{' '}
        </FormattedText>
        <FormattedText
          fontSize={28}
          fontWeight="bold"
          intelligentAccessibilityScaling={true} // ← SISTEMA BI-DIREZIONALE ATTIVO
          fixed={true}
          fixedLines={1} // ← SEMPRE 1 riga esatta
          allowSystemFontScaling={false} // ← CONSISTENCY ASSOLUTA
          lineBreakStrategyIOS="push-out"
          breakStrategyAndroid="highQuality"
          hyphenationFrequencyAndroid="full"
          style={[styles.titleText, { color: '#DC2626' }]}
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
    marginBottom: Spacing[3],
  },

  titleText: {
    color: '#DC2626',
  },
});
