import React from 'react';

import {
  PerfectText,
  PerfectContainer,
  PerfectCardContainer,
} from '@/components/ui';
import { Colors, BorderRadius, Shadows, PerfectSpacing } from '@/shared/constants';
import { scale, scaleSpacing } from '@/shared/constants/perfectScale';

export const ActionDescription: React.FC = () => {
  return (
    <PerfectContainer 
      preset="section" 
      marginVertical={PerfectSpacing.base} 
      marginHorizontal={PerfectSpacing.xs}
    >
      <PerfectCardContainer
        backgroundColor="card"
        shadow="medium"
        padding={scaleSpacing(32)}
        borderRadius={BorderRadius.xl}
      >
        <PerfectText
          size={18}
          fontWeight="bold"
          lines={3}
          color={Colors.neutral[800]}
          textAlign="center"
          style={Shadows.sm}
        >
          Unisciti a noi nella lotta {"\n"}contro la fame nel mondo
        </PerfectText>

        <PerfectContainer style={{ alignSelf: 'center', width: '40%', height: scale(2), marginVertical: scaleSpacing(20), borderRadius: scale(1), backgroundColor: Colors.neutral[300], opacity: 0.8 }} />

        <PerfectText
          size={16}
          fontWeight="600"
          lines={3}
          color={Colors.neutral[500]}
          textAlign="center"
          style={{ fontStyle: 'italic', ...Shadows.sm }}
        >
          Ogni azione conta per{"\n"}cambiare vite
        </PerfectText>
      </PerfectCardContainer>
    </PerfectContainer>
  );
};
