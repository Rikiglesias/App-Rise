import React from 'react';
import { StyleSheet } from 'react-native';

import {
  PerfectText,
  PerfectContainer,
  PerfectCardContainer,
} from '../../../../components/ui';

export const ActionDescription: React.FC = () => {
  return (
    <PerfectContainer preset="section" marginVertical={16} marginHorizontal={4}>
      <PerfectCardContainer
        backgroundColor="card"
        shadow="medium"
        padding={40}
        borderRadius={24}
      >
        {/* ✅ SISTEMA PERFETTO - Prima frase: andata a capo dopo "lotta " */}
        <PerfectText
          fontSize={20}
          fontWeight="bold"
          lines={2} // ✅ Sempre 2 righe esatte
          color="#1F2937"
          textAlign="center"
          style={styles.descriptionMain}
        >
          Unisciti a noi nella lotta {'\n'}contro la fame nel mondo
        </PerfectText>

        {/* ✅ SISTEMA PERFETTO - Divider */}
        <PerfectContainer
          width={50}
          height={3}
          backgroundColor="transparent"
          marginVertical={18}
          borderRadius={1}
          style={styles.descriptionDivider}
        />

        {/* ✅ SISTEMA PERFETTO - Seconda frase: andata a capo dopo "per" */}
        <PerfectText
          fontSize={18}
          fontWeight="600"
          lines={2} // ✅ Sempre 2 righe esatte
          color="#6B7280"
          textAlign="center"
          style={styles.descriptionSecondary}
        >
          Ogni azione conta per{'\n'}cambiare vite
        </PerfectText>
      </PerfectCardContainer>
    </PerfectContainer>
  );
};

const styles = StyleSheet.create({
  descriptionMain: {
    letterSpacing: -0.3,
    textShadowColor: 'rgba(31, 41, 55, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  descriptionDivider: {
    backgroundColor: '#DC2626',
    alignSelf: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },

  descriptionSecondary: {
    letterSpacing: 0.3,
    fontStyle: 'italic' as const,
    textShadowColor: 'rgba(107, 114, 128, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
