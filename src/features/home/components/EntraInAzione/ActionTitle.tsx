import React from 'react';
import { PerfectContainer, PerfectText } from '../../../../components/ui';
import { Spacing, Colors, Shadows } from '../../../../shared/constants/designTokens';

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
          color={Colors.primary[600]}
          textAlign="center"
          style={Shadows.md}
        >
          Entra in Azione
        </PerfectText>
      </PerfectContainer>
    </PerfectContainer>
  );
};
