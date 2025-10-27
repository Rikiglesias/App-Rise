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
        <PerfectText
          size={32}
          maxSize={34}
          minSize={26}
          lines={1}
          fontWeight="900"
          color="#DC2626"
          textAlign="center"
          style={{
            textShadowColor: 'rgba(220, 38, 38, 0.3)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
          }}
        >
          Entra in Azione
        </PerfectText>
      </PerfectContainer>
    </PerfectContainer>
  );
};
