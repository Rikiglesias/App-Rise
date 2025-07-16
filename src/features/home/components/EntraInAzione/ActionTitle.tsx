import React from 'react';
import { View, StyleSheet } from 'react-native';

import { Spacing } from '../../../../shared/constants/designTokens';
import { PerfectText } from '../../../../components/ui';

export const ActionTitle: React.FC = () => {
  return (
    <View style={styles.titleSection}>
      <View style={styles.titleContainer}>
        {/* ✅ SISTEMA PERFETTO - PerfectText con immunità totale */}
        <PerfectText
          fontSize={35} // ✅ Font size diretto, no scaleFont
          lines={1} // ✅ lines invece numberOfLines
          fontWeight="900" // ✅ Font weight massimo
          color="#DC2626" // ✅ Rosso diretto
          style={{
            textAlign: 'center',
            textShadowColor: 'rgba(220, 38, 38, 0.3)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
          }}
        >
          ⚡ Entra in Azione
        </PerfectText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  titleSection: {
    alignItems: 'center',
    marginBottom: Spacing[1],
  },

  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[0],
  },
});
