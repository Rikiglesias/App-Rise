import React from 'react';
import { PerfectContainer, PerfectText } from '@/components/ui';
import { Colors, Shadows } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';

export const ActionTitle: React.FC = () => {
  return (
    <PerfectContainer
      preset="section"
      alignItems="center"
      marginTop={-20}
      marginBottom={PerfectSpacing.xs}
    >
      <PerfectText
        size={32}
        lines={1}
        fontWeight="900"
        color={Colors.primary[500]}
        textAlign="center"
        style={Shadows.md}
      >
        ⚡ Entra in Azione
      </PerfectText>
    </PerfectContainer>
  );
};
