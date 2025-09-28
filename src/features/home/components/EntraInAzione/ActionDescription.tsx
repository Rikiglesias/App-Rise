import React from 'react';
import { StyleSheet } from 'react-native';

import {
  PerfectText,
  PerfectContainer,
  PerfectCardContainer,
} from '../../../../components/ui';
import responsiveSystem, {
  scaleDimensionLinear,
} from '../../../../shared/constants/responsiveSystem';
import { Colors } from '../../../../shared/constants/designTokens';

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
          fontSize={18} // ← RIDOTTO DA 20 A 18 per evitare troncamento
          fontWeight="bold"
          lines={3} // ← AUMENTATO DA 2 A 3 per evitare taglio
          color="#1F2937"
          textAlign="center"
          style={styles.descriptionMain}
        >
          Unisciti a noi nella lotta {'\n'}contro la fame nel mondo
        </PerfectText>

        {/* ✅ SISTEMA PERFETTO - Divider grigio standard (millimetrico, centrato) */}
        <PerfectContainer
          style={[
            styles.descriptionDivider,
            {
              width: scaleDimensionLinear(
                (responsiveSystem?.LOGICAL_REFERENCE?.width ?? 393) * 0.4
              ),
              height: 2,
              marginVertical: 20,
              borderRadius: 1,
              backgroundColor: Colors.neutral[300],
              opacity: 0.8,
              shadowColor: Colors.neutral[400],
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.15,
              shadowRadius: 3,
              elevation: 2,
            },
          ]}
        />

        {/* ✅ SISTEMA PERFETTO - Seconda frase: andata a capo dopo "per" */}
        <PerfectText
          fontSize={16} // ← RIDOTTO DA 18 A 16 per evitare troncamento
          fontWeight="600"
          lines={3} // ← AUMENTATO DA 2 A 3 per evitare taglio
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
    alignSelf: 'center',
  },

  descriptionSecondary: {
    letterSpacing: 0.3,
    fontStyle: 'italic' as const,
    textShadowColor: 'rgba(107, 114, 128, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
