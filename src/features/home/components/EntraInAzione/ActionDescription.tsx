import React from 'react';
import { StyleSheet } from 'react-native';

import {
  PerfectText,
  PerfectContainer,
  PerfectCardContainer,
} from '../../../../components/ui';
import { Colors, Spacing, BorderRadius, Shadows } from '../../../../shared/constants/designTokens';
import { scale } from '../../../../shared/constants/perfectScale';

export const ActionDescription: React.FC = () => {
  return (
    <PerfectContainer preset="section" marginVertical={Spacing[4]} marginHorizontal={Spacing[1]}>
      <PerfectCardContainer
        backgroundColor="card"
        shadow="medium"
        padding={scale(40)}
        borderRadius={BorderRadius.xl}
      >
        {/* ✅ SISTEMA PERFETTO - Prima frase: andata a capo dopo "lotta " */}
        <PerfectText
          size={18} // ← RIDOTTO DA 20 A 18 per evitare troncamento
          fontWeight="bold"
          lines={3} // ← AUMENTATO DA 2 A 3 per evitare taglio
          color={Colors.neutral[800]}
          textAlign="center"
          style={styles.descriptionMain}
        >
          Unisciti a noi nella lotta {'\n'}contro la fame nel mondo
        </PerfectText>

        {/* ✅ SISTEMA PERFETTO - Divider grigio standard (millimetrico, centrato) */}
        <PerfectContainer style={styles.descriptionDivider} />

        {/* ✅ SISTEMA PERFETTO - Seconda frase: andata a capo dopo "per" */}
        <PerfectText
          size={16} // ← RIDOTTO DA 18 A 16 per evitare troncamento
          fontWeight="600"
          lines={3} // ← AUMENTATO DA 2 A 3 per evitare taglio
          color={Colors.neutral[500]}
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
    ...Shadows.sm,
  },

  descriptionDivider: {
    alignSelf: 'center',
    width: scale(157), // 40% dello schermo reference
    height: scale(2),
    marginVertical: Spacing[5],
    borderRadius: scale(1),
    backgroundColor: Colors.neutral[300],
    opacity: 0.8,
    ...Shadows.sm,
  },

  descriptionSecondary: {
    letterSpacing: 0.3,
    fontStyle: 'italic' as const,
    ...Shadows.sm,
  },
});
