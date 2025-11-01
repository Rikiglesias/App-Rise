import React from 'react';
import { type EntraInAzioneProps } from '../../types';
import { ActionTitle } from './ActionTitle';
import { ActionDescription } from './ActionDescription';
import { ActionCTAButtons } from './ActionCTAButtons';
import { PerfectContainer } from '@/components/ui';
import { PerfectSpacing } from '@/shared/constants';
import { scaleSpacing } from '@/shared/constants/perfectScale';

export const EntraInAzione: React.FC<EntraInAzioneProps> = () => {
  return (
    <PerfectContainer 
      marginHorizontal={PerfectSpacing.sm}
      padding={scaleSpacing(16)}
    >
      <ActionTitle />
      <ActionDescription />
      <ActionCTAButtons />
    </PerfectContainer>
  );
};

export default EntraInAzione;
