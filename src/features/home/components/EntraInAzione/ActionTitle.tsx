import React from 'react';
import { PerfectContainer, PerfectText } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';

export const ActionTitle: React.FC = () => {
  return (
    <PerfectContainer
      preset="section"
      alignItems="center"
      marginBottom={PerfectSpacing.base}
    >
      <PerfectText
        size={32}
        lines={1}
        fontWeight="900"
        color={Colors.primary[500]}
        textAlign="center"
      >
        ⚡ Entra in Azione
      </PerfectText>
    </PerfectContainer>
  );
};
