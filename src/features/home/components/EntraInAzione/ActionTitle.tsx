import React from 'react';
import { PerfectContainer, PerfectText } from '../../../../components/ui';
import { Spacing } from '../../../../shared/constants/designTokens';

export const ActionTitle: React.FC = () => {
  return (
    <PerfectContainer
      preset="section"
      alignItems="center"
      marginVertical={Spacing[1]}
    >
      <PerfectContainer alignItems="center" justifyContent="center">
        {/* ✅ SISTEMA PERFETTO - PerfectText con immunità totale */}
        <PerfectText
          size={32} // ← RIDOTTO DA 35 A 32 per evitare troncamento
          lines={2} // ← AUMENTATO DA 1 A 2 per evitare taglio
          fontWeight="900"
          color="#DC2626"
          textAlign="center"
          style={{
            textShadowColor: 'rgba(220, 38, 38, 0.3)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
          }}
        >
          ⚡ Entra in Azione
        </PerfectText>
      </PerfectContainer>
    </PerfectContainer>
  );
};
